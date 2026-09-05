# Phase 2733~2750 Handoff — Count Debounce, Direction Identity & Boss Displacement Guard

## Scope
Phase 2715~2732에서 label 종료/anchor/slot temporal jitter를 안정화한 뒤 남아 있던 세 가지 identity continuity 문제를 presentation-only로 정리했다.

- Phase 2733~2738 — Spawn-Lane Edge Count Downward Debounce
- Phase 2739~2744 — Projectile Impact Anchor Direction Identity
- Phase 2745~2750 — Boss Safe-Response Displacement Guard

HP/피해/속도/AI/스폰 수/보스 패턴/투사체 collision·TTL/spawn-lane memory TTL/boss safe-response TTL은 변경하지 않았다.

## Train A — Phase 2733~2738: Spawn-Lane Edge Count Downward Debounce

- 같은 `edge + target`의 `×N` count만 별도 presentation memory로 추적한다.
- 최초 count와 증가 count는 즉시 반영한다.
- 감소 count는 `0.18s` 동안 동일 값이 유지될 때만 표시값을 낮춘다.
- 4→3→2처럼 여러 memory entry가 연달아 종료되는 구간에서 숫자가 매 프레임 흔들리는 현상을 줄인다.
- 현재 cue가 아예 없으면 과거 count를 화면에 부활시키지 않는다.
- 서로 다른 edge/target은 독립 memory를 사용한다.
- memory retention은 `0.34s`이며 presentation state일 뿐 gameplay state가 아니다.
- 실제 lane cue의 `count`, `remainingTtl`, path/arrow lifecycle은 그대로 유지하고 `displayCount`만 label 렌더에 사용한다.

## Train B — Phase 2739~2744: Projectile Impact Anchor Direction Identity

- 기존 anchor-hold identity의 `sourceClass + 72px locality` 조건에 incoming-direction similarity를 추가했다.
- cosine threshold는 `0.78`이다.
- 같은 sourceClass라도 교차/반대 방향 탄도는 서로 다른 label anchor identity로 취급한다.
- 비슷한 방향의 연속 impact는 기존처럼 0.16초 anchor hold를 유지한다.
- memory entry가 incoming vector를 직접 보존하고, 매칭된 cluster의 최신 incoming vector로 갱신된다.
- invisible placement는 여전히 stale anchor로 label을 부활시키지 않는다.
- projectile cluster/compression, collision, damage, impact TTL에는 영향이 없다.

## Train C — Phase 2745~2750: Boss Safe-Response Displacement Guard

- boss slot memory에 slot을 채택했을 때의 `bossPos`를 함께 기록한다.
- 동일 boss/cycle이라도 boss가 이전 anchor에서 `96px`보다 크게 이동하면 기존 absolute label position hold를 즉시 해제한다.
- 작은 이동은 기존 0.20초 slot hysteresis와 44px release-clearance를 그대로 사용한다.
- 큰 dash/teleport 뒤에는 현재 strict placement를 즉시 채택하고 새 bossPos를 memory에 기록한다.
- 새 boss/cycle identity guard와 hero/core clearance guard는 기존대로 독립적으로 유지된다.
- boss ring, compact/full 판단, `if(presentation.showLabel)` source contract는 그대로 유지한다.

## Release Binding

신규 deterministic 64-sample audit 3종:

- `spawn-lane-edge-count-downward-debounce-audit.ts`
- `projectile-impact-label-anchor-direction-identity-audit.ts`
- `boss-safe-response-displacement-guard-audit.ts`

Release Freeze와 Candidate signature material에 pass bit + sample count를 모두 결박했다.

- pass bit false → Candidate `REVIEW` + `release-freeze`
- sample count +1 → logical PASS 유지, Candidate signature 변경

Forgery evidence:

- baseline: `RCQ-CE9AEAEB`
- pass-bit false signatures:
  - spawn count debounce → `RCQ-D95EE666`
  - impact direction identity → `RCQ-F9FF6182`
  - boss displacement guard → `RCQ-8872574E`
- sample-count +1 signatures:
  - spawn count debounce → `RCQ-16D13284`
  - impact direction identity → `RCQ-DE9B8830`
  - boss displacement guard → `RCQ-CF7BD2BC`

## Asset Decision

- New PNG atlas: **0**
- Phase 2732 대비 `assets/`: **120 files / byte-level 변경 0건**
- 이번 문제는 새로운 gameplay identity가 아니라 기존 숫자/anchor/slot의 identity continuity 문제라 새 이미지를 추가하지 않았다.

## Changed Source/Test Files

Phase 2732 대비 source/test 변경·추가 12개:

- `src/game/spawn-lane-edge-count-downward-debounce.ts`
- `src/game/spawn-lane-edge-count-downward-debounce-audit.ts`
- `src/game/projectile-impact-label-anchor-hold.ts`
- `src/game/projectile-impact-label-anchor-direction-identity-audit.ts`
- `src/game/boss-safe-response-slot-hysteresis.ts`
- `src/game/boss-safe-response-displacement-guard-audit.ts`
- `src/game/game.ts`
- `src/game/release-freeze-audit.ts`
- `src/game/release-candidate-audit.ts`
- `tests/phase2733-2738-spawn-lane-edge-count-downward-debounce.test.mjs`
- `tests/phase2739-2744-projectile-impact-anchor-direction-identity.test.mjs`
- `tests/phase2745-2750-boss-safe-response-displacement-guard.test.mjs`

## Verification

- Baseline build: PASS.
- Baseline Phase2715~2732 contracts: 18/18 PASS.
- TDD RED: 신규 계약 **18/18 fail** before implementation.
- GREEN: 신규 계약 **18/18 pass**.
- Related regression: **172/172 pass**.
- Full regression: **753 test files / 2,542 tests / 2,542 pass / 0 fail**.
  - parallel-safe 743 files: 2,487 tests / 0 fail
  - exclusive release/package/raster 10 files: 55 tests / 0 fail
- Candidate: **RCQ-CE9AEAEB PASS**.
- Raster: **5/5 PASS** (`16:9`, `20:9`, `4:3`, `foldable`, `32:9`).
- Release: **RQ-D4630257 PASS**, Action 9/9, baseline mutation disabled.
- 3 new pass-bit forgeries: all `REVIEW` + `release-freeze`, signature changed.
- 3 new sample-count mutations: logical PASS remains, signature changes.

## Repository Note

업로드 ZIP에는 `.git` metadata가 없으므로 branch/commit merge가 아니라 extracted source tree를 직접 갱신하는 방식이다.

## Next Direction

다음 패스는 이번 identity continuity를 한 단계 더 완성하는 편이 효율이 높다.

1. spawn edge count debounce가 현재 `edge + target`만 identity로 사용하므로 동일 edge/target에서 dominant kind가 regular→elite/boss로 바뀌면 이전 count hold를 상속할 수 있다. `kind` escalation은 즉시 새 count로 전환하도록 identity/escalation guard를 추가한다.
2. projectile label anchor는 direction-aware가 됐지만 `projectile-impact-count-hold`는 아직 `sourceClass + locality`만 사용한다. 교차 탄도에서 `×N` count가 섞이지 않도록 count-hold에도 incoming-direction identity를 동일하게 적용한다.
3. boss displacement guard는 큰 dash에서는 잘 끊지만 작은 boss 이동 동안 label absolute position을 잠깐 유지한다. slot identity는 유지하되 boss delta만큼 label도 함께 따라가도록 relative follow-offset을 적용하면 boss와 label의 시각적 분리가 줄어든다.

새 atlas는 기존 표현으로 구분할 수 없는 새로운 gameplay state가 생길 때만 추가한다.
