# Phase 3777~3830 — Impact Direction, Specialist Re-Anticipation & Boss Hazard Aftermath Ownership

## Scope

Presentation-only continuity cycle extending the Phase 3723~3776 impact/lifecycle work into actual impact direction cues, specialist locomotion-to-next-attack anticipation, and persistent boss-hazard end-to-aftermath ownership. No damage, collision, AI, economy, persistence, projectile gameplay movement, attack timing, hazard lifetime, or action-count formula changed. No new atlas was required.

## Fast Train 1 — Phase 3777~3794

Commit: `020d19d` — `Phase 3777-3794 fast train impact direction aftermath continuity`

### Projectile impact lineage direction
- Primary projectile impacts now retain their actual incoming velocity as presentation-only impact direction.
- Chain impacts use the real previous-jump → current-impact vector.
- Splash impacts use the direct-hit target → splash target branch vector.
- Direction cues are normalized and Reduced Motion shortens cue length without changing direction.
- Impact sprites and gameplay hit positions remain unchanged.

### Specialist recovery → next attack anticipation
- A specialist can only show the next-attack directional cue after the previous strike finish has substantially returned to locomotion.
- The cue is range-aware and uses the current target direction.
- Assassin / Shieldbearer / Siege Golem / Nullifier keep role-specific anticipation reach.
- Reduced Motion and Reduced Flash only reduce the presentation cue.

### Boss active hazard → aftermath handoff
- Fresh aftermath begins below canonical aftermath brightness instead of popping directly from an active hazard.
- Middle aftermath owns the residual cue.
- Late aftermath fades toward retirement.
- Reduced Flash lowers aftermath alpha without changing lifecycle ownership.

### Verification
- New TDD: **20/20 PASS** after **20/20 RED** verification.
- Related regression: **60 files / 363 tests / 363 PASS**.
- Fresh build: PASS.
- `git diff --check`: clean.

## Fast Train 2 — Phase 3795~3812

Commit: `8198ce7` — `Phase 3795-3812 fast train direction anticipation aftermath handoff`

### Impact direction source → secondary owner handoff
- Primary direction owns the source impact while active.
- Chain/splash direction yields while the primary source presentation remains active.
- Secondary direction takes ownership after source retirement.
- Late orphaned direction settles before full retirement.

### Specialist anticipation → attack motion handoff
- Standalone anticipation keeps full ownership.
- Pullback fades the anticipation cue into the actual attack pose.
- Strong lunge fully retires anticipation decoration.
- Resolve cannot resurrect a cue that is no longer valid.

### Boss aftermath → terrain owner arbitration
- Active-to-aftermath handoff, canonical aftermath, and cleared-terrain memory are reduced to one explicit final visual owner.
- Late terrain ownership can retain a small aftermath tail without simultaneous full-strength overlap.
- Retired ownership hides all transition decoration.

### Debugging note
- One Train 2 test initially returned `0.964` instead of the required `1.0` for an uncontested anticipation owner.
- Root cause was an unnecessary urgency-based attenuation inside the sole-owner branch, not a live wiring failure.
- The sole anticipation owner now keeps full alpha; urgency remains relevant to density prioritization rather than weakening uncontested ownership.

### Verification
- New TDD: **19/19 PASS** after **19/19 RED** verification.
- Cumulative related regression: **64 files / 383 tests / 383 PASS**.
- Fresh build: PASS.
- `git diff --check`: clean.

## Fast Train 3 — Phase 3813~3830

Commit: `c5ffb2e` — `Phase 3813-3830 fast train impact anticipation aftermath density`

### Impact-direction density budget
- Sparse impact directions keep full cue length and alpha.
- Dense old settle directions retire before source directions.
- Splash branches receive a tighter dense capacity than chain directions.
- Reduced Motion never increases directional cue capacity.
- Impact sprites themselves are never hidden by this budget.

### Specialist next-attack anticipation density budget
- Sparse specialists preserve full anticipation readability.
- Dense Assassin cues retire before the heavier Siege Golem cue budget.
- High urgency gains stronger dense priority.
- Reduced Motion shortens anticipation reach.
- Specialist body/silhouette rendering remains untouched by this budget.

### Boss aftermath density budget
- Sparse aftermath cues remain full strength.
- Dense old terrain-owned aftermath decoration retires before fresh handoff cues.
- Newest aftermath stays visible under dense hazard history.
- Cleared-ground memory remains a separate persistent informational layer.

### Verification
- New TDD: **19/19 PASS** after **19/19 RED** verification.
- Cumulative related regression: **67 files / 402 tests / 402 PASS**.
- Fresh build: PASS.
- `git diff --check`: clean.

## Risk-Adaptive Integration Gate

Risk classification: **MEDIUM**.

Reason: live presentation orchestration in projectile impact direction, specialist pre-attack cues, and boss hazard aftermath rendering was extended, but gameplay state, collision, damage, AI, hazard timing, and balance formulas were not changed.

### Extended regression
- Phase 2931+ presentation continuity set.
- **150 files / 906 tests / 906 PASS**.

### Raster
- 16:9 PASS — `RR-FE2C6B74`
- 20:9 PASS — `RR-0937F125`
- 4:3 PASS — `RR-4C84B218`
- foldable PASS — `RR-023FFC4B`
- 32:9 PASS — `RR-737044D6`
- Baseline auto-update disabled.

### Release gate
- PASS
- Signature: **`RQ-D4630257`**
- Action invariant: **9/9**
- Raster: **5/5**
- Visual effects: PASS

### Candidate gate
- PASS
- Signature: **`RCQ-6006367D`**
- Evidence: `{"ok":true,"signature":"RCQ-6006367D","issues":[]}`
- Eight-hour / Twelve-hour / balance / lifecycle / input / accessibility / release-freeze audits: PASS.

`verify:manifest` was intentionally not run because this is a MEDIUM integration under the project's fixed risk-adaptive policy.

## Integration

Base main before this cycle: `76dd822c3d5a7519f26f8d3f9f8025be7c55920b`.

The verified feature branch is intended to be fast-forwarded into local `main`, followed by a fresh build and smoke of all nine new phase test files (**58 tests total**).

GitHub remains synced only through the earlier Phase 3452 checkpoint unless a separate GitHub sync is explicitly performed.
