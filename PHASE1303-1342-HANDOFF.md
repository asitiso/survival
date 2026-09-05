# Phase 1303~1342 Handoff — Strategic Action Release Commit

## Baseline provenance

- Input archive: `arcane-last-stand-phase1302-full-merged.zip`
- Authoritative input provenance SHA: `03136c50d2204b569a8b863996f3d8e44162bf31`
- The input archive does not contain `.git`; local Git history is reconstructed separately and must not be confused with the authoritative archive provenance.

## Phase 1303~1310 — Strategic Action Arm

- Touch `shop` / `auto` no longer commit on `pointerdown`.
- They arm one transient owner pointer and remain visually held until release/cancel.
- `spell1~4`, `ultimate1~2`, and `potion` retain immediate pointerdown latency.
- Keyboard `B` / `R` retain immediate pressed semantics.

## Phase 1311~1318 — Slide-to-Cancel

- Strategic actions reuse the proven action leash formula: actual touch radius × `1.20`.
- Small 10~25 px jitter remains armed.
- Moving outside the release boundary permanently cancels that pointer's commit.
- Re-entering with the same pointer does not re-arm; a fresh pointerdown is required.

## Phase 1319~1326 — Single-Owner Commit

- One owner pointer maximum per strategic action.
- Two near-simultaneous AUTO touches cannot produce ON→OFF double toggles.
- Two shop touches cannot open/consume twice.
- Shop and AUTO may be armed independently, and entry into shop clears any remaining strategic arm.

## Phase 1327~1334 — Cancel / Lifecycle Safety

- `pointercancel`, `lostpointercapture`, `resetTransient()`, manual pause entry, decision-session entry, shop entry, and new-run reset discard armed strategic actions.
- Background/BFCache/resize/orientation continue to use the existing transient reset path.
- Strategic arms are transient and do not enter Snapshot schema.

## Phase 1335~1340 — Strategic Input Reliability Audit

- Deterministic evidence: `25 samples / PASS`.
- Coverage:
  - normal release: 2
  - jitter: 4
  - release boundary: 4
  - owner arbitration: 3
  - cancel safety: 3
  - foldable touch scaling: 4
  - frozen invariants: 5
- Existing combat-input, manual-target, action-hold, joystick-neutral, 9-action invariants remain green.
- No cooldown, damage, AUTO throughput, economy, or Snapshot schema mutation.

## Phase 1341~1342 — Release Fail-Closed

- `strategicInputReliabilityPassed` and `strategicInputReliabilitySamples` are included in Release Freeze.
- Candidate consistency requires strategic input evidence to be healthy even if aggregate `passed` is forged true.
- Candidate signature binds the strategic input sample count.

## Fresh feature verification before handoff commit

- Full tests: `364 files / 1,464 tests / 1,464 PASS / 0 FAIL`
  - 363 non-candidate files: `1,447 PASS`
  - legacy `release-candidate-audit.test.mjs`: all 17 subtests PASS via four bounded groups
- Build: PASS
- Candidate: `RCQ-9B7E571E` / PASS
- Raster: `5/5 PASS`
- Release Gate: `RQ-D4630257` / PASS
- Action invariant: `9/9`

## Frozen product boundaries

- 9 action buttons unchanged.
- Spell / ultimate / potion immediate touch latency unchanged.
- Shop token economy unchanged: a valid shop commit still consumes exactly one token through the existing `openShop()` path.
- Damage, cooldown, AUTO casting throughput, target logic, and Snapshot schema unchanged.
- No new button, HUD prompt, setting, debounce timer, or tutorial burden.
