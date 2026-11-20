# Verification evidence

Build in progress. Milestone check output is appended below. Final verification and known gaps will be recorded after implementation. A milestone check is not proof that the full definition of done is satisfied.

## M1 — 2026-11-20T10:53:46.583Z

### npm run typecheck

```text

> tollgate@0.1.0 typecheck
> tsc --noEmit

npm notice
npm notice New major version of npm available! 11.6.2 -> 12.2.3
npm notice Changelog: https://github.com/npm/cli/releases/tag/v12.2.3
npm notice To update run: npm install -g npm@12.2.3
npm notice

exit=0
```

### npm run lint

```text

> tollgate@0.1.0 lint
> eslint .


exit=0
```

### npm run test

```text

> tollgate@0.1.0 test
> vitest run


 RUN  v3.2.7 C:/Users/mh558/Documents/Codex/2026-11-20/files-mentioned-by-the-user-agents/outputs/tollgate

 ✓ tests/shared.test.ts (4 tests) 17ms

 Test Files  1 passed (1)
      Tests  4 passed (4)
   Start at  16:23:53
   Duration  583ms (transform 61ms, setup 0ms, collect 234ms, tests 17ms, environment 0ms, prepare 141ms)


exit=0
```

### npm run verify:all

```text

> tollgate@0.1.0 verify:all
> tsx scripts/verify-all.ts


> tollgate@0.1.0 typecheck
> tsc --noEmit


> tollgate@0.1.0 lint
> eslint .


> tollgate@0.1.0 test
> vitest run


 RUN  v3.2.7 C:/Users/mh558/Documents/Codex/2026-11-20/files-mentioned-by-the-user-agents/outputs/tollgate

 ✓ tests/shared.test.ts (4 tests) 17ms

 Test Files  1 passed (1)
      Tests  4 passed (4)
   Start at  16:23:59
   Duration  541ms (transform 49ms, setup 0ms, collect 222ms, tests 17ms, environment 0ms, prepare 129ms)

FOUNDATION CHECKS PASSED; milestone verification scope expands as implemented.

exit=0
```

## M2 — 2026-11-20T10:55:15.410Z

### npm run typecheck

```text

> tollgate@0.1.0 typecheck
> tsc --noEmit

packages/sim/src/index.ts(4,75): error TS2307: Cannot find module '@tollgate/shared' or its corresponding type declarations.
tests/sim.test.ts(2,28): error TS2307: Cannot find module '@tollgate/shared' or its corresponding type declarations.
tests/sim.test.ts(3,91): error TS2307: Cannot find module '@tollgate/sim' or its corresponding type declarations.
npm notice
npm notice New major version of npm available! 11.6.2 -> 12.2.3
npm notice Changelog: https://github.com/npm/cli/releases/tag/v12.2.3
npm notice To update run: npm install -g npm@12.2.3
npm notice

exit=2
```

## M2 — 2026-11-20T10:56:41.246Z

### npm run typecheck

```text

> tollgate@0.1.0 typecheck
> tsc --noEmit

npm notice
npm notice New major version of npm available! 11.6.2 -> 12.2.3
npm notice Changelog: https://github.com/npm/cli/releases/tag/v12.2.3
npm notice To update run: npm install -g npm@12.2.3
npm notice

exit=0
```

### npm run lint

```text

> tollgate@0.1.0 lint
> eslint .


exit=0
```

### npm run test

```text

> tollgate@0.1.0 test
> vitest run


 RUN  v3.2.7 C:/Users/mh558/Documents/Codex/2026-11-20/files-mentioned-by-the-user-agents/outputs/tollgate

 ✓ tests/sim.test.ts (3 tests) 11ms
 ✓ tests/shared.test.ts (4 tests) 15ms

 Test Files  2 passed (2)
      Tests  7 passed (7)
   Start at  16:26:48
   Duration  1.09s (transform 72ms, setup 0ms, collect 404ms, tests 27ms, environment 0ms, prepare 312ms)


exit=0
```

### npm run verify:all

```text

> tollgate@0.1.0 verify:all
> tsx scripts/verify-all.ts


> tollgate@0.1.0 typecheck
> tsc --noEmit


> tollgate@0.1.0 lint
> eslint .


> tollgate@0.1.0 test
> vitest run


 RUN  v3.2.7 C:/Users/mh558/Documents/Codex/2026-11-20/files-mentioned-by-the-user-agents/outputs/tollgate

 ✓ tests/shared.test.ts (4 tests) 15ms
 ✓ tests/sim.test.ts (3 tests) 11ms

 Test Files  2 passed (2)
      Tests  7 passed (7)
   Start at  16:26:54
   Duration  927ms (transform 59ms, setup 0ms, collect 358ms, tests 25ms, environment 0ms, prepare 221ms)

FOUNDATION CHECKS PASSED; milestone verification scope expands as implemented.

exit=0
```

## M3 — 2026-11-20T10:59:09.839Z

### npm run typecheck

```text

> tollgate@0.1.0 typecheck
> tsc --noEmit

apps/collector/src/privacy.ts(11,703): error TS2739: Type '{ score: number; value: number; baseline: number; }' is missing the following properties from type 'Record<"value" | "count" | "windowSec" | "score" | "baseline", number>': count, windowSec
apps/collector/src/privacy.ts(13,388): error TS2739: Type '{ count: number; windowSec: number; }' is missing the following properties from type 'Record<"value" | "count" | "windowSec" | "score" | "baseline", number>': value, score, baseline
apps/collector/src/privacy.ts(14,100): error TS2739: Type '{ count: number; }' is missing the following properties from type 'Record<"value" | "count" | "windowSec" | "score" | "baseline", number>': value, windowSec, score, baseline

exit=2
```

## M3 — 2026-11-20T10:59:20.854Z

### npm run typecheck

```text

> tollgate@0.1.0 typecheck
> tsc --noEmit


exit=0
```

### npm run lint

```text

> tollgate@0.1.0 lint
> eslint .


exit=0
```

### npm run test

```text

> tollgate@0.1.0 test
> vitest run


 RUN  v3.2.7 C:/Users/mh558/Documents/Codex/2026-11-20/files-mentioned-by-the-user-agents/outputs/tollgate

 ✓ tests/collector.test.ts (5 tests) 73ms
 ✓ tests/shared.test.ts (4 tests) 16ms
 ✓ tests/sim.test.ts (3 tests) 10ms

 Test Files  3 passed (3)
      Tests  12 passed (12)
   Start at  16:29:26
   Duration  1.60s (transform 102ms, setup 0ms, collect 667ms, tests 99ms, environment 1ms, prepare 336ms)


exit=0
```

### npm run verify:all

```text

> tollgate@0.1.0 verify:all
> tsx scripts/verify-all.ts


> tollgate@0.1.0 typecheck
> tsc --noEmit


> tollgate@0.1.0 lint
> eslint .


> tollgate@0.1.0 test
> vitest run


 RUN  v3.2.7 C:/Users/mh558/Documents/Codex/2026-11-20/files-mentioned-by-the-user-agents/outputs/tollgate

 ✓ tests/collector.test.ts (5 tests) 71ms
 ✓ tests/shared.test.ts (4 tests) 15ms
 ✓ tests/sim.test.ts (3 tests) 11ms

 Test Files  3 passed (3)
      Tests  12 passed (12)
   Start at  16:29:33
   Duration  1.56s (transform 100ms, setup 0ms, collect 632ms, tests 98ms, environment 0ms, prepare 337ms)

FOUNDATION CHECKS PASSED; milestone verification scope expands as implemented.

exit=0
```

## M4 — 2026-11-20T11:02:21.914Z

### npm run typecheck

```text

> tollgate@0.1.0 typecheck
> tsc --noEmit


exit=0
```

### npm run lint

```text

> tollgate@0.1.0 lint
> eslint .


C:\Users\mh558\Documents\Codex\2026-11-20\files-mentioned-by-the-user-agents\outputs\tollgate\apps\saas\lib\store.ts
  24:596  error  'latency' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars

✖ 1 problem (1 error, 0 warnings)


exit=1
```

## M4 — 2026-11-20T11:02:49.804Z

### npm run typecheck

```text

> tollgate@0.1.0 typecheck
> tsc --noEmit


exit=0
```

### npm run lint

```text

> tollgate@0.1.0 lint
> eslint .


exit=0
```

### npm run test

```text

> tollgate@0.1.0 test
> vitest run


 RUN  v3.2.7 C:/Users/mh558/Documents/Codex/2026-11-20/files-mentioned-by-the-user-agents/outputs/tollgate

 ✓ tests/saas.test.ts (5 tests) 145ms
 ✓ tests/collector.test.ts (5 tests) 75ms
 ✓ tests/shared.test.ts (4 tests) 16ms
 ✓ tests/sim.test.ts (3 tests) 11ms

 Test Files  4 passed (4)
      Tests  17 passed (17)
   Start at  16:32:56
   Duration  2.21s (transform 135ms, setup 0ms, collect 844ms, tests 247ms, environment 1ms, prepare 458ms)


exit=0
```

### npm run verify:all

```text

> tollgate@0.1.0 verify:all
> tsx scripts/verify-all.ts


> tollgate@0.1.0 typecheck
> tsc --noEmit


> tollgate@0.1.0 lint
> eslint .


> tollgate@0.1.0 test
> vitest run


 RUN  v3.2.7 C:/Users/mh558/Documents/Codex/2026-11-20/files-mentioned-by-the-user-agents/outputs/tollgate

 ✓ tests/saas.test.ts (5 tests) 133ms
 ✓ tests/collector.test.ts (5 tests) 73ms
 ✓ tests/shared.test.ts (4 tests) 15ms
 ✓ tests/sim.test.ts (3 tests) 10ms

 Test Files  4 passed (4)
      Tests  17 passed (17)
   Start at  16:33:04
   Duration  2.06s (transform 120ms, setup 0ms, collect 768ms, tests 231ms, environment 0ms, prepare 421ms)

FOUNDATION CHECKS PASSED; milestone verification scope expands as implemented.

exit=0
```

## M4-final — 2026-11-20T11:03:25.434Z

### npm run typecheck

```text

> tollgate@0.1.0 typecheck
> tsc --noEmit


exit=0
```

### npm run lint

```text

> tollgate@0.1.0 lint
> eslint .


exit=0
```

### npm run test

```text

> tollgate@0.1.0 test
> vitest run


 RUN  v3.2.7 C:/Users/mh558/Documents/Codex/2026-11-20/files-mentioned-by-the-user-agents/outputs/tollgate

 ✓ tests/saas.test.ts (5 tests) 144ms
 ✓ tests/collector.test.ts (5 tests) 74ms
 ✓ tests/shared.test.ts (4 tests) 15ms
 ✓ tests/sim.test.ts (3 tests) 11ms

 Test Files  4 passed (4)
      Tests  17 passed (17)
   Start at  16:33:32
   Duration  2.18s (transform 124ms, setup 0ms, collect 826ms, tests 244ms, environment 1ms, prepare 444ms)


exit=0
```

### npm run verify:all

```text

> tollgate@0.1.0 verify:all
> tsx scripts/verify-all.ts


> tollgate@0.1.0 typecheck
> tsc --noEmit


> tollgate@0.1.0 lint
> eslint .


> tollgate@0.1.0 test
> vitest run


 RUN  v3.2.7 C:/Users/mh558/Documents/Codex/2026-11-20/files-mentioned-by-the-user-agents/outputs/tollgate

 ✓ tests/saas.test.ts (5 tests) 138ms
 ✓ tests/collector.test.ts (5 tests) 74ms
 ✓ tests/shared.test.ts (4 tests) 15ms
 ✓ tests/sim.test.ts (3 tests) 10ms

 Test Files  4 passed (4)
      Tests  17 passed (17)
   Start at  16:33:40
   Duration  2.11s (transform 128ms, setup 0ms, collect 798ms, tests 237ms, environment 1ms, prepare 433ms)

FOUNDATION CHECKS PASSED; milestone verification scope expands as implemented.

exit=0
```

## M5 — 2026-11-20T11:06:22.142Z

### npm run typecheck

```text

> tollgate@0.1.0 typecheck
> tsc --noEmit


exit=0
```

### npm run lint

```text

> tollgate@0.1.0 lint
> eslint .


exit=0
```

### npm run test

```text

> tollgate@0.1.0 test
> vitest run


 RUN  v3.2.7 C:/Users/mh558/Documents/Codex/2026-11-20/files-mentioned-by-the-user-agents/outputs/tollgate

 ✓ tests/aiops.test.ts (3 tests) 443ms
   ✓ reproduces incidents across two seeded end-to-end pipeline runs  402ms
 ✓ tests/saas.test.ts (5 tests) 145ms
 ✓ tests/collector.test.ts (5 tests) 72ms
 ✓ tests/shared.test.ts (4 tests) 16ms
 ✓ tests/sim.test.ts (3 tests) 10ms

 Test Files  5 passed (5)
      Tests  20 passed (20)
   Start at  16:36:33
   Duration  3.27s (transform 141ms, setup 0ms, collect 1.06s, tests 685ms, environment 1ms, prepare 700ms)


exit=0
```

### npm run verify:all

```text

> tollgate@0.1.0 verify:all
> tsx scripts/verify-all.ts


> tollgate@0.1.0 typecheck
> tsc --noEmit


> tollgate@0.1.0 lint
> eslint .


> tollgate@0.1.0 test
> vitest run


 RUN  v3.2.7 C:/Users/mh558/Documents/Codex/2026-11-20/files-mentioned-by-the-user-agents/outputs/tollgate

 ✓ tests/aiops.test.ts (3 tests) 425ms
   ✓ reproduces incidents across two seeded end-to-end pipeline runs  381ms
 ✓ tests/saas.test.ts (5 tests) 138ms
 ✓ tests/collector.test.ts (5 tests) 71ms
 ✓ tests/shared.test.ts (4 tests) 14ms
 ✓ tests/sim.test.ts (3 tests) 10ms

 Test Files  5 passed (5)
      Tests  20 passed (20)
   Start at  16:36:42
   Duration  2.95s (transform 141ms, setup 0ms, collect 988ms, tests 658ms, environment 1ms, prepare 519ms)

FOUNDATION CHECKS PASSED; milestone verification scope expands as implemented.

exit=0
```

## M6 — 2026-11-20T11:09:22.763Z

### npm run typecheck

```text

> tollgate@0.1.0 typecheck
> tsc --noEmit

npm notice
npm notice New major version of npm available! 11.6.2 -> 12.2.3
npm notice Changelog: https://github.com/npm/cli/releases/tag/v12.2.3
npm notice To update run: npm install -g npm@12.2.3
npm notice

exit=0
```

### npm run lint

```text

> tollgate@0.1.0 lint
> eslint .


exit=0
```

### npm run test

```text

> tollgate@0.1.0 test
> vitest run


 RUN  v3.2.7 C:/Users/mh558/Documents/Codex/2026-11-20/files-mentioned-by-the-user-agents/outputs/tollgate

 ✓ tests/aiops.test.ts (3 tests) 413ms
   ✓ reproduces incidents across two seeded end-to-end pipeline runs  371ms
 ✓ tests/saas.test.ts (5 tests) 140ms
 ✓ tests/collector.test.ts (5 tests) 71ms
 ✓ tests/shared.test.ts (4 tests) 14ms
 ✓ tests/sim.test.ts (3 tests) 11ms
 ✓ tests/console.test.ts (1 test) 927ms
   ✓ serves the local console and enforces browser origins for fault changes  926ms

 Test Files  6 passed (6)
      Tests  21 passed (21)
   Start at  16:39:29
   Duration  4.83s (transform 167ms, setup 0ms, collect 1.66s, tests 1.58s, environment 1ms, prepare 630ms)


exit=0
```

### npm run verify:all

```text

> tollgate@0.1.0 verify:all
> tsx scripts/verify-all.ts


> tollgate@0.1.0 typecheck
> tsc --noEmit


> tollgate@0.1.0 lint
> eslint .


> tollgate@0.1.0 test
> vitest run


 RUN  v3.2.7 C:/Users/mh558/Documents/Codex/2026-11-20/files-mentioned-by-the-user-agents/outputs/tollgate

 ✓ tests/console.test.ts (1 test) 403ms
   ✓ serves the local console and enforces browser origins for fault changes  402ms
 ✓ tests/aiops.test.ts (3 tests) 425ms
   ✓ reproduces incidents across two seeded end-to-end pipeline runs  386ms
 ✓ tests/saas.test.ts (5 tests) 138ms
 ✓ tests/collector.test.ts (5 tests) 75ms
 ✓ tests/shared.test.ts (4 tests) 15ms
 ✓ tests/sim.test.ts (3 tests) 11ms

 Test Files  6 passed (6)
      Tests  21 passed (21)
   Start at  16:39:40
   Duration  3.99s (transform 157ms, setup 0ms, collect 1.36s, tests 1.07s, environment 1ms, prepare 633ms)

FOUNDATION CHECKS PASSED; milestone verification scope expands as implemented.

exit=0
```

## M7 — 2026-11-20T11:12:19.815Z

### npm run typecheck

```text

> tollgate@0.1.0 typecheck
> tsc --noEmit


exit=0
```

### npm run lint

```text

> tollgate@0.1.0 lint
> eslint .


exit=0
```

### npm run test

```text

> tollgate@0.1.0 test
> vitest run


 RUN  v3.2.7 C:/Users/mh558/Documents/Codex/2026-11-20/files-mentioned-by-the-user-agents/outputs/tollgate

 ✓ tests/aiops.test.ts (3 tests) 428ms
   ✓ reproduces incidents across two seeded end-to-end pipeline runs  389ms
 ✓ tests/console.test.ts (1 test) 372ms
   ✓ serves the local console and enforces browser origins for fault changes  371ms
 ✓ tests/saas.test.ts (5 tests) 137ms
 ✓ tests/collector.test.ts (5 tests) 71ms
 ✓ tests/shared.test.ts (4 tests) 15ms
 ✓ tests/sim.test.ts (3 tests) 10ms

 Test Files  6 passed (6)
      Tests  21 passed (21)
   Start at  16:42:27
   Duration  3.97s (transform 179ms, setup 0ms, collect 1.37s, tests 1.03s, environment 1ms, prepare 637ms)


exit=0
```

### npm run verify:all

```text

> tollgate@0.1.0 verify:all
> tsx scripts/verify-all.ts


> tollgate@0.1.0 typecheck
> tsc --noEmit


> tollgate@0.1.0 lint
> eslint .


> tollgate@0.1.0 test
> vitest run


 RUN  v3.2.7 C:/Users/mh558/Documents/Codex/2026-11-20/files-mentioned-by-the-user-agents/outputs/tollgate

 ✓ tests/aiops.test.ts (3 tests) 406ms
   ✓ reproduces incidents across two seeded end-to-end pipeline runs  368ms
 ✓ tests/console.test.ts (1 test) 342ms
   ✓ serves the local console and enforces browser origins for fault changes  341ms
 ✓ tests/saas.test.ts (5 tests) 136ms
 ✓ tests/collector.test.ts (5 tests) 70ms
 ✓ tests/shared.test.ts (4 tests) 14ms
 ✓ tests/sim.test.ts (3 tests) 10ms

 Test Files  6 passed (6)
      Tests  21 passed (21)
   Start at  16:42:37
   Duration  3.85s (transform 159ms, setup 0ms, collect 1.33s, tests 979ms, environment 1ms, prepare 618ms)

FOUNDATION CHECKS PASSED; milestone verification scope expands as implemented.

exit=0
```

## M7-final — 2026-11-20T11:15:54.302Z

### npm run typecheck

```text

> tollgate@0.1.0 typecheck
> tsc --noEmit

npm notice
npm notice New major version of npm available! 11.6.2 -> 12.2.3
npm notice Changelog: https://github.com/npm/cli/releases/tag/v12.2.3
npm notice To update run: npm install -g npm@12.2.3
npm notice

exit=0
```

### npm run lint

```text

> tollgate@0.1.0 lint
> eslint .


exit=0
```

### npm run test

```text

> tollgate@0.1.0 test
> vitest run


 RUN  v3.2.7 C:/Users/mh558/Documents/Codex/2026-11-20/files-mentioned-by-the-user-agents/outputs/tollgate

 ✓ tests/aiops.test.ts (3 tests) 488ms
   ✓ reproduces incidents across two seeded end-to-end pipeline runs  447ms
 ✓ tests/console.test.ts (1 test) 405ms
   ✓ serves the local console and enforces browser origins for fault changes  404ms
 ✓ tests/saas.test.ts (5 tests) 139ms
 ✓ tests/collector.test.ts (5 tests) 79ms
 ✓ tests/shared.test.ts (4 tests) 15ms
 ✓ tests/sim.test.ts (3 tests) 14ms

 Test Files  6 passed (6)
      Tests  21 passed (21)
   Start at  16:46:02
   Duration  4.32s (transform 181ms, setup 0ms, collect 1.47s, tests 1.14s, environment 1ms, prepare 694ms)


exit=0
```

### npm run verify:all

```text

> tollgate@0.1.0 verify:all
> tsx scripts/verify-all.ts


> tollgate@0.1.0 typecheck
> tsc --noEmit


> tollgate@0.1.0 lint
> eslint .


> tollgate@0.1.0 test
> vitest run


 RUN  v3.2.7 C:/Users/mh558/Documents/Codex/2026-11-20/files-mentioned-by-the-user-agents/outputs/tollgate

 ✓ tests/aiops.test.ts (3 tests) 442ms
   ✓ reproduces incidents across two seeded end-to-end pipeline runs  403ms
 ✓ tests/console.test.ts (1 test) 380ms
   ✓ serves the local console and enforces browser origins for fault changes  379ms
 ✓ tests/saas.test.ts (5 tests) 138ms
 ✓ tests/collector.test.ts (5 tests) 78ms
 ✓ tests/shared.test.ts (4 tests) 15ms
 ✓ tests/sim.test.ts (3 tests) 12ms

 Test Files  6 passed (6)
      Tests  21 passed (21)
   Start at  16:46:13
   Duration  4.18s (transform 162ms, setup 0ms, collect 1.43s, tests 1.06s, environment 1ms, prepare 677ms)

FOUNDATION CHECKS PASSED; milestone verification scope expands as implemented.

exit=0
```
