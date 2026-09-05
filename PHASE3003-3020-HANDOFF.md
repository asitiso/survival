# Phase 3003~3020 — Global Motion Budget / Specialist Ground Contact Ownership / Boss Ground Cue Arbitration

## Scope
Presentation-only battlefield motion cleanup. This pass does not change combat formulas, cooldowns, AI, collision, damage timing, action count, persistence schema, or balance. It reduces compounded micro-transforms and keeps body, shadow, and ground-contact cues under the same visual owner.

## Phase 3003~3008 — Hero Global Motion Budget
- Added `src/game/hero-motion-budget-rendering.ts` and deterministic audit.
- Introduced one final ownership budget across movement, hit recoil, normal cast, perfect evade transition, and ultimate body continuity.
- Priority order preserves high-value action identity: ultimate -> evade -> cast -> hit -> movement.
- Lower-priority transforms are compressed before the owner transform when simultaneous rapid input would exceed the body-motion budget.
- Budget enforcement is real: after diff review, an all-max regression case was added first, failed, then the implementation was changed to compress non-owner layers until the applied transform load is within the cap.
- Reduced Motion preserves owner identity with a tighter motion budget.
- Existing hero sprites and cast/ultimate VFX are reused; no new atlas was added.

## Phase 3009~3014 — Specialist Locomotion / Attack / Reaction Ground Contact Ownership
- Added `src/game/specialist-ground-contact-ownership-rendering.ts` and deterministic audit.
- Shieldbearer, Assassin, Siege Golem, and Nullifier now share one owner across generic locomotion, specialist turn/stop motion, shadow offset, and specialist ground pulse.
- Committed attacks reduce competing locomotion drift while allowing a small bounded ground-follow in attack direction.
- Hit reaction ownership follows only a small fraction of recoil displacement so feet/shadows stay anchored instead of sliding with the full body recoil.
- Fatal ownership clears specialist ground pulses and contact follow.
- Reduced Motion keeps owner identity while compressing ground follow and secondary motion.

## Phase 3015~3020 — Boss Body / Shadow / Contact Pulse Arbitration
- Added `src/game/boss-ground-cue-arbitration-rendering.ts` and deterministic audit.
- Normal locomotion keeps body, shadow stretch/offset, and contact pulse in the same lane.
- A new special telegraph suppresses conflicting locomotion settle/contact pulses so the boss reads as preparing the special rather than landing at the same time.
- Special recovery transfers weight into the shadow using the existing recovery shadow signal while suppressing repeated locomotion contact pulses.
- Heavy-hit stagger keeps a grounded shadow and compresses locomotion motion instead of letting the body and ground cues disagree.
- Existing phase, special, recovery, and stagger systems remain unchanged; arbitration only scales presentation output.

## TDD / Regression
New tests:
- `tests/phase3003-3008-hero-motion-budget.test.mjs`
- `tests/phase3009-3014-specialist-ground-contact-ownership.test.mjs`
- `tests/phase3015-3020-boss-ground-cue-arbitration.test.mjs`

TDD:
- Initial RED: 18/18 failed before production implementation.
- First GREEN pass: 18/18 passed after integration.
- Diff review found that reported hero budget load was capped but the applied layer scales could still exceed the cap in an all-max synthetic case.
- Added the applied-load regression assertion first; it failed as expected.
- Fixed by preserving the owner layer and proportionally compressing non-owner layers until the actual applied load fits the cap.
- Final new tests: 18/18 PASS.
- Related Phase 2931~3020 battlefield motion regression: 90/90 PASS.
- `git diff --check`: clean.

Full regression after the applied-budget fix:
- parallel-safe: 782 files / 2,716 tests / 0 fail
- exclusive serial: 10 files / 55 tests / 0 fail
- total: 792 files / 2,771 tests / 0 fail

Release gates:
- Raster: 5/5 PASS
- Release: `RQ-D4630257` PASS
- Candidate: `RCQ-6006367D` PASS
- Action invariant: 9/9

## Assets
No new image atlas was added.
The existing hero, specialist enemy, and boss sprites already contain enough visual identity; ownership cleanup produces a clearer battlefield result without increasing loading or asset maintenance cost.

## Next Direction
Prefer remaining body-to-ground coherence gaps over adding effects:
1. hero body / ground-contact ownership during perfect evade, ultimate lift, and rapid cast transitions so the hero shadow stays physically coherent;
2. defeated specialist body / shadow retirement handoff so fatal poses do not leave one-frame ground cues behind;
3. boss dash / phase-transition / special displacement ground-origin continuity so contact cues rebase cleanly after large boss movement.
