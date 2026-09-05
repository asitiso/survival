# Phase 2399~2406 — Boss Signature & Hero Projectile VFX Integration

이번 패스는 전장 안에서 체감되는 이미지/VFX를 더 밀도 있게 적용하는 단계입니다. 전투 밸런스와 판정은 유지하고, 보스와 영웅 마법의 시각적 정체성을 강화했습니다.

## Phase 2399 — Boss Signature VFX Atlas
- 신규 이미지: `assets/bosses/boss-signature-vfx.png`
- 384×256 / 3×2 / cell 128×128
- 6개 보스 archetype 각각 고유 시그니처 VFX
  - inferno / summoner / juggernaut / abyssWitch / twinMaw / timeEater
- 신규 모듈: `src/game/boss-signature-vfx-assets.ts`

## Phase 2400 — Hero Projectile / Impact VFX Atlas
- 신규 이미지: `assets/heroes/hero-projectile-vfx.png`
- 512×256 / 4×2 / cell 128×128
- 4영웅 × projectile/impact 2종 = 8 unique cells
- 신규 모듈: `src/game/hero-projectile-vfx-assets.ts`

## Phase 2401 — Boss Live VFX Integration
- `Game`에서 boss signature atlas async preload
- 보스 등장 직후 signature aura 표시
- 특수기 1.2초 이내 charge 단계에서 signature 강화
- Phase 2/3 전환 cue 중 signature 강화
- Reduced Motion에서는 회전 정지
- Reduced Flash에서는 alpha cap 감소
- 기존 boss sprite / 원형 fallback / 전투 판정은 그대로 유지

## Phase 2402~2403 — Hero Projectile & Hit Burst Integration
- `fireBolt` projectile에 현재 hero id를 저장
- 기존 원형 projectile fallback 유지
- atlas ready 시 hero별 projectile sprite를 이동 방향으로 회전 렌더
- 적 피격 시 0.18초 hero별 impact burst 생성
- impact visuals는 presentation-only이고 damage / pierce / slow / splash 계산에는 영향 없음

## Phase 2404~2406 — Deterministic Audit / Release Binding
- 신규 audit: `src/game/combat-visual-asset-integration-audit.ts`
- 총 32 deterministic samples
  - boss VFX 6 archetype coverage
  - hero projectile / impact 8 cells coverage
  - atlas bounds / uniqueness
  - Action 9개 invariant
  - presentation-only
  - load failure gameplay blocking 없음
  - Snapshot schema mutation 없음
- Release Freeze에 결박
- Candidate fail-closed + signature sample binding
- Candidate markdown에 `combat-visual-asset-integration safe (32)` 추가

## Verification
- focused combat visual regression: 34/34 PASS
- new Phase 2399~2406 tests: 8/8 PASS
- full regression: 694 files / 2,200 tests / 2,200 PASS / 0 FAIL
- Candidate: `RCQ-D120EE89`
- Release: `RQ-D4630257`
- Raster: 5/5 PASS

## Frozen Gameplay Surfaces
- `src/game/boss-patterns.ts` unchanged
- `src/game/enemies.ts` unchanged
- `src/game/entities.ts` unchanged
- `src/game/endless/snapshot.ts` unchanged
- Action count remains 9

## Next Visual Pass
다음 패스에서는 VFX 중심 방향을 유지하되, 체감 대비 비용이 큰 순서로 진행하는 것이 좋습니다.
1. 일반 적 12종의 피격/사망 VFX 이미지 차별화
2. 보스별 특수기 projectile / hazard 이미지 분리
3. 영웅별 chain / nova / field VFX variation
4. 전장 장애물 파손 상태 이미지 variation
