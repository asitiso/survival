# Phase 5 Field Events & Meta Rewards Design

## Goal
Long survival runs should keep producing new tactical decisions without adding navigation-heavy menus or quest administration.

## Architecture
`src/game/field-events.ts` owns event scheduling, active-event state, timing, and combat modifiers. It does not spawn entities or mutate the hero directly. `Game` consumes event transitions and applies them through the existing enemy, shop, pickup, and HUD systems. `src/domain/meta-rewards.ts` calculates and persists Arcane Shards independently from run gold.

## Field event rules
- First event becomes eligible at 75 seconds.
- Events never overlap.
- Do not start a new event when a boss is within 12 seconds of spawning.
- After an event ends, schedule the next event 85–120 seconds later.
- Event selection avoids immediately repeating the previous event.
- Events are short enough to preserve endless-combat flow and never open a modal.

## Events
1. Golden Goblin: 22 seconds. Spawn one fast fleeing golden enemy inside the arena. Killing it awards a large coin drop and completes the event. If the timer expires it escapes and is removed.
2. Supply Drop: 30 seconds. Spawn a crate in a tactically exposed arena position. Touching it grants either a potion or one free non-potion shop item and completes the event.
3. Mana Storm: 25 seconds. General spell cooldown multiplier 0.68 and enemy spawn pressure 1.5x.
4. Golden Night: 30 seconds. Gold drops 2x and elite pressure increases.
5. Elite Rush: 14 seconds. Immediately spawn an elite pack and temporarily increase elite pressure.

## Catastrophe variants
After 20 minutes, catastrophes rotate indefinitely through positive, negative, and mixed rules. Catastrophes expose modifiers instead of requiring Game to hardcode IDs: gold multiplier, enemy speed, cooldown multiplier, spawn pressure, elite interval multiplier, and core damage multiplier.

## Arcane Shards
Arcane Shards are distinct from run gold. They are earned at game over from survival minutes, boss kills, danger reached, and kill milestones. Total shards persist in browser localStorage. Phase 5 displays earned and total shards only; no permanent upgrade tree is added yet.

## UI
- Active field event appears as a compact banner under the top-center HUD with remaining time.
- Supply crate is rendered directly in the arena.
- Golden goblin is rendered by EnemyManager.
- Results show run Arcane Shards and accumulated total.
- No new navigation screen or inventory screen.

## Performance and clarity constraints
- At most one field event is active.
- Event effects reuse existing enemy/projectile systems and respect the 320 enemy budget where possible.
- No per-frame DOM work during combat.
- Event feedback must remain readable alongside boss warnings and level-up/shop overlays.
