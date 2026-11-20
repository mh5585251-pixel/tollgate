# AGENTS.md — Tollgate (CICADA 2026)

Secure two-tier AIOps observability. Raw telemetry never leaves Tier 1. Tier 2 receives allow-listed, structured metadata only.
Read this file fully before every task. If a task conflicts with this file, this file wins. Ask nothing; choose the safest interpretation and record it in `DECISIONS.md`.

## 1. Our Wedge (three mechanisms, all mandatory, all testable)

### W1. Verifiable Egress Ledger + Canary Tripwires
- Every outbound payload produces an `EgressAuditRecord` BEFORE transmission, containing the exact bytes sent.
- Receipts are hash-chained: `receiptHash = HMAC_SHA256(collectorKey, prevReceiptHash || sha256(canonicalJson(payload)))`.
- SaaS recomputes and verifies the chain on ingest; a broken chain raises a `chain_broken` alert and marks the collector Poor.
- Canary tokens (`TG-CANARY-<8 hex>`) and fake secrets are planted by the simulator into raw logs. The Egress Guard scans the final serialized bytes of every payload for: registered canaries, secret regexes, high-entropy strings, and any key not in the allow-list. The guard fails closed: a violating payload is NOT sent, a `GuardViolation` is logged, and the UI shows it.
- UI metric: "Canaries planted N / leaked 0". `leaked` is computed by `verify:boundary`, which greps the SaaS stores for every planted value.

### W2. No Free Text Crosses the Boundary
- Tier 2 payloads contain only: numbers, enums, UTC timestamps, pseudonymous IDs, and templated event codes with numeric parameters (e.g. `AUTH_FAIL_BURST {count:7, windowSec:60}`).
- There is no `message`, `rawLine`, `stack`, `url`, `username`, or `ip` field in the egress schema. Free text cannot leak because there is nowhere to put it.
- Pseudonymous IDs: `HMAC_SHA256(tenantSalt, value)` truncated to 12 hex chars, salt never leaves Tier 1.

### W3. Deterministic Explainable Correlation
- Anomaly detection: per-(source, metric) EWMA baseline with robust deviation (MAD). Warm-up 30 samples. Hysteresis: raise at score >= 3.5, clear at < 2.0.
- Correlation: sliding 60 s event-time window. Alerts are grouped into connected components of a topology graph (`config/topology.json`). Root-cause ranking is a fixed, documented formula (section 5). No LLM calls anywhere in the detection or recommendation path.
- Every incident stores `contributions[]` (signal, weight, evidence IDs), `confidence`, and a `reasoningPath[]` of human-readable steps built from templates over numeric facts. Same input stream + same seed = byte-identical incidents (tested).
- Live redaction diff: collector console shows raw line vs. what was kept/dropped, per rule.

## 2. Stack and Repository Layout

- Node 20+, TypeScript strict, npm workspaces. No Docker required. Zero-config start: `npm install && npm run dev`.
- SaaS: Next.js (App Router), Tailwind with the tokens in section 7, `better-sqlite3`, `zod`, SSE for live updates.
- Collector: plain Node process (`tsx`), `better-sqlite3` (WAL) for the outage queue and audit ledger, `zod`, `fastify` for its local console API.
- Tests: `vitest`; E2E: `playwright` (chromium only).

```
apps/saas/                Next.js (Tier 2). Never imports from apps/collector.
apps/collector/           Node service + local console UI (Tier 1). Never imports from apps/saas.
packages/shared/          zod schemas for EgressPayload, enums, canonicalJson, hash utils, health thresholds.
packages/sim/             Deterministic generator + OrganizerStreamAdapter + scenario injectors.
config/                   allowlist.v1.json, thresholds.json, topology.json, tenants.json, remediation-policy.json
data/                     sqlite files (gitignored): collector-<id>.sqlite, saas-ap-south-1.sqlite, saas-eu-central-1.sqlite
scripts/                  verify-boundary.ts, verify-slo.ts, verify-idempotency.ts, verify-all.ts
DECISIONS.md              append-only log of assumptions
```

Import rule (enforced by ESLint `no-restricted-imports`): `apps/saas` may import only `packages/shared`. `apps/collector` may import `packages/shared` and `packages/sim`.

Processes (started by `npm run dev` via `concurrently`):
- SaaS: `:3000`
- Collector `blr-02` (tenant `acme-ind`, region `ap-south-1`): console `:4001`
- Collector `fra-01` (tenant `nordwind-gmbh`, region `eu-central-1`): console `:4002`

## 3. Domain Model

Legend: `[T1]` stays in Tier 1 only. `[EGRESS]` may cross, only through the allow-list.

```ts
// ---------- packages/shared/src/enums.ts ----------
export type HealthState = "Excellent" | "Good" | "Fair" | "Poor";
export type Severity = "info" | "low" | "medium" | "high" | "critical";
export type EventCategory = "infra" | "network" | "security" | "collector";
export type Region = "ap-south-1" | "eu-central-1";
export type EventCode =
  | "AUTH_FAIL_BURST" | "CPU_ANOMALY" | "MEM_ANOMALY" | "DISK_PRESSURE"
  | "LATENCY_ANOMALY" | "PACKET_LOSS_ANOMALY" | "BW_SATURATION"
  | "SERVICE_DOWN" | "COLLECTOR_BUFFERING" | "COLLECTOR_RESUMED" | "SECRET_REDACTED";

// ---------- Tier 1 only ----------
export interface RawTelemetryEvent {                       // [T1] entire object
  eventId: string;                                         // [T1] source-local ID
  kind: "metric" | "syslog" | "auth" | "flow" | "snmp" | "app";
  observedAt: string;                                      // ISO-8601 UTC; collector clock if source lacks one
  sourceTz: string;                                        // IANA tz of source, e.g. "Asia/Kolkata"
  source: { host: string; ip?: string; deviceType: string };  // [T1] raw identity
  rawLine?: string;                                        // [T1] NEVER leaves
  fields: Record<string, string | number | boolean>;       // [T1] raw parsed fields (may hold secrets/PII)
  tags: { planted?: "secret" | "canary" | "pii" };         // [T1] simulator markers for verification only
}

export interface PrivacyPolicyEngine {                     // [T1]
  readonly allowListVersion: string;
  /** Pure + deterministic. Steps in order: normalize -> redact -> aggregate -> analyze -> allowlist -> build payload. */
  process(events: RawTelemetryEvent[], ctx: PolicyContext): PolicyResult;
}
export interface PolicyContext {
  tenantId: string; collectorId: string; region: Region;
  tenantSalt: Buffer;                                      // [T1] never serialized
  now: () => Date; windowMs: number;
}
export interface PolicyResult {
  payload: EgressPayload;                                  // the only thing that may be sent
  trace: RedactionTrace;                                   // [T1] drives the live diff UI
}
export interface RedactionTrace {                          // [T1]
  perEvent: Array<{
    eventId: string; rawLine?: string;
    redactions: Array<{ ruleId: string; span: [number, number] }>;
    keptPaths: string[]; droppedPaths: Array<{ path: string; reason: "not_allowlisted" | "secret" | "pii" | "free_text" }>;
  }>;
}

// ---------- Crossing the boundary ----------
export interface EgressPayload {                           // [EGRESS] every field below is allow-listed
  payloadId: string;                                       // UUID v4, idempotency key
  tenantId: string; collectorId: string; region: Region;
  seq: number;                                             // monotonic per collector, gap detection
  capturedAtUtc: string; sourceTz: string;                 // event time, not arrival time
  window: { startUtc: string; endUtc: string };
  schemaVersion: "1";
  metrics: Array<{ sourceId: string; name: "cpu_pct"|"mem_pct"|"disk_pct"|"bw_mbps"|"latency_ms"|"loss_pct"|"conn_up"; value: number; tsUtc: string }>;
  signals: Array<{ code: EventCode; category: EventCategory; severity: Severity; sourceId: string; params: Record<string, number>; tsUtc: string }>;
  collector: { version: string; cpuPct: number; memMb: number; queueDepth: number; configHash: string };
  health: { state: HealthState; reasons: string[] };       // reasons = enum-like codes only
  receipt: { prevHash: string; hash: string; hmac: string };
}
// sourceId = pseudonymous (HMAC with tenantSalt). No hostnames, IPs, usernames, URLs, messages.

export interface EgressAuditRecord {                       // [T1] stored in collector sqlite; shown in Egress Proof Panel
  id: string; payloadId: string; seq: number; createdAt: string;
  payloadJson: string;                                     // exact bytes handed to the transport
  bytes: number; sha256: string; prevHash: string; receiptHash: string;
  decisions: { keptPaths: string[]; dropped: Array<{ path: string; reason: string }>; redactions: Array<{ ruleId: string; count: number }> };
  guard: { passed: boolean; checks: Array<{ name: "allowlist"|"canary"|"secret_regex"|"entropy"|"schema"; passed: boolean; detail?: string }> };
  attempts: Array<{ at: string; outcome: "ok" | "duplicate_ack" | "network_error" | "http_error"; status?: number }>;
  ackedAt?: string;
}

export interface LocalOutageQueue {                        // [T1] SQLite WAL, durable across restarts
  enqueue(record: EgressAuditRecord): void;                // only guard-passed payloads
  nextBatch(limit: number): EgressAuditRecord[];           // ordered by seq asc
  markAcked(payloadId: string, at: Date): void;            // the ONLY way a record leaves the queue
  depth(): number; oldestAgeMs(): number;
  sentIds(): string[];                                     // for the sent-vs-received diff panel
}

export interface TenantEnvironment {                       // [T2] control-plane record
  tenantId: string; name: string; homeRegion: Region;      // data stored ONLY in this region's store
  collectors: Array<{ collectorId: string; enrolledAt: string; keyId: string }>;
  retentionDays: number; allowListVersion: string;
  thresholdsRef: string;                                   // key into config/thresholds.json
}

export interface CorrelatedIncident {                      // [T2] derived from metadata only
  incidentId: string; tenantId: string; state: "open" | "acknowledged" | "resolved";
  openedAtUtc: string; updatedAtUtc: string; severity: Severity;
  alertIds: string[];                                      // merged raw alerts (shows noise reduction N -> 1)
  affected: Array<{ sourceId: string; role: "root_cause_candidate" | "impacted" }>;
  contributions: Array<{ signal: string; weight: number; evidence: string[] }>;
  confidence: number;                                      // 0..1, formula in section 5
  reasoningPath: string[];                                 // template-generated, numeric facts only
  recommendation: { actionId: string; title: string; why: string; requiresApproval: true; rollbackPlan: string };
}

export interface RemediationAuditLog {                     // [T2] append-only, hash-chained
  entryId: string; incidentId: string; seq: number; tsUtc: string;
  step: "proposed" | "policy_checked" | "approved" | "rejected" | "executed_simulated" | "rolled_back";
  actor: { type: "system" | "human"; id: string };
  policyResult?: { allowed: boolean; riskTier: "low"|"medium"|"high"; blastRadius: number; rulesEvaluated: string[] };
  simulatedStateBefore?: Record<string, unknown>; simulatedStateAfter?: Record<string, unknown>;
  prevHash: string; hash: string;
}
```

Allow-list is data, not code: `config/allowlist.v1.json` enumerates permitted payload paths and value types. `EgressPayload` zod schema is `.strict()`; unknown keys fail parsing on BOTH collector (pre-send) and SaaS (ingest).

## 4. API Contracts

SaaS (Tier 2). All JSON. Collector requests carry headers `x-collector-id`, `x-ts`, `x-nonce`, `x-signature = HMAC_SHA256(collectorKey, ts + nonce + sha256(body))`. Reject if `|now - ts| > 120s` or nonce reused.

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/ingest/{region}` | Body: `EgressPayload`. 200 `{status:"accepted"\|"duplicate", payloadId}`. 421 if tenant home region != `{region}`. 400 on schema fail. 401 on bad signature. 409 `chain_broken`. Idempotency: unique `(tenant_id, payload_id)`. |
| POST | `/api/heartbeat/{region}` | Signed; `{collectorId, seq, tsUtc, version, queueDepth}` every 5 s. |
| GET | `/api/stream?tenant=` | SSE: `metric`, `health`, `incident`, `collector`. Requires tenant session. |
| GET | `/api/fleet` | Collectors + health + lastSeen + reasons. Tenant-scoped. |
| GET | `/api/incidents` / `/api/incidents/{id}` | Incident with contributions and reasoning. |
| POST | `/api/remediation/{incidentId}/{approve\|reject\|rollback}` | Human action; role `operator` required. |
| GET | `/api/ingest-ids?collectorId=` | Received payload IDs (for sent-vs-received diff). |
| POST | `/api/metrics/render-beacon` | `{payloadId, renderedAtUtc}` from dashboard; used for p95 latency. |
| GET | `/api/slo` | p95 collection->render, breach->alert, offline detect, loss, dupes. Computed from stored timestamps only. |
| GET | `/api/audit/dump` | Only if `AUDIT_MODE=1`. All stored rows as text, for `verify:boundary`. |

Collector (Tier 1, local console, bound to 127.0.0.1):

| Method | Path | Purpose |
|---|---|---|
| GET | `/console` | Tier 1 UI. |
| GET | `/api/raw/stream` | SSE of raw events + redaction trace (Tier 1 only). |
| GET | `/api/egress/records?limit=` | Egress Proof Panel data. |
| GET | `/api/egress/records/{payloadId}` | Exact bytes, hashes, decisions, guard checks, attempts. |
| GET | `/api/queue` | Depth, oldest age, sentIds. |
| POST | `/api/scenarios/{id}/run` | Judges' validation scenarios (section 6). Returns `{injectedAtUtc, scenarioId, runId}`. |
| POST | `/api/fault/saas-unreachable` | Body `{enabled:boolean}`. Blocks the transport layer only (real failed requests; no data faking). |
| POST | `/api/audit/boundary` | Runs the boundary audit against SaaS `/api/audit/dump` and returns match counts. |

The command center page `/command-center` on SaaS renders two panes: left = `<iframe src="http://localhost:4001/console">` (collector origin), right = SaaS dashboard. SaaS server code has no route or import to collector data. The browser is the only thing that sees both.

## 5. Algorithms (fixed; do not improvise)

Anomaly score per (sourceId, metric): `ewma_t = 0.2*x + 0.8*ewma_{t-1}`; `dev = 1.4826 * EWMA of |x - ewma|`; `score = |x - ewma| / max(dev, floor[metric])`. Floors in `config/thresholds.json`. Raise >= 3.5, clear < 2.0, minimum 3 consecutive samples to raise.

Correlation: collect open alerts whose `tsUtc` fall within 60 s (event time). Build graph from `config/topology.json` (edges `upstream -> downstream`). Each connected component with >= 2 alerts becomes ONE incident.
Root-cause candidate score per node: `0.4*temporal + 0.3*topology + 0.3*strength`, where
- `temporal` = 1 - (onset rank / (n-1)), earliest anomaly onset scores 1;
- `topology` = fraction of other alerting nodes reachable downstream from the node;
- `strength` = min(1, score/10).
Incident `confidence` = top candidate's score x coverage (alerts in component / alerts in window). Contributions = the three terms, each with the evidence alert IDs. `reasoningPath` is built from fixed templates, for example: `"gw-02 latency exceeded baseline by {z}σ at {t} UTC, {k}s before the first downstream alert"`.

Recommendation: lookup in `config/remediation-policy.json` by (rootCause metric, incident category). Each action has `riskTier`, `reversible:true`, `rollbackPlan`, `simulatedEffect`. Only reversible actions are allowed. Execution only mutates a `simulated_state` table; there is no real system call anywhere.

Health states (`config/thresholds.json`, editable, reason shown for every change):
- Poor: collector offline (no heartbeat 45 s), `chain_broken`, critical signal, loss > 5% or latency > 250 ms sustained 15 s.
- Fair: stale data (no payload 20 s while heartbeat alive), any open anomaly with severity >= medium, loss > 1%, queueDepth > 0 with SaaS unreachable.
- Good: anomalies low-severity only, or recovered < 60 s ago.
- Excellent: fresh data and all metrics within baseline.
Stale or missing data downgrades the state and never shows the last good value as current. Transitions are written to `health_events` with UTC time and reason codes.

Global-ready:
- Out-of-order: store `captured_at_utc` and `received_at_utc`. Aggregates are bucketed by event time (10 s buckets), recomputed idempotently when late data arrives, watermark 10 minutes; later data is stored and flagged `late_beyond_watermark`.
- Idempotency: `(tenant_id, payload_id)` unique; duplicates return `duplicate` and change nothing.
- Regional ingest: two SaaS stores (`saas-ap-south-1.sqlite`, `saas-eu-central-1.sqlite`) and two ingest routes. The UI labels the regional split as simulated on one machine. Do not claim real multi-region infrastructure.

## 6. Scenarios (the 8 live validations; each must be one API call)

Runs are deterministic given the seed. Each returns `injectedAtUtc` so latency is measured from the injection time, not from team claims.

| ID | Injects | Required observable outcome |
|---|---|---|
| `secret_in_log` | Raw log with a fake `api_key`, a `Bearer` token, an email, and a canary | Redaction trace shows spans; payload contains none; `SECRET_REDACTED` signal with count only; canary leaked = 0 after audit. |
| `saas_outage_replay` | Enables fault, generates 30 s of traffic, then disables | Collector shows buffering and depth rising; SaaS marks collector Fair, then Poor if > 45 s; after resume: sent IDs == received IDs, 0 missing, 0 duplicates. |
| `failed_logins` | 7+ auth failures in 60 s from one raw IP | Only `AUTH_FAIL_BURST{count,windowSec}` crosses; no IP/username; severity medium; contributes to a risk indicator. |
| `latency_spike` | gw-02 latency 40 ms -> 190 ms | Alert <= 15 s from injection; shows source, severity, trend, impacted service. |
| `cpu_anomaly` | srv CPU 35% -> 88% below any static threshold? No: choose a deviation that exceeds baseline but is below the static 90% | Flagged by baseline; contributions shown; recommendation "investigate". |
| `multi_alert_incident` | Latency + loss + auth failures on connected nodes | N alerts merge into 1 incident; affected components labeled root vs impacted; confidence and reasoning shown. |
| `dup_out_of_order` | Replays 5 payloads twice, delivers 10 payloads in reversed order | Duplicates return `duplicate`; trends and incident order are by event time; dashboards unchanged. |
| `remediation_flow` | Proposes the action for an open incident | Policy check -> human approve -> simulated execute -> rollback; each step is a chained audit entry. |

## 7. UI Rules (Swiss grid, no decoration)

- Palette: ground `#FFFFFF`, surface `#FAFAFA`, border `#E5E5E5`, text `#111111`, muted `#6B6B6B`. Dark mode optional; not required.
- Semantic colors only for status: Excellent `#15803D`, Good `#0E7490`, Fair `#B45309`, Poor `#B91C1C`. Color is never the only signal; always include the state text.
- Font: Inter (UI) + JetBrains Mono (hashes, payloads, logs). 12-column grid, 8 px spacing scale, 6 px radius max, 1 px borders, no shadows, no gradients, no emoji, no illustrations.
- Every number on screen must come from a real stored row. Empty state text instead of placeholders.
- Required panels: Fleet, Health history, Incidents, Incident detail (contributions, confidence, reasoning path), Remediation, Egress Proof Panel, Raw-vs-Sent diff, Sent-vs-Received IDs, SLO panel, Boundary audit result, Judges' Validation Bar.

## 8. Hard Rules

1. NO hardcoded fake metrics, counts, or statuses in UI or API. Everything derives from the stream and the DB.
2. Simulation is deterministic: seeded PRNG (`mulberry32`, default seed `1337`), `SIM_SEED` env override. No `Math.random()` outside the PRNG module (ESLint rule).
3. Latency is measured from timestamps on events (capture time vs. render beacon), never `setTimeout` assumptions.
4. Collector never logs raw payloads to stdout except to its own Tier 1 console. SaaS logs never include request bodies.
5. The Egress Guard fails closed. Any guard exception = payload not sent.
6. No network call from any detection or recommendation code. No LLM calls at runtime.
7. Remediation executes only against `simulated_state`.
8. Never claim what is not built. The UI "Limitations" page lists: simulated regions, local-dev HTTP (TLS via platform in deploy), demo auth, single-node SQLite, no real remediation.
9. Organizer stream: implement only via `OrganizerStreamAdapter` + `config/organizer.mapping.json`. Do not invent the organizer schema. If the format is unknown, ship the adapter with a documented JSONL fixture and mark it in `DECISIONS.md`.
10. Commit after each milestone with message `M<n>: <summary>`. Keep `npm run verify:all` green at every commit.

## 9. Verification Commands

```
npm run typecheck        # tsc --noEmit across workspaces
npm run lint             # eslint incl. import-boundary + no-Math.random rules
npm run test             # vitest unit + integration
npm run test:e2e         # playwright: runs all 8 scenarios through the UI
npm run verify:boundary  # plants secrets/canaries, runs scenarios, greps SaaS stores: must print LEAKED=0
npm run verify:idempotency # outage + duplicate + reorder: must print MISSING=0 DUPLICATES=0
npm run verify:slo       # 120 s run with injections: asserts p95<=10s, alert<=15s, offline<=60s
npm run verify:all       # all of the above, exits non-zero on any failure
```