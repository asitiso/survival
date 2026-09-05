# Arcane Last Stand — Phase 223~242 Handoff

## 기준
- Base: Phase 222 / `1692941`
- Feature branch: `work/phase223-242`
- 목표: 고숙련 Mythic 플레이의 보상/예고/입력 정확도/렌더 회귀 관리 강화
- 전투 Action: 9개 유지
- 새 Snapshot 필드: 없음

## Phase 223~226 — Final Form EVADE FINISH
- 파일: `src/game/endless/final-form-evade-finisher.ts`
- 기존 `arenaDodgeFinisherProfile()`을 기반으로 12개 최종형을 4계열로 분화합니다.
- `execution`: 높은 순간 피해
- `chain`: 피니시 반경 밖 근거리 적 최대 8체에 55% 연쇄 피해
- `control`: 더 넓은 반경 + 강한 감속
- `bulwark`: 밀쳐내기 + 최대 1.8% 이내 수호핵 회복
- 피니시는 PERFECT EVADE ×5 첫 진입에만 기존 edge trigger로 발동합니다.
- 경제 보상은 없습니다.

## Phase 227~230 — SAFE LANE Forecast
- 파일: `src/game/endless/safe-lane-forecast.ts`
- 현재 safe lane, 현재 safe-zone phase, 다음 safe-zone 중심, phase 전환 남은 시간을 하나의 deterministic forecast로 계산합니다.
- urgency: stable < reform < collapse < collapsed.
- Game은 urgency가 높은 구간에서만 현재 목표→다음 목표 점선을 추가 렌더합니다.
- `autoMove:false`; 물리 이동은 플레이어 입력만 담당합니다.

## Phase 231~234 — Mythic Safe-Zone Pressure Sync
- 파일: `src/game/endless/mythic-safe-zone-pressure.ts`
- 기존 `endlessBossEncounterModifiers()`에만 합성됩니다.
- stable/reform에서는 cadence를 늦추고 summon/dash를 낮춥니다.
- collapsed에서는 cadence를 빠르게 하고 summon/dash를 높입니다.
- Summoner는 summon, Juggernaut는 dash, Time Eater/Abyss는 cadence 비중이 더 큽니다.
- destroyed weakpoint ratio가 높을수록 collapsed peak가 완화됩니다.

## Phase 235~238 — Foldable Touch Density
- 파일: `src/game/foldable-touch-density.ts`
- 수정: `src/core/touch-controls.ts`, `src/core/input.ts`
- 보이는 Action 버튼 좌표/반경은 변경하지 않습니다.
- 폴더블에서만 Action별 touch scale을 `0.88..1.30` 범위로 계산합니다.
- 혼잡한 버튼 및 힌지에 가까운 버튼의 hit radius를 약간 줄입니다.
- nearest normalized distance 선택 규칙은 그대로 유지합니다.
- non-foldable에서는 기존 `hitTestActionButton(p)` 경로를 그대로 사용합니다.

## Phase 239~242 — Raster Baseline Approval Report
- 파일: `src/game/render-raster-baseline-report.ts`
- `rasterBaselineChangeReport()`:
  - baseline/current signature
  - overall similarity
  - critical similarity
  - changed cells
  - critical changed cells
  - `RB-XXXXXXXX` approval token
- `approveRasterBaselineChange()`은 report token이 정확히 일치할 때만 현재 signature를 승인 결과로 반환합니다.
- baseline source를 자동 수정하지 않습니다.
- `defaultRasterBaselineReport()`는 16:9 / 20:9 / 4:3 / foldable / 32:9 committed signature 상태를 요약합니다.

## 테스트
새 테스트:
- `tests/final-form-evade-finisher.test.mjs`
- `tests/safe-lane-forecast.test.mjs`
- `tests/mythic-safe-zone-pressure.test.mjs`
- `tests/foldable-touch-density.test.mjs`
- `tests/render-raster-baseline-report.test.mjs`
- `tests/phase223-242-integration.test.mjs`

현재 전체 회귀 기준:
- Phase 222: 583 tests
- Phase 223~242 추가: 25 tests
- 현재 전체: 608 tests

## 주요 계약
1. 전투 Action은 항상 9개.
2. Phase 223~242 transient 상태는 Snapshot에 저장하지 않음.
3. Mythic geometry/collision이 SAFE LANE 안전 판단의 최종 권위.
4. 폴더블 adaptive touch는 visual button layout을 바꾸지 않음.
5. baseline 변경은 자동 승인/자동 rewrite 금지.
6. baseline 승인 토큰은 현재 변경 report에서만 유효.

## 다음 시작점
Phase 243 이후에는 시스템 수 증가보다 다음 효과가 큼:
- Final Form 피니시 VFX/음향 정체성 강화
- SAFE LANE forecast와 Mythic attack telegraph의 시간축 통합
- 폴더블 좌/우 손가락 사용 패턴별 터치 학습 없는 적응
- Raster report를 CI artifact 형태로 사람이 읽기 쉬운 diff summary로 출력
- 실제 브라우저가 가능한 환경에서 Render/Raster contract와 screenshot 교차검증
