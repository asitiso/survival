# Arcane Last Stand — Phase 503~522 Handoff

## 기준선
- 시작 main: `359afc6ed75005f43770da1e124fc37aa1d0791a`
- 시작 regression: 889/889 PASS
- Phase 502 archive lineage 유지

## 구현
### Phase 503~506 — AUTO Weakpoint Effect Audit
- Lv.10 기준 Fire Bolt / Chain Lightning / Flame Field / Meteor Storm / Black Hole 5종 × boss-center 대비 약점 offset 6단계 = 30샘플.
- 기존 boss-center aim과 Phase 483 weakpoint aim의 예상 약점 접촉률을 같은 node radius에서 비교.
- 평균 contact gain +33.24%, direct spell gain +80.21%, area spell gain +1.93%.
- auto contact floor 1.0, 예상 약점 파괴시간 감소 24.95%, issue 0.
- read-only audit이며 전투 damage/cooldown은 변경하지 않음.

### Phase 507~510 — Combat Cue Priority
- normal: projectile cue 최대 6, AUTO/약점 label 유지.
- boss special <=0.75s: boss-response를 우선하고 projectile cue 최대 3, AUTO text만 숨김.
- heavy damage: projectile cue 최대 4.
- critical damage: 최우선으로 projectile cue 최대 2, AUTO/약점 text를 잠시 숨기되 ring/위험 표시는 유지.
- Game의 projectile/AUTO/weakpoint rendering에 연결하여 동시에 여러 cue가 떠도 중요한 정보부터 보이게 함.

### Phase 511~514 — Boss Action Assist Audit
- 6 boss archetype × all/first/second/none/potion/early/boundary/critical = 48샘플.
- mapped ready action이 있을 때 response coverage 100%.
- low-HP potion rescue coverage 100%.
- 1.05초 이전 early false prompt 0, invalid/multi-action violation 0.
- Candidate fail-closed evidence에 연결.

### Phase 515~518 — Quick-Buy Regret Audit
- 4 heroes × 4 archetypes × empty/upgrade/protected/legendary = 64 state samples.
- protected rank3+/legendary replacement quick-buy 0.
- unaffordable quick-buy 0, high-regret recommendation 0.
- same-item safe upgrade coverage 100%, risky swap block rate 100%.
- Candidate fail-closed evidence에 연결.

### Phase 519~522 — Manifest Verification Pipeline
- 기존 `npm test + npm run build + npm run verify:raster + npm run verify:release + npm run verify:candidate` 중첩 구조 제거.
- `release-verification-plan.mjs`에서 build 1회 후 direct Node entrypoint로 tests/raster/release/candidate 실행.
- 필수 evidence 종류와 fail-closed Release Manifest 의미는 그대로 유지.
- 실제 `npm run verify:manifest -- --out ...` 완전 종료: 25.86초, exit 0.
- Manifest run에서 909 tests / Raster PASS / Release PASS / Candidate PASS를 한 번에 수집.

## 현재 feature-tree 검증
- 신규 Phase tests: 20/20 PASS
- 전체 regression: 909/909 PASS
- Manifest wrapper: PASS, 25.86s, build exactly once
- Candidate 신규 증거: weakpoint +33% · boss assist 100% · quick regret 0
- 전투 Action: 9/9 유지
- 신규 Snapshot schema / 영구 통화 / 추가 입력 모드 없음

## 다음 기준점
Phase 523부터는 새 안내를 추가하기보다 실제 플레이 세션의 cue 지속시간/타겟 안정성/quick-buy 이용률을 하나의 compact telemetry-free deterministic replay 감사로 묶거나, 출시 전 package/archive 재현성과 정적 서버 smoke 시간을 더 줄이는 쪽이 효과 대비 좋습니다.
