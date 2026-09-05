# Phase 2769~2786 Handoff — Re-entry Freshness, Shared Impact Identity & Boss Same-Slot Rebase

## Scope

Phase 2751~2768에서 spawn kind, projectile direction, boss relative-follow identity를 정리한 뒤 남아 있던 세 가지 presentation continuity mismatch를 마무리했다.

- Phase 2769~2774 — Spawn-Lane Kind Re-entry Freshness
- Phase 2775~2780 — Projectile Impact Count-Anchor Identity Coherence
- Phase 2781~2786 — Boss Safe-Response Same-Slot Rebase

HP/피해/속도/AI/스폰 수/보스 패턴/projectile collision·TTL/spawn-lane canonical TTL/boss safe-response TTL은 변경하지 않았다.

## Train A — Phase 2769~2774: Spawn-Lane Kind Re-entry Freshness

- 기존 edge-count memory는 `edge + target + kind`별로 계속 독립 유지한다.
- lower kind memory가 잠시 사라진 사이 더 높은 kind가 같은 edge/target에서 더 최근에 관측되고, lower kind 재진입 gap이 `0.06s` 이상이면 그 lower-kind count memory를 stale로 판단한다.
- stale lower-kind re-entry는 이전 높은 displayCount/downward debounce를 상속하지 않고 현재 관측 count를 즉시 채택한다.
- higher-kind history가 다른 edge/target에 있으면 reset하지 않는다.
- higher-kind sibling이 없던 same-kind brief disappearance는 기존 `0.18s` downward debounce를 그대로 유지한다.
- canonical cue `count`, `remainingTtl`, path, arrow는 변경하지 않는다.

## Train B — Phase 2775~2780: Projectile Impact Count-Anchor Identity Coherence

- 새 presentation-only shared identity memory `projectile-impact-identity-coherence.ts`를 추가했다.
- identity는 기존 의미를 그대로 사용한다.
  - `sourceClass`
  - incoming direction cosine threshold `0.78`
  - locality radius `72px`
- 여러 cluster가 동시에 근접한 경우 단순 input-order greedy가 아니라 **전체 candidate pair를 거리순으로 정렬한 one-to-one matching**을 사용한다.
  - 이로써 먼저 처리된 cluster가 더 가까운 이웃 identity를 빼앗는 문제를 막는다.
- 같은 frame/update에서 생성된 shared identity key를 다음 두 memory가 동시에 사용한다.
  - projectile `×N` count hold
  - projectile label anchor hold
- render 시에도 shared identity memory에서 같은 key set을 다시 resolve한다.
- count/anchor entry에 `identityId`가 저장된다.
- 기존 count hold `0.18s`, anchor hold `0.16s`, projectile collision/damage/TTL은 변경하지 않았다.

## Train C — Phase 2781~2786: Boss Safe-Response Same-Slot Rebase

- 기존 boss safe-response displacement guard `96px`는 유지한다.
- displacement guard를 넘었을 때 strict current placement의 slot이 이전 held slot과 같고 followed position이 여전히 safe라면:
  - label을 strict absolute position으로 snap시키지 않는다.
  - 기존 followed position을 그대로 표시한다.
  - `bossPos`와 label anchor를 현재 위치로 rebase한다.
  - hold window를 현재 시점 기준으로 다시 시작한다.
- strict slot이 달라졌거나 followed position이 hero/core/extra protected 영역과 충돌하면 기존처럼 즉시 strict current placement로 release한다.
- boss ring, `presentation.showLabel`, boss cycle 판정은 변경하지 않았다.

## Release Binding

신규 deterministic 64-sample audit 3종:

- `spawn-lane-kind-reentry-freshness-audit.ts`
- `projectile-impact-count-anchor-identity-coherence-audit.ts`
- `boss-safe-response-same-slot-rebase-audit.ts`

Release Freeze와 Candidate signature material에 pass bit + sample count를 모두 결박했다.

Forgery evidence:

- baseline: `RCQ-3B6981F7`
- pass-bit false:
  - spawn re-entry freshness → `RCQ-CD6252E2` / `REVIEW` / `release-freeze`
  - impact count-anchor coherence → `RCQ-A71DF5FE` / `REVIEW` / `release-freeze`
  - boss same-slot rebase → `RCQ-9DF12EFA` / `REVIEW` / `release-freeze`
- sample-count +1:
  - spawn re-entry freshness → `RCQ-83A2A7A0`
  - impact count-anchor coherence → `RCQ-44A93A8C`
  - boss same-slot rebase → `RCQ-62A169E8`
- sample-count mutation은 logical PASS를 유지하지만 Candidate signature는 변경된다.

## Asset Decision

- New PNG atlas: **0**
- Phase 2768 대비 `assets/`: **120 files / byte-level 변경 0건**
- 이번 작업은 새 gameplay state가 아니라 기존 count/anchor/slot continuity를 정리하는 작업이라 새 이미지를 추가하면 오히려 전장 정보량과 maintenance cost만 증가한다.

## Changed Source/Test Files

Phase 2768 대비 source/test 변경·추가 14개:

- `src/game/spawn-lane-edge-count-downward-debounce.ts`
- `src/game/spawn-lane-kind-reentry-freshness-audit.ts`
- `src/game/projectile-impact-identity-coherence.ts`
- `src/game/projectile-impact-count-hold.ts`
- `src/game/projectile-impact-label-anchor-hold.ts`
- `src/game/projectile-impact-count-anchor-identity-coherence-audit.ts`
- `src/game/enemies.ts`
- `src/game/boss-safe-response-slot-hysteresis.ts`
- `src/game/boss-safe-response-same-slot-rebase-audit.ts`
- `src/game/release-freeze-audit.ts`
- `src/game/release-candidate-audit.ts`
- `tests/phase2769-2774-spawn-lane-kind-reentry-freshness.test.mjs`
- `tests/phase2775-2780-projectile-impact-count-anchor-identity-coherence.test.mjs`
- `tests/phase2781-2786-boss-safe-response-same-slot-rebase.test.mjs`

## Verification

- Baseline build: PASS.
- Baseline Phase2751~2768 contracts: 18/18 PASS.
- TDD RED: 신규 계약 **18/18 fail** before implementation.
- GREEN: 신규 계약 **18/18 pass**.
- Related regression: **165/165 pass**.
- Full regression: **759 test files / 2,578 tests / 2,578 pass / 0 fail**.
  - parallel-safe 749 files: 2,523 tests / 0 fail
  - exclusive release/package/raster 10 files: 55 tests / 0 fail
- Candidate: **RCQ-3B6981F7 PASS**.
- Raster: **5/5 PASS** (`16:9`, `20:9`, `4:3`, `foldable`, `32:9`).
- Release: **RQ-D4630257 PASS**, Action 9/9, baseline mutation disabled.
- 3 new pass-bit forgeries: all `REVIEW` + `release-freeze`, signature changed.
- 3 new sample-count mutations: logical PASS remains, signature changes.

## Repository Note

업로드 ZIP에는 `.git` metadata가 없으므로 branch/commit merge가 아니라 extracted source tree를 직접 갱신하는 방식이다.

## Next Direction

다음 패스는 identity continuity의 남은 수명/재사용 경계를 정리하는 것이 가장 효율적이다.

1. spawn re-entry freshness는 higher-kind 관측을 근거로 lower-kind stale memory를 reset한다. 다음은 **same-kind long-gap resurrection guard**를 추가해 memory TTL 안쪽이라도 lane이 실질적으로 끊겼다가 다시 나타난 경우 이전 `×N` hold를 되살리지 않도록 한다.
2. projectile count/anchor는 shared identity를 사용하지만 shared identity memory 자체가 `0.34s` 동안 남는다. **shared identity retirement / no-resurrection guard**를 추가해 모든 실제 impact가 사라진 뒤 재등장한 cluster가 오래된 identity를 재사용하지 않도록 한다.
3. boss same-slot rebase는 displacement guard마다 anchor를 갱신할 수 있다. **rebase cadence/budget guard**를 추가해 짧은 시간의 연속 대시에서 rebase가 무한 연장되지 않게 하고, 일정 횟수/시간 이후에는 strict placement로 확실히 handoff한다.

새 atlas는 현재 Canvas/VFX로 구분하기 어려운 새로운 gameplay state가 실제로 생길 때만 추가한다.
