# Phase 3093~3110 — Projectile Travel / Impact / Hazard Telegraph Ownership Handoff

## Scope
Presentation-only battlefield continuity pass. Canonical projectile positions, velocities, collision tests, damage timing, target selection, pierce behavior, boss hazard gameplay geometry/damage, action count, persistence schema, and balance remain unchanged. The pass makes launch trails, impact stamps, and boss hazard telegraphs inherit and then retire the temporary visual launch owner without leaving detached or stale presentation origins.

## Phase 3093~3098 — Projectile Trail / Residue Launch Handoff
- Added `projectile-trail-launch-handoff-rendering.ts` and deterministic audit.
- Hero, archer, and boss projectile launch trails derive their head from the same temporary visual launch offset already used by the projectile sprite.
- Trail tail is computed backwards from the visual head along canonical velocity; canonical projectile trajectory is untouched.
- Extra trail is shown only during launch convergence, avoiding permanent battlefield density growth.
- After convergence the owner becomes `canonical` and the extra launch trail disappears.
- Reduced Motion is wired through the live hero/enemy render calls and shortens the temporary trail while preserving owner semantics.
- Existing projectile sprites/colors are reused; no atlas added.

## Phase 3099~3104 — Projectile Arrival / Impact Handoff
- Added `projectile-impact-arrival-handoff-rendering.ts` and deterministic audit.
- At collision, only the residual visual launch displacement is captured as `entryOffset`; the canonical impact `pos` remains the gameplay collision point.
- Hero impact stamps, archer environment impact stamps, and boss projectile lifecycle impact stamps begin from that residual visual arrival point and quickly settle to the canonical impact point.
- Existing projectile-impact source continuity / cluster / label systems remain anchored to canonical impact data.
- Preserved the Phase 2653 source contract by keeping the original impact queue type declarations and attaching `entryOffset` as internal presentation metadata.
- Reduced Motion compresses the captured arrival carry.

## Phase 3105~3110 — Boss Hazard Launch Cue → Telegraph Ownership
- Added `boss-hazard-telegraph-handoff-rendering.ts` and deterministic audit.
- Fresh hazards begin with short launch-line ownership while the telegraph remains visible at reduced alpha.
- As launch TTL falls, launch-line alpha falls while telegraph alpha returns to full ownership.
- Once launch TTL expires, or the hazard becomes active, stale `launchOrigin`, `launchTtl`, and `launchMaxTtl` are explicitly retired from the live hazard object.
- Active hazards never keep the old launch line, preventing duplicate line + active hazard presentation.
- Reduced Flash lowers only the launch cue alpha and does not weaken final telegraph ownership.

## TDD / Regression
New tests:
- `tests/phase3093-3098-projectile-trail-launch-handoff.test.mjs`
- `tests/phase3099-3104-projectile-impact-arrival-handoff.test.mjs`
- `tests/phase3105-3110-boss-hazard-telegraph-handoff.test.mjs`

TDD / review fixes:
- Initial RED: 18/18 failed before production implementation.
- First GREEN pass exposed a `-0` strict-equality edge; zero residual TTL now explicitly returns `{x:0,y:0}`.
- Full regression exposed the Phase 2653 impact queue declaration source contract. The original declarations were restored while new entry offsets remain internal presentation metadata.
- Review found Reduced Motion existed in the helper but was not passed through the live render path. A new source assertion was added RED first, then optional trailing render parameters were wired from `Game` without breaking existing callers.
- Existing Phase 2402 projectile fallback and Phase 2560 Chain Lightning contracts rechecked: 11/11 PASS.
- Related Phase 2931~3110 battlefield motion/launch regression: 180/180 PASS before final full regression; final full regression covers the same files after the last fixes.
- `git diff --check`: clean.

Final full regression on feature worktree:
- parallel-safe: 797 files / 2,806 tests / 0 fail
- exclusive serial: 10 files / 55 tests / 0 fail
- total: 807 files / 2,861 tests / 0 fail

Release gates after final fixes:
- Raster: 5/5 PASS
- Release: `RQ-D4630257` PASS
- Candidate: `RCQ-6006367D` PASS
- Action invariant: 9/9

## Assets
No new image atlas added. Existing projectile sprites, impact stamps, boss projectile lifecycle assets, and arena hazard telegraphs already contain sufficient identity. Ownership handoff produces a larger readability gain than another asset layer and avoids loading/memory/maintenance cost.

## Packaging
Rebuild and force-stage the full tracked `dist/` tree before commit so the Git archive remains directly runnable. After fast-forward merge to reconstructed `main`, rerun the full 807-file regression, release gates, archive reproducibility, provenance, package runtime smoke, and package run-cycle checks against the merged HEAD.

## Next Direction
Projectile launch-to-impact ownership is now coherent. Prefer the next high-value battlefield continuity gaps:
1. piercing / multi-hit projectile presentation should retire the first impact carry without duplicating trail or residue on subsequent hits;
2. projectile threat / near-miss cues should follow the temporary visual projectile position during launch convergence, then hand back to canonical threat tracking;
3. boss hazard telegraph → active → expiry / aftermath identity should use one lifecycle owner so active and aftermath stamps never overlap stale telegraph presentation.
