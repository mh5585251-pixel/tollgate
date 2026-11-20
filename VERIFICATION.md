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
