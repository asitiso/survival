# Phase 6 Meta Lobby, Run Traits, Legendary Equipment Design

## Goal
Turn Arcane Last Stand's earned arcane shards into a lightweight between-run progression loop, add one meaningful pre-run trait choice, and make rank-5 equipment visibly evolve into legendary gear without adding inventory management or crafting screens.

## Product Principles
- Landscape mobile remains the only target UI.
- Every added screen must be understandable in seconds and require few taps.
- Permanent growth should help but must not trivialize early combat.
- Prefer unlock-like or bounded bonuses over endless percentage stacking.
- Reuse the existing hero, shop, equipment, results, and localStorage flows.
- No crafting materials, equipment inventory, sockets, rarity rerolls, or branching skill tree in this phase.

## Meta Lobby
The game starts in a lightweight lobby before hero selection. It shows total arcane shards and four bounded upgrades. The player can spend shards and then press one large `전투 준비` button.

Permanent upgrades:
1. `생명 각인`: max 5, +3% starting max HP per level.
2. `마력 각인`: max 5, +2% all spell damage per level.
3. `전투 자금`: max 5, +50 starting run gold per level.
4. `마력 자석`: max 4, +8% pickup radius per level.

Upgrade costs by target level are 15, 25, 40, 60, 85 shards for five-level tracks. The four-level pickup track uses the first four costs. Purchases are immediate and persisted to localStorage together with the remaining shard balance.

The lobby deliberately avoids an upgrade graph. Four independent cards are faster to learn and much easier to maintain while still making earned shards useful.

## Run Trait Choice
After choosing a hero, the player chooses one run trait from four cards. Exactly one trait applies for that run and is reset on death/restart.

Traits:
- `파괴 본능`: spell damage +12%, max HP -8%.
- `신속 영창`: cooldown multiplier -10%, incoming hero damage +8%.
- `황금 감각`: gold gain +25%, spell damage -6%.
- `수호 맹세`: guardian core damage taken -20%, move speed -5%.

Traits intentionally use one benefit and one tradeoff. There is no trait leveling in this phase.

## Modifier Composition
Permanent meta bonuses, run trait bonuses, and equipment bonuses compose multiplicatively or additively through a single build modifier function. Existing level-up upgrades remain on `hero.spellPower`, `hero.cooldownMultiplier`, `hero.speed`, `hero.maxHp`, and `hero.pickupRadius` and must not be overwritten by later shop synchronization.

To avoid compounding bugs, run-base meta/trait adjustments are applied once when the run begins. Equipment synchronization only owns equipment multiplier fields.

## Legendary Equipment Evolution
Existing equipment keeps the same one-weapon + one-armor structure. When a duplicate purchase raises an item from rank 4 to rank 5, it becomes its legendary identity immediately. Rank remains 5, so no extra inventory or evolution menu is required.

Legendary mappings:
- `마력 지팡이` → `대마도사의 심장`: stronger spell-power scaling.
- `속사 완드` → `크로노스 셉터`: stronger cooldown scaling.
- `폭발 지팡이` → `성운 파괴봉`: stronger area scaling.
- `황금 완드` → `미다스의 손`: stronger gold scaling.
- `철갑 로브` → `불멸의 로브`: stronger damage reduction.
- `질풍 망토` → `폭풍군주의 망토`: stronger move-speed scaling.
- `자석 망토` → `심연의 자석망토`: stronger pickup scaling.
- `수호 갑주` → `영원의 성벽`: stronger guardian-core damage reduction.

The legendary state is represented directly on `EquippedItem` with `legendary: boolean`. Shop UI announces `전설 진화` when purchasing the rank-4 duplicate and renders legendary items with a distinct name and label.

## Results and Restart Flow
Results continue to show earned and total shards. Two actions are provided:
- `같은 영웅으로 다시 도전`: returns to trait choice for the same hero, preserving meta upgrades but resetting all run state.
- `로비로 돌아가기`: returns to the meta lobby, where shards can be spent before choosing a hero again.

This removes unnecessary repeated hero selection when the player simply wants another attempt while still keeping the lobby accessible.

## Persistence
Persist one versioned JSON object under `arcane-last-stand.meta-profile`:
- `version: 1`
- `shards: number`
- `upgrades: { vitality, power, bankroll, magnet }`

Legacy `arcane-last-stand.shards` is migrated on first load when no profile exists. Invalid or unavailable storage safely falls back to a zeroed profile and must never prevent gameplay.

## Testing
Add focused tests for:
- profile load/save/migration/sanitization;
- upgrade costs, caps, and shard spending;
- meta bonus calculations;
- run trait modifiers;
- rank-5 legendary transformation and names;
- legendary equipment bonus strength;
- same-hero retry and lobby transitions at the pure flow/model level where possible;
- full regression suite and TypeScript build.
