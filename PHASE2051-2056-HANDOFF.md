# Phase 2051~2056 Handoff — Relic Resonance Tier Active Recall Integration

## Scope
Phase 2051~2056 adds active recall for the existing Relic Resonance system without adding a new image asset, loader, HUD row, action, inventory field, or snapshot field.

The existing `assets/ui/build-identity-icons.png` atlas is reused for all 14 relics. Resonance tier is now visible as a small `I / II / III` badge on the currently equipped relic in the existing Build Identity Strip, and tier increases use the same relic icon in the existing event-toast surface.

## Phase 2051 — Reused Relic Resonance identity contract
- Added `relic-resonance-recall-assets.ts`.
- Reuses all 14 existing relic cells from `build-identity-icons.png`.
- Atlas remains 480×384 RGBA, 5×4, 96×96 cells.
- Relic identity coverage: 14/14.
- Unique relic cells: 14/14.
- Static only: animation false, motion amplitude 0.
- Text fallback preserved and image load failure is non-blocking.
- Existing PNG SHA-256 remains `07be13ea898ed1f7627ad4b1b1929bdbac74eaecfa303c758335f64377440d66`.

## Phase 2052 — Resonance tier-up toast
- The Game tracks the current relic and last observed resonance tier as transient presentation state only.
- When the active relic reaches a higher tier, the existing event toast reports `유물 공명 · <유물명> · 공명 I/II/III`.
- The existing relic icon from `build-identity-icons.png` is drawn in the existing toast identity slot.
- No new toast surface or animation was added.

## Phase 2053 — Build Identity Strip tier badge
- The existing relic icon remains first in the Build Identity Strip.
- When resonance tier is I/II/III, a small static tier badge is drawn at the relic icon lower-right corner.
- Tier 0 has no badge.
- Fusion icons and strip capacity are unchanged.

## Phase 2054 — Stale-state and restore safety
- No relic immediately clears the transient resonance tracker and yields no badge.
- Tier 0 yields no badge.
- A relic change resets comparison state so a valid new relic resonance can be surfaced once.
- Run snapshot restore synchronizes the transient tracker to restored state to prevent a false tier-up toast after resume.
- Presentation identity state is not serialized.

## Gameplay contract freeze
The following existing gameplay files are unchanged:
- `src/game/endless/relic-resonance.ts`
- `src/game/endless/snapshot.ts`
- `src/game/endless/types.ts`
- `assets/ui/build-identity-icons.png`

Existing resonance rules remain unchanged:
- Score = `fusionCount × 1.5 + fateChoiceCount + ascensionSelections + matching-hero relic affinity(1)`.
- Score clamp: 0…16.
- Tier thresholds: I at 3, II at 6, III at 9.
- Per-tier modifiers remain:
  - Spell Power +5%.
  - Cooldown -3%.
  - Area +3.5%.
  - Gold +4%.
  - Core Damage Taken -2.5%.
- Existing modifier clamps remain unchanged.
- Actions remain 9/9.
- No RunSnapshot or Endless snapshot schema mutation.

## Phase 2055 — 60 deterministic samples
`auditRelicResonanceRecallAssets()` validates exactly 60 deterministic samples.

Results:
- relic coverage: 14/14
- unique cells: 14/14
- toast coverage: 100%
- strip badge coverage: 100%
- fallback coverage: 100%
- tier badge coverage: 100%
- text fallback preserved: true
- image load failure non-blocking: true
- icon motion amplitude: 0
- stale badge guarded: true
- score contract mutation: false
- tier threshold mutation: false
- modifier contract mutation: false
- Actions: 9/9
- snapshot schema mutation: false

## Phase 2056 — Release Fail-Closed
Release Freeze now binds:
- `relicResonanceRecallAssetsPassed`
- `relicResonanceRecallAssetsSamples = 60`

Candidate evidence:
- Normal: `PASS · RCQ-D91FDA07`
- Forged child evidence false while parent passed remains true: `REVIEW · release-freeze · RCQ-F57D12A6`
- Sample count 60→61: `PASS · RCQ-124067F8`
- Release Quality Gate: `PASS · RQ-D4630257`
- Raster baseline: 5/5 PASS

## Regression evidence before merge
Feature worktree:
- 516 test files
- 1,818 tests
- 1,818 PASS
- fail 0
- Fresh TypeScript build PASS
- Relevant focused regression: 52/52 PASS

## Delivery policy
The source delivery used as the Phase 2050 baseline did not contain the original repository `.git` history. Any Git SHA reported for Phase 2056 is therefore a reconstructed-delivery SHA and must not be represented as the original upstream repository SHA.
