# Phase 7 Relics Design

## Goal
Add a single-slot boss relic system that materially changes each run without adding a separate inventory screen or increasing input complexity.

## Player Flow
- Relics are boss-exclusive rewards. They never appear in the normal shop or level-up pool.
- Every boss reward presents exactly three cards: one relic card and two existing boss-growth cards.
- The run has exactly one relic slot.
- Picking a relic with an empty slot equips it immediately.
- Picking a relic when another relic is equipped replaces the old relic immediately.
- The currently equipped relic is shown in the combat HUD and on the run-results screen.
- Retrying the run starts with no relic; relics are run-local and never persist between runs.

## Relic Pool
### Universal relics
1. `abyss-eye` — 심연의 눈
   - Spell power x1.24
   - Hero damage taken x1.12
   - Purpose: obvious glass-cannon option.
2. `chrono-shard` — 크로노 파편
   - Spell cooldown x0.84
   - Move speed x0.92
   - Purpose: high spell frequency with a positioning cost.
3. `guardian-heart` — 수호자의 심장
   - Core damage taken x0.65
   - Gold gain x0.85
   - Purpose: protect long runs at an economy cost.

### Hero-specific relics
4. `ember-crown` — 잿불 왕관 (Arkan only)
   - Arkan chain-explosion chance +0.17
   - Arkan explosion radius x1.30
5. `winter-heart` — 영원의 겨울심장 (Seria only)
   - Spell area x1.25
   - Spell cooldown x0.92
6. `storm-core` — 폭풍핵 (Kain only)
   - Overload charge rate x1.55
   - Full-overload cooldown reduction increases from 20% to 30%
7. `oath-seal` — 수호의 맹세인 (Edric only)
   - Guardian aura radius +80
   - Hero mitigation inside aura improves from x0.78 to x0.70
   - Core mitigation inside aura improves from x0.74 to x0.65

## Reward Generation
- The relic candidate pool is the three universal relics plus the selected hero's one specific relic.
- The currently equipped relic is excluded when possible so a boss does not offer a no-op replacement.
- The relic card is always present in a boss reward so relic acquisition is predictable, but the player can always ignore it and take one of two normal boss growth options.
- When a relic is already equipped, the card description explicitly says it will replace the current relic.

## Architecture
- `src/game/relics.ts` owns relic definitions, candidate generation, and pure modifier calculations.
- `src/game/upgrades.ts` builds a boss reward union that may contain an upgrade or relic.
- `src/ui/levelup.ts` becomes display-card generic enough to render both without learning relic rules.
- `src/game/game.ts` owns the active run relic and applies its modifiers at existing integration points.
- `src/ui/results.ts` receives the final relic display name.

## Integration Rules
- Relic bonuses compose multiplicatively with permanent meta, run traits, equipment, field events, catastrophe modifiers, and hero passives.
- Relics do not mutate the permanent meta profile.
- Equipment sync must not erase relic bonuses.
- Universal stat relics apply through existing equipment multiplier fields where safe.
- Hero-specific passive relics apply only at the existing passive calculation sites.

## UX Constraints
- No relic inventory screen.
- No drag/drop or manual equip menu.
- One slot only.
- No more than one extra HUD chip.
- No new currency.
- No crafting.

## Tests
- Relic pool contains three universal plus only the current hero's specific relic.
- Current relic is excluded from the next candidate when alternatives exist.
- Universal relic modifiers have the intended tradeoffs.
- Hero-specific modifiers only affect the matching hero.
- Boss rewards always contain exactly one relic and two normal growth cards.
- Equipping/replacing relics is deterministic and run-local.
- Arkan, Kain, and Edric passive behavior changes at their existing integration points.
- Results model includes the final relic.
- Full regression and TypeScript build remain green.
