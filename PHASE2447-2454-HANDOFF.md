# Phase 2447-2454 Handoff — Resource Flow & Spawn Pressure VFX

## Scope
Presentation-only battlefield readability pass built on Phase 2446. Gameplay economy, pickup collection distance, magnet movement, spawn counts, enemy stats, input actions, and snapshot schema remain unchanged.

## Phase 2447 — Pickup Flow VFX Atlas
- Added `assets/arena/pickup-flow-vfx.png`.
- 512×384, 4×3, 128×128 cells.
- 2 resource kinds (`xp`, `coin`) × 6 states = 12 mapped cells.
- States: `attract`, `cluster`, `rich`, `globalMagnet`, `collectSmall`, `collectLarge`.
- 12/12 cells are non-empty and pixel-unique.

## Phase 2448 — Attraction Readability
- Pickup render path now marks resources entering the existing magnet range.
- Existing magnet range and acceleration formulas are unchanged.
- New atlas is an overlay; legacy battlefield pickup art remains the base/fallback.

## Phase 2449 — Cluster / Rich / Global Magnet Identity
- Added presentation classifications for merged pickups, high-value pickups, and global magnet attraction.
- No XP/gold values or drop quantities are modified.
- No collection-radius changes.

## Phase 2450 — Collection Burst Feedback
- Added short-lived XP/coin collection burst queue.
- Small/large burst identity is presentation-only.
- Queue capped at 32 transient cues.
- Reduced Flash lowers the overlay alpha without disabling core pickup readability.

## Phase 2451 — Spawn Pressure VFX Atlas
- Added `assets/arena/spawn-pressure-vfx.png`.
- 512×256, 4×2, 128×128 cells.
- 4 pressure classes × 2 lifecycle states = 8 mapped cells.
- Pressure classes: `regular`, `specialist`, `elite`, `boss`.
- Lifecycle: `portal` → `arrival`.
- 8/8 cells are non-empty and pixel-unique.

## Phase 2452 — Spawn Pressure Classification
- Existing spawn portal queue now classifies specialist, elite, and boss arrivals visually.
- Specialist identity covers shieldbearer / assassin / siegeGolem / nullifier.
- Spawn count, type selection, difficulty and stat formulas remain unchanged.

## Phase 2453 — Lifecycle Integration & Fallback
- Game preload path now loads both atlases independently.
- Spawn pressure uses new imagery when available; regular/elite legacy spawn portal imagery remains fallback.
- Pickup flow overlays are omitted on load failure while existing pickup graphics remain intact.
- No atlas failure blocks gameplay.

## Phase 2454 — Deterministic Audit & Release Binding
- Added `runResourceFlowSpawnPressureVfxAudit()` with 64 deterministic samples.
- Audit requires 9/9 action invariant, both atlas coverage audits, presentation-only contract, and unchanged snapshot schema.
- Release Freeze includes pass/sample evidence.
- Release Candidate signature payload binds the new pass/sample evidence and fails closed on forged failure.

## Verification
- Focused Phase 2447-2454 contract: 6/6 PASS after verified RED state.
- Related battlefield regressions: 27/27 PASS.
- Full suite sharded to avoid sandbox process limits: 704 test files / 2,247 tests / 0 failures.
- TypeScript build: PASS.
- Candidate audit: `RCQ-71125EFD` PASS.
- Release quality gate: `RQ-D4630257` PASS, action invariant 9/9.
- Raster baseline: 5/5 PASS.
- Pickup atlas SHA-256: `a1e897e10944b24a2e7ff64117a1f547bd68a5e74e21221274bfabca79207bba`.
- Spawn atlas SHA-256: `c1b7f4e6dae9c2c2446bbb5ba30ddaca27afb613454eef49c93715033b2b92e2`.

## Continuation Notes
Prefer future image work only where it materially improves moment-to-moment battlefield recognition. Avoid duplicating the existing pickup/spawn identities unless a later mechanic introduces genuinely new player decisions.
