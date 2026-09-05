# Phase 1903~1912 Handoff — Reduced Motion Accessibility Completion

## Execution Scope
This pass implements the approved twelve-function Reduced Motion accessibility expansion while keeping Phase numbering compact. `Reduced Motion` is independent from Reduced Flash and Reduced Shake. Gameplay telegraphs, collision, damage, cooldowns, AI, economy, audio, haptics, 9 Actions, and RunSnapshot schema remain frozen.

## Phase 1903 — Independent MOTION Setting
- Added persisted `reducedMotion:boolean` to `PresentationSettings`.
- Added combat control `MOTION ON/LOW` with ARIA pressed state and storage persistence.
- `FLASH`, `SHAKE`, and `MOTION` can now be toggled independently.

## Phase 1904 — OS Preference Default
- Fresh profiles use `prefers-reduced-motion: reduce` as the initial default for Motion, Flash, and Shake.
- After initialization the three toggles remain independent; changing Flash or Shake does not mutate Motion.

## Phase 1905 — Legacy Settings Migration
- Existing four-field presentation settings migrate without reset.
- Legacy `reducedMotion` is inferred true only when both prior reduced Flash and reduced Shake were true; mixed explicit preferences migrate to Motion ON.
- Quality and haptic preferences are preserved.

## Phase 1906 — Boss Opening + Screen Radius Motion
- `PresentationRuntime.renderScreenEffects()` now accepts Reduced Flash and Reduced Motion separately.
- Boss entrance/death shockwave, pulse, and glow remain visible but radial expansion freezes at scale 1 under Reduced Motion.
- Reduced Flash continues to control alpha, not Motion state.

## Phase 1907 — Ambient / Runtime Motion Scale
- Presentation Runtime now separates lifetime progression from positional motion.
- Reduced Motion sets particle displacement scale to 0 while TTL cleanup continues normally.
- Death-burst decorative radius expansion becomes steady instead of growing.
- Map ambient particle velocities are zeroed without removing the particles or map identity.

## Phase 1908 — Kill Chain + Death Afterglow
- Kill-chain screen pulses remain visible but stop radial expansion under Reduced Motion.
- Enemy death burst and afterglow particle velocities become 0.
- Boss settle drift is also stopped while color, count, TTL, and identity remain unchanged.

## Phase 1909 — Boss Phase Transition
- Boss health-pressure transition pulses remain visible but steady.
- Phase-change shockwaves/pulses use the common static radius path under Reduced Motion.
- Phase telegraphs, HP thresholds, special cadence, damage, and Boss Assist are unchanged.

## Phase 1910 — Ultimate / Final Form / Environment Motion
- Meteor/Black Hole aftermath rings remain visible with static radius.
- Ultimate aftermath particle velocity becomes 0.
- Final Form Flow impact particles and map combat-reaction particles become stationary.
- Map evolution and terrain-destruction debris remain visible but do not travel.
- Shared `cosmeticMotionScale()` / `cosmeticMotionVelocity()` keep all presentation-only paths consistent.

## Twelve Functional Paths Covered
1. persisted Reduced Motion setting
2. OS reduced-motion default
3. legacy settings migration
4. boss opening entrance radius motion
5. map ambient drift
6. kill-chain cinematic pulse motion
7. enemy death afterglow drift
8. boss phase-transition motion
9. ultimate aftermath particles
10. ultimate aftermath rings / Final Form environmental reaction
11. map evolution / destruction debris
12. common Presentation Runtime positional motion scale

## Phase 1911 — 64-Sample Deterministic Audit
`auditReducedMotionAccessibility()` locks:
- twelve functional paths
- four independent setting contexts across each motion path
- system defaults and legacy migration
- normal-motion preservation
- Flash independence
- Shake independence
- Reduced Motion maximum velocity: 0
- Reduced Motion radial expansion delta: 0
- transient cleanup remains bounded
- Actions: 9/9
- RunSnapshot schema mutation: false
- total samples: 64

## Phase 1912 — Release Fail-Closed
Release Freeze now binds:
- `reducedMotionAccessibilityPassed`
- `reducedMotionAccessibilitySamples`

Candidate consistency requires lower-level Reduced Motion evidence and Candidate signature includes the sample count.
- forged lower evidence false + top-level release PASS => Candidate REVIEW (`release-freeze`)
- sample-count mutation => Candidate signature changes

## Verification
- Dedicated Phase tests: 12/12 PASS
- Focused presentation/accessibility/boss/map/death/ultimate regression: 42/42 PASS
- Full regression: 436 test files / 1,670 tests / 1,670 PASS
- Fresh TypeScript build: PASS
- Release Freeze: PASS · reduced-motion safe (64)
- Candidate: PASS · `RCQ-8D6AD15C`
- Forged Reduced Motion evidence: REVIEW (`release-freeze`)
- Sample-count mutation signature: `RCQ-D986778B`
- Actions: 9/9
- Snapshot schema mutation: false

## Asset Delta
- New image files: 0
- Existing art remains unchanged.
- This pass intentionally uses code-level motion suppression because adding more art would not reduce player confusion or motion burden.

## Frozen Systems
No changes to enemy/boss spawn cadence, AI, HP, damage, healing, potion behavior, AUTO targeting, spell damage/cooldowns, weakpoints, boss cadence, economy, audio scheduling, haptic patterns, snapshot payload schema, input geometry, or the nine combat Actions.
