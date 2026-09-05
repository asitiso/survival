# Phase 2715~2732 Handoff — Terminal Fade, Impact Anchor Hold & Boss Slot Hysteresis

## Scope
Phase 2697~2714에서 label 위치와 숫자 표시를 안정화한 뒤에도 남아 있던 세 가지 temporal jitter를 presentation-only로 정리했다.

- Phase 2715~2720 — Spawn-Lane Edge Label Terminal Fade
- Phase 2721~2726 — Projectile Impact Label Anchor Hold
- Phase 2727~2732 — Boss Safe-Response Slot Hysteresis

HP/피해/속도/AI/스폰 수/보스 패턴/투사체 collision·TTL/spawn-lane memory TTL/boss safe-response TTL은 변경하지 않았다.

## Train A — Phase 2715~2720: Spawn-Lane Edge Label Terminal Fade

- `enemySpawnLaneCues()`가 같은 edge/target group에서 가장 긴 실제 presentation-memory TTL을 `remainingTtl`로 보존한다.
- 기존 `SPAWN_LANE_MEMORY_SECONDS = 1.35`는 그대로 유지한다.
- lane path/arrow는 기존 alpha와 lifecycle을 그대로 사용한다.
- `×N` count label만 memory 종료 직전 0.24초 동안 선형 fade한다.
- singleton count와 이미 만료된 label은 숨긴다.
- fade helper는 cue/path endpoints, count, tactical priority를 변경하지 않는다.

## Train B — Phase 2721~2726: Projectile Impact Label Anchor Hold

- 기존 projectile impact cluster compression → count hold → placement arbitration 순서를 유지한다.
- placement 결과가 frame마다 다른 slot으로 바뀌더라도 같은 sourceClass + 72px locality의 label은 0.16초 동안 직전 anchor를 유지한다.
- hold가 끝나면 현재 valid fallback placement를 즉시 채택하므로 영구 pinning은 없다.
- boss/archer와 서로 먼 impact cluster는 독립 memory를 사용한다.
- 현재 placement가 invisible이면 stale anchor가 label을 부활시키지 않는다.
- memory TTL은 0.30초이고 EnemyManager reset에서 반드시 비운다.
- projectile damage/collision/impact TTL에는 영향이 없다.

## Train C — Phase 2727~2732: Boss Safe-Response Slot Hysteresis

- 기존 strict local placement 순서 above → right → left → below를 그대로 보존한다.
- 동일 boss id + boss cycle에서만 이전 slot을 최대 0.20초 유지한다.
- strict 56px clearance 경계를 조금 넘나드는 hero/core 이동 때문에 above/right가 매 frame 흔들리지 않도록, 유지 중에는 더 좁은 44px release clearance를 사용한다.
- 이전 slot이 실제로 위험해지면 hold 시간이 남아 있어도 즉시 현재 strict placement로 이동한다.
- 새 boss 또는 새 cycle은 이전 slot memory를 절대 상속하지 않는다.
- ring, compact/full 판단, `if(presentation.showLabel)` source contract는 그대로 유지한다.

## Release Binding

신규 deterministic 64-sample audit 3종:

- `spawn-lane-edge-label-fade-audit.ts`
- `projectile-impact-label-anchor-hold-audit.ts`
- `boss-safe-response-slot-hysteresis-audit.ts`

Release Freeze와 Candidate signature material에 pass bit + sample count를 모두 결박했다.

- pass bit false → Candidate `REVIEW` + `release-freeze`
- sample count +1 → logical PASS 유지, Candidate signature 변경

## Asset Decision

- New PNG atlas: **0**
- Phase 2714 대비 `assets/`: **120 files / byte-level 변경 0건**
- 이번 문제는 새 gameplay identity가 아니라 기존 label의 종료/자리 이동 jitter였으므로 새 이미지를 추가하지 않았다.

## Verification

- Baseline build: PASS.
- Baseline Phase2697~2714 contracts: 18/18 PASS.
- TDD RED: 신규 계약 **18/18 fail** before implementation.
- GREEN: 신규 계약 **18/18 pass**.
- Related regression: **111/111 pass**.
- Full regression: **750 test files / 2,524 tests / 2,524 pass / 0 fail**.
  - parallel-safe 740 files: 2,487 tests / 0 fail
  - exclusive package/runtime/release/raster 10 files: 37 tests / 0 fail
- Candidate: **RCQ-87257BA1 PASS**.
- Raster: **5/5 PASS** (`16:9`, `20:9`, `4:3`, `foldable`, `32:9`).
- Release: **RQ-D4630257 PASS**, Action 9/9, baseline mutation disabled.
- 3 new pass-bit forgeries: all `REVIEW` + `release-freeze`, signature changed.
- 3 new sample-count mutations: logical PASS remains, signature changes.

## Next Direction

다음 패스는 새 장식 VFX보다 identity continuity를 한 단계 더 정밀하게 만드는 편이 효율이 높다.

1. spawn edge `×N` count가 서로 다른 memory entry 종료 때문에 4→3→2로 짧게 흔들릴 수 있으므로, lane 자체 TTL은 그대로 둔 채 count 숫자에만 짧은 downward debounce를 적용한다.
2. projectile impact label anchor hold가 현재 sourceClass + locality로만 매칭되므로, 같은 sourceClass의 교차 탄도가 밀집했을 때 잘못된 anchor를 상속하지 않도록 incoming-direction similarity를 identity 조건에 추가한다.
3. boss slot hysteresis가 동일 cycle에서 보스가 큰 거리로 순간 이동/대시했을 때 이전 absolute label position을 잠깐 유지하지 않도록 boss displacement guard를 추가한다.

새 atlas는 기존 표현으로 구분할 수 없는 새로운 gameplay state가 생길 때만 추가한다.
