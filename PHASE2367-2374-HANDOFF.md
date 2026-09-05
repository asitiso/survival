# Phase 2367-2374 Handoff — Boss Pressure Multi-Threat Priority

## Baseline provenance
- Delivery baseline: `arcane-last-stand-phase2366-full-merged.zip`
- Reconstructed local baseline main: `f51dc8f930a27df66558beccb378c5901d21795f`
- This SHA is reconstructed local Git provenance, not original upstream history.

## Scope
Phase2359-2366 guaranteed at least one visible threat, but with two or more simultaneous threats the second slot could still be consumed by a larger opportunity. This pass remains presentation-only: if two or more >=1% threats are visible, both existing slots are reserved for the two strongest threats. With exactly one threat, Phase2359 behavior remains `threat + strongest remaining`; with no threat, prior magnitude ordering remains unchanged.

### Phase 2367-2369 — Multi-Threat Salience
- Two or more threats: choose the two strongest threats by magnitude.
- Stable source-order tie break remains `special-cadence / summon-pressure / dash-distance / boss-vulnerability`.
- One threat: preserve `threat + strongest remaining`.
- No threat: preserve prior magnitude order.
- 1% visibility threshold and two-chip cap remain unchanged.

### Phase 2370-2371 — Existing HUD Contract
- Existing pressure atlas, semantic `위험/기회` text, layout, attention suppression, and max-two chip contract are reused.
- No new row, input, animation, audio, haptic, modal, or image atlas.

### Phase 2372-2373 — 64-Sample Multi-Threat Audit
- 24 two-threat cases.
- 12 three-threat cases.
- 12 compatibility cases.
- 16 invariants.
- Locks dual-threat retention, strongest-threat ordering, one/no-threat compatibility, max-two, atlas reuse, new atlas count 0, Actions 9/9, Snapshot mutation false, and gameplay formula mutation false.

### Phase 2374 — Release Freeze / Candidate Binding
- Adds `bossEffectivePressureMultiThreatPriorityPassed/Samples` to Release Freeze.
- Candidate fails closed on forged false evidence.
- Candidate signature binds the 64-sample count.
- Candidate markdown includes `boss-effective-pressure-multi-threat-priority safe (64)`.

## Compatibility note
Three older presentation fixtures were narrowed from multi-threat samples to one-threat samples so their original contracts remain meaningful after the new salience policy:
- Phase2344: magnitude ordering compatibility when the multi-threat override does not apply.
- Phase2352: numeric/semantic label compatibility with one visible threat.
- Phase2360: `threat + strongest remaining` compatibility when exactly one threat exists.

## Gameplay freeze evidence
The following Phase2366 baseline files remain byte-identical:
- `src/game/game.ts` SHA256 `1e0c6d8071816e9645c01528c68c0b4397c16d8c0e1bca4b2e23b25ea0b82b8e`
- `src/game/boss-encounters.ts` SHA256 `0e857a194d5c887c62194672540e375b952783f01fe8124d234a278f892c1dce`
- `src/game/endless/mythic-safe-zone-pressure.ts` SHA256 `979e5b8422ce23c5ea261f33aa30f9233c7b2c96aa6431e457b568becbf6eea6`
- `src/game/endless/nemesis.ts` SHA256 `e6baaf39af91a0532c4eaaa30ffd47d97ea3b625d628b9240b76e53de3a88ad4`
- `src/game/endless/snapshot.ts` SHA256 `9e1b6cb99ea51a2062cc6caa7189b43c55e44fe0d05dbf77e7e21c179451ad02`
- `assets/ui/mythic-safe-zone-pressure-effect-icons.png` SHA256 `76866f6268bad824bf6f0706fb567a7f5a80a4da80981b6cb7bebea7eddcd576`

Combat formulas, encounter multipliers, SAFE/Nemesis formulas, economy, input, audio/haptic, Actions 9/9, image assets, and RunSnapshot schema are unchanged.

## TDD / regression
New tests:
- `tests/phase2367-2369-boss-effective-pressure-multi-threat-priority.test.mjs`
- `tests/phase2370-2371-boss-effective-pressure-multi-threat-integration.test.mjs`
- `tests/phase2372-2373-boss-effective-pressure-multi-threat-audit.test.mjs`
- `tests/phase2374-boss-effective-pressure-multi-threat-release-gate.test.mjs`

TDD evidence:
- RED: 6 expected new-contract failures; 3 compatibility/invariant checks already passed.
- GREEN: related regression 28/28 PASS after superseded fixture narrowing.
- Full worktree regression: 683 test files / 2,171 tests / 2,171 PASS / 0 FAIL.

Quality gates:
- Candidate: `RCQ-09979A68` PASS
- Release: `RQ-D4630257` PASS
- Raster: 5/5 PASS
  - 16:9 `RR-FE2C6B74`
  - 20:9 `RR-0937F125`
  - 4:3 `RR-4C84B218`
  - foldable `RR-023FFC4B`
  - 32:9 `RR-737044D6`

## Packaging
After commit and fast-forward merge, rerun merged-main full regression and Candidate/Release/Raster gates. Build fresh `dist`, create deterministic Phase2374 full merged ZIP excluding `.git/.worktrees/node_modules`, compare two independently generated archive bytes, extract independently, and run packaged HTTP/runtime plus new/checkpoint/resume verification.
