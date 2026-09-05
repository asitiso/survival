# Phase 8 Legendary Effects and Synergy Design

## Goal

Turn legendary equipment from larger static numbers into memorable run-defining effects, and make legendary equipment, relics, run traits, and hero identity produce automatic synergies without adding another inventory or crafting screen.

## Player Experience

A legendary item should create a visible combat moment. Synergies should activate automatically when the player already owns the required pieces, so there is no extra confirmation step. The HUD shows at most two active synergy names; details remain in the existing shop/reward copy.

## Legendary Runtime Effects

Eight existing legendary items keep their current static bonuses and gain one unique runtime effect:

- `arcane-staff` / 대마도사의 심장: every 20 kills triggers 4 seconds of Arcane Surge, +30% spell power.
- `rapid-wand` / 크로노스 셉터: every 35 kills triggers 5 seconds of Time Rush, an additional 22% cooldown reduction.
- `blast-rod` / 성운 파괴봉: every 18 kills primes a Nova; the next non-boss kill causes a large 170-radius explosion centered on the death.
- `golden-wand` / 미다스의 손: elite kills grant +90 bonus gold and boss kills grant +280 bonus gold.
- `iron-robe` / 불멸의 로브: dropping to 35% HP or lower grants 6 seconds of 35% extra damage reduction, 32-second internal cooldown.
- `gale-cloak` / 폭풍군주의 망토: moving continuously for 3 seconds grants 4 seconds of +18% move speed and 12% cooldown reduction; continuous movement must build again after the buff.
- `magnet-cloak` / 심연의 자석망토: every 22 seconds triggers a 3-second global pickup magnet pulse.
- `guardian-plate` / 영원의 성벽: when the core falls below 50% HP, restore 10% max core HP and grant 8 seconds of 25% extra core damage reduction, 45-second internal cooldown.

Runtime effects are owned by one `LegendaryEffectController`; equipment remains the source of which effects are eligible. The controller resets each run.

## Automatic Synergies

Synergies are pure-data combinations detected from hero, run trait, active relic, and equipped legendary items. They never consume items and require no selection screen.

Initial synergy set:

- Forbidden Arcana: 대마도사의 심장 + 심연의 눈 => +16% spell power, +5% incoming hero damage.
- Broken Time: 크로노스 셉터 + 크로노 파편 => additional 8% cooldown reduction, -3% move speed.
- Last Bastion: 영원의 성벽 + 수호자의 심장 => additional 18% core damage reduction.
- Starbreaker: 성운 파괴봉 + 파괴 본능 => +18% area, +8% spell power.
- Golden Fever: 미다스의 손 + 황금 감각 => +30% gold gain.
- Overclock: 크로노스 셉터 + 신속 영창 => additional 7% cooldown reduction, +4% incoming hero damage.
- Ember Dominion: 아르칸 + 잿불 왕관 + 대마도사의 심장 => Arkan explosion chance +8%, radius +15%.
- Winter Dominion: 세리아 + 영원의 겨울심장 + 성운 파괴봉 => area +15%, cooldown -5%.
- Storm Dominion: 카인 + 폭풍핵 + 크로노스 셉터 => overload gain +25%, max overload cooldown reduction +4 percentage points.
- Oath Dominion: 에드릭 + 수호의 맹세인 + 영원의 성벽 => guardian aura radius +45, aura mitigation strengthened.

At most two synergy names are drawn in the compact HUD. All modifiers still compose even if more than two are active.

## Boss Relic Expansion

Add three boss-archetype relics to the existing pool:

- `inferno-heart` / 폭군의 화핵: spell power +16%, area +12%, hero damage taken +6%.
- `summoner-sigil` / 군주의 소환인: cooldown -10%, pickup radius +20%, core damage taken +8%.
- `juggernaut-core` / 거인의 동력핵: move speed +12%, hero damage taken -12%, cooldown +6%.

The most recently defeated boss archetype is passed into boss reward generation. The reward relic card pool contains universal relics, the current hero relic, and the matching boss-archetype relic. The current equipped relic remains excluded when alternatives exist.

## Architecture

- `src/game/legendary-effects.ts`: run-state machine and event responses for legendary procs.
- `src/game/synergies.ts`: pure synergy detection and modifier composition.
- `src/game/relics.ts`: add three boss relic definitions and boss-aware candidate filtering.
- `src/game/enemies.ts`: include boss archetype in boss death events.
- `src/game/game.ts`: feed movement, kills, hero/core health, and pickup magnet state into the controller; compose synergy modifiers with equipment/relic modifiers.
- Existing UI is reused; only compact HUD text and existing boss reward copy change.

## Constraints

- No new inventory, crafting, equipment slot, currency, or modal.
- Legendary effects must be bounded and event-driven; no per-enemy extra state.
- Mobile enemy cap stays 320.
- No legendary proc can permanently remove cooldowns or damage risk.
- Existing Phase 7 relic behavior remains compatible.
