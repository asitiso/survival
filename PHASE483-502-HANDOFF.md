# Arcane Last Stand — Phase 483~502 Handoff

## 기준선
- 입력 source lineage: Phase 482 archive comment `104a8a5103b4637557be9c12bf466a0d0af833a5`
- Phase 482 ZIP SHA-256: `c9a0a51c1132216ecbd22b6744b203be6e43433b94a1c63eb8554173afd7e74d`
- 시작 regression: 869/869 PASS

## 구현
### Phase 483~486 — AUTO Weakpoint Aim
- AUTO 적 선택 로직 자체는 변경하지 않음.
- 선택된 대상이 현재 active boss일 때만 현재 1순위 살아 있는 weakpoint로 spell aim point 보정.
- manual cast / mismatch boss / dead node / 760px 밖 node는 기존 target center 유지.
- Fire Bolt, Chain Lightning encounter impact, Flame Field, Meteor Storm, Black Hole에 연결.

### Phase 487~490 — Projectile Danger Visibility
- 실제 속도 벡터에서 target 방향 진행거리/횡방향 miss distance/time-to-impact 계산.
- 1.45초 이내 실제 충돌 궤도만 watch/danger/critical로 분류.
- 최대 6개 cue만 렌더링하여 탄막 과밀 방지.
- hero radius 23 / core radius 48을 collision width에 반영.

### Phase 491~494 — Boss Special Action Assist
- `specialTimer <= 1.05s`에서만 기존 Action 중 1개 highlight.
- HP <=34% + potion 보유/ready면 potion 우선.
- archetype별 기존 spell/ultimate ready fallback 사용.
- shop/auto 신규 대응 Action 없음.

### Phase 495~498 — Quick-Buy Mispurchase Guard
- click 시점 current offer/price/coins 재검증.
- rank 3+ 또는 legendary 장비를 다른 item으로 교체하는 경우 quick-buy 차단.
- same-item upgrade와 potion은 quick-buy 유지.
- 일반 shop card purchase는 변경 없음.
- quick button은 click 즉시 disabled되어 double-tap 재구매도 억제.

### Phase 499~502 — Mobile Input Regression Gate
- 4 landscape profiles.
- 96 sustained-drag samples.
- Action 9/9, reachable 9/9, foldable hinge clear.
- reach burden reduction 60.68%, max soft reach 92px.
- action layout mutation false.
- Candidate에 fail-closed `mobile-input-regression` gate 연결.

## 현재 검증
- 신규 Phase test: 20/20 PASS
- 전체 regression: 889/889 PASS
- Raster: 5/5 PASS
- Release Gate: `RQ-9085A5AD`
- Candidate: `RCQ-B6AA748A`
- Candidate mobile input: PASS · actions 9/9 · drag 96 · relief 61%
- Action invariant: 9/9
- baseline mutation: disabled

## 불변 조건
- 전투 Action 추가 없음.
- 신규 영구 통화 없음.
- Snapshot schema 필드 추가 없음.
- manual target contract 유지.
- boss/shop 기존 일반 조작 경로 유지.

## 다음 기준점
Phase 503부터는 새 전투 표시를 계속 늘리기보다, 현재 warning/assist가 실제로 겹치지 않는지 presentation density를 감사하고, AUTO weakpoint 성과·특수기 대응 성공률·quick-buy 취소/실수 방지 체감·긴 런 입력 안정성을 정리하는 방향이 효율적입니다.
