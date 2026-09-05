# Phase 2661~2678 Handoff — Continuity Compression & Memory

## Scope
Phase 2643~2660의 검색 연결 VFX를 더 추가하지 않고, 이미 표시되는 정보를 덜 겹치고 조금 더 안정적으로 읽게 만드는 3개 presentation-only Train을 적용했다.

- Phase 2661~2666 — Projectile Impact Cluster Compression
- Phase 2667~2672 — Spawn-Lane Presentation Memory
- Phase 2673~2678 — Boss Safe-Response Compact Acknowledgement

전투 HP/피해/속도/AI/스폰 수/쿨다운/보스 패턴/투사체 collision·TTL은 변경하지 않았다. 신규 이미지 atlas도 추가하지 않았다.

## Train A — Phase 2661~2666: Projectile Impact Cluster Compression

- archer/boss impact stamp 자체는 기존대로 유지한다.
- source continuity line만 같은 source class + 근접 위치 + 유사 incoming direction일 때 cluster로 압축한다.
- archer와 boss는 절대 한 cluster로 합치지 않는다.
- 반대 방향처럼 source 해석을 왜곡할 수 있는 incoming vector는 별도 cluster로 유지한다.
- High/Medium/Low에서 최대 4/3/2 cluster만 표시한다.
- cluster count가 2개 이상이면 작은 `×N` 표기만 추가한다.
- 정적 cue이며 `animated:false`, `motionAmplitude:0`이다.
- Reduced Flash는 alpha만 낮춘다.

## Train B — Phase 2667~2672: Spawn-Lane Presentation Memory

- 기존 spawn portal VFX TTL 0.72초는 그대로 유지한다.
- lane readability 전용 memory를 1.35초만 별도 유지한다.
- 같은 kind + target + 42px 이내 재등장 포털은 새 lane을 만들지 않고 memory 위치/TTL만 refresh한다.
- memory는 최대 12개로 제한하고 boss/elite를 routine regular lane보다 우선 보존한다.
- EnemyManager reset에서 memory도 즉시 비운다.
- Game occupancy와 lane draw는 raw portal view가 아니라 presentation memory view를 사용한다.
- 게임 스폰 로직, enemy lifetime, portal asset lifetime에는 영향이 없다.

## Train C — Phase 2673~2678: Boss Safe-Response Compact Acknowledgement

- 기존 safe response latch/판정 자체는 변경하지 않는다.
- safe response가 단독이면 기존 `대응 여유` label + ring을 유지한다.
- boss action assist 또는 response acknowledgement가 이미 보이면 중복 텍스트를 숨기고 ring-only compact mode로 축소한다.
- Low quality에서도 기본 compact mode를 사용한다.
- Hero/Core critical 상태에서는 기존처럼 표시하지 않는다.
- `claimsGlobalSafety:false`를 유지해 완전 안전/무적 의미를 주장하지 않는다.
- Phase 2659의 canonical `대응 여유` source contract도 `game.ts`에 보존했다.

## Release Binding

신규 deterministic 64-sample audit 3종:

- `projectile-impact-cluster-compression-audit.ts`
- `spawn-lane-presentation-memory-audit.ts`
- `boss-safe-response-compact-acknowledgement-audit.ts`

Release Freeze와 Candidate signature material에 pass bit + sample count를 모두 결박했다.

- pass bit false → Candidate `REVIEW` + `release-freeze`
- sample count +1 → logical PASS 유지 가능하지만 Candidate signature 변경

## Asset Decision

- New PNG atlas: **0**
- 기존 impact/spawn/boss acknowledgement 자산을 그대로 재사용한다.
- 이번 문제는 새 이미지보다 겹치는 선·짧은 표시시간·중복 텍스트가 핵심이라, 신규 자산은 화면 점유/관리 비용만 늘어난다고 판단했다.

## Verification

- TDD RED: 신규 계약 18/18 fail before implementation.
- GREEN: 신규 계약 18/18 pass.
- Related regression: 75/75 pass after preserving the Phase 2659 canonical label source contract.
- Full regression: **741 test files / 2,470 tests / 2,470 pass / 0 fail**.
  - parallel-safe 731 files: 2,415 tests / 0 fail
  - exclusive release/package/raster 10 files: 55 tests / 0 fail
- Candidate: **RCQ-7014C323 PASS**.
- Raster: **5/5 PASS** (`16:9`, `20:9`, `4:3`, `foldable`, `32:9`).
- Release: **RQ-D4630257 PASS**, Action 9/9, baseline mutation disabled.
- 3 new pass-bit forgeries: all `REVIEW` + `release-freeze`, signature changed.
- 3 new sample-count mutations: logical PASS remains, signature changes.

## Next Direction

다음 패스는 새 VFX를 더 쌓기보다 아래 순서가 효율이 높다.

1. spawn-lane memory가 같은 edge/target에 여러 memory point를 남길 때 centroid drift를 줄이는 lane hysteresis
2. impact cluster가 boss/archer stamp와 동시에 많은 경우 `×N` label 자체가 겹치지 않게 label placement arbitration
3. compact boss acknowledgement가 너무 자주 ring-only가 되지 않도록 실제 visible action affordance 기준으로 overlap detector를 좁히기

새 atlas는 Canvas/기존 아이콘보다 분명한 판독 이득이 생길 때만 추가한다.
