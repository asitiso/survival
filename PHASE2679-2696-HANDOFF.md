# Phase 2679~2696 Handoff — Hysteresis, Label Arbitration & Visible Affordance

## Scope
Phase 2661~2678의 continuity compression/memory 위에 새 VFX를 쌓지 않고, 기존 신호가 흔들리거나 겹치거나 과도하게 compact 되는 세 가지 판독성 문제를 presentation-only로 보정했다.

- Phase 2679~2684 — Spawn-Lane Hysteresis
- Phase 2685~2690 — Projectile Impact Label Placement Arbitration
- Phase 2691~2696 — Boss Safe-Response Visible Affordance Narrowing

전투 HP/피해/속도/AI/스폰 수/쿨다운/보스 패턴/투사체 collision·TTL은 변경하지 않았다. 신규 이미지 atlas도 추가하지 않았다.

## Train A — Phase 2679~2684: Spawn-Lane Hysteresis

- 기존 42px 이내 spawn-lane memory refresh 동작은 그대로 보존한다.
- 42~96px 구간의 같은 kind + target + edge 재등장만 hysteresis 대상으로 처리한다.
- 동일 edge의 중간 이동은 한 번에 최대 12px만 anchor가 움직인다.
- 18px deadzone은 순수 hysteresis helper 내부에서 micro jitter를 잠근다.
- 다른 target/kind/edge는 절대 합치지 않는다.
- 96px보다 먼 같은-edge 포털도 별도 lane으로 남긴다.
- 기존 Phase 2668의 근거리 평균 refresh 계약을 보존해 이전 presentation memory 의미를 깨지 않았다.

## Train B — Phase 2685~2690: Projectile Impact Label Placement Arbitration

- projectile impact source cluster의 line/stamp는 기존대로 유지한다.
- `×N` multiplier label만 별도 placement arbitration을 거친다.
- impact stamp와 최소 24px clearance를 확보한다.
- 먼저 배치된 다른 multiplier label과 최소 34px separation을 확보한다.
- 화면 가장자리 16px inset 안쪽으로 유지한다.
- 깨끗한 slot이 없으면 label을 숨기며 가짜 위치를 만들지 않는다.
- source class(boss/archer)는 보존하고 배치는 static (`animated:false`, `motionAmplitude:0`)이다.

## Train C — Phase 2691~2696: Boss Safe-Response Visible Affordance Narrowing

- 기존 safe-response latch/확정 로직과 `대응 여유` 표현 자체는 변경하지 않는다.
- compact/ring-only 여부를 raw cue 존재가 아니라 실제 화면 affordance가 보일 조건으로 좁혔다.
- Action Assist는 같은 boss + 실제 assist memory age + boss special window(≤1.05s)일 때만 visible overlap으로 본다.
- Response Ack는 같은 boss + 같은 current cycle + ack age + 실제 ack identity asset ready일 때만 visible overlap으로 본다.
- 이전 boss cycle의 stale acknowledgement는 새 safe-response cycle을 compact로 만들지 않는다.
- 결과적으로 새 cycle에서 이미 사라진 이전 프레임 cue 때문에 `대응 여유` label이 불필요하게 숨는 문제를 줄인다.

## Release Binding

신규 deterministic 64-sample audit 3종:

- `spawn-lane-hysteresis-audit.ts`
- `projectile-impact-label-placement-arbitration-audit.ts`
- `boss-safe-response-visible-affordance-audit.ts`

Release Freeze와 Candidate signature material에 pass bit + sample count를 모두 결박했다.

- pass bit false → Candidate `REVIEW` + `release-freeze`
- sample count +1 → logical PASS 유지, Candidate signature 변경

## Asset Decision

- New PNG atlas: **0**
- Phase 2678 대비 `assets/` byte-level 변경: **0건**
- 이번 문제는 새 그림보다 위치 안정성, label 충돌, stale affordance 판정이 핵심이라 기존 자산과 Canvas 표현을 재사용했다.

## Verification

- TDD RED: 신규 계약 **18/18 fail** before implementation.
- GREEN: 신규 계약 **18/18 pass**.
- Related regression: **150/150 pass** after preserving Phase 2668 near-refresh behavior.
- Full regression: **744 test files / 2,488 tests / 2,488 pass / 0 fail**.
  - parallel-safe 734 files: 2,433 tests / 0 fail
  - exclusive release/package/raster 10 files: 55 tests / 0 fail
- Candidate: **RCQ-8DBD7B8D PASS**.
- Raster: **5/5 PASS** (`16:9`, `20:9`, `4:3`, `foldable`, `32:9`).
- Release: **RQ-D4630257 PASS**, Action 9/9, baseline mutation disabled.
- 3 new pass-bit forgeries: all `REVIEW` + `release-freeze`, signature changed.
- 3 new sample-count mutations: logical PASS remains, signature changes.

## Next Direction

다음 패스는 새 이미지를 추가하기 전에 아래 순서로 판독성 비용을 더 줄이는 편이 효율이 높다.

1. spawn-lane hysteresis가 여러 priority lane과 함께 있을 때 label/count를 edge 단위로 더 안정적으로 묶는 edge-stack arbitration
2. impact multiplier label이 짧은 시간에 count가 급변할 때 숫자 flicker를 줄이는 short count hold/debounce
3. boss safe-response full label이 boss/hero/core critical occlusion guard와 겹칠 때 text 위치를 자동으로 위/옆으로 이동시키는 local label placement

새 atlas는 기존 Canvas/자산으로는 의미 구분이 어려운 구간에서만 추가한다.
