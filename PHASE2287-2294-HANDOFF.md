# Phase 2287~2294 Handoff — Generic Upgrade Effective Gain + Cap Awareness Integration

## Provenance
- Input delivery: `arcane-last-stand-phase2286-full-merged.zip`
- Input delivery archive comment: `21e01a4da3bb6ab93c9482a80f6bd916140ce5a4`
- Upstream `.git` was not present in the delivery ZIP.
- Reconstructed-local baseline only: `e6480a3a06a4e34542a55589ee92dfba6d3a8a69`
- Local SHA values in this handoff are reconstruction evidence, not upstream repository SHAs.

## Scope
### Phase 2287 — Effective Gain Status Atlas
- `assets/ui/generic-upgrade-gain-status-icons.png`
- 288×96 / 3×1 / cell 96×96
- identities: `full`, `diminished`, `capped`
- labels: 정상 효율 / 감소 효율 / 상한 도달
- 3/3 pixel-unique
- static only; gameplay never blocks on asset load
- SHA256: `70635e521b1f2e40e55ed780938a726e4404df2b38451b632adc919dded549a4`

### Phase 2288 — Existing Growth Identity Reuse
- Existing growth-choice stat icons remain the stat identity.
- No duplicate maxHP/move/spell-power/cooldown/pickup atlas was added.

### Phase 2289 — Authoritative Shadow Projection
- New `generic-upgrade-effective-projection.ts`.
- Calls the existing frozen `applyUpgrade()` against a shadow Hero.
- Live Hero is not mutated.
- Supported generic upgrades: maxHp / moveSpeed / spellPower / cooldown / pickupRadius.

### Phase 2290 — Cooldown Floor Truthfulness
- Existing cooldown gameplay remains `Math.max(0.55, cooldownMultiplier * 0.94)`.
- 1.000× → 0.940× reports full -6.0%.
- 0.560× → 0.550× reports diminished -1.8%.
- 0.550× → 0.550× reports cap reached instead of claiming another -6%.

### Phase 2291 — Level-Up Card Integration
- Generic stat choices receive one gain-status secondary identity plus real before→after hint.
- Existing opening/midgame recommendation badge/hint remains and is appended after the authoritative projection.
- Spell choices retain the Phase 2263~2270 Spell Evolution path and its existing three-icon contract.
- No `secondaryIdentityLimit` expansion.

### Phase 2292~2293 — Deterministic Audit
- `generic-upgrade-effective-projection-identity-audit.ts`
- exactly 60 samples
  - 5 generic upgrades × 10 deterministic Hero states = 50 runtime projections
  - 10 frozen contracts
- Covers `full`, `diminished`, and `capped`.
- Confirms live Hero mutation false, Actions 9/9, snapshot/gameplay presentation-only flags.

### Phase 2294 — Release Freeze / Candidate Binding
- Release Freeze fail-closed evidence:
  - `genericUpgradeEffectiveProjectionIdentityAssetsPassed`
  - `genericUpgradeEffectiveProjectionIdentityAssetsSamples`
- Candidate consistency requires the new pass flag.
- Candidate signature binds both pass flag and sample count.
- Candidate markdown reports `generic-upgrade-effective-projection-identity-assets safe (60)`.

## Gameplay Freeze
Unchanged:
- `src/game/upgrades.ts`
- `src/game/endless/snapshot.ts`
- `src/game/growth-choice-icon-assets.ts`
- `src/ui/levelup.ts`
- max HP +42 and immediate +42 heal
- move speed ×1.075
- spell power ×1.12
- cooldown `max(0.55, x * 0.94)`
- pickup radius +28
- level-up choice count 3
- Actions 9/9
- snapshot schema unchanged

## TDD
RED first:
- 11 focused tests: 9 failed because new modules/integration/release evidence did not exist; 2 frozen-contract tests passed.
GREEN:
- focused 11/11 PASS.
- adjacent upgrade + guidance + spell-evolution regression: 42/42 PASS.

## Full Regression — feature worktree
- 643 test files
- 2,058 tests
- 2,058 PASS
- 0 FAIL

## Quality Gates — feature worktree
- Candidate: `RCQ-6AD9A6B9` PASS
- Release Quality: `RQ-D4630257` PASS
- Raster: 5/5 PASS
  - 16:9 `RR-FE2C6B74`
  - 20:9 `RR-0937F125`
  - 4:3 `RR-4C84B218`
  - foldable `RR-023FFC4B`
  - 32:9 `RR-737044D6`
- baseline auto-update disabled

## Packaging Rule
Because reconstructed Git ignores generated `dist/`, final delivery packaging must include a fresh built `dist/` explicitly while excluding `.git` and `node_modules`. Use deterministic metadata, generate twice, compare SHA256, run `unzip -t`, then independently re-extract and verify build/focused/Candidate/Release/Raster/HTTP 9/9/run-cycle.
