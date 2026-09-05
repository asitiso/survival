# Phase 15-17 Triple Depth Design

## Goal

Turn the current endless defense loop into a more tactical run without adding new combat buttons. The player should periodically choose where to stand, which battlefield object to protect or destroy, and which build interaction to exploit, while existing mobile performance caps remain unchanged.

## Design principles

- Keep the landscape mobile control scheme unchanged: left movement, four normal spells, two ultimates, potion, shop, AUTO.
- Reuse existing rewards (gold, shop tokens, potion, relic/build power); do not add another run currency.
- One optional battlefield objective at a time. Never start a new one within 12 seconds of a boss arrival.
- Boss encounter objects are capped and detached from the 320-enemy budget.
- Threat, catastrophe, field event, mission, and objective pressure compose once through bounded multipliers.
- ARCANE COMBO is automatic. The player never equips combo cards manually.
- All new runtime collections have hard caps.

## Phase 15 — Battlefield Objectives

### Objective director

A `BattlefieldObjectiveDirector` begins checking after 150 seconds. It schedules one of three objectives with an 85–115 second gap after completion/failure and avoids repeating the same type twice in a row.

Objectives:

1. `riftSeal` — stand inside a rune circle to fill 100 seal points. Leaving the circle pauses progress. Nearby enemies increase decay slightly, creating a risk/reward positioning choice.
2. `beaconDefense` — a beacon appears with 100 HP for 28 seconds. Enemies entering its radius drain HP. Survive the timer with HP above zero.
3. `cursedAltar` — enter the altar once to activate a 22-second curse. Enemy pressure rises temporarily; surviving completes it. The altar does not require a new button.

### Rewards

Rewards rotate by objective type and success streak:

- Rift Seal: +120 gold or +1 shop token.
- Beacon Defense: +1 potion or +1 shop token.
- Cursed Altar: +180 gold plus a temporary 20-second spell power boost.

Failure has no direct resource penalty. It only ends the opportunity and resets objective streak.

### Placement

Objective positions are derived from map id and evolution stage. Each map supplies three anchor points that avoid the guardian core and action-button side of the arena. Selection chooses the anchor farthest from the hero's current position when possible, making repositioning meaningful.

## Phase 16 — Boss Encounter Arenas

### Encounter nodes

Each boss archetype owns a small set of destructible encounter nodes managed outside `EnemyManager`, capped at four nodes total:

- Inferno: `flamePylon` — two pylons. While alive they reduce boss damage taken. Destroying both creates a 6-second vulnerability window.
- Summoner: `summonCore` — two cores. While alive the boss periodically gains extra summons. Destroying one interrupts the next summon cycle; destroying both slows special cadence for 8 seconds.
- Juggernaut: `armorPlate` — three plates orbit in fixed positions around the boss. Each destroyed plate reduces dash distance and increases boss damage taken slightly.

The nodes implement a tiny `MagicTargetSink` interface. `SpellSystem` reports magic impacts to both terrain and the sink, so player projectiles/AOE/ultimates can damage nodes without turning them into full enemies.

### Arena hazards

A pure `BossArenaState` computes bounded hazards by boss archetype/phase/variant:

- Inferno: periodic burning rings around pylons/boss.
- Summoner: summoning circles that become slow zones before adds appear.
- Juggernaut: dash lanes that remain dangerous briefly after a charge.

At most six hazards exist. Hazard damage is capped and telegraphed through the existing danger presentation layer.

### Boss modifiers

Encounter nodes output a `BossEncounterModifiers` object consumed by `EnemyManager`:

- `bossDamageTakenMultiplier`
- `specialCadenceMultiplier`
- `summonCountBonus`
- `dashDistanceMultiplier`

Default values are neutral, so existing bosses behave identically when no encounter is active.

## Phase 17 — ARCANE COMBO and Run Build Recap

### Combo analyzer

`ArcaneComboAnalyzer` observes the current hero, evolved spells, legendary equipment, active relic, run trait, active synergies, hero meter state, and objective streak. It derives automatic combo tiers:

- Tier 0 — no combo.
- Tier 1 `ARCANE LINK` — two compatible build conditions.
- Tier 2 `ARCANE SURGE` — three compatible conditions.
- Tier 3 `ARCANE ASCENDANCY` — four or more compatible conditions, capped to prevent exponential stacking.

Example families:

- Inferno chain: Arkan + evolved Fire Bolt + legendary Arcane Staff/Blast Rod + Ember Crown/Inferno Heart.
- Frozen control: Seria + evolved Frost Nova + Winter Heart + area legendary/synergy.
- Storm velocity: Kain + evolved Chain Lightning + Rapid Wand + Storm Core + active SURGE.
- Guardian fortress: Edric + Guardian Plate + Oath Seal/Guardian Heart + high core HP.

### Combo effects

Combo modifiers are deliberately small because existing build systems already stack:

- Tier 1: +5% spell power or family-specific utility.
- Tier 2: +8% spell power and +5% area/cooldown utility.
- Tier 3: +12% spell power plus one family-specific effect, with no additional multiplicative tiers.

The analyzer exposes labels, accent color, tier, family, and modifiers. Game HUD shows one compact combo line under synergy text.

### Run recap

Run completion stores no new unbounded history. The result overlay receives:

- Combo family/name and highest tier reached.
- Objective completions/failures and best streak.
- Boss encounter nodes destroyed.
- Existing score/new-record/threat/map data.

The run record score adds a bounded tactical bonus for objectives and encounter nodes, so tactical play matters without overwhelming survival time and boss kills.

## Integration and performance

- Enemy cap remains 320.
- Enemy projectile cap remains 150.
- Feedback cap remains 96.
- Presentation particle cap remains 180.
- Objective objects: max 1 active objective.
- Boss encounter nodes: max 4.
- Boss hazards: max 6.
- No per-enemy combo state.
- No new animation loop independent of the existing fixed update loop.

## Testing

All behavior is built test-first. New tests cover director scheduling, objective progress/rewards, placement, encounter node damage/modifiers, hazard caps, SpellSystem magic target integration, combo tiers/families/modifiers, tactical score bonus, recap data, and Game integration helpers. Full existing regression must stay green after each task.
