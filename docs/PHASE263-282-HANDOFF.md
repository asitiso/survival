# Arcane Last Stand — Phase 263~282 Handoff

## 기준
- Base: Phase 262 / `4914c6b`
- Feature branch: `work/phase263-282`
- 목표: Mythic 공략 보상을 다음 고유 특수기와 연결하고, Last Law/SAFE 판단 정보·12개 최종형 피니시 표현·폴더블 입력 복구·릴리스 렌더 게이트를 강화
- 전투 Action: 9개 유지
- 새 Snapshot 필드: 없음
- 신규 경제 보상/영구 강화: 없음

## Phase 263~266 — Mythic Tactic Attack Link
- 신규: `src/game/endless/mythic-tactic-attack-link.ts`
- 수정: `src/game/enemies.ts`, `src/game/game.ts`
- Phase 251~254 Tactic Break 성공 시 `Game`이 one-shot link를 생성합니다.
- `EnemyManager`는 실제 Mythic 특수기 실행 프레임에서만 matching link를 읽고, 실행 후 즉시 consume callback을 호출합니다.
- 보스별 채널:
  - Inferno `EMBER INTERCEPT`: projectile pressure 중심 완화
  - Summoner `BROOD SEVER`: summon pressure 중심 완화
  - Juggernaut `IRON SIDESTEP`: dash distance 중심 완화
  - Abyss Witch `VOID DISRUPT`: projectile/summon 완화
  - Twin Maw `TWIN BREAKSTEP`: 양쪽 mirrored fan 모두 projectile 수 완화 + dash 완화
  - Time Eater `TIME RELEASE`: time-warp pressure 완화
- multiplier hard bounds: projectile/summon/dash/time-warp `0.70~1.00`, 다음 cadence `1.00~1.25`.
- 신규 상태는 transient이며 새 보스 시작/종료, 만료, consume 시 제거되고 Snapshot에 저장하지 않습니다.
- 구현 중 Twin Maw의 두 번째 mirrored fan이 link를 누락한 실제 회귀를 테스트로 발견해 양쪽 fan 모두 동일하게 완화되도록 수정했습니다.

## Phase 267~270 — Last Law SAFE Timeline
- 신규: `src/game/endless/last-law-safe-timeline.ts`
- 기존 `SafeTelegraphTimeline` + Mythic HP ratio + Last Law identity를 pure merger로 합칩니다.
- HP `<=22%`이면서 Last Law 전이면 `LAST LAW · PREPARE` warning을 표시합니다.
- 기존 HP 15% Last Law가 실제 활성화되면 `LAST LAW · <identity>`와 보스 accent를 표시합니다.
- 실제 Last Law activation threshold는 변경하지 않습니다.
- SAFE stage/urgency와 함께 읽되 `autoMove:false`를 강제합니다.
- type은 `Omit<SafeTelegraphTimeline,'label'> & {label:string}` 형태로 정리해 literal label 강제 캐스팅을 제거했습니다.

## Phase 271~274 — 12 Final Form Finisher Signatures
- 신규: `src/game/endless/final-form-finisher-signature.ts`
- 12개 Final Form에 deterministic presentation signature를 부여합니다.
- 고유 signature 예:
  - Arkan: `SOLAR CROWN`, `PHOENIX WING`, `MAGMA SEAL`
  - Seria: `ZERO HALO`, `FROST AEGIS`, `PRISM ORBIT`
  - Kain: `THUNDER THRONE`, `TEMPEST LINE`, `STORM EYE`
  - Edric: `RADIANT JUDGMENT`, `OATH WALL`, `PILGRIM PATH`
- 차이는 `secondaryAccent`, `angleOffset`, `particleSides`, `trailSkew`, `ringScale`, label에만 적용합니다.
- 전투 피해/범위/밀쳐내기 등은 기존 `finalFormEvadeFinisher()` 가족 프로필이 계속 권위를 가져 밸런스가 중복되지 않습니다.
- bounds: particle sides 3~8, trail skew -0.45~0.45, ring scale 0.90~1.12.

## Phase 275~278 — Foldable Dead-Space Resolver
- 신규: `src/game/foldable-dead-space.ts`
- 수정: `src/core/input.ts`
- foldable에서만 resolver를 호출합니다.
- 실제 hinge rectangle은 항상 neutral이며 Action/joystick으로 변환하지 않습니다.
- 힌지 왼쪽 36px 제한 띠는 안전한 joystick origin으로 recover할 수 있습니다.
- 오른쪽 패널은 기존 Action 중심과 150 logical px 이내일 때만 nearest Action을 recover합니다.
- non-foldable은 기존 Action hit-test/joystick path를 유지합니다.
- Phase 103의 정적 통합 테스트는 foldable 보정점 `joystickPoint`를 허용하도록 새 책임 경계에 맞춰 갱신했습니다.

## Phase 279~282 — Raster Release Quality Gate
- 신규: `src/game/render-raster-release-gate.ts`
- 신규 CLI: `scripts/render-release-gate.mjs`
- `package.json`: `npm run verify:release`
- 게이트 입력:
  - existing Raster CI summary
  - Action count
  - required profile count
- PASS 조건:
  - Raster summary PASS
  - Action `9/9`
  - profile `5/5`
  - baseline mutation disabled
- 현재 deterministic signature: `RQ-9085A5AD`.
- REVIEW 상태에서는 issue list와 markdown report를 반환합니다.
- `--out <path>`로 markdown artifact 저장이 가능하지만 baseline 파일을 자동 수정하지 않습니다.

## 테스트
Phase 263~282 신규 테스트 총 28개:
- `tests/mythic-tactic-attack-link.test.mjs` — 3
- `tests/phase263-tactic-link-integration.test.mjs` — 2
- `tests/mythic-tactic-attack-link-regression.test.mjs` — 1
- `tests/last-law-safe-timeline.test.mjs` — 3
- `tests/phase267-last-law-timeline-integration.test.mjs` — 1
- `tests/final-form-finisher-signature.test.mjs` — 2
- `tests/phase271-finisher-signature-integration.test.mjs` — 1
- `tests/foldable-dead-space.test.mjs` — 4
- `tests/phase275-foldable-dead-space-integration.test.mjs` — 1
- `tests/render-raster-release-gate.test.mjs` — 5
- `tests/phase263-282-integration.test.mjs` — 5

전체 회귀:
- Phase 262 기준: 633
- Phase 263~282 추가: 28
- 전체: **661 / 661 pass**

## Raster / Release Gate
`npm run verify:raster`:
- 16:9 `RR-FE2C6B74` PASS
- 20:9 `RR-0937F125` PASS
- 4:3 `RR-4C84B218` PASS
- foldable `RR-023FFC4B` PASS
- 32:9 `RR-737044D6` PASS
- baseline auto-update: disabled

`npm run verify:release`:
- Status: PASS
- Signature: `RQ-9085A5AD`
- Action invariant: 9/9
- Raster profiles: 5/5
- Baseline mutation: disabled

## 주요 계약
1. Combat Action = 9.
2. 새 Snapshot schema 필드 없음.
3. Tactic Attack Link는 matching Mythic special 1회만 약화하고 즉시 consume.
4. Last Law의 실제 15% 활성 기준은 기존 코드가 권위.
5. 12 Final Form 피니시 차이는 presentation only이며 전투 수치는 기존 가족 프로필이 권위.
6. Foldable hinge는 항상 neutral이며 non-foldable 입력 경로는 유지.
7. Raster/Release gate는 baseline을 자동 갱신하거나 자동 승인하지 않음.

## 검증 명령
- `npm run build`
- `npm test`
- `npm run verify:raster`
- `npm run verify:release`
- `git diff --check`

## 다음 시작점
Phase 283 이후는 신규 시스템 수보다 다음 품질 개선의 체감 이득이 큽니다.
- Tactic Attack Link 성공 여부를 과잉 UI 없이 읽게 하는 짧은 boss feedback
- Last Law SAFE Timeline과 실제 safe-zone lifecycle을 한 줄보다 더 직관적으로 시각 통합
- 12 Final Form finisher signature와 기존 hero palette/audio identity 추가 정렬
- foldable dead-space를 실제 left/right thumb travel 거리 기준으로 정밀 감사
- Release Quality Gate에 full test/build/diff 결과를 묶는 상위 release manifest
