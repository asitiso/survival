# Phase 283~302 Product Gate Design

## Goal
Finish the Phase 282 combat loop by making skill rewards readable, making Last Law and safe-zone timing one authoritative lifecycle, giving all 12 Final Forms distinct audio/palette identity, auditing foldable thumb travel, and replacing separate release checks with one deterministic Release Manifest gate.

## Global constraints
- Combat Action count remains exactly 9.
- No new blocking modal, permanent menu, persistent currency, or snapshot schema field.
- Existing Mythic geometry/collision remains authoritative for danger.
- Tactic feedback and Final Form presentation never increase enemy/projectile budgets.
- Last Law still activates at the existing Mythic HP threshold; the new lifecycle only changes safe-zone timing while it is active.
- Final Form combat values remain owned by the existing family finisher profile; 12-form differences are presentation-only.
- Non-foldable input behavior remains unchanged.
- Raster baselines are never auto-written or auto-approved.
- Release Manifest must be deterministic for a fixed source tree and verification result.

## Phase 283~286 — Tactic Link Success Feedback
When `MythicTacticAttackLink` is actually consumed by a boss special, Game emits one archetype-specific success cue. Six profiles provide label, primary/secondary accent, ring/particle/trail counts, and an existing bounded sound family. Feedback happens on consumption, not merely when the tactic reward is awarded, so the cue confirms that the player successfully altered a real boss attack. Presentation counts remain below the existing mobile caps and no combat modifier is added here.

## Phase 287~290 — Last Law Safe-Zone Lifecycle
Last Law becomes an input to the same safe-zone lifecycle that drives collision, rendering, SAFE LANE, and safe-zone pressure. Normal Mythic encounters preserve the current 9000 ms cycle. Active Last Law shortens the cycle and stable window, but destroyed weakpoints partially restore breathing room. The lifecycle has hard floors for stable/reform time and hard caps for collapse/collapsed time. The existing 15% Last Law activation rule remains unchanged.

## Phase 291~294 — Twelve Final-Form Audio/Palette Identity
All 12 Final Forms receive a deterministic audio/palette profile layered over the four combat families. Each profile defines primary/secondary color, bounded oscillator frequency multiplier, bounded duration/gain multiplier, and a palette id. `ArcaneAudio.play` gains an optional presentation-only sound variation argument; existing callers remain source-compatible. Family finisher combat values and scheduler priority/cooldown remain unchanged.

## Phase 295~298 — Foldable Thumb Travel Audit
Add a pure audit of the foldable left-thumb joystick lobe and right-thumb action cluster. It reports maximum/average travel, unreachable actions, cross-hinge violations, and a deterministic pass/fail summary. The audit uses the same safe-area profile and action button layout as runtime input. It does not move buttons or make the hinge interactive. Non-foldable profiles return an explicit not-applicable result.

## Phase 299~302 — Release Manifest Gate
Create one final product gate that runs the full test suite, raster CI, release-quality gate, and then assembles a deterministic manifest containing test count, action invariant, raster/release signatures, foldable thumb audit, baseline mutation policy, source revision label, and issues. A CLI writes JSON/Markdown only when an output path is explicitly supplied. Any failed prerequisite or invariant produces REVIEW/non-zero exit. The script never mutates source baselines.

## Verification
- RED→GREEN targeted tests for each phase group.
- Integration tests for Tactic consumption feedback, Last Law lifecycle use, Final Form audio variation, foldable audit, and Release Manifest.
- Full `npm test` regression.
- `npm run verify:raster`.
- `npm run verify:release`.
- `npm run verify:manifest`.
- `git diff --check`.
- Static HTTP smoke for root, game bundle, and new modules.
