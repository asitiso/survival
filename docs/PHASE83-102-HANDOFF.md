# Arcane Last Stand Phase 83~102 Handoff

기준: Phase 82 `b49e3ba` 이후 확장. 이 패스는 후반 시스템 수를 늘리기보다 기존 Build Capsule, Mythic, Final Form, Snapshot, 모바일 입력/표현 예산을 실제 플레이 편의와 재현성 중심으로 연결한다.

## 운영 원칙

- 전투 Action은 `일반마법4 + 궁극기2 + 물약 + 상점 + AUTO`의 **9개를 유지**한다.
- Build Replay는 완성 빌드를 지급하지 않는다. 시작 조건만 재현하고 빌드는 정상 진행으로 다시 맞춘다.
- 장기 체크포인트는 게임을 멈추지 않는다.
- 모바일 성능 저하 시 적 AI/스폰보다 장식 표현을 먼저 줄인다.
- 신규 상태는 기존 Snapshot/endless payload에 compact 저장하며 적 좌표나 탄막 배열은 저장하지 않는다.

## Phase 83~86 — Progression-valid Build Replay

주요 파일:
- `src/domain/build-replay.ts`
- `src/domain/run-snapshot.ts`
- `src/game/game.ts`
- `tests/build-replay.test.mjs`

`Build Capsule`을 `BuildReplayPlan`으로 해석한다. 즉시 복원되는 값은 영웅, 특성, Threat, 맵, deterministic seed뿐이다. 마법 레벨, 유물, 융합, Fate, Ascension, Final Form은 목표 값으로만 남고 플레이 중 다시 획득해야 한다.

`replayProgressPercent()`는 마법 성장 50%, 유물 10%, 융합 10%, Fate 8%, Ascension 12%, Final Form 5%, Build Archetype 5% 가중치로 현재 빌드의 재현도를 0~100으로 계산한다. 기존 결과창 재도전 버튼을 그대로 재사용하고 HUD의 최대 빌드 요약 영역에 `REPLAY xx%`를 표시한다.

Snapshot에는 `replayCapsule` 문자열만 추가한다. 잘못된 Capsule은 sanitizer가 제거하므로 기존 저장 복구를 막지 않는다.

## Phase 87~90 — Mythic Last Law Identity

주요 파일:
- `src/game/endless/mythic-last-law-identity.ts`
- `src/game/game.ts`
- `src/game/enemies.ts`
- `tests/endless-mythic-last-law-identity.test.mjs`

기존 Last Law의 HP 15% 진입 조건과 약점 완화 규칙 위에 보스별 정체성을 합성한다.

- Inferno: `SOLAR RUPTURE` — 탄막 비중 강화
- Summoner: `BROOD CROWN` — 소환 비중 강화
- Juggernaut: `IRON VERDICT` — 돌진 거리 강화
- Abyss Witch: `NULL ECLIPSE` — 특수기 cadence 강화
- Twin Maw: `TWIN CATACLYSM` — 돌진+탄막 혼합
- Time Eater: `BROKEN HOUR` — 가장 빠른 특수기 회전

모든 multiplier는 clamp를 거치며 약점을 파괴할수록 기존 Last Law relief가 그대로 작동한다.

## Phase 91~94 — Final Form Attack Patterns

주요 파일:
- `src/game/endless/final-form-patterns.ts`
- `src/game/game.ts`
- `tests/endless-final-form-patterns.test.mjs`

12개 Final Form을 네 전투 패턴군으로 나눈다.

- `nova`: 큰 순간 광역 피해
- `chain`: 가까운 적을 제한 개수만 연쇄 타격
- `shockwave`: 낮은 피해 대신 큰 밀쳐내기/방어 보조
- `domain`: 넓은 범위의 감속형 펄스

Signature가 발동되는 순간 한 번만 실행한다. 새로운 지속 투사체/탄막 엔진은 만들지 않는다. 감속은 기존 `EnemyManager.applySlow()` API를 사용한다.

## Phase 95~98 — Non-blocking Run Checkpoints

주요 파일:
- `src/game/endless/run-checkpoints.ts`
- `src/game/endless/types.ts`
- `src/game/endless/snapshot.ts`
- `src/game/endless/runtime.ts`
- `src/game/game.ts`
- `tests/endless-run-checkpoints.test.mjs`

90/180/300/480/720분에 자동 체크포인트를 만든다. 이 이벤트는 Pause나 Modal을 열지 않고 `saveCurrentRunSnapshot()`과 recovery journal append를 즉시 수행한다.

복귀 시 여러 이정표를 이미 넘긴 상태라면 crossed milestone은 모두 저장하지만 화면에는 가장 최신 체크포인트 receipt 하나만 노출한다. `reachedMilestones`는 Snapshot에 저장되어 재접속 후 같은 체크포인트가 반복되지 않는다.

## Phase 99~102 — Mobile Touch + Frame Polish

주요 파일:
- `src/core/touch-controls.ts`
- `src/core/input.ts`
- `src/game/endless/mobile-frame-governor.ts`
- `src/game/presentation-runtime.ts`
- `src/game/game.ts`
- `tests/mobile-touch-polish.test.mjs`
- `tests/endless-mobile-frame-governor.test.mjs`

터치 액션은 확대된 원형 hit target이 겹칠 때 첫 번째 배열 원소가 아니라 포인터에서 정규화 거리가 가장 가까운 버튼을 선택한다. 조이스틱에는 기본 0.12 radial deadzone과 연속 remap을 적용한다.

Frame Governor policy:

| Tier | Visual density | Projectile visual | Particle cap | Trail cap | Telegraph cap |
| --- | ---: | ---: | ---: | ---: | ---: |
| full | 1.00 | 1.00 | 180 | 72 | 24 |
| reduced | 0.72 | 0.68 | 112 | 48 | 24 |
| minimal | 0.48 | 0.42 | 64 | 28 | 24 |

`PresentationRuntime.trimToBudget()`가 tier 하향 직후 이미 쌓여 있던 장식 효과를 즉시 정리한다. 위험 텔레그래프 cap은 전 단계 24로 고정한다.

## 통합 계약

`tests/endless-phase83-102-integration.test.mjs`에서 다음을 한 번에 잠근다.

1. Action 버튼은 여전히 정확히 9개다.
2. 결과창에 세 번째 Replay/Checkpoint 버튼이 생기지 않는다.
3. Build Replay의 Capsule과 체크포인트 상태가 Snapshot을 통과한다.
4. Mythic identity와 Final Form 공격이 presentation-only가 아니라 실제 combat path에 연결된다.
5. 모바일 입력 정확도와 즉시 VFX shedding이 실제 Input/Game 경로에 연결된다.

## 검증 명령

```bash
npm test
npm run build
git diff --check
```

Phase 83~102 기능 병합 브랜치에서 전체 테스트는 463개까지 확장됐다. 최종 `main` 병합 후에는 동일 명령을 다시 실행해 병합된 트리 자체를 검증한다.
