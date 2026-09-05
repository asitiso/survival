# Phase 2311~2318 Handoff — Ascension Tier Pressure Forecast + Threshold Outcome Projection Integration

## Provenance

- Delivery baseline ZIP: `arcane-last-stand-phase2310-full-merged.zip`
- Delivery archive comment / prior reconstructed main provenance: `8842954a4792ea66fc989f088f79f1234e8e3c32`
- This session reconstructed baseline: `1a9b6fe71e432e738f00589a2b9bfd2b2f47a9b7`
- Feature branch: `work/phase2311-2318`

## Phase 2311 — Ascension Tier Pressure Atlas

Added `assets/ui/ascension-tier-pressure-icons.png`.

- 384×192 RGBA
- 4×2 grid
- 96×96 cells
- 7 used identities, one unused cell
- identities: enemy health / enemy damage / spawn pressure / elite pressure / gold / mastery / mutator threshold
- 7/7 pixel-unique used cells
- static only; no animation or motion
- PNG SHA-256: `dc4d1e3a5de2fdaf2953273af37311458b3044d83c474ceb6e7b1117000376b8`

Added `src/game/ascension-tier-pressure-identity-assets.ts`.

## Phase 2312~2313 — Authoritative Tier Projection

Added `src/game/ascension-tier-pressure-projection.ts`.

Projection reads the frozen `getAscensionTier()` and `getAscensionModifiers()` functions directly.

- Tier 0 before 30 minutes
- Tier 1 at 30 minutes
- +1 tier every 10 minutes
- Tier 10 cap
- forecast visible only when the next tier is 90 seconds or less away
- Tier 3 / 6 / 9 flagged as mutator thresholds
- transition effects cover enemy health, enemy damage, spawn budget, elite budget, gold and mastery XP
- HUD primary pressure identities are enemy health + enemy damage

Examples:

- 29:00 → A1 in 60s
- 38:30 → A2 in 90s
- Tier 2→3 → HP +0.10× / damage +0.07× / mutator threshold
- Tier 10 → no next-tier forecast

## Phase 2314 — Existing Status Panel Integration

No new HUD row was added.

The forecast is drawn inside the existing status panel immediately left of the catastrophe icon.

- compact label such as `A3 64s`
- up to two pressure icons
- tiny mutator threshold marker at Tier 3 / 6 / 9
- hidden outside the 90-second window
- hidden during hero critical / core critical / boss special ≤1.2s
- async image decode with non-blocking text/gameplay fallback

## Phase 2315~2316 — Tier / Mutator Toast Integration

Ascension tier toast now uses the actual transition projection instead of the vague `후반 압박 상승` copy.

The pre-existing mutator message remains exactly preserved:

`승천 변이 · <mutator name>`

Pressure helper icons are layered onto that toast without replacing the old text contract.

Stale projection state is cleared by unrelated event toasts and run reset.

### Regression found through full-suite review

The first integration moved the mutator text into a new helper and broke the old Phase 2026 literal compatibility contract. The old text path was restored without weakening the old test.

### Catch-up correctness bug found through diff review

When a long resume advances multiple tiers in one `advanceAscension()` call, `this.endlessState.ascension.tier` already contains the final catch-up tier while effects are replayed sequentially. A Tier 3 mutator could therefore have shown Tier 10 pressure helper icons.

A failing regression test was added first. The mutator toast now reuses the immediately preceding `ascension_tier` projection before falling back to current state, so multi-tier catch-up remains truthful.

## Phase 2317 — Deterministic Projection Audit

Added `src/game/ascension-tier-pressure-projection-identity-audit.ts` with exactly 60 deterministic samples.

- 10 authoritative tier transitions
- 30 forecast-window boundary samples
- 7 identity usage/static samples
- 13 schedule/cap/action/schema invariants
- all 10 transitions covered
- all 7 identities covered
- mutator thresholds exactly 3 / 6 / 9
- tier cap 10
- forecast window 90s
- Actions 9/9
- snapshot schema mutation false
- gameplay mutation false

## Phase 2318 — Release Freeze / Candidate Binding

Release Freeze adds:

- `ascensionTierPressureProjectionIdentityAssetsPassed`
- `ascensionTierPressureProjectionIdentityAssetsSamples`

Candidate:

- fail-closed on forged lower evidence
- signature payload includes pass flag + sample count
- markdown includes `ascension-tier-pressure-projection-identity-assets safe (60)`

## Frozen Gameplay Contracts

The following remain unchanged from Phase 2310:

- `src/game/endless/ascension.ts`
- `src/game/endless/ascension-mutator-runtime.ts`
- `src/game/endless/snapshot.ts`
- `src/game/endless/types.ts`
- `src/game/config.ts`

Locked behavior:

- Ascension starts at 30 minutes
- +1 tier every 10 minutes
- tier cap 10
- enemy health +0.10× per tier up to +1.00×
- enemy damage +0.07× per tier up to +0.70×
- spawn budget +0.06× per tier up to +0.60×
- elite budget +0.05× per tier up to +0.50×
- gold +0.04× per tier up to +0.40×
- mastery XP +0.05× per tier up to +0.50×
- mutator award tiers 3 / 6 / 9
- mutator RNG / uniqueness unchanged
- Actions 9/9
- RunSnapshot schema unchanged

## Worktree Verification Before Handoff

- focused Phase 2311~2318: 13/13 PASS
- full regression: 655 test files / 2,094 tests / 2,094 PASS / 0 FAIL
- Candidate: `RCQ-ECDF8547` PASS
- Release Quality: `RQ-D4630257` PASS
- Raster: 5/5 PASS

Final delivery packaging must be performed only after fast-forward merge to reconstructed `main`, followed by a fresh merged-main full regression, Candidate/Release/Raster rerun, deterministic ZIP reproducibility, independent extraction, HTTP 9/9 and new-run/checkpoint/resume verification.
