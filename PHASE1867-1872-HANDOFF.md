# Phase 1867~1872 Handoff — Decision Identity Assets

## Scope

This is a double-workload visual pass with only six phase numbers. It upgrades two existing decision flows at once without changing choice generation or gameplay values.

## Phase 1867 — Run Trait / Fate Path Identity
- Added `assets/ui/decision-path-icons.png`.
- Atlas: 384×288, 4×3, 96px cells.
- Covers 8 Run Traits and 3 Fate Paths, 11/11 unique identities.
- `src/game/decision-path-icon-assets.ts` owns deterministic cell mapping and CSS presentation metadata.
- Existing radial `trait-mark` remains as a second-layer fallback.
- Desktop 52px / compact landscape 40px.
- No animation, pulse, audio, haptic, or loading gate.

## Phase 1868 — Level-Up / Boss Reward Identity
- Added `assets/ui/growth-choice-icons.png`.
- Atlas: 384×192, 4×2, 96px cells.
- Covers 5 generic stat growth identities plus Relic and Fusion.
- The six spell/ultimate growth identities reuse `assets/ui/action-icons.png`; no duplicated spell art is added.
- `src/game/growth-choice-icon-assets.ts` maps Upgrade/Reward IDs to either the new growth atlas or the existing action atlas.

## Phase 1869 — UI Integration / Fallback
- Trait and Fate cards now show their specific static icons.
- Level-Up and Boss Reward cards now retain an icon even when a recommendation badge is present.
- Existing title, description, hint, recommendation, card order, and callbacks are unchanged.
- Unknown/unsupported decision card types continue using the original generic radial icon.
- Failed PNG loads preserve the radial fallback and all text.

## Phase 1870 — Combined Deterministic Audit
`auditDecisionChoiceAssets()` locks 32 samples:
- path coverage 11/11
- path unique cells 11/11
- growth coverage 7/7
- growth unique cells 7/7
- 6/6 spell growth choices reuse the existing action atlas
- motion amplitude 0
- text fallback preserved
- choice logic mutation false
- Snapshot schema mutation false
- desktop/mobile icon sizes bounded

## Phase 1871 — Release Fail-Closed
- Added `decisionChoiceAssetsPassed` / `decisionChoiceAssetsSamples` to Release Freeze.
- Candidate consistency requires the child evidence to pass even if a caller forges top-level `passed=true`.
- Candidate signature binds the 32-sample count.
- Candidate markdown includes `decision-choice-assets safe (32)`.

## Phase 1872 — Package
- Full source ZIP includes both new atlases, source modules, tests, README update, and this handoff.

## Frozen behavior
- Run Trait bonuses and mastery unlock rules
- Fate modifiers, checkpoints, accumulation, and cap rules
- Level-Up choice pool/RNG/order
- Boss Reward choice pool/RNG/order and guidance
- Relic and Fusion mechanics
- Combat stats, enemy/boss cadence, cooldowns, economy
- 9 Actions
- audio/haptics
- RunSnapshot schema

## Verification
- New Phase tests: 11/11 PASS
- Targeted decision/regression suite: 55/55 PASS
- Full regression: 417 test files, 1,614/1,614 PASS
- Release Candidate: PASS
- Candidate signature: `RCQ-646FA25F`
- Release Freeze evidence: `decision-choice-assets safe (32)`
- New atlas sizes: decision-path 54,726 bytes; growth-choice 39,695 bytes
