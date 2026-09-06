# Phase 3723~3776 — Impact Lineage, Recovery & Persistent Hazard Lifecycle

## Scope

Presentation-only continuity cycle connecting chain/multihit impact lineage, specialist impact finish recovery, and boss hazard footprint ownership into persistent hazard lifecycle. No damage, collision, AI, economy, persistence, action-count, projectile movement, or hazard gameplay rules were changed. No new atlas was required.

## Fast Train 1 — Phase 3723~3740

Commit: `50bc99b` — `Phase 3723-3740 fast train impact lifecycle continuity`

### Projectile impact lineage transfer
- Explicit impact lineage metadata carries primary / multihit / chain / splash presentation identity.
- Chain impacts preserve one cast lineage across jumps.
- Splash impacts branch under the parent impact lineage.
- Terminal primary impact can retire its source presentation owner cleanly.

### Specialist impact finish → locomotion recovery
- Late impact finish blends from role-specific finish direction back toward locomotion facing.
- Tail length contracts as locomotion recovery owns the pose.
- Reduced Motion reaches recovery ownership sooner with bounded transform.

### Boss footprint → persistent hazard lifecycle
- Materialization footprint yields to telegraph before activation.
- Active hazard retires footprint ownership.
- Reduced Flash attenuates the secondary footprint without changing the gameplay hazard.

### Verification
- New TDD: **20/20 PASS** after RED verification.
- Related regression: **26 files / 158 tests / 158 PASS**.
- Fresh build: PASS.
- `git diff --check`: clean.

## Fast Train 2 — Phase 3741~3758

Commit: `ad8e343` — `Phase 3741-3758 fast train impact owner retirement`

### Impact-lineage owner retirement
- Primary impact keeps source ownership while active.
- Secondary lineage inherits after the primary presentation retires.
- Orphaned late secondary lineage settles and then fully retires.

### Specialist dynamic locomotion-facing handoff
- Early recovery retains stored strike-facing identity.
- Late recovery follows live locomotion-facing rather than a stale strike vector.
- Dead specialists do not pull presentation toward stale locomotion state.

### Persistent-hazard activation settle
- Telegraph → active transition gets a short presentation settle.
- Active hazard remains fully authoritative and reaches canonical active brightness quickly.
- No collision/damage timing changes.

### Verification
- New TDD: **18/18 PASS** after RED verification.
- Related regression: **29 files / 176 tests / 176 PASS**.
- Fresh build: PASS.
- `git diff --check`: clean.

## Fast Train 3 — Phase 3759~3776

Commit: `f59e080` — `Phase 3759-3776 fast train transition density ownership`

### Impact-lineage density budget
- Sparse impact labels preserve full readability.
- In dense impact stacks, older settle labels retire before active source/secondary identity.
- High held counts keep stronger priority.
- Impact sprites themselves are never hidden by this budget.

### Specialist recovery-tail density budget
- Dense locomotion-owned recovery tails retire before finish-owned tails.
- Siege Golem keeps one additional heavy-finish slot.
- Reduced Motion tightens transition length without hiding the enemy body.

### Boss activation-settle density budget
- Dense old activation-settle decoration is removed first.
- Canonical active hazards remain visible and authoritative.
- Newest activation retains the settle cue.

### Debugging note
- Initial Train 3 build hit TypeScript `TS2367`: inside an `owner !== 'activation'` narrowed branch, the helper still compared the same owner to `'activation'`.
- Root cause was TypeScript control-flow narrowing, not the rendering design.
- The non-activation branch was corrected to derive `activeVisible` only from canonical active ownership.
- A later cumulative regression exposed one stale Train 2 source-contract that expected direct `postImpactHandoff` access; the contract was minimally expanded to accept the new `postImpactSpriteScale` owner chain while preserving its semantic assertion.

### Verification
- New TDD: **18/18 PASS** after RED verification.
- Related regression: **33 files / 200 tests / 200 PASS**.
- Fresh build: PASS.
- `git diff --check`: clean.

## Risk-Adaptive Integration Gate

Risk classification: **MEDIUM**.

Reason: live presentation orchestration in projectile impacts, specialist recovery, and boss hazard visuals was extended, but gameplay state and balance formulas were not changed.

### Extended regression
- Phase 2931+ presentation continuity set.
- **141 files / 848 tests / 848 PASS**.

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

Base main before this cycle: `c26bcb7fa059e4f02ca518b82b5c1d9fdab6ca3a`.

The verified feature branch is intended to be fast-forwarded into local `main`, followed by a fresh build and smoke of all nine new phase test files (**56 tests total**).

GitHub remains synced only through the earlier Phase 3452 checkpoint unless a separate GitHub sync is explicitly performed.
