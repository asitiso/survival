# Phase 2643~2660 Handoff — Search-Problem Continuity VFX

## Scope
Phase 2642의 VFX arbitration/occlusion/occupancy 계층 위에서, 새 장식 효과를 늘리지 않고 실제 전투 중 반복적으로 발생하는 세 가지 탐색 문제를 줄였다.

- Phase 2643~2648 — Enemy Spawn-Lane Readability
- Phase 2649~2654 — Projectile Impact-Source Continuity
- Phase 2655~2660 — Boss Safe-Response Window Confirmation

전투 HP/피해/속도/AI/스폰 수/쿨다운/보스 패턴은 변경하지 않았다. 신규 PNG atlas도 추가하지 않았다.

## Train A — Phase 2643~2648: Enemy Spawn-Lane Readability

- `EnemyManager`의 실제 spawn portal presentation queue에 기존 kind 외에 실제 `target`(hero/core)을 보존한다.
- `spawnPortalViews()`는 현재 살아 있는 presentation portal snapshot만 복사해 노출한다.
- `enemySpawnLaneCues()`는 portal을 가장 가까운 화면 edge + 실제 target으로 묶는다.
- 같은 lane의 여러 portal은 한 줄로 압축하고, regular < specialist < elite < boss 중 가장 중요한 kind를 대표값으로 쓴다.
- hero/core/damage critical에서는 regular/specialist lane을 먼저 숨기고 elite/boss를 보존한다.
- High/Medium/Low는 최대 4/3/2 lane으로 제한한다.
- 경로는 실제 portal centroid → 현재 hero/core 좌표를 사용하며 정적인 dashed route + arrow로만 표시한다.
- 기존 `world-vfx-priority-arbitration`, occlusion guard, occupancy budget을 통과한다.
- occupancy id `enemy-spawn-lane`을 추가했다.

## Train B — Phase 2649~2654: Projectile Impact-Source Continuity

- archer/boss projectile impact presentation queue에 충돌 직전 실제 incoming velocity를 보존한다.
- `projectileImpactSourceContinuity()`는 impact point에서 incoming vector 반대 방향으로 짧은 backtrace segment를 계산한다.
- zero velocity면 방향을 발명하지 않고 `null`을 반환한다.
- archer/boss는 색만 구별하고, 기존 impact image stamp를 그대로 유지한다.
- High/Medium/Low는 backtrace 길이만 줄이며 Reduced Flash는 alpha만 낮춘다.
- `animated:false`, `motionAmplitude:0`의 정적 설명 cue다.
- projectile damage, target, TTL, collision, expiry 로직은 변경하지 않았다.

## Train C — Phase 2655~2660: Boss Safe-Response Window Confirmation

- 기존 manual boss-response acknowledgement가 실제 다음 boss cycle로 넘어간 경우에만 pending confirmation을 만든다.
- 같은 boss + 바로 직전 acknowledged cycle만 인정한다.
- boss special timer가 충분히 reset된 상태여야 한다.
- hero/core critical, heavy/critical damage, danger/critical projectile가 하나라도 있으면 confirmation을 보류한다.
- 위험이 걷힌 뒤 해당 cycle에서 한 번만 0.62초간 `대응 여유`를 보스 주변에 표시한다.
- boss 소멸/교체/run reset 시 pending/visible state를 모두 정리한다.
- `claimsGlobalSafety:false`: 무적/완전안전/공격보장 같은 의미를 주장하지 않는다.
- boss AI, specialTimer 값, bossCycle 증가, cadence는 변경하지 않았다.

## Release Binding

신규 deterministic 64-sample audit 3종:

- `enemy-spawn-lane-readability-audit.ts`
- `projectile-impact-source-continuity-audit.ts`
- `boss-safe-response-window-confirmation-audit.ts`

Release Freeze와 Candidate signature material에 세 pass bit와 sample count를 모두 결박했다.

- pass bit false → Candidate `REVIEW` + `release-freeze`
- sample count +1 → Candidate signature 변경

## Asset Decision

- New PNG atlas: **0**
- Phase 2642 ZIP 대비 `assets/` 전체 diff: **unchanged**
- 이유: 이번 세 문제는 이미 존재하는 portal/impact/boss state를 연결하면 해결되며, 새 이미지를 추가하면 화면 점유와 유지관리 비용만 늘어난다.

## Verification

- TDD RED: 신규 계약 18/18 fail before implementation.
- GREEN: 신규 계약 18/18 pass.
- 기존 Phase 2452 spawn-pressure source contract 회귀 1건을 발견했고, 기존 literal type contract를 보존하면서 target field를 추가하는 방식으로 수정.
- Full regression: **738 test files / 2,452 tests / 2,452 pass / 0 fail**.
  - parallel-safe 728 files: 2,397 tests / 0 fail
  - exclusive release/package/raster 10 files: 55 tests / 0 fail
- Candidate: **RCQ-F701C359 PASS**.
- Raster: **5/5 PASS** (`16:9`, `20:9`, `4:3`, `foldable`, `32:9`).
- Release: **RQ-D4630257 PASS**, Action 9/9, baseline mutation disabled.
- 3 new pass-bit forgeries: all `REVIEW` + `release-freeze`, signature changed.
- 3 new sample-count mutations: logical PASS remains but signature changes.

## Next Direction

다음 패스는 새 VFX를 넓게 추가하기보다, 현재 검색 연결을 더 실전적으로 만드는 소수 개선이 우선이다. 후보 우선순위:

1. simultaneous impact cluster를 source별로 압축해 다발 피격 때 선이 겹치지 않게 하기
2. spawn-lane cue가 짧은 portal TTL 뒤 바로 사라지는 문제를 해결하는 짧은 presentation-only lane memory
3. boss safe-response confirmation과 player action affordance가 겹칠 때 텍스트 중복을 줄이는 compact acknowledgement

새 atlas는 기존 Canvas/아이콘보다 명확한 판독 이득이 확인될 때만 추가한다.
