# Arcane Last Stand — Phase 523~542 Handoff

## 기준선

- 시작 lineage: Phase 522 `main@6882b9bed3f4f8a9ea24052d5ffb43d0b84814f9`
- 시작 regression: 909/909 PASS
- 전투 Action invariant: 일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9
- 신규 Snapshot schema / 영구 통화 / combat Action: 없음

## Phase 523~526 — Boss Combat Cue Density Audit

- 기존 `combatCuePriorityPolicy()`를 boss-special frame 관점에서 조합 감사한다.
- 3 damage severity × 4 special timer = 12 sample.
- imminent special frame 최대 cue units 6, critical 최대 4, projectile 최대 3.
- boss-response cue와 위험 projectile warning을 제거하지 않는다.
- Candidate issue key: `boss-cue-density`.

## Phase 527~530 — AUTO Target / Weakpoint Transition Latency

- 실제 `chooseSpellTarget()` sticky threshold와 `autoWeakpointAimPoint()`를 frame sequence로 재생한다.
- 120-frame 일반 target 경쟁, 60-frame core-threat 전환, 60-frame weakpoint priority 전환.
- material/core/weakpoint 전환 latency 0~1 frame, 불필요한 switch 0.
- Candidate issue key: `auto-transition-latency`.

## Phase 531~534 — Quick-Buy Shop Dwell Audit

- 4 heroes × 4 archetypes × 4 equipment states = 64 states.
- 실제 `shopGuidanceForOffers()` + `quickShopRecommendation()`을 사용한다.
- legacy path 2 taps → quick path 1 tap, tap reduction 50%.
- interaction-model dwell reduction 약 67%.
- protected rank3+/legendary swap exposure 0, unaffordable exposure 0.
- Candidate issue key: `quick-buy-dwell`.

## Phase 535~538 — Long-Run Control + HUD Integration

- 2/4/8/12h × normal/boss/mythic = 12 checkpoint.
- `longRunHudFocusPolicy()` + `mobileInputRegressionAudit()`를 동시에 감사한다.
- critical bars 유지, danger telegraph multiplier 1.0, reachable actions 9/9, hinge clear, thumb relief >=25%.
- Candidate issue key: `long-run-control-hud`.

## Phase 539~542 — Archive Reproducibility Gate

- `git archive --format=zip HEAD`를 임시 디렉터리에 2회 생성한다.
- SHA-256 byte equality, entry-count equality, full SHA archive comment, tracked file coverage를 확인한다.
- tracked worktree가 dirty면 archiveErrors로 REVIEW한다.
- `release-verification-plan` 마지막에 `archive` step을 추가한다.
- Manifest에 `archiveReproducibility` evidence를 optional-compatible 형태로 추가하고, 실제 release runner에서는 필수 evidence로 공급한다.
- archive gate 실패 시 Manifest issue: `archive-reproducibility`.

## 검증 현황 — feature tree

- 신규 Phase tests: 20/20 PASS
- 전체 regression: 929/929 PASS
- Raster: 5/5 PASS
- Release Gate: RQ-9085A5AD PASS
- Candidate: RCQ-4D8B6A3D PASS
- Candidate 신규 요약:
  - boss cue density: imminent <=6 / critical <=4
  - AUTO transition: target/core/weakpoint 0 frame in audit sequence
  - quick-buy dwell: 2→1 tap / ~67% interaction-model dwell reduction
  - long-run control/HUD: actions 9/9 / thumb relief ~61%

## 최종 병합 후 필수 검증

1. clean main에서 `npm test`
2. `npm run verify:manifest -- --out release-manifest.json`
3. Manifest의 Archive reproducibility PASS 확인
4. 실제 static server에서 신규 audit/script 관련 dist route smoke 확인
5. 최종 `git archive` ZIP 생성 후 archive comment / SHA-256 / unzip integrity 확인
6. work/phase523-542 worktree 및 branch 제거
