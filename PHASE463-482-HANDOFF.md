# Arcane Last Stand — Phase 463~482 Handoff

## 기준점

- Source lineage: `main@8dde7903600bab1c7a98c53dea1e8df8cd45fce6` (Phase 462)
- Baseline tests: `849/849 PASS`
- Phase 463~482 tests 추가 후: `869/869 PASS`
- Release Gate: `RQ-9085A5AD PASS`
- Candidate: `RCQ-D6DF7FFE PASS`
- Raster: `5/5 PASS`, baseline mutation disabled
- Action invariant: `9/9`
- 신규 Snapshot schema / 영구 통화 / 전투 Action: 없음

## Phase 463~466 — Damage Cue Density Guard

- `src/game/damage-reason-feedback.ts`
- 다른 normal source가 0.22초 안에 연속될 때 cue 교체를 억제합니다.
- same-source는 기존처럼 합산하고 heavy/critical은 즉시 interrupt합니다.
- `DamageReasonState` 키는 기존 `source/label/severity/amount/expiresAt` 그대로입니다.

## Phase 467~470 — Stable AUTO Target

- `src/game/auto-targeting.ts`
- AUTO target에 optional preferred id를 받아 48점 미만의 미세 우선도 차이는 기존 target을 유지합니다.
- core threat처럼 material priority가 생기면 즉시 switch합니다.
- `Game.autoTargetId`가 실제 AUTO spell과 target indicator 양쪽에 같은 id를 공급합니다.
- manual targeting은 preferred id를 무시합니다.

## Phase 471~474 — Weakpoint Cue Density

- `src/game/auto-target-visibility.ts`
- `primaryWeakpointNode()`가 가장 손상된 live node를 1개 선택합니다.
- 동일 HP ratio는 hero distance → node id 순으로 deterministic tie-break합니다.
- primary만 `약점` label을 보여주고 secondary는 ring만 유지합니다.

## Phase 475~478 — Quick Recommended Shop Return

- `src/game/shop-guidance.ts`, `src/ui/shop.ts`, `src/game/game.ts`
- `quickShopRecommendation()`은 기존 `best` guidance 중 최고점 1개만 선택합니다.
- 기존 shop footer에 optional `추천 바로 구매` 버튼을 노출합니다.
- 성공한 quick purchase만 shop을 닫고 전투로 복귀합니다.
- 기존 card purchase/reroll/close flow는 그대로 유지합니다.

## Phase 479~482 — Thumb Fatigue Audit

- `src/core/thumb-fatigue-audit.ts`
- 4방향 × 24 = 96 sustained-drag sample을 비교합니다.
- fixed average reach: `100px`
- soft-follow average reach: `80.1159px`
- reach burden reduction: `60.6811%`
- max soft reach: `92px`
- max anchor shift: `68px`
- issues: `0`, audit PASS

## 검증

- `npm test`: `869/869 PASS`
- `npm run verify:raster`: `5/5 PASS`
- `npm run verify:release`: `RQ-9085A5AD PASS`
- `npm run verify:candidate`: `RCQ-D6DF7FFE PASS`
- pre-merge manifest evidence: `RM-28C7E1EA PASS`, tests 869, Action 9/9, Foldable 9/9

## 다음 기준점

Phase 483부터는 새 표시나 새 버튼을 더 늘리기보다 실제 전투 의사결정 시간을 줄이는 쪽을 우선합니다. 후보는 `AUTO 약점 연계 타겟팅 → 위험 투사체 읽기 우선순위 → 보스 특수기 직전 Action 가독성 → 상점 quick-buy 오구매 방지 → 모바일 장시간 입력 회귀 gate` 순서가 적합합니다.
