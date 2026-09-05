# Phase 2359-2366 Handoff — Boss Pressure Threat Retention

## Baseline provenance
- Delivery baseline: `arcane-last-stand-phase2358-full-merged.zip`
- Reconstructed local baseline main: `510259a8f4ee8be0a0b8ed82c053ccbbdf1fab91`
- This SHA is reconstructed local Git provenance, not original upstream history.

## Scope
The Phase2351-2358 HUD explains `위험/기회`, but its max-two selection still used absolute magnitude only. Two large opportunities could therefore hide a smaller visible threat. This pass changes presentation salience only: if any >=1% threat exists, the strongest threat owns one of the two existing slots; the second slot is the strongest remaining visible effect. With no threat, the prior magnitude ordering is preserved.

### Phase 2359-2361 — Threat-Preserving Salience
- Existing four final applied modifier channels remain unchanged.
- Visible effects are still filtered at 1% and capped at two.
- If at least one threat is visible, the strongest threat is placed first.
- The second slot uses the strongest remaining effect, regardless of threat/opportunity.
- No-threat states preserve prior magnitude/source-order behavior.

### Phase 2362-2363 — Existing HUD Contract
- No new row, chip count, input, modal, animation, audio, haptic, or image atlas.
- Existing pressure atlas and explicit `위험/기회` text are reused.
- Existing hero/core critical, boss-special <=1.2s, and Mythic Last Law suppression remain unchanged.

### Phase 2364-2365 — 64-Sample Threat-Retention Audit
- 24 mixed threat/opportunity cases.
- 12 threat-only cases.
- 12 opportunity-only cases.
- 16 invariants.
- Locks threat retention, max-two, no-threat compatibility, stable tie order, atlas reuse, new atlas count 0, Actions 9/9, Snapshot mutation false, and gameplay formula mutation false.

### Phase 2366 — Release Freeze / Candidate Binding
- Adds `bossEffectivePressureThreatRetentionPassed/Samples` to Release Freeze.
- Candidate fails closed if the evidence is forged false.
- Candidate signature binds the 64-sample count.
- Candidate markdown includes `boss-effective-pressure-threat-retention safe (64)`.

## Gameplay freeze evidence
The following Phase2358 baseline files remain byte-identical:
- `src/game/game.ts` SHA256 `1e0c6d8071816e9645c01528c68c0b4397c16d8c0e1bca4b2e23b25ea0b82b8e`
- `src/game/boss-encounters.ts` SHA256 `0e857a194d5c887c62194672540e375b952783f01fe8124d234a278f892c1dce`
- `src/game/endless/mythic-safe-zone-pressure.ts` SHA256 `979e5b8422ce23c5ea261f33aa30f9233c7b2c96aa6431e457b568becbf6eea6`
- `src/game/endless/nemesis.ts` SHA256 `e6baaf39af91a0532c4eaaa30ffd47d97ea3b625d628b9240b76e53de3a88ad4`
- `src/game/endless/snapshot.ts` SHA256 `9e1b6cb99ea51a2062cc6caa7189b43c55e44fe0d05dbf77e7e21c179451ad02`
- `assets/ui/mythic-safe-zone-pressure-effect-icons.png` SHA256 `76866f6268bad824bf6f0706fb567a7f5a80a4da80981b6cb7bebea7eddcd576`

Combat formulas, encounter multipliers, SAFE/Nemesis formulas, economy, input, audio/haptic, Actions 9/9, image assets, and RunSnapshot schema are unchanged.

## TDD / regression
New tests:
- `tests/phase2359-2361-boss-effective-pressure-threat-retention.test.mjs`
- `tests/phase2362-2363-boss-effective-pressure-threat-retention-integration.test.mjs`
- `tests/phase2364-2365-boss-effective-pressure-threat-retention-audit.test.mjs`
- `tests/phase2366-boss-effective-pressure-threat-retention-release-gate.test.mjs`

TDD evidence:
- RED: 6 expected new-contract failures; 3 existing invariant checks already passed.
- GREEN: related Phase2343-2366 regression 24/24 PASS.
- Full worktree regression: 679 test files / 2,162 tests / 2,162 PASS / 0 FAIL.

Quality gates:
- Candidate: `RCQ-2E9F467E` PASS
- Release: `RQ-D4630257` PASS
- Raster: 5/5 PASS
  - 16:9 `RR-FE2C6B74`
  - 20:9 `RR-0937F125`
  - 4:3 `RR-4C84B218`
  - foldable `RR-023FFC4B`
  - 32:9 `RR-737044D6`

## Packaging
After commit and fast-forward merge, rerun merged-main full regression and Candidate/Release/Raster gates. Build fresh `dist`, create deterministic Phase2366 full merged ZIP excluding `.git/.worktrees/node_modules`, compare two independently generated archive bytes, extract independently, and run packaged HTTP/runtime plus new/checkpoint/resume verification.
