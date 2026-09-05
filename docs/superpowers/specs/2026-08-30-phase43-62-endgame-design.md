# Phase 43~62 Endgame Product Design

## Goal
Phase 42의 9 Action 전투를 그대로 유지하면서 80분 이후 장기런의 플레이 차이, Mythic 보스 카운터플레이, 재도전 편의, 복구 안정성, 6시간 이상 성능 예산을 확장한다.

## Product constraints
- 전투 Action은 일반마법 4 + 궁극기 2 + 물약 + 상점 + AUTO의 9개를 유지한다.
- 새 선택 모달을 추가하지 않는다. 80분 최종형은 35/50/65분 Hero Ascension 선택 결과에서 자동 파생한다.
- 결과창의 기존 재도전 버튼은 같은 영웅만이 아니라 hero/trait/threat/map/seed를 재사용하는 같은 조건 재도전으로 강화한다.
- Snapshot은 적/탄막 좌표 배열을 저장하지 않는다.
- 저장 실패나 손상은 런을 막지 않고 primary -> backup -> journal 순으로 복구한다.
- 저사양 성능 조절은 적 AI/피격 판정보다 장식, 파티클, 투사체 표현 밀도를 먼저 낮춘다.
- Ascension X 이후 수치 배율은 상한을 유지하고 장기 난이도는 패턴/페이즈/변이로 만든다.

## Phase map
### Phase 43~45 — Hero Final Form
- 80분부터 각 영웅은 기존 Hero Ascension 3개 선택의 태그를 집계해 3개 최종형 중 하나로 자동 변신한다.
- 최종형은 새 버튼 없이 상시 패시브와 짧은 자동 Pulse를 제공한다.
- 최종형은 hero id + selected ascensions만으로 결정되어 Snapshot 복구 후 동일하게 재현된다.

### Phase 46~47 — Build Archetype + Overdrive
- 현재 빌드를 burst / cycle / domain / fortress 네 유형 중 하나로 읽는다.
- 전투 이벤트로 charge가 누적되고 100에 도달하면 12초 Overdrive가 자동 발동한다.
- charge는 처치보다 spell/fusion/boss 이벤트를 더 높게 평가해 적극적인 마법 난사를 보상한다.
- Overdrive는 별도 버튼/게이지 조작 없이 HUD 한 줄과 실제 modifier만 추가한다.

### Phase 48~52 — Mythic Multi-Phase
- Mythic 보스는 HP 70% / 35% 경계로 3페이즈를 가진다.
- 페이즈마다 기존 3개 Mythic channel의 우선순위가 회전하고, special cadence / weakpoint vulnerability / summon pressure가 변화한다.
- 3페이즈는 적 수를 폭증시키지 않으며 최대 summon multiplier와 projectile density에 상한을 둔다.
- weakpoint 파괴는 phase pressure를 일시적으로 완화해 플레이어가 읽고 대응할 이유를 만든다.

### Phase 53~57 — Retry Blueprint + Run Comparison
- 런 시작 조건(hero, trait, threat, map, deterministic seed)을 compact blueprint로 저장한다.
- 결과창의 기존 retry 버튼은 이 blueprint를 사용해 같은 조건으로 즉시 재도전한다.
- 최근 5런에 archetype/final form/bosses/score를 추가하되 legacy history를 계속 읽는다.
- 결과창은 직전 런/개인 최고 대비 survival/score 차이를 짧게 보여준다.
- 별도 기록 화면은 만들지 않는다.

### Phase 58~59 — Recovery Journal
- 15초 Snapshot primary/backup 외에 60초마다 최대 3개의 compact journal checkpoint를 유지한다.
- journal에는 기존 RunSnapshot만 저장하고 전장 개체 좌표를 추가하지 않는다.
- 복구 우선순위는 primary -> backup -> newest valid journal이다.
- 저장소가 quota 오류를 내도 게임은 계속 진행한다.

### Phase 60~62 — Long-Run Stability
- 240/300/360/480분 checkpoint에서 low/mid/high 장치 예산을 검사한다.
- 장시간 상태 배열은 기존 cap을 재검증하고 신규 overdrive/journal/history도 bounded 상태만 유지한다.
- 8시간 low-device Threat 5 soak audit를 제공하고, effect/projectile presentation이 combat logic보다 먼저 축소되는지 검증한다.

## Architecture
새 순수 로직은 `src/game/endless/`에 유지한다. 메타 저장은 `src/domain/`에 둔다. `game.ts`는 host adapter 역할만 하며 신규 시스템의 세부 규칙을 소유하지 않는다.

새 모듈:
- `final-form.ts`: 최종형 파생/수정치
- `build-overdrive.ts`: archetype 판정, charge/runtime, modifier
- `mythic-phases.ts`: Mythic HP phase와 pressure profile
- `long-run-auditor.ts`: 240~480분/8시간 budget audit
- `retry-blueprint.ts`: 같은 조건 재도전 payload
- `run-comparison.ts`: 최근/개인 최고 비교
- `recovery-journal.ts`: bounded third-tier checkpoint 저장

기존 수정:
- `endless/snapshot.ts`: final/overdrive state migration
- `endless/runtime.ts`: overdrive event progression
- `game.ts`: modifier/effect/retry bridge
- `run-history.ts`: optional extended fields backward compatibility
- `run-snapshot.ts`: journal fallback integration helper
- `results.ts`, `lobby.ts`: 기존 UI 안에서 짧은 상태 표시

## Testing
각 새 모듈은 Node test로 RED -> GREEN을 확인한다. 이후 기존 380개 전체 회귀, TypeScript build, `git diff --check`, 정적 HTTP smoke, ZIP integrity를 다시 수행한다.
