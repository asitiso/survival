# Arcane Last Stand — Phase 1263~1302 Handoff

## Baseline
- Input provenance: Phase 1262 full merged source ZIP
- Authoritative prior main provenance: `1e243ea4b2e7ef0caf4cf029e14ecbaed51aa272`
- Local reconstructed Git history is operational only and must not replace the ZIP provenance above.

## Phase 1263~1270 — Joystick Home Anchor
- Pointer joystick start records a transient `joystickHome` independent from the soft-follow base.
- Existing `softFollowStart=72`, `maxReach=92`, movement speed and deadzone remain unchanged.
- Recovery thresholds derive from existing `maxReach`; no standalone device pixel constant is introduced.
- `catchRadius = 0.24 × maxReach = 22.08` logical px at the current 92px reach.
- `minBaseShift = 0.18 × maxReach = 16.56` logical px prevents neutral catch before soft-follow has materially moved.

## Phase 1271~1278 — Neutral Return Catch
- After soft-follow moves the base materially, returning the thumb inside the original home catch radius snaps the joystick to neutral.
- On catch, home/base/thumb are aligned to the current pointer and movement becomes exactly `{x:0,y:0}`.
- A representative 220px drag then return previously leaves reverse residual magnitude `1.0`; recovery reduces it to `0.0`.
- Normal movement far from home is not swallowed.

## Phase 1279~1286 — Recenter Hysteresis
- Catching neutral promotes the current pointer position to the new home.
- The same pointer can immediately move in the reverse direction after the neutral frame.
- Existing deadzone stays `0.12`; no post-catch deadzone inflation or timer/state machine is added.
- Jitter inside the existing `92 × 0.12 = 11.04px` deadzone remains neutral.

## Phase 1287~1294 — Foldable / Pointer Safety
- Foldable safe-area, hinge dead-space recovery and `safeJoystickOrigin()` remain authoritative.
- Recovered hinge-side joystick origins become the transient home without crossing the hinge.
- `pointerup`, `pointercancel`, `lostpointercapture`, and `resetTransient()` clear joystick home state.
- Action pointers and joystick pointer remain isolated during multi-touch.
- Keyboard WASD/arrow movement behavior is unchanged.
- Snapshot schema is unchanged; joystick home is transient only.

## Phase 1295~1300 — Neutral Recovery Audit
- Deterministic evidence: 25 samples.
- cardinal return: 4
- diagonal return: 4
- reverse direction after catch: 4
- deadzone jitter: 4
- foldable / hinge-safe return: 4
- frozen invariants: 5
- Maximum representative residual before recovery: `1.0`.
- Maximum residual after recovery: `0.0`.
- 9 action surface, Combat Input Reliability, Manual Target Stability and Action Hold Reliability remain PASS.
- keyboard movement / Snapshot schema mutation: false.

## Phase 1301~1302 — Release Fail-Closed
- `joystickNeutralRecoveryPassed` and `joystickNeutralRecoverySamples` are part of Release Freeze evidence.
- Candidate consistency requires joystick neutral evidence PASS.
- Candidate signature binds neutral-recovery sample count.
- Forced neutral-recovery evidence failure causes Candidate REVIEW/fail-closed.

## Fresh verification before handoff
- Test files: 359
- Tests: 1,438 / 1,438 PASS
- FAIL: 0
- Build: PASS
- Candidate: `RCQ-D71D3EC3` / PASS
- Release Freeze: joystick-neutral safe (25)
- Raster: 5/5 PASS
- Release Gate: `RQ-D4630257` / PASS

## Files added
- `src/core/joystick-neutral-recovery.ts`
- `src/game/joystick-neutral-recovery-audit.ts`
- `tests/joystick-neutral-recovery.test.mjs`
- `tests/joystick-neutral-recovery-input.test.mjs`
- `tests/joystick-neutral-recovery-audit.test.mjs`
- `tests/phase1301-1302-joystick-neutral-release-gate.test.mjs`

## Files modified
- `src/core/input.ts`
- `src/game/release-freeze-audit.ts`
- `src/game/release-candidate-audit.ts`
- generated `dist/` counterparts
