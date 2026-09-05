# Phase 2439~2446 — Battlefield Response & Lifecycle VFX

이번 패스는 난전 중 영웅 피격/회피 보상, 보스 약점, 보스 장판의 상태 변화를 문장이나 단순 도형보다 먼저 읽을 수 있도록 이미지 레이어를 추가한 presentation-only 작업입니다. 전투 수치, 적 AI, 충돌 판정, 액션 수, Snapshot 스키마는 변경하지 않았습니다.

## Phase 2439 — Hero Response VFX Atlas
- 신규 `assets/heroes/hero-response-vfx.png`
- 512×384 / 4×3 / cell 128×128 / 12 unique cells
- 4영웅(arkan/seria/kain/edric) × 3상태(hit/perfectEvade/flowBoost)
- 신규 `src/game/hero-response-vfx-assets.ts`
- atlas load failure 시 기존 영웅/Canvas 피드백 유지

## Phase 2440 — Hero Hit Response
- 일반 피격, volatile death, strain, boss arena damage에 짧은 이미지 피격 큐 추가
- queue max 10 / TTL 0.32s
- 기존 HP 감소·damage reason·충돌 계산 변경 없음
- 새 VFX가 기존 `CombatFeedbackSystem`의 ImpactKind를 확장하지 않도록 presentation queue로 분리

## Phase 2441 — Perfect Evade & Flow Boost
- perfect evade 성공 시 전용 이미지 burst 추가
- 회피 가속 보상(`arenaEvadeBoostUntilMs`)이 살아 있는 동안 영웅별 flowBoost 문양 표시
- Reduced Flash에서는 alpha만 낮추고 판정/보상은 그대로 유지

## Phase 2442 — Boss Weakpoint World VFX Atlas
- 신규 `assets/bosses/boss-weakpoint-world-vfx.png`
- 384×512 / 3×4 / cell 128×128 / 12 unique cells
- 6약점(flamePylon/summonCore/armorPlate/curseAnchor/mawSigil/clockShard) × active/break
- 신규 `src/game/boss-weakpoint-world-vfx-assets.ts`

## Phase 2443 — Weakpoint Active / Final Break Integration
- 살아 있는 약점은 기존 원형/HP bar/identity icon을 유지하면서 world image를 뒤 레이어에 추가
- 전 약점 파괴 시 break VFX를 약점 배열의 임의 마지막 노드가 아니라 **약점 군집 중심점**에 표시
- 기존 weakpoint label 우선순위/HP/보스 modifier 계약 유지
- break queue max 8 / TTL 0.62s

## Phase 2444 — Boss Arena Lifecycle VFX Atlas
- 신규 `assets/bosses/boss-arena-lifecycle-vfx.png`
- 384×512 / 3×4 / cell 128×128 / 12 unique cells
- 6장판(firePool/summonSigil/shockLane/cursePool/twinCross/timeZone) × telegraph/active
- 신규 `src/game/boss-arena-lifecycle-vfx-assets.ts`

## Phase 2445 — Telegraph → Active Lifecycle Integration
- `hazard.telegraph > 0`이면 telegraph cell, 이후 active cell 선택
- 기존 geometryShape Canvas 장판을 그대로 유지해 atlas load failure에도 게임플레이 가독성 보존
- 기존 `bossSpecialHazardVfxSprite()` 블록 순서를 보존하고 신규 lifecycle layer를 그 뒤에 배치해 Phase 2412 world-space 계약 유지
- Reduced Flash에서는 신규 이미지 alpha 축소

## Phase 2446 — Deterministic Audit & Release Binding
- 신규 `src/game/battlefield-response-lifecycle-vfx-audit.ts`
- 64 deterministic samples
- hero 12/12 + weakpoint 12/12 + hazard 12/12 coverage
- Action 9/9
- `gameplayFormulaMutation: false`
- `snapshotSchemaMutation: false`
- Release Freeze / Candidate signature fail-closed 결박

## Asset Evidence
- `hero-response-vfx.png`
  - SHA256 `705f81cf333f52abf3c2a4e13d68c12f246177da4d07d6b46b4d6e36057c4aa2`
  - 112,566 bytes / 12/12 pixel-unique cells
- `boss-weakpoint-world-vfx.png`
  - SHA256 `b7890aa916b4f7a39a166859bcd968abf3b264c3af2ba01ed30f3587454d6046`
  - 106,808 bytes / 12/12 pixel-unique cells
- `boss-arena-lifecycle-vfx.png`
  - SHA256 `a66bee08824cc62e1768a5cdab720b7bf25c3c92e3693c8877b955247b126032`
  - 107,758 bytes / 12/12 pixel-unique cells
- 총 36/36 이미지 셀 고유, 빈 셀 0

## Verification
- RED: 신규 테스트 7/7 expected fail → 구현 후 GREEN
- 약점 중심점 회귀: expected fail → GREEN
- focused + recent battlefield regression: 41/41 PASS
- full regression: 703 files / 2,241 tests / 0 failures
- Candidate: `RCQ-92D37F67`
- Release: `RQ-D4630257`
- Raster: 5/5 PASS
