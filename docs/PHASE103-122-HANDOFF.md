# Arcane Last Stand Phase 103~122 Handoff

기준: Phase 102 `63fa168` 이후 확장. 이 패스는 새 시스템 수를 늘리기보다 기존 Build Replay, Boss Arena, Final Form, Snapshot, 모바일 입력을 더 읽기 쉽고 재현 가능하게 만드는 제품 마감 패스다.

## 운영 원칙

- 전투 Action은 `일반마법4 + 궁극기2 + 물약 + 상점 + AUTO`의 **9개를 유지**한다.
- Replay는 완성 빌드를 지급하지 않는다. 같은 시작 조건에서 정상 진행으로 목표 빌드를 다시 맞춘다.
- Mythic별 전장 차이는 새 hazard 엔진을 만들지 않고 기존 BossArena mutation에 합성한다.
- Final Form이 없으면 기존 이동 감각을 정확히 유지한다.
- 장기런 결산은 Modal/Pause를 만들지 않고 한 줄 receipt만 노출한다.
- 가로 모바일 개선은 버튼 확대보다 HUD/joystick 오입력 경계를 줄이는 데 우선순위를 둔다.

## Phase 103~106 — Replay Guidance

주요 파일:
- `src/domain/build-replay-guidance.ts`
- `src/game/game.ts`
- `tests/build-replay-guidance.test.mjs`

`replayGuidance(plan,currentBuild)`가 Build Replay 목표와 현재 상태를 비교해 `progress`, `category`, `label`을 반환한다. 유물 10, 마법 50, 융합 10, Ascension 12, Fate 8, Final Form 5, Archetype 5의 기존 Replay 기여도를 사용해 가장 영향이 큰 미달성 목표 하나만 고른다.

마법은 목표 레벨까지 남은 상대 격차를 비교하고 동점이면 더 높은 목표 레벨을 우선한다. HUD는 별도 패널을 만들지 않고 기존 빌드 최대 4줄 안에 `REPLAY 62% · 마법 · 연쇄 Lv.10` 같은 한 줄을 표시한다.

## Phase 107~110 — Mythic Arena Identity

주요 파일:
- `src/game/endless/mythic-arena-identity.ts`
- `src/game/game.ts`
- `tests/endless-mythic-arena-identity.test.mjs`

기존 `BossArenaMutationModifiers`를 6개 Mythic 정체성에 맞춰 합성한다.

- Inferno: `SOLAR` — 큰 반경과 화력 압박
- Summoner: `BROOD` — 더 많은 hazard와 빠른 cadence
- Juggernaut: `IRON` — 좁고 강한 lane형 압박
- Abyss Witch: `VOID` — 큰 orbit 변화
- Twin Maw: `TWIN` — 교차 회전 압박
- Time Eater: `CLOCK` — 가장 빠른 cadence 계열

동시 hazard는 **4~8개**, telegraph multiplier는 **0.78 이상**, damage multiplier는 **1.22 이하**로 clamp한다. 파괴된 보스 약점 비율이 높아질수록 cadence가 느려지고 피해/hazard 수가 감소해 기존 counterplay 가치가 전장에도 이어진다.

## Phase 111~114 — Final Form Mobility

주요 파일:
- `src/game/endless/final-form-mobility.ts`
- `src/game/game.ts`
- `tests/endless-final-form-mobility.test.mjs`

12개 Final Form을 `surge / flow / drift / anchor` 네 이동 family로 나눈다. `advanceFinalFormMotion()`은 Final Form이 없을 때 desired input을 그대로 반환하므로 기존 초반 이동은 변하지 않는다. 최종형 이후에만 response와 이동 배율이 달라져 같은 버튼으로도 가속/관성/고정감 차이가 생긴다.

Signature 발동 시 `signatureMobilityImpulse()`가 바라보는 방향으로 최대 78px의 1회 추진을 반환하고, Game은 지형 충돌 해석을 거친 뒤 위치를 적용한다. 새 dash 버튼은 없다.

## Phase 115~118 — Run Milestone Recap

주요 파일:
- `src/game/endless/run-milestone-recap.ts`
- `src/game/endless/types.ts`
- `src/game/endless/snapshot.ts`
- `src/game/endless/runtime.ts`
- `src/game/game.ts`
- `tests/endless-run-milestone-recap.test.mjs`

120/240/360/480/720분에 aggregate kills/bosses 증가량으로 한 줄 결산을 만든다. Snapshot에는 `reachedMilestones`, `lastKills`, `lastBosses`만 저장한다. 과거 Snapshot에서 여러 milestone을 한 번에 넘겼다면 crossed milestone은 모두 기록하지만 UI에는 가장 최근 receipt 하나만 노출한다.

결산 문구는 `보스 압박 돌파 / 화력 유지 / 안정적 보스 사냥 / 장기 생존 유지`처럼 aggregate 결과만 요약하고 게임을 멈추지 않는다.

## Phase 119~122 — Landscape HUD & Touch Ergonomics

주요 파일:
- `src/game/landscape-hud.ts`
- `src/core/input.ts`
- `src/game/game.ts`
- `tests/landscape-hud-touch.test.mjs`

`compactLandscapeStatusLine()`은 가로 화면 문자 예산 안에서 상태줄을 구성한다. 맵·Threat·위험도는 mandatory이며 재앙·처치·금화는 공간이 있을 때만 추가한다.

HUD no-touch 영역을 정의해 해당 영역에서는 joystick이 시작되지 않는다. `safeJoystickOrigin()`은 실제 joystick 중심을 x=110~720, y=400~770 범위로 보정한다. Action button hit-test는 기존처럼 joystick 판정보다 먼저 처리된다.

## 통합 계약

`tests/endless-phase103-122-integration.test.mjs`에서 다음을 잠근다.

1. 전투 Action은 여전히 정확히 9개다.
2. Replay guidance는 기존 4줄 빌드 HUD를 재사용한다.
3. Mythic arena identity가 실제 BossArena mutation path에 합성된다.
4. Final Form mobility와 Signature impulse가 실제 Game movement path에 연결된다.
5. Run recap은 Snapshot을 통과하고 modal을 열지 않는다.
6. landscape joystick은 실제 `InputState`에서 HUD 안전구역을 사용한다.

## 검증 명령

```bash
npm test
npm run build
git diff --check
```

Phase 103~122 기능 브랜치의 전체 테스트는 **489개**까지 확장됐다. 최종 `main` 병합 후에도 동일 명령과 HTTP smoke를 다시 실행해 병합된 트리 자체를 검증한다.
