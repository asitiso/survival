# Phase 4353-4370 Cast-to-Impact / Action-Result Readability

## Goal
Make it immediately clear which player action produced a meaningful battlefield result without increasing combat power, changing targeting, or adding high-maintenance image assets.

## Existing behavior to preserve
- Projectile impact lineage, direction, guard/weakpoint contact ownership, density budgets, and target-intent cues already exist and must not be duplicated.
- Manual cast buffering, AUTO targeting, weakpoint aim blending, damage, cooldowns, rewards, saves, and enemy tuning remain unchanged.
- Boss/critical telegraphs and mythic safe-lane guidance always retain higher visual priority.

## New behavior
1. Distinguish contact from resolved results. Normal hits stay quiet; weakpoint hits may acknowledge softly; weakpoint breaks, guard breaks, enemy kills, and boss heavy-hit staggers receive stronger but brief confirmation.
2. Use existing source positions to preserve cast-to-impact causality. Do not add sprite atlases; use Canvas arcs/rings/short connectors.
3. Coalesce repeated weakpoint-hit confirmations and dense multihit spam while never suppressing break/stagger/kill outcomes.
4. Yield under battlefield stress, protected warnings, and safe-lane visibility. Reduced Motion disables pulse/expansion motion; Reduced Flash lowers alpha and ray count.
5. Validate the presentation across 4 heroes x Threat 0-5 x manual/AUTO conditions and retain the Phase 4317-4352 control/target regressions.

## Phase mapping
- 4353-4358: resolved outcome ownership and precedence.
- 4359-4364: meaningful outcome confirmation and coalescing.
- 4365-4370: battlefield causality budget, accessibility, matrix regression.
