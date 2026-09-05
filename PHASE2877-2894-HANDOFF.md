# Phase 2877~2894 — Hero Cast Render + Enemy Motion Readability Upgrade

이번 패스는 전장 화면에서
1) 영웅이 스킬을 시전하는 순간이 더 즉각적으로 읽히고,
2) 일반 적들도 "가만히 미끄러지는 점"이 아니라 실제로 전장 위를 움직이는 개체처럼 보이도록 만드는 데 집중했다.

게임플레이 수치나 저장 포맷은 건드리지 않고, 전부 presentation-only 레이어로 붙였다.

## 핵심 변경

### Phase 2877~2882 — 영웅 Cast / Recover 오버레이 atlas 추가
- 신규 에셋: `assets/heroes/hero-cast-render-overlays.png`
- 규격: `1024×512`, `4 columns × 2 rows`, `cell 256×256`
- 열 순서: `arkan / seria / kain / edric`
- 행 순서:
  - row 1: cast emphasis overlay
  - row 2: recover / settle overlay
- 신규 모듈: `src/game/hero-cast-render-assets.ts`
- 완전 fail-open 구조: atlas 로드 실패 시에도 기존 영웅 렌더와 스킬 사용 자체는 그대로 유지

### Phase 2883~2888 — 영웅 draw pipeline에 시전/회복/방향 전환 모션 추가
- `Game`에 `initializeHeroCastRenderAtlas()` 추가
- 스킬 성공 시 `heroCastRenderCast` / `heroCastRenderRecover` 상태를 발생시켜 시전 직후의 전진감과 회복감을 표현
- 기존 hero motion render 위에 다음이 추가됨:
  1. cast overlay
  2. body lead / lean / turn tilt
  3. 정지 직후 recovery pullback
  4. recover overlay
- 이동 종료 직후에도 급정지 느낌이 덜하도록 `heroRenderRecoveryBlend`를 추가
- 방향 급변 시 몸체가 살짝 따라도는 `heroRenderTurnTilt` 추가
- reduced motion / reduced flash 환경에서는 자동으로 진폭과 알파 축소

### Phase 2889~2894 — 일반 적 이동 가독성 보강
- 신규 모듈: `src/game/enemy-motion-rendering.ts`
- 적 개체별 presentation state `renderMotion` 추가
- 업데이트 루프에서 실제 위치 변화량을 기반으로 motion blend / stride / turn / recovery를 계산
- 렌더 시 다음이 추가됨:
  1. foot-contact shadow ellipse 확장
  2. 이동 방향 기반 lead / bob / lean
  3. specialist / elite / boss 이동 silhouette 보강
  4. reduced motion 안전 처리
- 기존 enemy / boss sprite atlas는 그대로 유지하면서, 이동 시 체감만 강화

## 추가 파일
- `assets/heroes/hero-cast-render-overlays.png`
- `src/game/hero-cast-render-assets.ts`
- `src/game/hero-cast-render-audit.ts`
- `src/game/enemy-motion-rendering.ts`
- `src/game/enemy-motion-render-audit.ts`
- `tests/phase2877-2894-cast-enemy-motion-rendering.test.mjs`

## 수정 파일
- `src/game/game.ts`
- `src/game/enemies.ts`

## 검증
- `npm run build`
- `node --test tests/phase2877-2894-cast-enemy-motion-rendering.test.mjs`
- 참고: 전체 `npm test`도 재실행해 장시간 회귀 검증을 시작했고, 타임아웃 전까지 진행 구간에서 실패 없이 통과 흐름을 확인함. 다만 전체 스위트가 매우 길어 이번 실행에서는 완료 전 타임아웃됨.

## 결과
- 영웅이 스킬을 쓸 때 "지금 방금 시전했다"는 시각적 피드백이 훨씬 빨라졌다.
- 영웅 이동이 끊기듯 멈추는 느낌이 줄고, 회복 모션이 들어가면서 더 자연스러워졌다.
- 일반 적도 이동 그림자 / stride / silhouette 변화 덕분에 전장 밀도 속에서 진입 방향을 읽기 쉬워졌다.
- 특히 specialist / elite / boss는 스프라이트를 바꾸지 않고도 이동 체감 차이가 꽤 커졌다.
