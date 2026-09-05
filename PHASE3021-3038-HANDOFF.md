# Phase 3021~3038 — Hero Ground Contact Ownership / Specialist Defeat Retirement / Boss Ground-Origin Rebase

## Scope
Presentation-only battlefield coherence pass. Combat formulas, cooldowns, AI decisions, collision, damage timing, action count, persistence schema, and balance remain unchanged. The pass makes body motion, shadow contact, and ground cues agree during high-displacement actions and fatal retirement.

## Phase 3021~3026 — Hero Body / Shadow Ground Contact Ownership
- Added `src/game/hero-ground-contact-ownership-rendering.ts` and deterministic audit.
- Ground shadow owner priority follows existing action readability: ultimate -> perfect evade -> cast -> locomotion -> neutral.
- Rapid casts reduce locomotion shadow drift and follow only a bounded fraction of cast body lead.
- Perfect evade keeps directional identity while anchoring the shadow more strongly than ordinary casting.
- Ultimate lift keeps the shadow near the ground origin, narrows/softens it as body lift increases, and avoids visually lifting the shadow with the hero.
- Reduced Motion preserves owner identity with tighter ground follow.
- Existing hero sprite and VFX assets are reused.

## Phase 3027~3032 — Defeated Specialist Body / Shadow Retirement Handoff
- Added `src/game/specialist-defeat-ground-retirement-rendering.ts` and deterministic audit.
- Shieldbearer, Assassin, Siege Golem, and Nullifier fatal body poses now receive a short grounded retirement shadow using the existing defeated-body queue.
- Fatal shadow follows only a bounded fraction of the death body displacement, preventing the feet/shadow from sliding with the full recoil.
- Siege Golem retirement reads broader/heavier than Assassin retirement while reusing the same enemy sprite atlas.
- Specialist ground pulses remain disabled on fatal retirement.
- Shadow retirement reaches zero before the body queue expires, preventing a one-frame ground cue after the fatal pose is gone.
- Reduced Motion further tightens fatal shadow displacement.

## Phase 3033~3038 — Boss Dash / Phase / Special Ground-Origin Rebase
- Added `src/game/boss-ground-origin-rebase-rendering.ts` and deterministic audit.
- Added render-only `bossGroundOriginRebase` state to live boss entities; it is not part of persistence snapshots.
- Large boss displacement creates a bounded trailing ground origin instead of teleporting shadow/contact cues the full dash distance.
- Boss phase changes and special-cycle changes also trigger a short rebase even when positional displacement is small.
- During rebase, stale contact pulses and locomotion settle are compressed while the shadow catches up to the current boss position.
- Rebase decays quickly to zero and Reduced Motion further tightens visible ground-origin trail distance.
- Existing boss sprites, special telegraphs, recovery poses, and ground cues remain authoritative.

## TDD / Regression
New tests:
- `tests/phase3021-3026-hero-ground-contact-ownership.test.mjs`
- `tests/phase3027-3032-specialist-defeat-ground-retirement.test.mjs`
- `tests/phase3033-3038-boss-ground-origin-rebase.test.mjs`

TDD:
- Initial RED: 18/18 failed before production implementation.
- Initial GREEN: 18/18 passed after the three presentation modules were integrated.
- Diff review then aligned boss locomotion settle with the same rebase owner used by shadow/contact cues.
- Final new tests: 18/18 PASS.
- Related Phase 2931~3038 battlefield motion regression: 72/72 PASS.
- `git diff --check`: clean.

Full regression:
- parallel-safe: 785 files / 2,734 tests / 0 fail
- exclusive serial: 10 files / 55 tests / 0 fail
- total: 795 files / 2,789 tests / 0 fail

Release gates:
- Raster: 5/5 PASS
- Release: `RQ-D4630257` PASS
- Candidate: `RCQ-6006367D` PASS
- Action invariant: 9/9

## Assets
No new image atlas was added. Existing hero/enemy/boss sprites already provide enough identity; ground-contact coherence produces a larger readability improvement without adding asset loading or maintenance cost.

## Next Direction
Prefer remaining coherence gaps over decorative VFX expansion:
1. hero hit-recoil / shadow compression and recovery handoff so heavy damage never makes the hero appear to skate above the ground;
2. regular/elite defeated-body ground retirement so the same fatal contact language is consistent outside specialists without increasing VFX density;
3. boss summon/teleport-style special origin handoff so newly materialized adds and boss ground cues never share a stale pre-displacement origin.
