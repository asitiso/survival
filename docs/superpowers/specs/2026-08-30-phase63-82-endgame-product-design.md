# Phase 63-82 Endgame Product Design

## Goal
Extend the Phase 62 build without adding combat buttons, turning 80+ minute runs into visibly different hero play, making Mythic bosses climax with a readable final phase, giving 120-360 minute runs clear automatic goals, making builds portable through a compact capsule, and improving mobile frame stability without reducing enemy AI first.

## Global product constraints
- Keep the existing 9 combat actions unchanged: 4 normal spells + 2 ultimates + potion + shop + AUTO.
- Reuse existing overlays and result UI instead of adding a new management screen.
- Preserve Phase 62 snapshot compatibility; corrupt optional extension data must never block resume.
- Prefer deterministic, bounded, aggregate state over entity-coordinate persistence.
- Under performance pressure, lower decorative density before gameplay simulation limits.
- New late-game multipliers remain capped; long runs continue indefinitely without exponential numeric growth.

## Phase 63-66 — Final Form Signature
Each of the 12 Final Forms gains an automatic signature identity. Existing spell casts, fusion casts, elite kills, boss kills, and damage events build a small signature meter. When full and off cooldown it auto-triggers; no button is added. Each signature belongs to one of four gameplay families: burst, cycle, domain, or fortress, but keeps a Final Form-specific name and color/descriptor.

The runtime stores charge, active window, cooldown, and activation count. The active window applies bounded modifiers through the existing combat modifier chain. A single presentation cue/toast announces activation, and a compact HUD line appears only while active. State is included in the endless snapshot so resume cannot reset the meter.

## Phase 67-70 — Mythic Last Law
Mythic bosses gain a fourth and final phase at <=15% HP, only after the existing three-phase system. The Last Law does not add extra enemies without bound. It changes special cadence, movement pressure, projectile presentation density, damage, and weakpoint behavior within explicit caps.

Entering Last Law emits one readable telegraph/event. Destroying the existing Mythic counterplay nodes during Last Law reduces pressure and increases boss damage taken, so the final phase has a deliberate counterplay rather than being pure stat inflation. Reward multiplier gains a small capped final-phase bonus.

## Phase 71-74 — Long-Run Oaths
At 120, 150, 180, 240, 300, and 360 minutes, the run receives an automatic Oath objective. There is no choice modal. Oaths rotate among kill, elite, boss, core-defense, spell/fusion, and survival goals based on deterministic state and recent history.

Only one Oath is active. Progress consumes existing gameplay events. Completion gives bounded gold/core recovery plus a short boon; failure is possible only for timed defense/survival Oaths. Completed milestones are one-shot and snapshot-safe. HUD shows at most one short Oath line.

## Phase 75-78 — Build Capsule
At run completion, the product creates a compact Build Capsule from the run seed, hero, trait, threat, map, Final Form, ascension choices, fate path, relic, fusions, archetype, and key spell levels. It is deterministic and validates on decode.

The result screen shows the Build Capsule code alongside the existing Run Code; no new settings screen is created. The same-condition retry continues using the Retry Blueprint. The capsule is for exact build identification/share/comparison, while the blueprint owns start-condition replay. Recent run records store the capsule code so the last five builds can be distinguished without opening another menu.

## Phase 79-82 — Mobile Frame Governor and 12-hour audit
Add a hysteresis-based mobile frame governor using frame pressure samples. It has full/reduced/minimal presentation tiers and requires sustained pressure before degrading and sustained recovery before upgrading, preventing quality flicker. It never lowers enemy AI cap before decorative density/projectile representation.

The governor can temporarily override presentation density without changing the user's quality preference. Its compact state is snapshot-safe. Extend static audit checkpoints through 720 minutes and verify low-device Threat 5 stays within caps, with presentation reduction occurring before simulation reduction.

## Integration boundaries
New focused modules live under `src/game/endless/`. `game.ts` only gains small adapters: event-driven signature/Oath advancement, Mythic Last Law modifiers, frame governor density, compact HUD/result lines, and snapshot fields. Existing spell/enemy/shop ownership remains unchanged.

## Testing
Every subsystem gets RED/GREEN unit tests first. Integration tests prove: no action-count increase, snapshot migration from Phase 62, deterministic resume, Last Law threshold/caps, Oath one-shot progression, capsule encode/decode stability, frame governor hysteresis, and 12-hour low-device guard. Final gate is full test suite + TypeScript build + `git diff --check` + static HTTP module checks + ZIP integrity.
