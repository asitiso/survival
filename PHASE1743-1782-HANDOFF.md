# Phase 1743~1782 Handoff — Hero Identity Asset Integration

## 기준

Phase 1742 전체 병합 트리에서 이어진 Bounded visual-asset pass입니다. 전투 규칙을 늘리지 않고 영웅 선택 단계에서 4영웅의 정체성을 즉시 구분할 수 있도록 직접 생성한 초상화 atlas를 기존 선택 UI에 연결했습니다.

## Phase 1743~1750 — Hero Portrait Atlas

- 직접 생성한 4영웅 판타지 메달리온 초상화를 단일 atlas로 정리했습니다.
- 파일: `assets/ui/hero-portraits.png`
- atlas: 512×512 RGBA PNG
- cell: 256×256, 2 columns × 2 rows
- 원본 1254×1254 이미지를 런타임 용도에 맞게 축소해 약 537KB로 유지했습니다.
- 외부 CDN/네트워크 의존 없음

매핑:

- arkan → top-left
- seria → top-right
- kain → bottom-left
- edric → bottom-right

## Phase 1751~1758 — Hero Select Integration

`HeroSelectOverlay`가 `heroPortraitPresentation()`의 atlas 좌표를 CSS custom property로 전달합니다.

- 기존 4개 hero card 순서/선택 callback 불변
- 기존 영웅명/칭호/passive/설명/stats 항상 유지
- desktop portrait 84×84
- compact landscape portrait 58×58
- hero-card touch target과 선택 흐름 불변

## Phase 1759~1766 — Fail-Safe / Motion Safety

초상화는 CSS background 첫 레이어로 렌더링하고, 기존 `hero-orb` radial gradient를 두 번째 레이어로 그대로 유지합니다.

- atlas load 성공 → portrait 표시
- atlas load 실패 → 기존 colored orb fallback이 자동 노출
- 이미지 때문에 hero selection/opening flow를 기다리지 않음
- portrait animation 없음
- motion amplitude 0
- 새 flash/shake/audio/haptic 없음

## Phase 1767~1774 — Deterministic Audit

새 `auditHeroPortraitAssets()` 25 samples를 추가했습니다.

목표/결과:

- hero coverage: 100%
- unique cells: 4/4
- sprite out-of-bounds: 0
- selectable heroes: 4/4
- portrait motion amplitude: 0
- fallback orb preserved: true
- Snapshot schema mutation: false

## Phase 1775~1782 — Release Fail-Closed

Release Freeze에 다음 evidence를 추가했습니다.

- `heroPortraitAssetsPassed`
- `heroPortraitAssetsSamples`

Candidate consistency와 signature payload에도 연결했습니다.

- 하위 hero portrait evidence false + 상위 `passed=true` 위조 → Candidate FAIL
- sample count 변경 → Candidate signature 변경
- Release Freeze markdown에 `hero-portrait-assets safe (25)` 노출

## 동결 항목

다음은 변경하지 않았습니다.

- hero stats / passive / spells
- hero selection callback / trait selection flow
- enemy spawn / boss cadence
- HP / damage / heal / potion
- AUTO / cooldown / economy
- audio scheduler / haptic pattern
- Combat Attention ordering
- Snapshot schema
- 9 Actions와 touch reachability

## 이미지 적용 원칙

이후에도 이미지가 기존 Canvas/CSS보다 식별성과 게임 정체성을 확실히 높일 때만 직접 생성·최적화해서 포함합니다. 로딩·관리 비용만 늘어나는 장식성 자산은 추가하지 않습니다.

## 최종 검증

- TypeScript build: PASS
- Phase 1743~1782 targeted tests: 10/10 PASS
- 전체 regression: 400 test files / 1,577 tests / 1,577 PASS
- Release Candidate: PASS
- Candidate signature: `RCQ-9EA592E3`
- Release Freeze: `hero-portrait-assets safe (25)`
- hero portrait atlas: 512×512 / 549,262 bytes
- Snapshot schema mutation: false
- 기존 9 Actions: 9/9 유지

라이브 headless browser는 실행 환경의 localhost/file URL 조직 정책으로 페이지 접근이 차단되어, 브라우저 screenshot 기반 검증 대신 실제 PNG 확인 + source/CSS integration test + deterministic audit + 전체 regression으로 검증했습니다.
