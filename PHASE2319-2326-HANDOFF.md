# Phase 2319~2326 Handoff — Catastrophe Rotation Forecast + Transition Impact Projection Integration

## Baseline / provenance
- Input baseline: Phase 2318 reconstructed local main `dd5d6afec01773e21bd908b827436813c1fb87cc`.
- This SHA is reconstructed local Git provenance only, not an upstream repository claim.
- Baseline Catastrophe identity tests: 6/6 PASS.
- Baseline gameplay source `src/domain/catastrophe.ts` remains unchanged.

## Scope
Display-only Catastrophe rotation recall. The frozen 20-minute start, 180-second rotation, five catastrophe order/modifiers, Actions 9/9, and snapshot schema are unchanged.

## Phase 2319 — Transition identity atlas
Added:
- `assets/ui/catastrophe-transition-icons.png`
- `src/game/catastrophe-transition-identity-assets.ts`

Atlas contract:
- 192×192 / 2×2 / 96×96 cells
- `helpful`, `harmful`, `mixed`, `transition`
- 4/4 pixel-unique cells
- static, zero motion amplitude
- text fallback preserved
- load failure never blocks gameplay
- PNG SHA-256 `05c532b8d56aacaea8f9f34fc49e583b8b1a8ae20d131f02a377d4d95f1e21d9`

## Phase 2320~2321 — Authoritative transition projection
Added `src/game/catastrophe-transition-projection.ts`.

Projection reads existing `catastropheAt()` and `catastropheModifiers()` directly. It computes:
- current catastrophe
- next catastrophe
- seconds until next rotation
- 60-second forecast visibility
- actual before→after modifier deltas
- helpful / harmful / mixed outcome
- at most two highest-salience changes for presentation

Examples:
- Golden Night → Frenzy: harmful; gold loss + enemy-speed pressure.
- Frenzy → Arcane Surge: helpful; cooldown relief + enemy-speed relief.
- Arcane Surge → Red Moon: mixed; beneficial enemy-speed relief but harmful density/elite/cooldown changes.
- Guardian Grace → Golden Night: mixed; gold gain with loss of core-damage protection.

The pre-start window also truthfully forecasts Golden Night during the final 60 seconds before 20:00.

## Phase 2322 — HUD forecast integration
Modified `src/game/game.ts` only at presentation level.

- No new HUD row.
- Existing catastrophe icon remains unchanged.
- On non-foldable layouts, a compact 82×22 forecast box appears only when the next transition is within 60 seconds.
- The forecast shows a countdown plus `transition` and overall outcome icons.
- It is suppressed for hero critical, core critical, or boss special timer ≤1.2s.
- Foldable layout intentionally suppresses the extra forecast to avoid collision with existing battlefield/world/ascension recall.

## Phase 2323 — Transition banner impact recall
The existing frozen Catastrophe banner name and description remain verbatim.

On a real transition, the banner additionally shows:
- compact authoritative impact hint, up to two changes
- transition icon
- helpful/harmful/mixed icon

Presentation state is stored only in `catastropheBannerTransitionProjection` and reset on a new run. It is never persisted.

## Phase 2324~2325 — Deterministic audit
Added `src/game/catastrophe-transition-projection-identity-audit.ts`.

Exactly 60 deterministic samples:
- 20 rotation-edge samples: five edges × four contracts
- 15 forecast-window samples: five boundaries × outside/edge/imminent
- 4 identity samples
- 21 frozen invariants

Audit contract:
- transitionSamples 20
- forecastWindowSamples 15
- identityCount 4
- all five rotation edges covered
- all three outcome states covered
- startSeconds 1200
- rotationSeconds 180
- forecastWindowSeconds 60
- actionCount 9
- snapshotSchemaMutation false
- gameplayMutation false
- issues []

## Phase 2326 — Release Freeze / Candidate binding
Modified:
- `src/game/release-freeze-audit.ts`
- `src/game/release-candidate-audit.ts`

Added fail-closed evidence:
- `catastropheTransitionProjectionIdentityAssetsPassed`
- `catastropheTransitionProjectionIdentityAssetsSamples`

Candidate signature binds the pass flag and sample count and markdown includes `catastrophe-transition-projection-identity-assets safe (60)`.

## Tests
Added exactly four test files:
- `tests/phase2319-2321-catastrophe-transition-assets-projection.test.mjs`
- `tests/phase2322-2323-catastrophe-transition-integration.test.mjs`
- `tests/phase2324-2325-catastrophe-transition-audit.test.mjs`
- `tests/phase2326-catastrophe-transition-release-gate.test.mjs`

TDD RED: all 12 new tests failed because modules/assets/integration/release evidence did not exist.
Focused GREEN: 12/12 PASS.

## Frozen gameplay contracts
Baseline diff confirms unchanged:
- `src/domain/catastrophe.ts`
- `src/game/endless/snapshot.ts`

Therefore unchanged:
- Catastrophe begins at 1200 seconds
- rotation every 180 seconds
- order: Golden Night → Frenzy → Arcane Surge → Red Moon → Guardian Grace → repeat
- all existing catastrophe modifier values
- Actions 9/9
- snapshot schema

## Verification evidence before commit
- full regression: 659 test files / 2,106 tests / 2,106 PASS / 0 FAIL
- focused: 12/12 PASS
- Candidate: `RCQ-43BB2951`
- Release Quality: `RQ-D4630257`
- Raster: 5/5 PASS
- `git diff --check`: clean
- atlas: 192×192, 4/4 pixel-unique, 2,340 bytes

Final commit/main SHA and delivery ZIP evidence are filled by the final packaging report after merge verification.
