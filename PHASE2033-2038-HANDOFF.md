# Phase 2033~2038 Handoff — Fate Path Active Recall Integration

## Scope

This pass reuses the existing Fate cells inside `assets/ui/decision-path-icons.png` instead of creating another image atlas. The goal is to make long-lived Fate choices readable during combat without adding a new HUD row or changing gameplay.

## Phase 2033 — Reused Canvas sprite contract

- Existing atlas reused: `decision-path-icons.png`
- Atlas: 384×288 RGBA / 4×3 / cell 96×96
- File size: 54726 bytes
- Fate cells: `frenzy`, `golden`, `guardian`
- Fate unique cells: 3/3
- Added `decisionPathIconSprite()` so the same CSS atlas can be drawn on Canvas.
- No new PNG, no duplicate atlas, no animation, motion amplitude 0.

## Phase 2034 — Fate selection toast identity

- Existing `운명 선택 · ...` text remains unchanged.
- The selected Fate cell is drawn at the existing event toast seam.
- Image load failure leaves the existing text-only toast intact.

## Phase 2035 — Active Fate recall

- Existing `운명` tactical status row remains in place.
- Up to 3 selected Fate icons are drawn in selection order.
- No new HUD row, modal, timer, pulse, blink, or rotating effect.

## Phase 2036 — Text fallback / layout guard

- Existing `광란 · 황금 · 수호` summary stays visible.
- Atlas loading is asynchronous and non-blocking.
- Missing/failed image path does not block Fate selection, combat, save/resume, or modifier composition.

## Frozen gameplay contracts

The following production gameplay files are unchanged:

- `src/game/fate-paths.ts`
- `src/game/fate-runtime.ts`
- `src/game/fate-integration.ts`
- `src/domain/run-snapshot.ts`
- `src/game/endless/snapshot.ts`

Locked behavior:

- checkpoints: 360 / 720 / 1080 seconds
- max Fate choices: 3
- current duplicate-choice behavior preserved
- selection order preserved
- all frenzy/golden/guardian modifiers and caps unchanged
- Actions: 9/9
- RunSnapshot schema mutation: false

## Phase 2037 — 60 deterministic samples

`auditFatePathRecallAssets()` covers 60 deterministic checks:

- identity coverage: 3/3
- unique cells: 3/3
- toast coverage: 100%
- active recall coverage: 100%
- fallback coverage: 100%
- max visible recall icons: 3
- selection order preserved: true
- duplicate selection preserved: true
- text fallback preserved: true
- image load failure non-blocking: true
- motion amplitude: 0
- checkpoint contract mutation: false
- modifier contract mutation: false
- Actions: 9/9
- Snapshot schema mutation: false

## Phase 2038 — Release Fail-Closed

Release Freeze now binds:

- `fatePathRecallAssetsPassed`
- `fatePathRecallAssetsSamples = 60`

Feature-branch candidate verification:

- Release Candidate: PASS · RCQ-CBBFD879
- Release Quality Gate: PASS · RQ-D4630257
- Raster: 5/5 PASS
- forged lower evidence with top-level `passed=true`: rejected as `release-freeze`
- sample-count mutation changes the candidate signature

## Feature-branch regression

- test files: 504
- tests: 1,800
- pass: 1,800
- fail: 0
- fresh TypeScript build: PASS
- `git diff --check`: clean

Final delivery must still be revalidated after reconstructed-main merge and after ZIP extraction from a fresh directory.
