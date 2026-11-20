import {createHash,createHmac,timingSafeEqual} from 'node:crypto';
import {readFileSync,existsSync} from 'node:fs';
import {dirname,join,resolve} from 'node:path';
import {z} from 'zod';
function findRoot(){let dir=resolve(process.env.TOLLGATE_ROOT??process.cwd());while(!existsSync(join(dir,'config','tenants.json'))){const parent=dirname(dir);if(parent===dir)throw new Error('Run from the Tollgate checkout or set TOLLGATE_ROOT');dir=parent;}return dir;}
export const root=findRoot();
export function config<T=any>(name:string):T{return JSON.parse(readFileSync(`${root}/config/${name}.json`,'utf8')) as T;}
export const thresholds=config('thresholds');
export const tenants=config<Tenant[]>('tenants');
export interface Tenant {tenantId:string;name:string;homeRegion:Region;collectorId:string;port:number;sourceTz:string;collectorKey:string;retentionDays:number;allowListVersion:string;thresholdsRef:string}
export const region=z.enum(['ap-south-1','eu-central-1']);
export type Region=z.infer<typeof region>;
export const healthState=z.enum(['Excellent','Good','Fair','Poor']);
export type HealthState=z.infer<typeof healthState>;
export const metricName=z.enum(['cpu_pct','mem_pct','disk_pct','bw_mbps','latency_ms','loss_pct','conn_up']);
export type MetricName=z.infer<typeof metricName>;
export const codes=['AUTH_FAIL_BURST','CPU_ANOMALY','MEM_ANOMALY','DISK_PRESSURE','LATENCY_ANOMALY','PACKET_LOSS_ANOMALY','BW_SATURATION','SERVICE_DOWN','COLLECTOR_BUFFERING','COLLECTOR_RESUMED','SECRET_REDACTED'] as const;
const utc=z.iso.datetime();const hex=z.string().regex(/^[a-f0-9]{64}$/);const source=z.string().regex(/^[a-f0-9]{12}$/);
export const metricSchema=z.object({sourceId:source,name:metricName,value:z.number().finite(),tsUtc:utc}).strict();
export const signalSchema=z.object({code:z.enum(codes),category:z.enum(['infra','network','security','collector']),severity:z.enum(['info','low','medium','high','critical']),sourceId:source,params:z.partialRecord(z.enum(['count','windowSec','score','value','baseline']),z.number().finite()),tsUtc:utc}).strict();
export const egressSchema=z.object({payloadId:z.uuid(),tenantId:z.enum(['acme-ind','nordwind-gmbh']),collectorId:z.enum(['blr-02','fra-01']),region,seq:z.number().int().positive(),capturedAtUtc:utc,sourceTz:z.enum(['Asia/Kolkata','Europe/Berlin','UTC']),window:z.object({startUtc:utc,endUtc:utc}).strict(),schemaVersion:z.literal('1'),metrics:z.array(metricSchema),signals:z.array(signalSchema),collector:z.object({version:z.literal('0.1.0'),cpuPct:z.number().finite(),memMb:z.number().finite(),queueDepth:z.number().int().nonnegative(),configHash:hex}).strict(),health:z.object({state:healthState,reasons:z.array(z.enum(['FRESH','ANOMALY','BUFFERING','RECOVERED','OFFLINE','STALE','CHAIN_BROKEN','CRITICAL','LOSS','LATENCY']))}).strict(),receipt:z.object({prevHash:hex,hash:hex,hmac:hex}).strict()}).strict();
export type EgressPayload=z.infer<typeof egressSchema>;
export type Signal=z.infer<typeof signalSchema>;
export type Metric=z.infer<typeof metricSchema>;
export interface RawTelemetryEvent {eventId:string;kind:'metric'|'syslog'|'auth'|'flow'|'snmp'|'app';observedAt:string;sourceTz:string;source:{host:string;ip?:string;deviceType:string};rawLine?:string;fields:Record<string,string|number|boolean>;tags:{planted?:'secret'|'canary'|'pii'}}
export interface RedactionTrace {perEvent:Array<{eventId:string;rawLine?:string;redactions:Array<{ruleId:string;span:[number,number]}>;keptPaths:string[];droppedPaths:Array<{path:string;reason:'not_allowlisted'|'secret'|'pii'|'free_text'}>}>}
export function canonicalJson(v:unknown):string {
  if(v===null||typeof v!=='object')return JSON.stringify(v);
  if(Array.isArray(v))return `[${v.map(canonicalJson).join(',')}]`;
  const entries=Object.entries(v as Record<string,unknown>).filter(([,v])=>v!==undefined).sort(([a],[b])=>a.localeCompare(b,'en'));
  return '{'+entries.map(([k,v])=>JSON.stringify(k)+':'+canonicalJson(v)).join(',')+'}';
}
export const sha256=(v:string)=>createHash('sha256').update(v).digest('hex');
export const hmac=(key:string|Buffer,v:string)=>createHmac('sha256',key).update(v).digest('hex');
export const pseudonymize=(salt:string|Buffer,v:string)=>hmac(salt,v).slice(0,12);
export const ZERO='0'.repeat(64);
export function safeEqual(a:string,b:string){return a.length===b.length&&timingSafeEqual(Buffer.from(a),Buffer.from(b));}
export function contentHash(p:EgressPayload){const {receipt:_receipt,...body}=p;return sha256(canonicalJson(body));}
export function seal(p:EgressPayload,key:string,prevHash:string):EgressPayload{const hash=contentHash(p);return {...p,receipt:{prevHash,hash,hmac:hmac(key,prevHash+hash)}};}
export function signature(key:string,ts:string,nonce:string,body:string){return hmac(key,ts+nonce+sha256(body));}
export function deterministicUuid(key:string){const x=sha256(key);return `${x.slice(0,8)}-${x.slice(8,12)}-4${x.slice(13,16)}-a${x.slice(17,20)}-${x.slice(20,32)}`;}
export interface GuardCheck{name:'allowlist'|'canary'|'secret_regex'|'entropy'|'schema';passed:boolean;detail?:string}
export interface EgressAuditRecord{id:string;payloadId:string;seq:number;createdAt:string;payloadJson:string;bytes:number;sha256:string;prevHash:string;receiptHash:string;decisions:{keptPaths:string[];dropped:Array<{path:string;reason:string}>;redactions:Array<{ruleId:string;count:number}>};guard:{passed:boolean;checks:GuardCheck[]};attempts:Array<{at:string;outcome:'ok'|'duplicate_ack'|'network_error'|'http_error';status?:number}>;ackedAt?:string}
export interface CorrelatedIncident {incidentId:string;tenantId:string;state:'open'|'acknowledged'|'resolved';openedAtUtc:string;updatedAtUtc:string;severity:Signal['severity'];alertIds:string[];affected:Array<{sourceId:string;role:'root_cause_candidate'|'impacted'}>;contributions:Array<{signal:string;weight:number;evidence:string[]}>;confidence:number;reasoningPath:string[];recommendation:{actionId:string;title:string;why:string;requiresApproval:true;rollbackPlan:string}}
export interface PolicyContext {tenantId:string;collectorId:string;region:Region;tenantSalt:Buffer;now:()=>Date;windowMs:number}
export interface PolicyResult {payload:EgressPayload;trace:RedactionTrace}
export interface PrivacyPolicyEngine {readonly allowListVersion:string;process(events:RawTelemetryEvent[],ctx:PolicyContext):PolicyResult}
export interface LocalOutageQueue {enqueue(record:EgressAuditRecord):void;nextBatch(limit:number):EgressAuditRecord[];markAcked(payloadId:string,at:Date):void;depth():number;oldestAgeMs():number;sentIds():string[]}
export interface RemediationAuditLog {entryId:string;incidentId:string;seq:number;tsUtc:string;step:'proposed'|'policy_checked'|'approved'|'rejected'|'executed_simulated'|'rolled_back';actor:{type:'system'|'human';id:string};policyResult?:{allowed:boolean;riskTier:'low'|'medium'|'high';blastRadius:number;rulesEvaluated:string[]};simulatedStateBefore?:Record<string,unknown>;simulatedStateAfter?:Record<string,unknown>;prevHash:string;hash:string}


