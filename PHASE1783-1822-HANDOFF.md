# Phase 1783~1822 Handoff — Battlefield Enemy Identity Asset Integration

## 기준

Phase 1782 전체 병합 트리에서 이어진 Bounded visual-asset pass입니다. 전장 적이 대부분 색 원으로만 표현되던 식별성 병목을 해결하되, gameplay state나 combat rule은 변경하지 않고 presentation layer만 확장했습니다.

## Phase 1783~1790 — Enemy Sprite Atlas

12종 non-boss 적을 단일 atlas로 직접 제작했습니다.

- 파일: `assets/enemies/enemy-sprites.png`
- atlas: 512×384 RGBA PNG
- cell: 128×128
- grid: 4 columns × 3 rows
- 파일 크기: 약 86KB
- 외부 CDN/네트워크 의존 없음

매핑:

- row 1: grunt / hound / brute / archer
- row 2: bomber / shaman / shieldbearer / assassin
- row 3: siegeGolem / nullifier / golden / elite

이번 pass에서는 `boss`를 명시적으로 제외했습니다. 6 boss archetype은 다음 전용 identity pass에서 별도 이미지로 다루는 편이 실루엣 차이와 유지관리 측면에서 더 낫기 때문입니다.

## Phase 1791~1798 — Battlefield Rendering Integration

`EnemyManager.renderEnemies()`가 optional atlas image/ready state를 받도록 확장했습니다.

- sprite 준비 완료 → 기존 body 위에 고유 sprite 표시
- 기존 HP bar 유지
- 기존 target/core outline 유지
- bomber/shaman/shield/assassin/siege/nullifier/golden/elite 보조 cue 유지
- boss body 및 boss presentation은 기존 구현 그대로
- hit flash는 sprite 위에서도 유지

sprite draw size는 기존 collision radius를 바꾸지 않고 presentation scale만 사용합니다.

## Phase 1799~1806 — Non-Blocking Fallback

`Game`이 action icon과 같은 방식으로 enemy atlas를 async decode합니다.

- load 성공 → enemy sprite 활성
- load 전/실패 → 기존 colored circle body 그대로 사용
- startup을 await하지 않음
- gameplay update loop와 asset load 분리
- sprite animation 없음
- motion amplitude 0

따라서 이미지 파일 누락이나 decode 실패가 적 렌더링 또는 게임 시작 실패로 전파되지 않습니다.

## Phase 1807~1814 — Deterministic Audit

새 `auditEnemySpriteAssets()` 25 samples를 추가했습니다.

목표/결과:

- sprite type coverage: 12/12
- coverage: 100%
- unique cells: 12/12
- sprite out-of-bounds: 0
- draw-size safety: PASS
- sprite motion amplitude: 0
- circle fallback preserved: true
- boss excluded: true
- Snapshot schema mutation: false

## Phase 1815~1822 — Release Fail-Closed

Release Freeze에 다음 evidence를 추가했습니다.

- `enemySpriteAssetsPassed`
- `enemySpriteAssetsSamples`

Candidate consistency와 signature payload에도 연결했습니다.

- 하위 enemy sprite evidence false + 상위 `passed=true` 위조 → Candidate FAIL
- sample count 변경 → Candidate signature 변경
- Release Freeze markdown에 `enemy-sprite-assets safe (25)` 노출

## 동결 항목

다음은 변경하지 않았습니다.

- enemy HP / damage / speed / radius
- enemy AI / target / specialist logic
- spawn weights / boss cadence
- boss archetype / boss special / boss image
- hero stats / spells / cooldown
- potion / shop / AUTO / economy
- audio scheduler / haptic pattern
- Combat Attention ordering
- Snapshot schema
- 9 Actions와 touch reachability

## 이미지 적용 판단

전장 적은 동일한 원형 body가 12종의 행동 차이를 시각적으로 충분히 전달하지 못해 이미지 적용 이득이 컸습니다. 반면 boss까지 같은 generic atlas에 묶으면 6 archetype의 정체성이 약해지므로 이번에는 의도적으로 제외했습니다. 다음 이미지 pass에서는 boss archetype을 별도로 제작하는 것이 유지관리 비용 대비 효과가 더 큽니다.

## 최종 검증

- TypeScript build: PASS
- Phase 1783~1822 targeted tests: 9/9 PASS
- 전체 regression: 404 test files / 1,586 tests / 1,586 PASS
- Release Candidate: PASS
- Candidate signature: `RCQ-D5851A3E`
- Release Freeze: `enemy-sprite-assets safe (25)`
- enemy sprite atlas: 512×384 / 86,360 bytes
- Snapshot schema mutation: false
- 기존 9 Actions: 9/9 유지
