# Phase 2859~2876 — Hero Motion Rendering Upgrade

이번 패스는 전장화면에서 영웅이 "움직이고 있다"는 체감과, 영웅 자체의 렌더링 완성도를 올리는 데 집중했다.
기존 원형 기반 fallback은 유지하되, 실제 전장에서는 신규 오버레이 atlas를 이용해 idle / move / crest 3층의 영웅 렌더링이 추가된다.

## 핵심 변경

### Phase 2859~2862 — 신규 영웅 모션 렌더 atlas 추가
- 신규 에셋: `assets/heroes/hero-motion-render-overlays.png`
- 규격: 1024×768, 4 columns × 3 rows, cell 256×256
- 열 순서: arkan / seria / kain / edric
- 행 순서:
  - row 1: idle aura overlay
  - row 2: movement streak overlay
  - row 3: crest / flourish overlay
- 완전 fail-open 구조: atlas 로드 실패 시 기존 영웅 렌더 fallback 유지

### Phase 2863~2868 — 영웅 draw pipeline 업그레이드
- `src/game/hero-motion-render-assets.ts` 추가
- `Game`에 `initializeHeroMotionRenderAtlas()` 추가
- 영웅 렌더에 다음 레이어가 들어감:
  1. 지면 shadow ellipse
  2. idle aura overlay
  3. move overlay(방향 회전 포함)
  4. 기존 hero battle sprite + body fallback
  5. crest overlay
  6. facing line
- 이동 중에는 stride 기반 bob / squash / lift 연출이 들어가며 정지 시 자연스럽게 감쇠
- reduced motion / reduced flash 환경에서는 움직임과 알파를 자동 축소

### Phase 2869~2876 — 검증 추가
- `src/game/hero-motion-render-audit.ts` 추가
- 신규 테스트: `tests/phase2859-2876-hero-motion-rendering.test.mjs`
- atlas coverage / bounds / presentation invariants / preload wiring / deterministic audit 검증

## 추가 파일
- `assets/heroes/hero-motion-render-overlays.png`
- `src/game/hero-motion-render-assets.ts`
- `src/game/hero-motion-render-audit.ts`
- `tests/phase2859-2876-hero-motion-rendering.test.mjs`

## 검증
- `npm run build`
- `node --test tests/phase2391-2398-battlefield-visual-asset-integration.test.mjs tests/phase2553-2558-perfect-evade-trail-vfx.test.mjs tests/phase2859-2876-hero-motion-rendering.test.mjs`

## 결과
전장 체감상 영웅이 배경 위에 더 선명하게 떠오르고, 이동 시 "미끄러지듯 움직이는 평면" 느낌이 줄어들었다.
특히 Kain / Arkan처럼 기동감이 중요한 영웅은 이동 streak가 즉각적으로 읽히고,
Edric / Seria는 idle + crest overlay 덕분에 서 있는 상태에서도 존재감이 커졌다.
