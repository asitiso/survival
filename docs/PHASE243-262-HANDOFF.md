# Arcane Last Stand — Phase 243~262 Handoff

## 기준
- Base: Phase 242 / `4283427`
- Feature branch: `work/phase243-262`
- 목표: Final Form 피니시 표현, Mythic 안전 이동 시간축, 고숙련 공략 보상, 폴더블 엄지 입력, Raster CI 보고 강화
- 전투 Action: 9개 유지
- 새 Snapshot 필드: 없음

## Phase 243~246 — Final Form Finisher Feedback
- 파일: `src/game/endless/final-form-finisher-feedback.ts`
- 수정: `src/game/audio.ts`, `src/game/game.ts`
- execution / chain / control / bulwark 4계열의 ring/particle/trail/SFX가 실제로 다릅니다.
- 새 SoundKind: `finisherExecution`, `finisherChain`, `finisherControl`, `finisherBulwark`.
- 기존 `finalFormEvadeFinisher()`가 전투 수치와 기본 accent의 권위를 계속 가집니다.
- presentation cap: particle <=18, ring <=3, trail <=8, TTL <=0.5s.

## Phase 247~250 — SAFE Telegraph Timeline
- 파일: `src/game/endless/safe-telegraph-timeline.ts`
- SAFE ZONE 전환 시간과 BossArena `hazard.telegraph`를 동일 시간축으로 결합합니다.
- `mythicArenaHazardContact()`를 사용해 current/next SAFE target을 실제로 위협하는 hazard만 계산합니다.
- stage: `hold / prepare / move / critical`.
- `autoMove:false`.
- 기존 SAFE LANE 위치에 짧은 텍스트와 작은 urgency bar만 추가합니다.

## Phase 251~254 — Mythic Tactic Break
- 파일: `src/game/endless/mythic-tactic-reward.ts`
- 조건: Mythic + SAFE LINK 성공 + 약점 파괴율 >= 50% + safe-zone phase가 collapsed가 아님.
- 보상: 4~6.5초 boss vulnerability, Signature 소량, Flow retention.
- boss damage taken multiplier 최대 1.08, Signature 최대 +3, Flow retention 최대 1600ms.
- Gold/XP 없음.
- Game transient fields: `mythicTacticBoostUntilMs`, `mythicTacticBossDamageMultiplier`.
- 새 보스 시작/종료와 만료 시 즉시 제거되며 Snapshot에 저장하지 않습니다.

## Phase 255~258 — Foldable Thumb Zones
- 파일: `src/game/foldable-thumb-zones.ts`
- 수정: `src/core/input.ts`
- foldable에서만 left/right/neutral thumb ownership을 계산합니다.
- left: joystick start 가능.
- right: adaptive Action hit-test 가능.
- hinge/상단: neutral.
- non-foldable은 기존 `hitTestActionButton(p)`와 기존 joystick 판단을 유지합니다.

## Phase 259~262 — Raster CI Diff Summary
- 파일: `src/game/render-raster-ci-summary.ts`
- CLI: `scripts/render-raster-ci.mjs`
- package script: `npm run verify:raster`
- 현재 tree에서는 5개 화면비 모두 `PASS`.
- 변경 report에서는 expected/current signature, similarity, critical similarity, changed cell 수, `RB-XXXXXXXX` review token을 출력합니다.
- baseline auto-update / auto-approve / file write는 하지 않습니다.

## 테스트
새 테스트:
- `tests/final-form-finisher-feedback.test.mjs` — 3
- `tests/safe-telegraph-timeline.test.mjs` — 4
- `tests/mythic-tactic-reward.test.mjs` — 4
- `tests/foldable-thumb-zones.test.mjs` — 4
- `tests/render-raster-ci-summary.test.mjs` — 5
- `tests/phase243-262-integration.test.mjs` — 5

현재 전체 회귀:
- Phase 242: 608
- Phase 243~262 추가: 25
- 전체: 633

## 주요 계약
1. Combat Action = 9.
2. Phase 243~262 상태는 Snapshot에 저장하지 않음.
3. Mythic hazard threat 판단은 기존 geometry/collision이 최종 권위.
4. Tactic Break는 economy 보상이 아니며 boss vulnerability 최대 ×1.08.
5. Foldable thumb ownership은 보이는 Action layout을 바꾸지 않음.
6. Non-foldable input path는 기존 호출을 유지.
7. Raster CI는 baseline을 자동 갱신하거나 승인하지 않음.

## 검증 명령
- `npm run build`
- `npm test`
- `npm run verify:raster`
- `git diff --check`

## 다음 시작점
Phase 263 이후에는 시스템 수보다 다음 개선의 체감 이득이 큼:
- Mythic Tactic Break와 보스별 공격 패턴의 추가 정체성
- SAFE TIMELINE을 boss phase/Last Law 전환까지 확장
- Final Form 피니시의 hero별 12종 세부 연출 차별화
- 폴더블 좌/우 엄지 사용 기록 없이 적응하는 dead-space 튜닝
- Raster CI summary를 빌드 artifact/markdown report로 저장하는 선택적 외부 CI 연결
