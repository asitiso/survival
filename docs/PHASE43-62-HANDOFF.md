# Arcane Last Stand — Phase 43~62 Handoff

## 기준점

- Base: Phase 42 merged main (`b3de977`)
- Feature branch: `work/phase43-62`
- 전투 Action 계약: 일반마법 4 + 궁극기 2 + 물약 + 상점 + AUTO = **9개 유지**
- 신규 선택 모달: **0개**

## Phase 43~45 — Hero Final Form

80분 이후 35/50/65분 Hero Ascension 선택 3개를 다시 사용해 영웅별 최종형을 자동 결정합니다. 최종형은 Snapshot에 중복 저장하지 않고 영웅 ID + Ascension 선택 + elapsed에서 결정적으로 재구성합니다.

- `src/game/endless/final-form.ts`
- 각 영웅 3개 최종형, 총 12개
- 공격력/쿨다운/범위/기동/방어/융합/보스 피해 상한 적용
- HUD와 결과 FINAL BUILD에 한 줄만 표시

## Phase 46~47 — Build Archetype + Automatic Overdrive

현재 Ascension + Final Form modifier를 읽어 `burst / cycle / domain / fortress` 중 하나로 자동 분류합니다. 전투 행동으로 charge가 올라가 100이 되면 12초간 자동 발동하며 새 버튼이 없습니다.

- `src/game/endless/build-overdrive.ts`
- 일반 시전 +2 / 융합 시전 +5 / 일반 처치 +1 / 정예 +3 / 보스 +20
- Snapshot V2에 `overdrive`만 compact 저장
- 발동 시 HUD 상단 빌드 라벨에 `OVERDRIVE` 우선 노출

## Phase 48~52 — Mythic 3-Phase Combat

Mythic 보스를 HP 70% / 35% 경계의 3페이즈로 나누고 기존 3개 Mythic channel의 우선순위를 회전합니다.

- `src/game/endless/mythic-phases.ts`
- `src/game/enemies.ts`에서 실제 보스 channel/cadence에 연결
- `src/game/game.ts`의 BossEncounter modifier에서 weakpoint 생존 비율까지 합성
- weakpoint 파괴 시 받는 피해/특수기/소환/돌진 압박이 완화됨
- 적 수 무제한 증가 대신 기존 채널 재조합으로 난이도를 만듦

## Phase 53~57 — Same-Condition Retry + Run Comparison

결과 화면의 기존 재도전 버튼을 설정 재입력 없는 같은 조건 재도전으로 강화했습니다.

- `src/domain/retry-blueprint.ts`
- 저장 필드: hero / trait / threat / map / deterministic seed
- `Game.resetRun(..., retryBlueprint)`로 같은 조건 즉시 재시작
- `src/domain/run-comparison.ts`에서 직전 런/개인 최고 대비 생존·점수 차이 계산
- 최근 5런에 optional `mapId / bosses / archetype / finalForm` 추가
- legacy RunHistory는 그대로 읽음

## Phase 58~59 — Recovery Journal

15초 primary/backup Snapshot 구조는 유지하면서 60초마다 최대 3개 recovery journal checkpoint를 추가합니다.

복구 우선순위:

1. primary
2. backup
3. newest valid journal

- `src/domain/recovery-journal.ts`
- quota/JSON 손상은 런을 중단시키지 않음
- 적/탄막/파티클 좌표 배열을 새로 저장하지 않음
- 새 런/런 종료 시 journal도 함께 정리

## Phase 60~62 — Eight-Hour Stability

기존 6시간 기준을 8시간까지 확장했습니다.

- `src/game/endless/long-run-auditor.ts`
- 240 / 300 / 360 / 480분 checkpoint
- low/mid/high 성능 예산 검사
- 저사양에서는 combat logic보다 presentation density를 먼저 낮추는 계약 유지
- RunSnapshot/RunHistory elapsed 상한을 28,800초까지 일치시켜 8시간 이어하기가 잘리지 않음

## Game Host 연결 지점

`src/game/game.ts`는 규칙 자체를 소유하지 않고 다음만 담당합니다.

- final-form / overdrive modifier 합성
- Mythic HP + weakpoint 비율 전달
- 15초 Snapshot + 60초 journal 스케줄
- retry blueprint 저장/복원
- 결과 comparison/build identity 전달

`src/game/enemies.ts`는 Mythic의 실제 secondary channel 회전과 special cadence만 적용합니다.

## 호환성

- 기존 RunSnapshot version 1 읽기 유지
- 기존 endless raw/V2 payload 마이그레이션 유지
- 기존 RunHistory optional field가 없어도 정상
- Final Form은 파생 상태라 저장 용량 증가 없음
- Overdrive 상태는 숫자 3개만 저장
- Recovery Journal은 기존 compact RunSnapshot 최대 3개만 저장

## 검증 포인트

- `tests/endless-final-form-overdrive.test.mjs`
- `tests/endless-phase43-snapshot.test.mjs`
- `tests/endless-mythic-phases.test.mjs`
- `tests/retry-blueprint-comparison.test.mjs`
- `tests/recovery-journal.test.mjs`
- `tests/endless-long-run-auditor.test.mjs`
- `tests/endless-phase43-62-integration.test.mjs`

최종 release 검증에서는 전체 Node tests, TypeScript build, `git diff --check`, HTTP smoke, ZIP integrity를 다시 실행합니다.
