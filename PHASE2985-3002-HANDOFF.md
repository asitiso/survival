# Phase 2985~3002 — Hero Ultimate Handoff / Specialist Attack-Hit Arbitration / Boss Stagger-Recovery Arbitration

## Scope
Presentation-only battlefield motion ownership refinement. This pass does not change combat formulas, cooldowns, AI, collision, damage timing, action count, persistence schema, or balance. It reduces visible transform conflicts between layers already introduced in Phase 2931~2984.

## Phase 2985~2990 — Hero Ultimate Recovery → Movement / Normal Spell Handoff
- Added `src/game/hero-ultimate-action-handoff-rendering.ts`.
- Ultimate wind-up/release keeps ownership; handoff becomes available only during the recovery portion.
- Hero movement gradually takes ownership from an ultimate recovery pose instead of stacking both transforms at full strength.
- A successful normal spell outranks movement and quickly releases the remaining ultimate body transform.
- Ordinary cast recovery suppression is reduced along with ultimate pose ownership so the next action can read cleanly.
- A normal-spell handoff pulse is explicitly reset by a new ultimate cast, preventing stale ownership from a spell immediately before an ultimate.
- Reduced Motion preserves ownership identity.
- Added a deterministic 64-sample presentation audit.

## Phase 2991~2996 — Specialist Attack Wind-up ↔ Hit Stagger ↔ Fatal Priority
- Added `src/game/specialist-attack-hit-arbitration-rendering.ts`.
- Shieldbearer, Assassin, Siege Golem, and Nullifier use a bounded attack commitment score from existing pullback/lunge/resolve presentation state.
- Once a specialist attack is visually committed, nonfatal hit stagger is compressed instead of fighting the attack silhouette.
- Critical hits retain more visibility than heavy/normal hits while still not stealing a committed attack.
- When attack commitment has cleared, hit stagger immediately regains ownership.
- Fatal transition is defined as absolute priority: attack and hit layers are zeroed while the existing defeated-body transition owns the body.
- Reduced Motion does not change priority identity.
- Added a deterministic 96-sample presentation audit.

## Phase 2997~3002 — Boss Heavy-Hit Stagger ↔ Special Recovery Arbitration
- Added `src/game/boss-stagger-special-recovery-arbitration-rendering.ts`.
- Active special recovery owns the boss silhouette and compresses recent heavy/critical stagger plus generic hit recoil.
- Critical stagger remains slightly more legible than heavy stagger but is capped during early recovery.
- As recovery settles, heavy-hit stagger regains ownership smoothly.
- A new special telegraph has absolute priority over both recovery and stagger; existing telegraph protection remains intact while stale recovery is reduced.
- Later phases receive slightly stronger recovery dominance to prevent late-fight silhouette noise.
- Reduced Motion preserves ownership identity.
- Added a deterministic 72-sample presentation audit.

## TDD / Regression
New tests:
- `tests/phase2985-2990-hero-ultimate-action-handoff.test.mjs`
- `tests/phase2991-2996-specialist-attack-hit-arbitration.test.mjs`
- `tests/phase2997-3002-boss-stagger-special-recovery-arbitration.test.mjs`

TDD:
- Initial RED: 18/18 failed before production implementation.
- GREEN: 18/18 passed after implementation.
- Diff review found a stale normal-spell handoff pulse path when a new ultimate followed immediately; a regression assertion failed first, then the ultimate-trigger reset fixed it.
- Related battlefield motion regression: 72/72 PASS before final full verification.
- `git diff --check`: clean.

Full regression after the stale-pulse fix:
- parallel-safe: 779 files / 2,698 tests / 0 fail
- exclusive serial: 10 files / 55 tests / 0 fail
- total: 789 files / 2,753 tests / 0 fail

Release gates:
- Raster: 5/5 PASS
- Release: `RQ-D4630257` PASS
- Candidate: `RCQ-6006367D` PASS
- Action invariant: 9/9

## Assets
No new image atlas was added.
The existing hero, specialist enemy, and boss sprites already contain enough visual identity; arbitration of existing transforms produces a clearer battlefield result without adding loading or maintenance cost.

## Next Direction
Prefer global motion-budget cleanup over adding more effects:
1. hero hit/cast/ultimate/movement ownership budget so extreme rapid input cannot compound micro-transforms;
2. specialist locomotion/attack/reaction ground-contact ownership so feet/shadows stay anchored during fast priority changes;
3. boss locomotion/special/recovery/stagger shadow and contact-pulse arbitration so the body and ground cues always agree on weight.
