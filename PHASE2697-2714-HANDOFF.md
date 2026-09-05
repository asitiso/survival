# Phase 2697~2714 Handoff — Edge Stack, Count Hold & Local Label Placement

## Scope
Phase 2679~2696의 위치 안정화 위에서 새 자산을 추가하지 않고, 남아 있던 세 가지 순간 판독성 문제를 presentation-only로 줄였다.

- Phase 2697~2702 — Spawn-Lane Edge-Stack Arbitration
- Phase 2703~2708 — Projectile Impact Count Hold / Debounce
- Phase 2709~2714 — Boss Safe-Response Local Label Placement

HP/피해/속도/AI/스폰 수/보스 패턴/투사체 collision·TTL/기존 spawn memory TTL은 변경하지 않았다.

## Train A — Phase 2697~2702: Spawn-Lane Edge-Stack Arbitration

- 기존 `enemySpawnLaneCues()`의 start/end/target/kind/count를 그대로 입력으로 사용한다.
- 같은 edge에 hero/core lane이 동시에 있을 때 `×N` count label을 별도 stack slot으로 배치한다.
- 최소 label separation은 48px이다.
- north/east/south/west edge별로 독립 배치한다.
- 입력 cue 배열 순서가 달라도 target/kind identity 기준으로 같은 stack placement를 만든다.
- screen inset 22px 안쪽을 보장한다.
- lane path와 arrow는 전혀 재작성하지 않고 count label 위치만 중재한다.

## Train B — Phase 2703~2708: Projectile Impact Count Hold / Debounce

- projectile impact cluster의 source line/stamp와 기존 placement arbitration은 유지한다.
- 증가하는 `×N` count는 즉시 반영한다.
- 감소하는 count는 0.18초 동안 이전 높은 값을 짧게 유지해 TTL 경계에서 5→4→3→2처럼 빠르게 깜빡이는 현상을 줄인다.
- sourceClass와 72px impact locality를 identity로 사용해 boss/archer와 떨어진 cluster를 섞지 않는다.
- unmatched memory는 0.34초 후 제거된다.
- 현재 cluster가 사라지면 stale label을 새로 그리지 않는다. memory는 오직 현재 cluster의 표시 숫자 안정화에만 사용한다.
- EnemyManager reset에 memory를 포함해 run 간 presentation state가 남지 않는다.

## Train C — Phase 2709~2714: Boss Safe-Response Local Label Placement

- 기존 safe-response latch, `대응 여유` label, ring, compact/full 판단은 보존한다.
- full label일 때 canonical above-boss slot을 먼저 시도한다.
- hero/core readability anchor와 가까우면 right → left → below 순으로 local slot을 재시도한다.
- screen inset 18px과 hero/core 56px clearance를 보장한다.
- 모든 local slot이 막히면 text만 숨기고 boss ring은 계속 유지한다.
- 위치는 static이며 animation/motion을 새로 만들지 않는다.
- Phase 2677의 기존 `if(presentation.showLabel)` source contract도 그대로 보존했다.

## Release Binding

신규 deterministic 64-sample audit 3종:

- `spawn-lane-edge-stack-arbitration-audit.ts`
- `projectile-impact-count-hold-audit.ts`
- `boss-safe-response-label-placement-audit.ts`

Release Freeze와 Candidate signature material에 pass bit + sample count를 모두 결박했다.

- pass bit false → Candidate `REVIEW` + `release-freeze`
- sample count +1 → logical PASS 유지, Candidate signature 변경

## Asset Decision

- New PNG atlas: **0**
- Phase 2696 대비 `assets/`: **120 files / byte-level 변경 0건**
- 이번 문제는 새 이미지가 아니라 label 위치/숫자 시간 안정성이 핵심이라 기존 자산과 Canvas 표현을 재사용했다.

## Verification

- Baseline build: PASS.
- Baseline Phase2679~2696 contracts: 18/18 PASS.
- TDD RED: 신규 계약 **18/18 fail** before implementation.
- GREEN: 신규 계약 **18/18 pass**.
- Related regression: **111/111 pass** after preserving the Phase2677 source contract.
- Full regression: **747 test files / 2,506 tests / 2,506 pass / 0 fail**.
  - parallel-safe 737 files: 2,451 tests / 0 fail
  - exclusive release/package/raster 10 files: 55 tests / 0 fail
- Candidate: **RCQ-A1607C8F PASS**.
- Raster: **5/5 PASS** (`16:9`, `20:9`, `4:3`, `foldable`, `32:9`).
- Release: **RQ-D4630257 PASS**, Action 9/9, baseline mutation disabled.
- 3 new pass-bit forgeries: all `REVIEW` + `release-freeze`, signature changed.
- 3 new sample-count mutations: logical PASS remains, signature changes.

## Next Direction

다음 패스는 새 atlas보다 temporal stability를 한 단계 더 다듬는 것이 효율이 높다.

1. spawn edge-stack label이 lane memory 종료 직전에 갑자기 사라지지 않도록 TTL 기반의 짧은 edge-label fade를 적용하되 lane 자체 TTL은 바꾸지 않는다.
2. impact `×N` count가 안정되어도 placement slot이 frame마다 바뀔 수 있으므로 label placement slot에 짧은 anchor hold/hysteresis를 추가한다.
3. boss safe-response label이 hero 이동에 따라 above/right 사이에서 흔들리지 않도록 선택된 local slot을 짧게 유지하는 slot hysteresis를 추가한다.

새 이미지는 기존 Canvas/자산으로 의미 구분이 불가능한 새 gameplay state가 생길 때만 추가한다.
