# Phase 2407~2414 — Battlefield Combat VFX Expansion

이번 패스는 전장 내부에서 가장 자주 보이는 전투 피드백을 이미지화하는 단계입니다. 전투 수치와 판정은 유지하고, 일반 적 피격/사망, 보스 특수 projectile/hazard, 영웅별 chain/nova/field 마법의 시각적 정체성을 강화했습니다.

## Phase 2407 — Enemy Hit / Death VFX Atlas
- 신규 이미지: `assets/enemies/enemy-combat-vfx.png`
- 768×512 / 6×4 / cell 128×128
- 일반 적 12종 × hit/death 2채널 = 24셀
- 신규 모듈: `src/game/enemy-combat-vfx-assets.ts`
- `Game.drawEnemyCombatImageVfx()`에서 살아있는 적 hitFlash와 사망 burst를 presentation-only로 렌더
- 기존 `emitDeathPresentation()`의 particle/trail/afterglow는 유지

## Phase 2408 — Boss Special Projectile / Hazard VFX Atlas
- 신규 이미지: `assets/bosses/boss-special-combat-vfx.png`
- 384×512 / 3×4 / cell 128×128
- 6 boss archetype × projectile/hazard = 12셀
- 신규 모듈: `src/game/boss-special-combat-vfx-assets.ts`
- boss projectile에 `bossArchetype` presentation metadata만 보존
- `EnemyManager.renderProjectiles()`에서 기존 원형 projectile fallback 유지 + boss archetype image overlay
- boss arena hazard는 기존 shape/telegraph/damage 렌더 위에 archetype image stamp 추가

## Phase 2409 — Hero Chain / Nova / Field Signature Atlas
- 신규 이미지: `assets/heroes/hero-spell-signature-vfx.png`
- 512×384 / 4×3 / cell 128×128
- 4영웅 × chainLightning/frostNova/flameField = 12셀
- 신규 모듈: `src/game/hero-spell-signature-vfx-assets.ts`
- LightningArc / NovaVisual / FlameField에 hero id를 presentation metadata로 보존
- 기존 generic spell stamp를 유지하면서 hero별 image overlay 추가

## Phase 2410~2412 — Live Integration
- 신규 atlas 3종 async preload
- 이미지 load 실패 시 모든 기존 Canvas fallback 유지
- Reduced Flash에서는 enemy/hazard 이미지 alpha cap 축소
- Reduced Motion 계약과 기존 residual motion 소유권은 유지
- enemy damage, boss pattern, hazard collision, spell damage/cooldown/pierce/slow 공식 변경 없음
- Snapshot schema 변경 없음

## Phase 2413 — Deterministic Audit
- 신규 audit: `src/game/combat-battlefield-vfx-expansion-audit.ts`
- 64 deterministic samples
  - enemy 24셀 bounds
  - boss special 12셀 bounds
  - hero signature 12셀 bounds
  - 16 invariants
- Action 9개 invariant
- presentation-only true
- load failure blocks gameplay false
- Snapshot mutation false
- gameplay formula mutation false

## Phase 2414 — Release Binding
- Release Freeze fields:
  - `combatBattlefieldVfxExpansionPassed`
  - `combatBattlefieldVfxExpansionSamples`
- Candidate fail-closed + signature sample binding
- Candidate markdown evidence: `combat-battlefield-vfx-expansion safe (64)`

## Verification
- focused VFX / boss arena / spells regression: 31/31 PASS
- full regression: 697 files / 2,209 tests / 2,209 PASS / 0 FAIL
- Candidate: `RCQ-EF50B26F`
- Release: `RQ-D4630257`
- Raster: 5/5 PASS

## Frozen Gameplay Surfaces
- boss pattern tuning unchanged
- boss arena damage/collision formulas unchanged
- spell damage/cooldown/pierce/slow formulas unchanged
- Snapshot schema unchanged
- Action count remains 9

## Next Visual Pass
다음 패스는 전장 이미지/VFX 중심 원칙을 유지하면서 다음 순서가 효율적입니다.
1. 장애물 파손 단계 이미지 variation
2. 적 specialist 공격/시전 pose + projectile variation
3. 보스 phase 2/3 sprite overlay variation
4. 궁극기 meteor/black-hole 영웅별 시그니처 이미지 분화
