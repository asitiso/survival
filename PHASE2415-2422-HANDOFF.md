# Phase 2415~2422 — Battlefield Visual Evolution VFX

이번 패스는 전장 화면 이미지/VFX 우선 원칙을 이어서 **장애물 상태 변화, specialist 전투 표현, 보스 Phase 외형, 영웅 궁극기 정체성**을 이미지화했습니다. 전투 수치·AI·충돌·Snapshot은 유지했습니다.

## Phase 2415 — Obstacle State Atlas
- 신규 `assets/arena/battlefield-obstacle-states.png`
- 384×384 / 3×3 / cell 128
- ruinedGate / frozenFen / crystalQuarry × normal / cracked / broken = 9셀
- 전장 evolution stage 0/1/2를 정상/균열/파손 이미지에 연결
- 충돌 판정은 기존 wall rectangle을 그대로 유지하고 이미지 오버레이만 교체

## Phase 2416 — Specialist Combat VFX
- 신규 `assets/enemies/specialist-combat-vfx.png`
- 512×256 / 4×2 / cell 128
- shieldbearer / assassin / siegeGolem / nullifier × pose / projectile cue = 8셀
- 기존 specialist intent emphasis를 그대로 읽어 시전/공격 강조 시에만 projectile visual cue를 추가
- projectile cue는 presentation-only이며 피해/충돌 projectile를 새로 생성하지 않음

## Phase 2417 — Boss Phase Overlay
- 신규 `assets/bosses/boss-phase-overlays.png`
- 384×512 / 3×4 / cell 128
- 6 archetype × Phase 2/3 = 12셀
- 기존 boss sprite 위에 Phase 2/3 전용 aura/rune overlay를 추가
- Phase 1은 기존 sprite 그대로 유지

## Phase 2418 — Hero Ultimate Signature
- 신규 `assets/heroes/hero-ultimate-signature-vfx.png`
- 512×256 / 4×2 / cell 128
- arkan / seria / kain / edric × meteorStorm / blackHole = 8셀
- Meteor impact와 Black Hole vortex에 영웅별 전용 이미지 stamp를 추가
- 기존 generic choreography와 fallback은 그대로 유지

## Phase 2419~2421 — Live Integration
- 신규 atlas 4종 async preload
- `Game.drawTerrainSpriteOverlays()`는 obstacle-state atlas 우선, 기존 prop atlas fallback
- `EnemyManager.renderEnemies()`는 specialist combat cue와 boss phase overlay를 optional image layer로 추가
- `SpellSystem.render()`는 ultimate signature atlas를 optional layer로 추가
- 신규 조작/오디오/햅틱 없음

## Phase 2422 — Release Binding
- 신규 `src/game/battlefield-visual-evolution-vfx-audit.ts`
- 정확히 64 deterministic samples
- Actions 9/9
- presentation-only true
- load failure blocks gameplay false
- gameplay formula mutation false
- Snapshot mutation false
- Release Freeze: `battlefieldVisualEvolutionVfxPassed/Samples`
- Candidate fail-closed + signature sample binding

## Verification
- focused regression: 31/31 PASS
- full regression: 699 files / 2,217 tests / 0 FAIL
- Candidate: RCQ-E01BB985
- Release: RQ-D4630257
- Raster: 5/5 PASS

## Frozen Gameplay Surfaces
- boss pattern tuning unchanged
- specialist combat contract unchanged
- terrain wall collision unchanged
- spell damage/cooldown/pierce/slow unchanged
- Snapshot schema unchanged
- Action count remains 9
