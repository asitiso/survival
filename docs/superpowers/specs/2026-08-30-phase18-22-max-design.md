# Phase 18–22 Maximum Expansion Design

## Goal
Turn the existing endless defense prototype into a release-shaped offline mobile loop by adding spell fusion, in-run fate choices, broader enemy/boss tactics, hero mastery unlocks, and resilient pause/resume/onboarding/balance tooling without increasing combat button count or removing existing mobile performance caps.

## Global constraints
- Keep the existing landscape six-spell combat layout and global AUTO assist.
- No gacha, pets, guilds, server accounts, PvP, crafting-material economy, or multi-slot equipment inventory.
- Enemy cap remains 320, enemy projectile cap remains 150, combat feedback cap remains 96, presentation particles remain bounded by the existing presentation budget.
- All new persistent data uses versioned, bounded localStorage payloads with sanitizer functions.
- Threat never directly reduces player attack power.
- All new combat systems must have pure/testable rule modules and minimal `Game` branching.

## Phase 18 — Spell Fusion

### Fusion model
A run can own at most two fusions. A fusion becomes eligible only when both required component spells are level 10. Fusion candidates appear only in boss rewards and never consume an additional combat button: casting either component spell triggers the fusion behavior through the existing spell runtime.

Six base fusion families cover the six unordered pairs among the four normal spells:
- Solar Detonation: Fire Bolt + Flame Field
- Thunder Singularity: Chain Lightning + Black Hole-style vortex behavior expressed through Chain Lightning + Frost Nova pair mechanics
- Frostfire Cataclysm: Fire Bolt + Frost Nova
- Storm Crucible: Chain Lightning + Flame Field
- Glacial Conduit: Chain Lightning + Frost Nova
- Cataclysmic Domain: Frost Nova + Flame Field

Because only the four normal spells are components, the exact six unordered pairs are deterministic. Hero identity mutates damage/area/control channels rather than multiplying the catalog to 24 separate data records.

### Runtime
`spell-fusions.ts` owns definitions, eligibility, hero-facing names, and bounded modifiers. `fusion-runtime.ts` owns the maximum-two equipped fusion state and trigger cooldowns. `SpellSystem` receives optional fusion modifiers so existing callers remain valid.

## Phase 19 — Fate Paths

At 6:00, 12:00 and 18:00, combat pauses for a compact three-card choice:
- Frenzy Path: more spawn/elite pressure, more XP.
- Golden Path: stronger enemies, more gold/shop access.
- Guardian Path: stronger core protection, slightly lower offensive reward.

Only one choice exists per checkpoint. Choices accumulate into a bounded run profile and affect field objective reward weights, enemy pressure, boss variant bonus and run reward modifiers. Fate is a run-only system and creates no new permanent currency.

## Phase 20 — Enemy, Boss and Apex Expansion

### New regular enemies
- Shieldbearer: reduced frontal/initial incoming damage modeled as a regenerating guard pool.
- Blink Assassin: periodic reposition toward the hero and burst melee behavior.
- Siege Golem: always prioritizes the guardian core and has slow heavy attacks.
- Nullifier: nearby aura increases spell cooldown pressure through one bounded global multiplier, not per-spell timers.

### New bosses
The archetype rotation expands from 3 to 6:
- Abyss Witch: curse zones and area denial.
- Twin Maw: alternating dual-direction projectile patterns.
- Time Eater: temporal pulses that temporarily increase player spell cooldown pressure.

Existing boss presentation, variant and weakpoint systems remain reusable through archetype tuning.

### Apex boss
After 20 minutes, sufficiently high Threat/variant pressure may replace a normal boss with an APEX encounter. Apex combines at most two archetype channels at once, never doubles enemy budget, and stays inside projectile/hazard caps.

## Phase 21 — Hero Mastery

Each hero has Mastery 1–20. Mastery XP is awarded at run end from survival, boss kills and threat, then persisted per hero.

Mastery primarily unlocks choice breadth rather than raw power:
- new starting trait at milestone levels,
- extra fusion candidates,
- hero-only relic availability,
- alternate spell evolution branches,
- compact mastery title/border metadata.

Small raw bonuses are capped and secondary. The initial implementation exposes the persistent mastery profile, milestone unlock checks, mastery XP reward and lobby/result display hooks.

## Phase 22 — Mobile Product Completion

### Pause/resume
The game can be paused manually and automatically on `visibilitychange`. The simulation clock and input actions stop while paused; rendering can continue.

### Run snapshot
A versioned snapshot stores only reconstruction-critical state: hero, trait, threat, elapsed time, level/XP/gold, core/hero health, spell levels, equipment, relic/fusions, fate profile, map/evolution state, boss ordinal and run counters. It intentionally does not serialize hundreds of enemy/projectile positions. Resume reconstructs a clean battlefield at equivalent progression pressure.

### First-run onboarding
A small state machine advances through movement, normal spell, ultimate, level-up/shop awareness and guardian-core awareness using actual gameplay signals. No modal tutorial pages are added.

### Balance simulator
Pure functions project 10/20/30/45-minute pressure, level curve, enemy budget, boss tier, expected gold band and rough hero DPS band. Tests enforce monotonic/bounded curves and catch accidental economy/difficulty spikes.

## UX and error handling
- Every optional storage read is sanitized; corrupt snapshots are ignored and cleared.
- Resume is offered only for a valid snapshot.
- Fate and fusion choices reuse existing card overlay styling.
- Locked mastery content is described but cannot be selected.
- Failure of Audio/Web Storage features never blocks combat.

## Verification
- TDD for every new pure subsystem.
- Full regression after each phase integration.
- `npm test`, standalone `npm run build`, `git diff --check`, HTTP smoke test for new modules, ZIP integrity check.
