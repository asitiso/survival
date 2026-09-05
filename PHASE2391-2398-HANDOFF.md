# Phase 2391~2398 — Battlefield Visual Asset Integration

이번 패스는 요청하신 방향대로 **전장 안에서 실제 체감되는 이미지/VFX 우선 개선**에 집중했습니다.
기존처럼 전부 도형으로만 그리는 방식은 빠르지만, 전장 가독성과 보스전 몰입감이 크게 늘지는 않아서,
이번에는 **배경 / 전장 오브젝트 / 영웅 전투 스프라이트 / 마법 VFX**를 직접 제작해서 코드에 연결했습니다.

## Phase 2391~2392 — Hero Battle Sprite Atlas
- 신규 파일: `assets/heroes/hero-battle-sprites.png`
- 신규 모듈: `src/game/hero-battle-sprite-assets.ts`
- 4영웅 전투 스프라이트 추가
  - arkan / seria / kain / edric
- 2x2 atlas / 512x512 / cell 256x256
- `drawHero()`가 기존 원형 바디 fallback을 유지하면서 스프라이트를 우선 렌더
- 따라서 이미지 로드 실패 시에도 플레이는 그대로 가능

## Phase 2393~2394 — Battlefield Prop Atlas + Terrain Overlay
- 신규 파일: `assets/arena/battlefield-props-vfx.png`
- 신규 모듈: `src/game/battlefield-props-vfx-assets.ts`
- 12셀 atlas 구성
  - row1: map별 wall/obstacle prop 3종
  - row2: map별 crystal objective 3종
  - row3~4: spell VFX stamp 6종
- `Game.drawTerrainSpriteOverlays()` 추가
- 기존 terrain의 충돌/판정 로직은 그대로 두고,
  **벽/장애물은 직사각형 판정 유지 + 이미지 오버레이**, **결정체는 기존 기능 유지 + 이미지 오버레이** 구조로 붙였습니다.
- 즉, 플레이 감각은 그대로 두고 보이는 정보만 더 좋아졌습니다.

## Phase 2395~2398 — Spell VFX Atlas Integration
- `SpellSystem.render()`가 optional atlas를 받도록 확장
- 신규 VFX 스탬프 적용
  - chainLightning midpoint stamp
  - frostNova ring sigil
  - flameField magic circle
  - meteorStorm impact burst
  - blackHole vortex sigil
- reduced-motion / residual-motion 흐름은 깨지지 않도록 기존 motion contract를 유지
- 완전히 새 애니메이션 시스템을 또 만드는 대신,
  **기존 전투 판독성을 망치지 않는 선에서 이미지 VFX를 얹는 방식**으로 작업했습니다.

## 배경 리소스
- `assets/arena/battlefield-environments.png`도 새로 갱신했습니다.
- 3x3 atlas / ruinedGate / frozenFen / crystalQuarry 각 3단계 진화 배경 유지
- 기존 구조와 호환되므로 다른 코드 변경 없이 즉시 반영됩니다.

## 검증
- `npm run build` 통과
- 집중 회귀 테스트 통과:
  - `tests/phase1791-1806-enemy-sprite-render-integration.test.mjs`
  - `tests/phase1823-1830-boss-sprite-atlas.test.mjs`
  - `tests/phase1895-1900-residual-combat-motion.test.mjs`
  - `tests/phase1944-battlefield-environment-release-gate.test.mjs`
  - `tests/phase2391-2398-battlefield-visual-asset-integration.test.mjs`
- 실행 커맨드:
  - `node --test tests/phase1791-1806-enemy-sprite-render-integration.test.mjs tests/phase1823-1830-boss-sprite-atlas.test.mjs tests/phase1895-1900-residual-combat-motion.test.mjs tests/phase1944-battlefield-environment-release-gate.test.mjs tests/phase2391-2398-battlefield-visual-asset-integration.test.mjs`

## 다음 패스 추천
다음부터도 같은 원칙으로 가는 게 좋습니다.
특히 효과 대비 체감이 큰 순서는 아래입니다.
1. **보스별 전투 전용 시그니처 VFX 분리**
2. **영웅별 spell1 projectile / spell2 cast pose 분리**
3. **맵별 destructible obstacle variation 추가**
4. **피격 / 처치 / 보스 등장 컷인 VFX 이미지화**

이번 패스는 “전장 전체를 완전 재작성”하지 않고,
**기존 판정/밸런스/검증 구조를 유지한 채 눈에 보이는 전장 품질을 바로 끌어올리는 방향**으로 반영했습니다.
