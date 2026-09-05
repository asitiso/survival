# Phase 2431~2438 — Battlefield Environment Depth & Reaction VFX

이번 패스는 전장 배경의 깊이감과 지형 반응 가독성을 높이는 presentation-only 작업입니다. 전투 수치/AI/충돌/Snapshot은 변경하지 않았습니다.

## Phase 2431~2432 — Atmosphere Overlay Atlas
- 신규 `assets/arena/battlefield-atmosphere-vfx.png`
- 768×432 / 3×3 / cell 256×144 / 9 unique cells
- ruinedGate: 불씨 / 연기 / 재
- frozenFen: 눈발 / 서리안개 / 빙정
- crystalQuarry: 마력먼지 / 수정광 / 공명균열
- 신규 `src/game/battlefield-atmosphere-vfx-assets.ts`
- `drawArena()` 직후, 지형/캐릭터보다 아래 레이어에 렌더
- Reduced Motion에서는 drift 0으로 고정
- atlas load failure 시 기존 arena background만 렌더

## Phase 2433~2436 — Environment Reaction Atlas
- 신규 `assets/arena/battlefield-environment-reaction-vfx.png`
- 512×256 / 4×2 / cell 128×128 / 8 unique cells
- 3개 맵 × crystalBlast/evolutionCollapse = 6종
- archer projectile / impact = 2종
- 신규 `src/game/battlefield-environment-reaction-vfx-assets.ts`
- 기존 shockwave/glow/debris Canvas feedback를 유지한 채 이미지 반응을 추가
- reaction queue: max 12, TTL 0.42~0.56s

## Phase 2437 — Archer Projectile Identity
- `EnemyProjectileView.sourceType` optional presentation metadata 추가
- archer projectile만 신규 화살 이미지 사용
- hit 시 0.34초 impact VFX 큐
- impact queue max 24
- 피해/속도/충돌 판정/target contract 변경 없음

## Phase 2438 — Deterministic Audit & Release Binding
- 신규 `src/game/battlefield-environment-depth-vfx-audit.ts`
- 64 deterministic samples
- atmosphere 9/9 / reaction 8/8 coverage
- Action 9/9
- gameplayFormulaMutation false
- snapshotSchemaMutation false
- Release Freeze / Candidate signature fail-closed 결박

## Asset Evidence
- `battlefield-atmosphere-vfx.png`
  - SHA256 `e4f922054f802bee251bd98268d477490db9ce5ac829152561b95888c2a85d35`
  - 9/9 pixel-unique cells
- `battlefield-environment-reaction-vfx.png`
  - SHA256 `7bb771c1fd851412c9090ffebbaafc8e7b2baa4a9f683fe6144de12a1b8e54e1`
  - 8/8 pixel-unique cells

## Verification
- focused regression: 59/59 PASS
- full regression: 702 files / 2,233 tests / 0 failures
- Candidate: `RCQ-DDEBFF01`
- Release: `RQ-D4630257`
- Raster: 5/5 PASS
