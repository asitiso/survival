# Phase 2751~2768 Handoff — Kind Escalation, Count Direction Identity & Boss Relative Follow

## Scope
Phase 2733~2750에서 count/anchor/slot identity continuity를 강화한 뒤 남아 있던 세 가지 presentation identity mismatch를 정리했다.

- Phase 2751~2756 — Spawn-Lane Kind Escalation Guard
- Phase 2757~2762 — Projectile Impact Count Direction Identity
- Phase 2763~2768 — Boss Safe-Response Relative Follow

HP/피해/속도/AI/스폰 수/보스 패턴/투사체 collision·TTL/spawn-lane memory TTL/boss safe-response TTL은 변경하지 않았다.

## Train A — Phase 2751~2756: Spawn-Lane Kind Escalation Guard

- edge-count debounce memory identity에 `kind`를 추가했다.
- 동일 `edge + target`이라도 regular/specialist/elite/boss는 독립 presentation memory를 가진다.
- regular→elite, elite→boss처럼 위험 kind가 상승할 때 이전 lower-kind count debounce를 상속하지 않고 현재 count를 즉시 채택한다.
- 같은 kind 안의 downward debounce `0.18s`는 그대로 유지한다.
- 현재 cue가 없는 과거 kind count를 화면에 부활시키지 않는다.
- 실제 lane cue `count`, path, arrow, remaining TTL은 변경하지 않는다.

## Train B — Phase 2757~2762: Projectile Impact Count Direction Identity

- 기존 `projectile-impact-count-hold` identity의 `sourceClass + 72px locality`에 incoming-direction compatibility를 추가했다.
- direction threshold는 anchor identity와 동일한 cosine `0.78`을 공유한다.
- 같은 archer/boss source라도 교차/반대 탄도는 서로 다른 `×N` count memory로 처리한다.
- 비슷한 방향의 연속 impact는 기존 `0.18s` count hold를 유지한다.
- memory entry가 최신 incoming vector를 직접 보존한다.
- projectile collision, damage, impact TTL, cluster compression은 변경하지 않았다.

## Train C — Phase 2763~2768: Boss Safe-Response Relative Follow

- 기존 `0.20s` safe-response slot hysteresis 동안 slot identity는 그대로 유지한다.
- boss가 작은 범위로 이동하면 held label position도 채택 당시 boss anchor 대비 동일 delta만큼 따라간다.
- memory의 원래 `bossPos`/label anchor는 유지하므로 기존 `96px` displacement guard는 누적 displacement 기준으로 계속 작동한다.
- hero/core/extra protected clearance는 stale absolute position이 아니라 실제 followed position에 대해 검사한다.
- followed position이 unsafe이면 즉시 strict current placement로 release한다.
- boss ring, compact/full 판단, `if(presentation.showLabel)` gate는 그대로 유지한다.

## Release Binding

신규 deterministic 64-sample audit 3종:

- `spawn-lane-kind-escalation-guard-audit.ts`
- `projectile-impact-count-direction-identity-audit.ts`
- `boss-safe-response-relative-follow-audit.ts`

Release Freeze와 Candidate signature material에 pass bit + sample count를 모두 결박했다.

Forgery evidence:

- baseline: `RCQ-B6E51835`
- pass-bit false:
  - spawn kind escalation → `RCQ-E596F4BC` / `REVIEW` / `release-freeze`
  - projectile count direction → `RCQ-1FB13B70` / `REVIEW` / `release-freeze`
  - boss relative follow → `RCQ-8183C3E4` / `REVIEW` / `release-freeze`
- sample-count +1:
  - spawn kind escalation → `RCQ-0C4BC176`
  - projectile count direction → `RCQ-3581917A`
  - boss relative follow → `RCQ-9B3EFA7E`
- sample-count mutation은 logical PASS를 유지하지만 Candidate signature는 변경된다.

## Asset Decision

- New PNG atlas: **0**
- Phase 2750 대비 `assets/`: **120 files / byte-level 변경 0건**
- 이번 작업은 새로운 gameplay state가 아니라 기존 count/anchor/slot identity mismatch를 해결하는 작업이라 이미지 추가보다 현재 Canvas/VFX 신호를 안정화하는 편이 더 효율적이다.

## Changed Source/Test Files

Phase 2750 대비 source/test 변경·추가 11개:

- `src/game/spawn-lane-edge-count-downward-debounce.ts`
- `src/game/spawn-lane-kind-escalation-guard-audit.ts`
- `src/game/projectile-impact-count-hold.ts`
- `src/game/projectile-impact-count-direction-identity-audit.ts`
- `src/game/boss-safe-response-slot-hysteresis.ts`
- `src/game/boss-safe-response-relative-follow-audit.ts`
- `src/game/release-freeze-audit.ts`
- `src/game/release-candidate-audit.ts`
- `tests/phase2751-2756-spawn-lane-kind-escalation-guard.test.mjs`
- `tests/phase2757-2762-projectile-impact-count-direction-identity.test.mjs`
- `tests/phase2763-2768-boss-safe-response-relative-follow.test.mjs`

## Verification

- Baseline build: PASS.
- Baseline Phase2733~2750 contracts: 18/18 PASS.
- TDD RED: 신규 계약 **18/18 fail** before implementation.
- GREEN: 신규 계약 **18/18 pass**.
- Related regression: **167/167 pass**.
- Full regression: **756 test files / 2,560 tests / 2,560 pass / 0 fail**.
  - parallel-safe 746 files: 2,505 tests / 0 fail
  - exclusive release/package/raster 10 files: 55 tests / 0 fail
- Candidate: **RCQ-B6E51835 PASS**.
- Raster: **5/5 PASS** (`16:9`, `20:9`, `4:3`, `foldable`, `32:9`).
- Release: **RQ-D4630257 PASS**, Action 9/9, baseline mutation disabled.
- 3 new pass-bit forgeries: all `REVIEW` + `release-freeze`, signature changed.
- 3 new sample-count mutations: logical PASS remains, signature changes.

## Repository Note

업로드 ZIP에는 `.git` metadata가 없으므로 branch/commit merge가 아니라 extracted source tree를 직접 갱신하는 방식이다.

## Next Direction

다음 패스는 새로운 VFX를 늘리기보다 이번 identity continuity의 마지막 mismatch를 정리하는 편이 효율이 높다.

1. spawn kind memory가 독립화되면서 escalation은 즉시 전환되지만, elite/boss가 사라진 뒤 오래된 lower-kind memory가 짧게 재사용될 수 있다. **kind re-entry freshness/de-escalation reset guard**를 추가해 stale lower-kind count 상속을 막는다.
2. projectile count와 label anchor가 모두 direction-aware가 됐지만 두 memory가 별도로 매칭되므로 난전에서 `×N` count와 anchor가 다른 cluster identity를 가리킬 수 있다. **count-anchor identity coherence**를 추가해 같은 source/direction/locality identity를 공유하도록 묶는다.
3. boss relative follow는 96px displacement guard에 도달하면 strict placement로 handoff한다. strict slot이 기존 slot과 동일한 경우에는 **same-slot rebase**로 anchor만 갱신해 불필요한 위치 snap을 줄이고, 실제 slot 변경이 필요할 때만 즉시 release한다.

새 atlas는 기존 표현으로 구분할 수 없는 새로운 gameplay state가 생길 때만 추가한다.
