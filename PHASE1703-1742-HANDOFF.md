# Phase 1703~1742 Handoff — Action Icon Asset Integration

## 기준

Phase 1702 전체 병합 트리에서 이어진 Bounded visual-asset pass입니다. 게임 규칙이나 조작 수를 늘리지 않고, 모바일 전투 버튼 9개를 더 빨리 식별할 수 있도록 실제 이미지 리소스를 프로젝트에 넣고 기존 Canvas HUD에 연결했습니다.

## Phase 1703~1710 — Generated Action Icon Atlas

- 직접 생성한 판타지 UI 아이콘 9종을 사용했습니다.
- 런타임 관리 비용을 줄이기 위해 9개의 원본 PNG를 그대로 포함하지 않고 384×384 단일 atlas로 합쳤습니다.
- 파일: `assets/ui/action-icons.png`
- cell: 128×128, 3 columns × 3 rows
- 최종 atlas 크기: 약 300KB
- 9 Actions 모두 고유 cell 1개씩 사용합니다.

매핑:

- spell1 → fire bolt
- spell2 → lightning
- spell3 → frost
- spell4 → flame field
- ultimate1 → meteor
- ultimate2 → black hole
- potion → healing potion
- shop → gold bag
- auto → target reticle

## Phase 1711~1718 — Non-blocking Asset Load

`Game`이 atlas 1장만 비동기 preload합니다.

- `onload` 이후에만 icon layer 표시
- `onerror` 시 기존 text-only control 유지
- 이미지 로딩은 게임 시작/입력/쿨다운을 block하지 않음
- 외부 CDN/네트워크 의존 없음

## Phase 1719~1726 — Control Readability Integration

기존 원형 버튼 위에 icon layer를 추가했습니다.

- icon은 버튼 중심 위쪽에 배치
- 기존 action name과 READY/cooldown/AUTO label은 항상 유지
- cooldown overlay는 icon 위에도 동일하게 적용
- unavailable shop alpha도 기존 상태와 동기화
- 버튼 x/y/radius와 touch geometry 불변

즉 아이콘만 보고도 기능을 빨리 구분할 수 있지만, 이미지가 깨져도 텍스트만으로 기존과 똑같이 조작할 수 있습니다.

## Phase 1727~1734 — Asset Budget / Motion Safety

- atlas 파일 1개
- 384×384 RGBA PNG
- 350KB 이하 gate
- icon animation 없음
- motion amplitude 0
- 새 flash/shake/haptic/audio 없음
- Reduced Flash 및 Combat Attention 규칙과 충돌 없음

## Phase 1735~1740 — Deterministic Audit

새 `auditActionIconAssets()` 25 samples를 추가했습니다.

목표/결과:

- action coverage: 100%
- unique cells: 9/9
- sprite out-of-bounds: 0
- reachable Actions: 9/9
- icon motion amplitude: 0
- text fallback preserved: true
- Snapshot schema mutation: false

## Phase 1741~1742 — Release Fail-Closed

Release Freeze에 다음 evidence를 추가했습니다.

- `actionIconAssetsPassed`
- `actionIconAssetsSamples`

Candidate consistency와 signature payload에도 연결했습니다.

- 하위 action icon evidence를 false로 만들고 상위 `passed=true`만 위조 → Candidate FAIL
- sample count 변경 → Candidate signature 변경
- Release Freeze markdown: `action-icon-assets safe (25)`

## 검증

TDD RED → GREEN으로 진행했습니다.

- Phase 1703~1710 atlas tests: PASS
- Phase 1711~1734 game integration / actual PNG budget tests: PASS
- Phase 1735~1742 audit / fail-closed tests: PASS
- 핵심 9 Actions / input / HUD / attention / release regression: 59/59 PASS
- 전체 suite: 396 test files / 1,567 tests / 1,567 PASS
- TypeScript build: PASS
- Release Candidate: PASS
- Candidate signature: `RCQ-1929AD6E`

## 동결 항목

다음은 변경하지 않았습니다.

- 적 spawn/cadence
- boss timing / HP / damage
- heal / potion mechanics
- spell cooldown / AUTO behavior
- economy / shop rules
- audio scheduler / haptic pattern
- Combat Attention ordering
- Snapshot schema
- 9 Actions와 touch reachability

## 다음 이미지 적용 원칙

향후 Phase에서도 이미지가 기존 Canvas/CSS보다 체감 식별성과 완성도를 분명히 높이는 경우에만 직접 생성·최적화해서 포함합니다. 배경 장식처럼 로딩 비용만 늘거나 코드 도형으로 충분한 부분은 이미지로 교체하지 않습니다.
