# Phase 2303~2310 Handoff — Battlefield Mechanic Identity + Evolution Impact Recall Integration

## Delivery basis

This bounded pass was applied to the provided `arcane-last-stand-phase2302-full-merged.zip` delivery.

- Delivery archive provenance comment: `15676599844f9aacb0963997feb5e310acc738ca`
- Reconstructed local baseline SHA: `af1fe75a6636876b112ab5cc98738f3889ee5261`
- The reconstructed SHA is local verification provenance only and is not claimed as the upstream repository SHA.

## Scope

Phase 2303~2310 makes the existing battlefield identity more actionable without adding a new HUD row. The existing 3-map × 3-stage battlefield environment atlas remains the primary map/stage identity; this pass adds only compact mechanic/stage cues and authoritative evolution deltas.

### Phase 2303 — Battlefield Mechanic + Stage Atlas

- Added `assets/ui/battlefield-mechanic-icons.png`.
- Atlas: **288×192 / 3×2 / cell 96×96**.
- Mechanic cells: `wall`, `slow`, `crystal`.
- Stage cells: `stage0`, `stage1`, `stage2`.
- **6/6 pixel-unique** cells.
- Static only: animation false, motion amplitude 0.
- Asset bytes: **3,538**.
- SHA-256: `e157bd8993d7af067c6decc2605f0912a766399c5f3e5d3ae7a60b6c57c3b811`.

### Phase 2304 — Authoritative Battlefield Mechanic Projection

Added:
- `src/game/battlefield-mechanic-identity-assets.ts`
- `src/game/battlefield-mechanic-projection.ts`

`projectBattlefieldMechanics()` derives the current mechanic profile from the existing `MAP_LAYOUTS` plus `evolveMapLayout()` result. It does not copy map geometry or mechanic balance values.

Baseline dominant identities:
- Ruined Gate → wall/chokepoint
- Frozen Fen → slow field
- Crystal Quarry → crystal chain explosion

Evolution stages may change the dominant mechanic when the actual evolved layout changes enough to do so.

`projectBattlefieldEvolutionImpact()` compares stage N-1 to stage N using the authoritative evolved layouts and ranks only wall / slow / crystal changes.

### Phase 2305 — Existing HUD Thumbnail Overlay

The existing battlefield thumbnail remains in the current status panel. Two tiny overlays are drawn inside that same 34×19 thumbnail:
- dominant mechanic cue
- evolution stage badge

No status panel height, HUD row, build-label capacity, World Evolution position, or action layout is changed.

### Phase 2306 — Evolution Impact Toast

At the existing 8-minute and 16-minute map evolution points:
- the original `mapEvolutionLabel()` remains,
- actual top 1~2 layout deltas are appended,
- up to two mechanic icons are reused in the existing event toast,
- helper icons yield to hero critical, core critical, and boss special timer ≤ 1.2s,
- unrelated event toasts clear stale battlefield evolution projection state.

Examples from the final authoritative projection:
- Ruined Gate stage 1: `둔화+1 · 통로변경`
- Ruined Gate stage 2: `수정+1 · 통로변경`
- Frozen Fen stage 1: `벽+1 · 둔화강화·확장`
- Frozen Fen stage 2: `수정+1 · 둔화확장`
- Crystal Quarry stage 1: `수정+2 · 둔화확장`
- Crystal Quarry stage 2: `벽+2 · 수정강화`

### Phase 2307 — Gameplay Freeze

Unchanged baseline files:
- `src/game/map-layouts.ts`
- `src/game/map-evolution.ts`
- `src/game/terrain.ts`
- `src/game/endless/snapshot.ts`

Frozen behavior includes:
- evolution thresholds at 480s / 960s,
- all wall geometry,
- all slow pool radii/factors,
- all crystal thresholds/radii/damage,
- crystal charge/cooldown behavior,
- Actions 9/9,
- snapshot schema.

### Phase 2308~2309 — Deterministic Audit

Added `src/game/battlefield-mechanic-projection-identity-audit.ts`.

Exactly **60 deterministic samples**:
- 3 maps × 3 stages × 5 runtime projection checks = 45,
- 6 real stage transitions,
- 9 freeze/atlas/action invariants.

Audit verifies:
- 3/3 mechanic identity coverage,
- 3/3 stage identity coverage,
- all 6 evolution transitions,
- Actions 9/9,
- snapshot schema mutation false,
- gameplay mutation false,
- issues `[]`.

### Phase 2310 — Release Freeze / Candidate Binding

Release Freeze adds:
- `battlefieldMechanicProjectionIdentityAssetsPassed`
- `battlefieldMechanicProjectionIdentityAssetsSamples`

Candidate:
- includes the pass flag in fail-closed consistency,
- binds pass flag + sample count into the candidate signature,
- exposes `battlefield-mechanic-projection-identity-assets safe (60)` in markdown.

## TDD evidence

Initial RED:
- 10 tests total,
- 9 expected failures because assets/projection/integration/audit/release evidence did not exist,
- 1 existing gameplay freeze check passed.

Initial GREEN:
- focused 10/10 PASS.

Diff review found a presentation risk: the original map evolution label plus two verbose delta labels could reach 35 characters inside the existing 420px event toast.

Regression cycle:
- added a new ≤30-character toast contract,
- observed RED on Ruined Gate stage 1,
- compacted delta wording only,
- focused **11/11 PASS**.

No gameplay values were changed by this fix.

## Final verification — feature worktree

- Test files: **651**
- Tests: **2,081**
- Pass: **2,081**
- Fail: **0**
- Focused Phase 2303~2310: **11/11 PASS**
- Candidate: **PASS — `RCQ-7B0219CD`**
- Release Quality: **PASS — `RQ-D4630257`**
- Raster: **5/5 PASS**
  - 16:9 `RR-FE2C6B74`
  - 20:9 `RR-0937F125`
  - 4:3 `RR-4C84B218`
  - foldable `RR-023FFC4B`
  - 32:9 `RR-737044D6`
- `git diff --check`: clean

## Packaging rule

The delivery ZIP must contain fresh `dist/`, exclude `.git`, use deterministic timestamps/order/permissions/compression, store the reconstructed final main SHA as the archive comment, be generated twice byte-identically, and be independently re-extracted for build/focused/Candidate/Release/Raster/HTTP/run-cycle verification.
