# Phase 2375-2382 Handoff — Boss Pressure Hidden Threat Count

## Baseline provenance
- Delivery baseline: `arcane-last-stand-phase2374-full-merged.zip`
- Reconstructed local baseline main: `9841dbfb4fc2abd60b4a33e4051d0a70168ac3f6`
- This SHA is reconstructed local Git provenance, not original upstream history.

## Scope
Phase2367-2374 reserves both visible pressure chips for threats when multiple threats exist, but with three or four simultaneous threats the player still cannot tell that additional danger is hidden by the two-chip cap. This pass remains presentation-only: the existing two chips stay unchanged and a compact same-line `+1 위험` / `+2 위험` overflow badge appears only when more visible threats exist than the two shown slots.

### Phase 2375~2377 — Hidden Threat Metadata
- Final applied pressure projection now exposes `visibleThreatCount`, `hiddenThreatCount`, and `hiddenThreatLabel`.
- Three visible threats → two threat chips + `+1 위험`.
- Four visible threats → two threat chips + `+2 위험`.
- Zero, one, or two visible threats → no overflow badge.
- Existing 1% threshold, threat semantics, strongest-threat ordering, and max-two primary effect contract remain unchanged.

### Phase 2378~2379 — Same-Line HUD Integration
- The existing boss pressure recall line reuses its two current pressure chips.
- Hidden threat count is drawn as one compact 40px badge on the same line; no new row, modal, input, animation, audio, haptic, or image asset is added.
- Existing pressure atlas, critical/Last Law/boss-special suppression, and semantic `위험/기회` text remain intact.

### Phase 2380~2381 — 64-Sample Hidden Threat Audit
- 16 three-threat cases.
- 16 four-threat cases.
- 16 compatibility cases.
- 16 invariants.
- Locks hidden count/label, max-two, atlas reuse, new atlas count 0, Actions 9/9, Snapshot mutation false, and gameplay formula mutation false.

### Phase 2382 — Release Freeze / Candidate Binding
- Adds `bossEffectivePressureHiddenThreatCountPassed/Samples` to Release Freeze.
- Candidate fails closed on forged false evidence.
- Candidate signature binds the 64-sample count.
- Candidate markdown includes `boss-effective-pressure-hidden-threat-count safe (64)`.

## Gameplay freeze evidence
The presentation file `src/game/game.ts` changes only in `drawBossEffectivePressureRecall()`. The actual `endlessBossEncounterModifiers()` method remains byte-identical to the Phase2374 baseline:
- `Game.endlessBossEncounterModifiers()` SHA256 `de0334bed4b7749c05cecd3d2a2d7a87863abc195eddb585f70a3986f9a95ae1`

Other frozen files remain byte-identical:
- `src/game/boss-encounters.ts` SHA256 `0e857a194d5c887c62194672540e375b952783f01fe8124d234a278f892c1dce`
- `src/game/endless/mythic-safe-zone-pressure.ts` SHA256 `979e5b8422ce23c5ea261f33aa30f9233c7b2c96aa6431e457b568becbf6eea6`
- `src/game/endless/nemesis.ts` SHA256 `e6baaf39af91a0532c4eaaa30ffd47d97ea3b625d628b9240b76e53de3a88ad4`
- `src/game/endless/snapshot.ts` SHA256 `9e1b6cb99ea51a2062cc6caa7189b43c55e44fe0d05dbf77e7e21c179451ad02`
- `assets/ui/mythic-safe-zone-pressure-effect-icons.png` SHA256 `76866f6268bad824bf6f0706fb567a7f5a80a4da80981b6cb7bebea7eddcd576`

Combat formulas, encounter multipliers, SAFE/Nemesis formulas, economy, input, audio/haptic, Actions 9/9, image assets, and RunSnapshot schema are unchanged.

## TDD / regression
New tests:
- `tests/phase2375-2377-boss-effective-pressure-hidden-threat-count.test.mjs`
- `tests/phase2378-2379-boss-effective-pressure-hidden-threat-integration.test.mjs`
- `tests/phase2380-2381-boss-effective-pressure-hidden-threat-audit.test.mjs`
- `tests/phase2382-boss-effective-pressure-hidden-threat-release-gate.test.mjs`

TDD evidence:
- RED: 9 expected new-contract failures.
- GREEN: new contract 9/9 PASS.
- Related Phase2335-2382 regression: 61/61 PASS.
- Full worktree regression: 687 test files / 2,180 tests / 2,180 PASS / 0 FAIL.

Quality gates:
- Candidate: `RCQ-B20EDCF2` PASS
- Release: `RQ-D4630257` PASS
- Raster: 5/5 PASS
  - 16:9 `RR-FE2C6B74`
  - 20:9 `RR-0937F125`
  - 4:3 `RR-4C84B218`
  - foldable `RR-023FFC4B`
  - 32:9 `RR-737044D6`

## Packaging
After commit and fast-forward merge, rerun merged-main full regression and Candidate/Release/Raster gates. Build fresh `dist`, create deterministic Phase2382 full merged ZIP excluding `.git/.worktrees/node_modules`, compare two independently generated archive bytes, extract independently, and run packaged HTTP/runtime plus new/checkpoint/resume verification.
