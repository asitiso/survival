# Phase 12–14 Triple Pass Design

## Goal
Turn the current endless defense build into a deeper repeatable game loop by adding hero-specific combat meters, evolving battlefields and elite/boss variants, then threat-level progression, lightweight audio, and run records without adding new combat buttons.

## Phase 12 — Hero Combat Identity
Each hero gains a passive meter driven by existing combat actions. Arkan builds Heat and enters Inferno; Seria builds Absolute Zero through chilling enemies and converts frozen kills into shatter pressure; Kain extends Overload into a capped surge state driven by movement and casting; Edric stores prevented damage as Judgment and releases a defensive shockwave. The meter is shown in HUD but requires no new input.

## Phase 13 — Living Battlefield
Maps evolve at 8 and 16 minutes through deterministic layout mutations. Elites can receive one affix early and two late from Swift, Armored, Regenerating, Frenzied, Commander, and Mana Shield. Repeated bosses receive a variant tier based on ordinal, adding pressure without changing the existing three archetypes or enemy/projectile caps.

## Phase 14 — Long-Term Challenge
Threat levels 0–5 scale density, elite pressure, boss variant tier, and Arcane Shard rewards while never directly reducing player power. Profiles unlock higher threat levels based on completed-run records. Records are stored per hero/map/threat with recent-run history capped at 10. Audio uses Web Audio with concurrency/cooldown guards and simple generated tones; settings remain compact.

## Constraints
- Landscape mobile controls unchanged; no new combat buttons.
- Enemy cap stays 320; enemy projectile cap stays 150; feedback cap stays 96.
- New systems are isolated pure modules where possible and integrated through Game/EnemyManager/TerrainSystem.
- Existing economy, relic, legendary, mission, event, catastrophe, VFX, and accessibility flows remain compatible.
