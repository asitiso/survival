# Landscape Mobile Endless Defense — Design Specification

## 1. Product Goal
Build a landscape mobile action-defense game where one hero survives an endless enemy flood by moving manually and aggressively casting magic. The run combines three clean progression axes: XP grows the hero and spells, coins buy run-only equipment and potions, and permanent currency is reserved for later meta unlocks.

The first playable milestone must already feel like a game: enemies continuously spawn, spells clear crowds, XP and coins visibly drop and are collected, level-up choices change combat, a shop lets the player spend coins, and difficulty escalates without a hard ending.

## 2. Platform and Presentation
- Primary target: mobile web, landscape orientation, 16:9 presentation.
- Responsive down to 960x540 logical space while filling wider screens with safe-area padding.
- Touch-first controls; mouse/keyboard fallbacks for desktop development.
- Gameplay occupies most of the screen. HUD is edge-aligned and never hides the hero.
- Visual readability rule: player magic is bright/saturated, enemy danger indicators use red/orange, interactable economy objects use gold.
- Initial version uses procedural shapes and particles; art assets are not required to validate gameplay.

## 3. Core Run Loop
1. Pick a hero.
2. Enter the arena with one starter spell.
3. Enemies spawn continuously from outside the camera bounds.
4. Kill enemies to gain XP crystals and coins.
5. XP causes level-ups; each level presents three upgrade cards and the player picks one.
6. Gold is spent during shop visits on one weapon, one armor, and consumable potions.
7. Elites and bosses appear on timers while normal enemies continue spawning.
8. Every few minutes the danger tier increases. After the late-game threshold, catastrophe modifiers begin stacking.
9. The run ends only when hero HP or the guardian core HP reaches zero.
10. Results summarize survival time, kills, level, gold earned, bosses killed, and final build.

## 4. Controls
### Touch
- Left side: floating virtual joystick for 8-direction movement.
- Right side: six action buttons arranged for thumb reach.
  - Four normal spell buttons.
  - Two larger ultimate buttons.
- Potion quick-slot sits above the normal spell cluster.
- Normal spell button:
  - Tap: cast once.
  - Hold: repeatedly cast whenever cooldown finishes.
  - Release: stop repeating.
- Ultimates are manual only.

### Desktop fallback
- WASD / arrow keys: movement.
- 1–4: normal spells.
- Q / E: ultimates.
- Space: potion.

## 5. Hero Roster
The data model supports four heroes from the start, but the first playable build may use one fully implemented hero plus selectable placeholders that share the combat core.

### Arkan — Fire Destroyer
- Identity: best crowd-clearing and chain explosions.
- Passive: enemies killed by burning damage have a chance to explode.

### Seria — Frost Controller
- Identity: slows, freezes, terrain control.
- Passive: frozen enemies take increased damage; frozen deaths spread chill.

### Kain — Storm Chaser
- Identity: high mobility and rapid chaining magic.
- Passive: consecutive spell casts build Overload, increasing cast speed.

### Edric — Guardian Battlemage
- Identity: survivability and guardian-core defense.
- Passive: stronger near the core; damage to the core charges ultimate energy.

## 6. Spell System
- A run has four normal spell slots and two ultimate slots.
- Each hero has a larger candidate pool, but only four normal spells can be active in a run.
- Spells scale by levels and must change behavior, not only numbers.
- Example fire spell progression: projectile -> larger explosion -> extra projectile -> pierce -> burn ground -> evolved projectile.
- The first playable build implements four normal spells and two ultimates:
  1. Fire Bolt — aimed projectile, short cooldown.
  2. Chain Lightning — jumps through nearby enemies.
  3. Frost Nova — radial damage + slow.
  4. Flame Field — targeted persistent area damage.
  5. Meteor Storm — ultimate, large delayed impacts.
  6. Black Hole — ultimate, pulls enemies inward and damages them.

## 7. Auto-Aim and Casting
To keep mobile input manageable, normal spells auto-select a target direction based on the nearest threatening enemy. The player chooses *when* to cast and where to position, but does not need twin-stick precision for every cast.

Targeting priority:
1. Enemy currently attacking the guardian core.
2. Elite/boss inside preferred range.
3. Nearest enemy to hero.

Area-targeted spells project slightly ahead of the chosen target direction.

## 8. Guardian Core
- Located near arena center.
- Has independent HP.
- Most enemies chase the hero; a minority target the core.
- The core creates a small aura that modestly improves pickup radius and healing.
- The core should create positional tension, not force permanent camping.

## 9. Terrain
Initial terrain types are limited to high-impact, low-maintenance mechanics:
- Wall: blocks movement and some projectiles.
- Choke passage: shaped by wall placement and improves piercing/AoE value.
- Slow pool: enemies move slower while inside.
- Arcane crystal: stores hits and explodes after a threshold.
- Cliff zone: strong knockback can instantly remove non-boss enemies.
- Mana well: reduces spell cooldown while hero is nearby.

The MVP needs only walls, slow pools, and explosive crystals. Remaining types can be added after the combat loop proves fun.

## 10. Enemies
Initial roster:
- Grunt: basic melee.
- Hound: low HP, high speed.
- Brute: slow, high HP.
- Archer: keeps distance and fires projectiles.
- Bomber: explodes on death or proximity.
- Shaman: shields nearby enemies.
- Giant: can pressure the core and ignore light crowd control.
- Assassin: bursts toward the hero after a tell.

The MVP implements Grunt, Hound, Brute, Archer, Elite, and Boss behavior first.

## 11. Endless Difficulty Director
Difficulty is time-driven and monotonic but not purely stat scaling.

The director controls:
- Spawn rate.
- Maximum active enemy budget.
- Enemy archetype mix.
- Elite frequency.
- Boss timers.
- Enemy HP and damage multipliers.

Suggested phase curve:
- 0–2 min: learn controls, low pressure.
- 2–5 min: all normal spell slots become obtainable.
- 5–10 min: first boss, more mixed enemy packs.
- 10–20 min: dense combat, elites overlap with waves.
- 20+ min: catastrophe tiers begin and continue indefinitely.

## 12. Catastrophes
After the late-game threshold, periodically add one global modifier. Modifiers can help, hurt, or create risk/reward.
Examples:
- Frenzy: enemy move speed increases.
- Arcane Surge: both player and enemy damage increase.
- Red Moon: elite frequency doubles.
- Golden Night: coin drop value doubles.
- Death Fog: damaging zones creep in from arena edges.

The MVP can expose the director hook and implement one catastrophe modifier.

## 13. XP and Leveling
- Enemies drop XP crystals.
- Nearby crystals merge into larger pickups to limit object count.
- Pickups magnetize toward the hero inside pickup range.
- Level requirement grows continuously, but enemy XP value also increases by danger tier so upgrades never disappear for too long.
- Level-up pauses/slows combat strongly and shows exactly three upgrade cards.
- Upgrade card copy is concise: one title, one effect line, one current-to-next comparison when applicable.

## 14. Gold Economy
- Coins are run-only currency and reset after death.
- Coins visibly drop but magnetize automatically to reduce collection chores.
- Harder enemies provide more gold.
- Elites and bosses provide guaranteed larger amounts.
- Economy items can modify coin income but must trade off combat power.

## 15. Shop
- Shop access is event/timer-based, not a physical NPC that the player must walk toward.
- When a shop token becomes available, the player may open it at a convenient moment.
- Opening the shop strongly slows or pauses combat.
- Show six item cards at most.
- Initial inventory composition: two weapon offers, two armor offers, two potion/utility offers.
- One reroll button, with escalating reroll price per visit.
- Purchases update equipment immediately; no drag-and-drop inventory flow.
- Comparison copy must state the meaningful tradeoff rather than making the player compare many numbers.

## 16. Equipment
MVP slots:
- Weapon x1.
- Armor x1.

Later extension:
- Relic x1.

Weapons modify offensive behavior; armor modifies survival/movement. Items should have one strong identity plus at most one secondary stat.

Example weapons:
- Arcane Staff: spell damage.
- Rapid Wand: cooldown reduction.
- Blast Staff: area radius.
- Storm Rod: extra chain jump.

Example armor:
- Iron Robe: damage reduction.
- Arcane Shield: regenerating shield.
- Gale Cloak: move speed.
- Thorn Armor: retaliation damage.

## 17. Equipment Upgrades
Buying the same equipment family upgrades it automatically instead of creating inventory clutter.
- I + duplicate -> II.
- II + duplicate -> III.
- Higher ranks improve the defining effect.
- No manual merge screen.

## 18. Potions
Initial quick-slot potion types:
- Healing Potion: restore a percentage of max HP.
- Berserk Potion: temporary damage and cooldown boost.
- Guard Potion: temporary damage reduction.
- Magnet Potion: collect nearby/current pickups.

MVP may implement Healing Potion first and one quick-slot.

## 19. Performance Budgets
- Use object pooling for enemies, projectiles, particles, and pickups.
- Avoid physics bodies for purely visual particles.
- Merge pickups and cap decorative effects.
- Use an active-enemy budget rather than unbounded live entities; the *pressure* is endless, not the number of simultaneous game objects.
- Use simplified crowd steering rather than expensive pathfinding per enemy.
- Reduce update frequency for distant enemies when needed.

## 20. UI States
1. Boot / orientation notice.
2. Hero select.
3. Gameplay HUD.
4. Level-up overlay.
5. Shop overlay.
6. Pause overlay.
7. Game-over results.

## 21. First Playable Acceptance Criteria
- Landscape canvas scales correctly on mobile and desktop.
- Hero can move with touch joystick and keyboard.
- Enemies spawn continuously and chase hero/core.
- At least four enemy behaviors are visible.
- Four normal spell buttons and two ultimate buttons exist and cast working abilities.
- Kills drop XP and coins; both are collectible and update HUD.
- Leveling presents three choices and selected upgrades affect combat.
- Shop can be opened after its timer/token condition and allows purchases with coins.
- At least one weapon, one armor, and one potion have working effects.
- Elite and boss spawns occur while normal enemies continue.
- Difficulty increases indefinitely.
- Hero/core death shows a result screen and restart works without page reload.
- Automated tests cover progression formulas, shop purchasing, equipment upgrade behavior, and difficulty scaling.
