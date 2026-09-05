# Arcane Last Stand — Phase 1223~1262 Handoff

## Baseline
- Input provenance: Phase 1222 full merged source ZIP
- Authoritative prior main provenance: `0caaa8f185480c087c1b99652cffaf180b44c777`
- Local reconstructed Git history is operational only and must not replace the ZIP provenance above.

## Phase 1223~1230 — Action Hold Leash
- Applies only to pointer-held `spell1`~`spell4`.
- Initial pointerdown/pressed behavior is unchanged.
- Hold release radius = actual action touch hit radius × `1.20`.
- Standard 58px spell buttons therefore release at 58 × 1.30 × 1.20 = 90.48 logical px from button center.
- Cooldown, damage, cast-buffer timing, spell targeting and AUTO behavior are unchanged.

## Phase 1231~1238 — Jitter Hysteresis
- 10~25 logical px thumb jitter remains inside the leash.
- Once a pointer crosses the release boundary its pointer hold is detached.
- Re-entering with that same pointer does not reactivate hold; a new pointerdown is required.

## Phase 1239~1246 — Stuck-Hold Safety
- `pointerup`, `pointercancel`, and `lostpointercapture` all release transient pointer holds.
- Repeated release/clear is idempotent.
- Lifecycle `resetTransient()` clears leash tracking together with existing pointer/held/pressed state.

## Phase 1247~1254 — Foldable / Multi-Touch Safety
- Leash radius derives from `foldableTouchScaleMap()` per-action scale on foldables.
- Same-action multi-touch keeps held state while at least one action pointer remains.
- Different action pointers remain isolated.
- Keyboard `1`~`4` hold behavior is unchanged.
- Ultimate/potion/shop/AUTO pointer behavior is unchanged by the spell hold leash.

## Phase 1255~1260 — Hold Reliability Audit
- Deterministic evidence: 25 samples.
- jitter: 4
- exact boundary: 8
- foldable touch-scale: 4
- pointer safety: 4
- frozen invariants: 5
- 9 action surface preserved.
- cooldown/damage/AUTO throughput/Snapshot schema mutation: false.

## Phase 1261~1262 — Release Fail-Closed
- `actionHoldReliabilityPassed` and `actionHoldReliabilitySamples` are part of Release Freeze evidence.
- Candidate consistency requires hold evidence PASS.
- Candidate signature binds hold sample count.
- Forced hold evidence failure causes Candidate REVIEW/fail-closed.

## Fresh verification before handoff
- Test files: 355
- Tests: 1,422 / 1,422 PASS
- FAIL: 0
- Build: PASS
- Candidate: `RCQ-BB29EB4E` / PASS
- Release Freeze: hold safe (25)
- Raster: 5/5 PASS
- Release Gate: `RQ-D4630257` / PASS

## Files added
- `src/core/action-hold-leash.ts`
- `src/game/action-hold-reliability-audit.ts`
- `tests/action-hold-leash.test.mjs`
- `tests/action-hold-drift-input.test.mjs`
- `tests/action-hold-reliability-audit.test.mjs`
- `tests/phase1261-1262-action-hold-release-gate.test.mjs`

## Files modified
- `src/core/input.ts`
- `src/game/release-freeze-audit.ts`
- `src/game/release-candidate-audit.ts`
- generated `dist/` counterparts
