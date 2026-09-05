# Phase 1921~1928 Handoff — Build Identity Asset Integration

## Scope
This bounded pass adds one shared visual identity atlas for the 14 relics and 6 spell fusions, then reuses it across six existing surfaces without changing build mechanics.

### Phase 1921 — Build Identity Atlas
- Added `assets/ui/build-identity-icons.png`
- 20 unique cells: 14 relics + 6 fusions
- 5×4 atlas, 96px cells, 480×384
- Presentation only; no animation or motion

### Phase 1922 — Boss Reward Choice Identity
- Concrete relic/fusion reward cards now use their own icon instead of the generic relic/fusion mark
- Existing action atlas remains reused for the six spell growth choices
- Text and generic radial fallback remain intact

### Phase 1923 — Active Build HUD Strip
- The live combat HUD reuses the same atlas for the equipped relic and up to two equipped fusions
- Atlas load is asynchronous and non-blocking
- If the asset is unavailable the existing build text remains unchanged

### Phase 1924 — Run Result Build Identity
- Run results now show the equipped relic/fusions as compact visual anchors
- Run Code and Build Capsule remain text-first for copying/comparison

### Phase 1925 — Recent Run Identity
- The lobby decodes a valid recent Build Capsule and shows relic/fusion icons beside the recent run
- Malformed/missing capsules still use the previous text-only rendering

### Phase 1926 — Resume Identity
- Resume Snapshot relic/fusions are shown beside the Continue control
- Resume data, persistence schema, and restore logic are unchanged

### Phase 1927 — Deterministic Asset Audit
- 40 samples: 20 reward-choice + 20 persistent-build samples
- atlas coverage 100%
- unique cells 20/20
- motion amplitude 0
- text fallback preserved 100%
- Actions 9/9
- Snapshot schema mutation false

### Phase 1928 — Release Fail-Closed
- Added `buildIdentityAssetsPassed`
- Added `buildIdentityAssetsSamples`
- Release Freeze requires the new evidence
- Candidate signature binds the 40-sample count
- Forged lower-level evidence causes Candidate REVIEW

## Frozen gameplay surfaces
No changes to relic/fusion eligibility, modifiers, RNG, boss rewards, spell damage, HP, cooldowns, economy, enemy/boss cadence, audio/haptics, 9 Actions, or RunSnapshot schema.

## Verification
- Core regression: 1,438 / 1,438 PASS
- Release regression: 246 / 246 PASS
- Total: 1,684 / 1,684 PASS across 444 test files
- Release Candidate: PASS
- Candidate signature: `RCQ-4CBB3AF8`
- Release Freeze: `build-identity-assets safe (40)`
