# Phase 263~282 Release Combat Design

## Goal
Strengthen high-skill Mythic play and release confidence without adding combat actions, blocking UI, persistent currencies, or snapshot schema fields.

## Global constraints
- Combat Action count stays exactly 9.
- No new blocking modal or permanent management screen.
- No new snapshot fields for Phase 263~282 state.
- Existing Mythic geometry/collision remains the authority for hazard safety.
- Existing boss archetype identity remains the authority for attack-channel meaning.
- All new combat bonuses are transient and bounded.
- Non-foldable input behavior must remain byte-for-byte compatible at call seams where existing tests require it.
- Raster baselines are never auto-approved or auto-written.

## Phase 263~266 — Tactic Break Attack Link
A successful Mythic Tactic Break modifies the next boss-specific special channel once instead of only exposing a flat vulnerability window. The link is derived from boss archetype: inferno dampens projectile density, summoner suppresses a portion of summon pressure, juggernaut shortens the next dash, abyss/time slow the next special cadence, twinMaw reduces the next paired-channel intensity. The modifier is consumed once and expires with the tactic window. No enemy or projectile count may rise because of the reward.

## Phase 267~270 — Last Law Timeline Integration
SAFE Timeline gains a Last Law transition event when a Mythic boss is approaching or inside the final 15% phase. It must distinguish pre-law warning, active law, and safe-zone/hazard deadlines on one decision timeline. The timeline remains informational and never moves the hero. Last Law activation keeps its existing HP threshold and identity logic.

## Phase 271~274 — Twelve Final-Form Finisher Signatures
Each of the 12 Final Forms receives a presentation signature layered on top of the existing four finisher families. The 12 variants differ by ring cadence, particle geometry, trail pattern, label suffix, and sound pitch/variant metadata while preserving family combat values and presentation caps. This prevents balance drift while making forms visually identifiable.

## Phase 275~278 — Foldable Dead-Space Resolver
Foldable input gains a deterministic dead-space resolver that reduces unusable pockets between the left joystick zone, center hinge neutral zone, and right action zone. It may shift the joystick origin inside its safe lobe and choose the nearest right-side action target when expanded hit regions overlap, but it must never make the hinge interactive. Non-foldable input paths remain unchanged.

## Phase 279~282 — Raster Release Quality Gate
Raster verification gains a release-grade aggregate gate. It must combine default baseline audit, critical similarity thresholds, action-count invariant, and report completeness. The gate produces a deterministic release summary/signature suitable for CI artifacts and exits non-zero on REVIEW. It may write a markdown report artifact when explicitly invoked by the script, but must not modify baseline source files or approve changes.

## Verification
- Targeted tests for each phase group and integration.
- Full `npm test` regression.
- `npm run build`.
- `npm run verify:raster` plus release-gate command.
- `git diff --check`.
- Static HTTP smoke for root, game bundle, and new modules.
