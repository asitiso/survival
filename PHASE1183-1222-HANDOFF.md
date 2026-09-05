# Arcane Last Stand — Phase 1183~1222 Handoff

## Baseline

- Authoritative Phase 1182 source archive comment: `e15d74d73134553529c25beb551541fb1bde0a05`
- This workspace reconstructs Git history locally because the supplied Phase 1182 ZIP contains tracked source files but no `.git` directory.
- Phase 1182 gameplay/release behavior was treated as frozen unless explicitly listed below.

## Phase 1183~1190 — Manual Target Memory

- Added transient `ManualTargetMemory` shared by all six manual cast actions.
- The most recent successful manual target is retained for `0.75s`.
- Same-priority challengers do not cause target oscillation during that window.
- Manual target memory is never serialized into `RunSnapshot`.

## Phase 1191~1198 — Priority-Safe Stickiness

Manual priority remains frozen as:

1. core-targeting enemy inside the existing 620 range,
2. boss/elite inside the existing 650 range,
3. normal manual nearest fallback.

Stickiness applies only while the remembered target remains in the same priority tier. A higher tier overrides immediately. Boss and elite intentionally share one tier so they do not oscillate against each other merely because their distances cross.

## Phase 1199~1206 — Range / Death / Threat Override

- Dead remembered targets release immediately.
- Core threats release memory when they leave the existing 620 priority range.
- Boss/elite targets release memory when they leave the existing 650 priority range.
- A 720 retention safety radius prevents stale off-field target memory without changing fallback targeting or spell range.
- A newly qualifying core threat overrides lower-priority remembered targets in the same frame.

## Phase 1207~1214 — Cast-Chain Stability

- `SpellWorld` accepts an optional transient `preferredManualTargetId`.
- Pressed casts, Phase 1182 buffered casts, and existing held manual normal-spell casts all use the same manual target memory.
- AUTO casts ignore `preferredManualTargetId` and preserve the existing AUTO hysteresis path.
- AUTO ON/OFF transitions clear manual memory so returning to manual mode never resurrects stale intent.
- Existing cast buffer lifecycle clearing also clears manual target memory.

## Phase 1215~1220 — Manual Target Stability Audit

`auditManualTargetStability()` provides deterministic evidence:

- same-tier stickiness: 4 samples,
- higher-priority override: 3 samples,
- expiry/death/range release: 5 samples,
- buffered cast compatibility across all six cast actions: 6 samples,
- AUTO/manual memory isolation: 2 samples,
- frozen snapshot/economy/damage/cooldown/AUTO-throughput invariants: 5 samples.

Total evidence: **25 samples / PASS**.

## Phase 1221~1222 — Release Fail-Closed

- Release Freeze now includes `manualTargetStabilityPassed` and `manualTargetStabilitySamples`.
- Candidate consistency requires manual target stability PASS.
- Candidate signature binds the manual target stability sample count.
- Forging the parent freeze `passed=true` while manual-target evidence is false still fails Candidate closed.

## Fresh feature verification before final packaging

- Test files: **351**
- Tests: **1,402 / 1,402 PASS**
- FAIL: **0**
- Build: **PASS**
- Candidate: **RCQ-F0274D53 / PASS**
- Release Freeze manual-target evidence: **25 samples / PASS**
- Raster: **5/5 PASS**
- Release Gate: **RQ-D4630257 / PASS**
- Action invariant: **9/9**

## Frozen invariants

- No spell damage tuning changes.
- No cooldown duration changes.
- No economy changes.
- No AUTO throughput multiplier changes.
- No new action/button count.
- No RunSnapshot schema changes.
- Existing manual 620/650 priority thresholds remain unchanged.
