# Phase 1913~1920 Handoff — Reduced Motion Live Combat Propagation

## Execution Scope
This pass propagates the independent `reducedMotion` setting through live combat HUD/attention motion. `FLASH LOW + MOTION ON` preserves motion while reducing brightness, and `FLASH ON + MOTION LOW` preserves all gameplay information while removing animation. Combat balance, AI, cadence, economy, audio, haptics, 9 Actions, and RunSnapshot schema remain frozen.

## Phase 1913 — Primary Combat Attention
- `CombatAttentionInput` now accepts explicit `reducedMotion`.
- Hero critical and core critical warnings remain visible but stop pulse animation under Motion LOW.
- Boss countdown remains visible but becomes steady under Motion LOW.
- Damage-critical / damage-heavy priority ordering remains unchanged and their text feedback remains steady.
- Legacy callers that omit `reducedMotion` retain the prior Reduced Flash behavior for compatibility.

## Phase 1914 — Opening Prep + Target Guidance
- Boss opening-prep ring motion now obeys Motion LOW while labels/actions remain available.
- AUTO target ring and boss weakpoint ring use explicit Motion state instead of Flash state.
- `FLASH LOW + MOTION ON` continues to animate target guidance; `MOTION LOW` forces amplitude 0.

## Phase 1915 — Battlefield Objective
- Battlefield objective marker motion now accepts `reducedMotion`.
- Objective ring, icon, name, progress, HP/time, activation and reward logic remain visible/unchanged.
- Motion LOW only freezes scale pulse.

## Phase 1916 — Secondary Combat Motion
- Boss hazard, priority threat, supply crate, field node, freeze status, and core ambient arbitration now use explicit Motion state.
- Existing single-owner priority is preserved.
- Motion LOW returns owner `none` and amplitude 0 while all six visual signals remain rendered.

## Phase 1917 — Residual Combat Motion
- Black Hole vortex, terrain crystal, golden enemy, bomber body, and Final Form Flow motion now use explicit Motion state.
- Existing residual owner priority and Secondary/Combat Attention suppression remain unchanged.

## Phase 1918 — Boss Assist / Ultimate Ready
- `actionCuePresentation()` now accepts explicit `reducedMotion`.
- Boss Assist and opening prep outer rings remain visible and labeled but steady under Motion LOW.
- Ultimate READY outer ring remains visible but steady under Motion LOW.
- Reduced Flash no longer suppresses motion when explicit Motion ON is supplied.

## Phase 1919 — Boss Health Pressure Envelope
- `bossPressureEnvelope()` accepts `reducedMotion` independently from Reduced Flash.
- Motion LOW produces a steady edge/glow/line-width envelope instead of a sinusoidal pressure pulse.
- Reduced Flash still controls intensity only.

## Phase 1920 — 80-Sample Audit + Release Fail-Closed
`auditReducedMotionLiveCombat()` locks 80 deterministic samples covering:
- hero critical
- core critical
- critical damage priority
- heavy damage priority
- boss response primary
- boss countdown
- opening boss prep
- AUTO target
- boss weakpoint
- battlefield objective
- all six Secondary Motion owners
- all five Residual Motion owners
- Boss Assist outer ring
- Ultimate READY outer ring
- boss health-pressure envelope
- four Flash/Motion combinations

Current evidence:
- samples: 80/80
- Reduced Motion max amplitude: 0
- Flash-only motion preserved: true
- Motion LOW visibility coverage: 100%
- Secondary owner coverage: 100%
- Residual owner coverage: 100%
- Actions: 9/9
- RunSnapshot schema mutation: false

Release Freeze binds:
- `reducedMotionLiveCombatPassed`
- `reducedMotionLiveCombatSamples`

Candidate fail-closed verification:
- forged lower evidence false + top-level release PASS => Candidate REVIEW (`release-freeze`)
- sample count mutation => Candidate signature changes

## Verification
- New Phase tests: 8/8 PASS
- Focused legacy Attention / Countdown / Target / Secondary / Residual / Reduced Motion regression: 40/40 PASS
- Full regression: 440 test files / 1,678 tests / 1,678 PASS
- Fresh TypeScript build: PASS
- Release Freeze: PASS · `reduced-motion-live-combat safe (80)`
- Candidate: PASS · `RCQ-0379C51C`
- Forged evidence: REVIEW (`release-freeze`)
- Sample-count mutation signature: `RCQ-09944E4B`
- Actions: 9/9
- Snapshot schema mutation: false

## Asset Delta
- New image files: 0
- Existing image atlases are unchanged.
- This pass is code-level accessibility propagation; adding art would not improve usability here.

## Frozen Systems
No changes to enemy/boss spawn cadence, enemy/boss AI, HP, damage, healing, potion behavior, AUTO target selection, spell damage/cooldowns, weakpoint mechanics, boss cadence, economy, audio scheduling, haptic patterns, input geometry, RunSnapshot payload schema, or the nine combat Actions.
