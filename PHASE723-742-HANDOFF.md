# Arcane Last Stand — Phase 723~742 Release Freeze Handoff

## Baseline

- Source baseline before this pass: `main@d9761e6`
- Phase 722 full source lineage: `d9761e625ecdc1f86c687d8a4a6400c91222fd9e`
- Baseline regression: **1109/1109**
- Combat action invariant: **9/9**
- No new permanent currency, blocking modal, or RunSnapshot schema field.

## Phase 723~726 — Storage Failure Injection

The snapshot writer now treats backup persistence as best-effort instead of allowing a backup quota failure to abort the primary write. Reading the previous primary is also best-effort; if `getItem()` fails but `setItem()` still works, the current checkpoint is still written. A failed primary overwrite leaves the previous valid checkpoint untouched.

Release evidence:

- fault samples: **5**
- primary-write recovery coverage: **100%**
- last-valid checkpoint coverage: **100%**
- optional persistence isolation: **true**
- clear/remove failure safe: **true**

## Phase 727~730 — Lifecycle Idempotency

A 250ms lifecycle persistence gate collapses `visibilitychange`, `pagehide`, and `beforeunload` bursts into one storage write while keeping `InputState.resetTransient()` unconditional.

Evidence:

- lifecycle bursts: **4**
- lifecycle events: **11**
- persistence writes: **4**
- duplicate writes: **0**
- transient reset coverage: **100%**
- Snapshot mutation: **false**

## Phase 731~734 — Low-End Release Performance

Six sustained stress profiles cover 24~42fps and adaptive pressure 0.80~0.95. Presentation degrades before combat logic.

Evidence:

- stress samples: **6**
- max frames to minimal tier: **180**
- short-spike downgrades: **0**
- recovery hysteresis: **240 frames**
- low-device enemy/projectile/effect caps: **220 / 81 / 36**
- minimal particle/trail caps: **64 / 28**
- telegraph cap: **24**
- combat logic multiplier: **1**

## Phase 735~738 — Mobile Browser Compatibility

Six viewport profiles include common iPhone/Android landscape sizes, tablet, foldable, and zero-size rotation transition.

Evidence:

- profiles: **6**
- finite pointer mapping: **100%**
- zero-size rect safe: **true**
- reachable actions: **9/9**
- foldable hinge: **clear**
- lifecycle return coverage: **100%**
- shell contract retains viewport-fit cover, safe-area padding, touch-action and overscroll protection.

## Phase 739~742 — Release Freeze / Packaged Run Cycle

`ReleaseCandidateEvidence` now includes a fail-closed `releaseFreeze` audit combining storage failure, lifecycle idempotency, low-end performance, and mobile-browser compatibility. Candidate issue key: `release-freeze`.

The release verification plan is now:

1. build
2. tests
3. raster
4. release
5. candidate
6. deterministic archive reproducibility
7. packaged HTTP runtime smoke
8. packaged new-run/checkpoint/resume cycle

The final run-cycle step creates a clean-HEAD ZIP, extracts it, imports persistence/endless modules from the extracted package, creates a new run state, writes a checkpoint, reloads it, and verifies resume elapsed + endless seed/state. Manifest fails closed with `package-run-cycle` on any mismatch.

## Feature-branch verification before clean commit

- tests: **1129/1129**
- Raster: **5/5 PASS**
- Release: **RQ-9085A5AD**
- Candidate: **RCQ-8CE53E89**
- Release Freeze: **PASS**
- direct packaged run cycle on baseline archive: new/checkpoint/resume **PASS**, elapsed drift **0**, endless state match **true**

## Final clean-HEAD verification required after commit/merge

Run:

```bash
npm run verify:manifest -- --out release-manifest.json
```

The final Manifest must include deterministic archive, packaged HTTP runtime, and packaged run-cycle evidence. Then rerun the same verification from merged `main`, smoke the current main server, and create the user-facing ZIP only from tracked `main` using `git archive`.
