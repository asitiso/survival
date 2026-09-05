# Phase 2423~2430 — Battlefield Interaction Visual Assets

이번 패스는 전장 안에서 자주 보는 상호작용 오브젝트를 하나의 이미지 언어로 통합했습니다. 전투/경제/AI/Snapshot 공식은 바꾸지 않고 presentation layer만 확장했습니다.

## Phase 2423~2424 — Interaction Atlas
- 신규 `assets/arena/battlefield-interaction-vfx.png`
- 512×512 / 4×4 / cell 128×128 / 16 unique cells
- 수호핵 normal/warning/critical 3종
- XP / coin 2종
- supply crate 1종
- battlefield objective 3종
- field node 5종
- regular / elite spawn portal 2종
- 신규 `src/game/battlefield-interaction-vfx-assets.ts`

## Phase 2425~2427 — Live Battlefield Integration
- `drawCore()`가 HP 비율에 맞는 3단계 수호핵 이미지를 사용
- `PickupManager.render()`가 XP/coin 이미지를 사용
- 보급상자 / 전장 목표 / Field Node가 신규 atlas를 우선 사용
- `EnemyManager`가 일반/엘리트 등장 위치에 짧은 portal VFX를 큐잉
- portal TTL 0.72초 / 최대 28개로 제한
- atlas load failure 시 기존 Canvas/identity fallback 유지

## Phase 2428~2429 — Deterministic Visual Audit
- 신규 `src/game/battlefield-interaction-vfx-audit.ts`
- 64 deterministic samples
- 16/16 cell coverage / unique / bounds
- core threshold 60% / 30% 계약
- Actions 9/9, gameplay/schema mutation false

## Phase 2430 — Release Binding
- Release Freeze / Release Candidate evidence에 64 samples 결박
- fail-closed Candidate signature 포함

## Verification
- Full regression: 701 files / 2,227 tests / 0 failures
- Candidate: `RCQ-2B663873`
- Release: `RQ-D4630257`
- Raster profiles: 5/5 PASS
