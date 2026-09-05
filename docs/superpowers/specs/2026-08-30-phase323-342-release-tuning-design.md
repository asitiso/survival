# Phase 323~342 Release Tuning Design

## Goal
Bring Arcane Last Stand from a passing release candidate to a tighter release-ready tuning loop by auditing and smoothing the first 30 minutes, validating the first six boss clears, stabilizing thermal recovery, auditing 2~12 hour Gold/XP density, and failing the Candidate/Manifest gates when performance or balance budgets regress.

## Global constraints
- Combat actions remain exactly 9.
- No new blocking modal, currency, inventory slot, or management screen.
- No new RunSnapshot fields.
- Enemy logic and danger telegraphs remain 100% under thermal relief.
- Existing 0~10 minute opening ceremony identity remains intact.
- Boss four and later keep neutral difficulty-curve modifiers.
- Long-run economy correction is transient and bounded; it never changes shop tokens or permanent meta rewards.
- Release baselines are never auto-mutated.

## Phase 323~326 — 0~30 minute combat timetable precision
The existing 10~30 minute extension currently changes in stepwise bands. Replace the within-band jumps with deterministic interpolation while keeping the public band labels. Add a minute-resolution audit covering 0~30 minutes, requiring no post-10-minute pressure cliff, bounded adjacent pressure deltas, stable shop/enemy budgets, and bounded rewards. The Game continues to consume `firstThirtyMinuteProfile` through its existing spawn/elite/reward seams.

## Phase 327~330 — first six boss clear/difficulty audit
Add a deterministic first-six-boss audit that combines the existing boss curve with a normalized player DPS progression. Track estimated clear seconds, normalized difficulty load, and adjacent spikes for boss ordinals 0~5. The first three bosses remain eased, boss four onward remains neutral, and the audit fails if a single boss produces an unreasonable clear-time or difficulty jump. This is an audit/gate; it does not add per-boss runtime state.

## Phase 331~334 — thermal recovery hysteresis
Keep `thermalBudgetPolicy` as the stateless desired thermal pressure evaluator, then add a transient `ThermalRecoveryState` used by Game presentation updates. Escalation occurs faster than recovery; hot/warm presentation caps only relax after sustained recovered frames, preventing quality flapping. Enemy logic and danger telegraphs are never changed. State is not persisted in snapshots.

## Phase 335~338 — 2~12 hour Gold/XP economy audit
Extend long-run reward auditing with checkpoints at 120, 180, 240, 360, 480, 600, and 720 minutes under drought, healthy, and saturated recent-Gold scenarios. Gold and XP multipliers remain within 1.00~1.08, saturated economies damp to 1.00, and the curve must not create late-game multiplier spikes. Runtime policy remains transient and still applies only to death Gold/XP.

## Phase 339~342 — performance/balance budget release enforcement
Extend Release Candidate evidence with the precise opening timetable, six-boss audit, thermal hysteresis audit, and 12-hour economy audit. Add explicit performance ceilings per low/mid/high device and fail closed on regressions. Release Manifest must include the Candidate signature and compact performance/balance summary; baseline mutation stays disabled and Action count stays 9.

## Verification
- Targeted RED/GREEN tests per phase bundle.
- Full `npm test` regression.
- `npm run build`.
- `npm run verify:raster`.
- `npm run verify:release`.
- `npm run verify:candidate`.
- `npm run verify:manifest`.
- `git diff --check` and clean working tree before integration.
