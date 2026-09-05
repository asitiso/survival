# Phase 1543-1582 Handoff — Critical Danger Hysteresis

## Provenance
- Input main: `423e2caa969a0b9e9e9121b7c757af025f888f10`
- Feature branch: `work/phase1543-1582`
- Scope: critical danger warning state stability only

## Phase 1543-1550 — Critical State Hysteresis
- Hero entry remains `HP <= 30%`; once critical, exits only above `33%`.
- Core entry remains `HP <= 35%`; once critical, exits only above `38%`.
- Hero danger vignette keeps a minimum `0.18` alpha throughout the hero hysteresis band and disappears only after safe exit.
- `dangerUiState()` accepts the previous transient danger state; no Snapshot field is added.

## Phase 1551-1558 — Haptic Rearm Safety
- Existing `criticalHapticEvents()` stays transition-based.
- Micro-heal / micro-hit movement inside the hysteresis band produces no repeated haptic.
- A full safe exit rearms the existing entry haptic; the next real entry emits exactly once again.
- No haptic cooldown timer was added.

## Phase 1559-1566 — Visual Attention Continuity
- Existing Phase 1503-1542 combat attention arbitration consumes the latched danger state.
- Hero/core warning text stays visible across the hysteresis band.
- Hero remains primary until it truly exits; core can then promote naturally.
- Boss assist compact behavior and Reduced Flash behavior are unchanged.

## Phase 1567-1574 — Boundary / Lifecycle Safety
- Hero: `30.0%` enters, `33.0%` remains critical, `>33.0%` exits.
- Core: `35.0%` enters, `38.0%` remains critical, `>38.0%` exits.
- New run explicitly resets to `dangerUiState(1, 1)`.
- In-memory danger state is not reset by routine pause/decision/shop/lifecycle transient input clears.
- Snapshot schema is unchanged; reload starts from a safe transient state and reevaluates from current HP ratios.

## Phase 1575-1580 — Danger Stability Audit
Deterministic audit: **25 samples / PASS**.
- threshold jitter warning toggles: `0`
- duplicate hysteresis-band haptics: `0`
- full safe-exit haptic rearm: `100%`
- critical warning visibility: `100%`
- animated primary warnings: `<= 1`
- minimum hero-band vignette alpha: `>= 0.18`
- reachable actions: `9/9`
- Snapshot schema mutation: `false`

## Phase 1581-1582 — Release Fail-Closed
- Release Freeze fields:
  - `criticalDangerHysteresisPassed`
  - `criticalDangerHysteresisSamples`
- Candidate release-freeze consistency requires the new child evidence.
- Candidate signature payload binds both the pass flag and sample count.
- Candidate report includes `danger-hysteresis safe (25)`.

## Frozen invariants
No changes to actual HP, damage, healing amount, potion power, boss cadence, boss response priority, cast buffer, cooldown, AUTO throughput, economy, action count, or Snapshot schema.

## Feature verification before handoff commit
- Build: PASS
- Full tests: `387 files / 1532 / 1532 PASS / FAIL 0`
- Critical Danger Hysteresis audit: `25/25 PASS`
- Candidate: `RCQ-288A3B0E / PASS`
- Raster: `5/5 PASS`
- Release Gate: `RQ-D4630257 / PASS`
