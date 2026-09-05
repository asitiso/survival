# Arcane Last Stand Phase 123~142 Handoff

기준점: Phase 122 `7a6e566` 이후 확장.

이번 패스는 새 시스템을 더 쌓는 대신 플레이어가 즉시 체감하는 전장 형상, 최종형 이동-시전 연계, 첫 10분 속도감, 장기런 시각 피로, 가로 HUD 우선순위를 마감한다.

## 고정 운영 원칙

- 전투 Action은 `일반마법4 + 궁극기2 + 물약 + 상점 + AUTO` **9개 그대로**다.
- 신규 메뉴/인벤토리/전투 버튼을 추가하지 않는다.
- 장기런 comfort는 적 AI·스폰·위험 telegraph를 약화시키지 않는다.
- Final Form Flow는 4.2초 transient 상태라 Snapshot schema를 늘리지 않는다.
- 초반 pacing은 600초 이전에만 적용되고 600초부터 배율 1.0으로 완전히 복귀한다.

## Phase 123~126 — Mythic Boss Arena Geometry

주요 파일:
- `src/game/endless/mythic-arena-geometry.ts`
- `src/game/boss-arena.ts`
- `src/game/game.ts`
- `tests/endless-mythic-arena-geometry.test.mjs`

6개 Mythic 보스가 각기 다른 geometry를 사용한다.

- Inferno: `solar-ring` / ring
- Summoner: `brood-pockets` / pockets
- Juggernaut: `iron-corridor` / corridor
- Abyss Witch: `void-orbit` / orbit
- Twin Maw: `twin-cross` / cross
- Time Eater: `broken-clock` / clock

기존 BossArena hazard kind와 mutation 수치 체인을 유지하면서 geometry가 **위치와 Canvas shape**를 추가로 결정한다. 약점 파괴율이 올라가면 pressure·rotation이 감소하고 safe gap이 증가한다.

## Phase 127~130 — Final Form Flow Combo

주요 파일:
- `src/game/endless/final-form-flow.ts`
- `src/game/game.ts`
- `tests/endless-final-form-flow.test.mjs`

Final Form 상태에서 실제로 이동 중인 상태로 마법을 시전하면 Flow streak가 쌓인다.

- 최대 5스택
- 마지막 이동 시전 후 4.2초 만료
- Final Form이 없거나 정지 시전이면 새 스택이 생기지 않음
- surge / flow / drift / anchor family에 따라 피해·쿨다운·이동 보너스 비중 차별화
- 최대 피해 배율 1.18, 최소 쿨다운 배율 0.86, 이동 배율 최대 1.05

Flow는 `currentCombatBuild()`의 기존 multiplier chain에만 들어가며 별도 액션을 만들지 않는다. HUD에는 2스택 이상일 때 `FLOW ×N` 한 줄만 후보로 들어간다.

## Phase 131~134 — Long-Run Fatigue Relief

주요 파일:
- `src/game/endless/long-run-comfort.ts`
- `src/game/game.ts`
- `src/game/landscape-hud.ts`
- `tests/endless-long-run-comfort.test.mjs`

2시간 / 4시간 / 8시간 이후 장시간 플레이 피로를 낮춘다.

- VFX density: 1.00 → 0.90 → 0.76 → 0.66
- Build label cap: 4 → 3 → 3 → 2
- 이벤트 toast 체류시간 점진적 감소
- 위험 telegraph multiplier는 항상 1
- enemy pressure multiplier는 항상 1

즉 **화면 장식과 정보 밀도만 줄이고 게임 난이도는 줄이지 않는다.**

## Phase 135~138 — First Ten-Minute Combat Pacing

주요 파일:
- `src/game/opening-pacing.ts`
- `src/game/game.ts`
- `tests/opening-pacing.test.mjs`

세 구간으로 초반 템포를 정리한다.

1. 0~2분 `ignition`: spawn 1.12 / elite interval 0.96 / reward 1.08
2. 2~5분 `momentum`: spawn 1.09 / elite interval 0.92 / reward 1.07
3. 5~10분 `escalation`: spawn 1.06 / elite interval 0.88 / reward 1.05
4. 10분 이후 `standard`: 모든 배율 1.0

상점 주기와 enemy budget은 항상 1.0이라 기존 경제/모바일 하드캡을 바꾸지 않는다.

## Phase 139~142 — Landscape HUD Final Priority

주요 파일:
- `src/game/landscape-hud.ts`
- `src/game/game.ts`
- `tests/landscape-hud-priority.test.mjs`

빌드 라벨을 단순 배열 순서가 아니라 실제 전투 중요도로 정렬한다.

우선순위 상단은 `SIGNATURE > OVERDRIVE > FLOW > REPLAY > Final Form > Oath`이며, 보스전은 최대 3줄, Mythic/8시간급 장기런은 최대 2줄로 줄인다. 유물/시너지 같은 수동 기록은 공간이 있을 때만 남는다.

## 통합 계약

`tests/endless-phase123-142-integration.test.mjs`에서 다음을 잠근다.

1. Action button은 정확히 9개다.
2. Mythic geometry가 실제 BossArena context와 render path에 연결된다.
3. Final Form Flow가 cast-driven transient 상태이며 Snapshot에 추가되지 않는다.
4. Opening pacing은 10분 이후 완전히 종료되고 shop/enemy budget을 바꾸지 않는다.
5. Long-run comfort는 장식 밀도만 줄이고 telegraph/적 압박을 유지한다.

## 검증

```bash
npm run build
npm test
git diff --check
```

Phase 122 전체 테스트 489개에서 Phase 123~142 검증을 추가해 현재 기능 브랜치 전체 스위트는 **506개**다.
