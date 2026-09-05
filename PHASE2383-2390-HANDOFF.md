# Phase 2383-2390 Handoff — Mythic Tactic Attack-Link Effect Projection

## Baseline provenance
- Delivery baseline: `arcane-last-stand-phase2382-full-merged.zip`
- Reconstructed local baseline main: `69f3ab0457c3a5c2714351c85ec1e020e6159639`
- This SHA is reconstructed local Git provenance, not original upstream history.

## Scope
The Mythic Tactic primed icon already tells the player that the next matching special will be modified, but the player still has to remember what each of the six tactic profiles actually changes. This pass remains presentation-only: it reads the already-created one-shot `MythicTacticAttackLink`, projects its five authoritative multipliers, and shows only the two largest visible effects beside the existing boss-local tactic identity.

### Phase 2383~2384 — Authoritative Link Projection
- New `mythic-tactic-attack-link-projection.ts` reads the active link through `activeMythicTacticAttackLink()` rather than duplicating profile coefficients.
- Five channels: projectile count, summon count, dash distance, time-warp pressure, next special cadence.
- Percent labels are derived directly from the stored multipliers.
- Effects below 1% stay out of the primary recall.
- At most two primary effects are selected by absolute magnitude with deterministic source-order tie breaking.
- Expired, consumed, or archetype-mismatched links fail closed to `null`.

### Phase 2385~2387 — Boss-Local Effect Recall
- Existing Mythic Tactic icon remains the identity anchor above the matching Mythic boss.
- Up to two compact same-area text chips are drawn with labels such as `탄막 -24%`, `소환 -30%`, `시간압박 -28%`, or `다음주기 +22%`.
- Existing atlas is reused; no new image asset, HUD row, input, animation, audio, or haptic path is added.
- Text still renders if the atlas image is unavailable, preserving a gameplay-safe fallback.

### Phase 2388~2389 — 64-Sample Projection Audit
- 30 source-accuracy cases: 6 archetypes × 5 stored multipliers.
- 6 top-two deterministic ordering cases.
- 24 lifecycle cases: active / expired / consumed / mismatch for all six archetypes.
- 4 invariants: existing atlas reuse, Actions 9/9, Snapshot frozen, gameplay formulas frozen.
- Total: 64 deterministic samples.

### Phase 2390 — Release Freeze / Candidate Binding
- Adds `mythicTacticAttackLinkProjectionPassed/Samples` to Release Freeze.
- Candidate fails closed on forged false evidence.
- Candidate signature binds the 64-sample count.
- Candidate markdown includes `mythic-tactic-attack-link-projection safe (64)`.

## Gameplay freeze evidence
The authoritative tactic profile and its actual enemy-special application remain unchanged:
- `src/game/endless/mythic-tactic-attack-link.ts` SHA256 `281f0dbe6b43908839db98eeec37d5b5b3be81744eadcdb3ebacf3b2a2b19511`
- `src/game/enemies.ts` SHA256 `4d06fea32d10c86890a54c7ca0ec028ff0febe371f20ed416863ee76c950b0ce`
- `src/game/endless/snapshot.ts` SHA256 `9e1b6cb99ea51a2062cc6caa7189b43c55e44fe0d05dbf77e7e21c179451ad02`
- `assets/ui/mythic-tactic-icons.png` SHA256 `de230dfcf39b5d1467000a7c5afb3418319b323927a14a5b70fc87553bec621d`

Combat formulas, link coefficients, one-shot consume timing, economy, input, audio/haptic, Actions 9/9, image assets, and RunSnapshot schema are unchanged.

## TDD / regression
New tests:
- `tests/phase2383-2384-mythic-tactic-link-effect-projection.test.mjs`
- `tests/phase2385-2387-mythic-tactic-link-effect-integration.test.mjs`
- `tests/phase2388-2389-mythic-tactic-link-effect-audit.test.mjs`
- `tests/phase2390-mythic-tactic-link-effect-release-gate.test.mjs`

TDD evidence:
- RED: 8 expected new-contract failures, 1 existing safety contract PASS.
- GREEN: new contract 9/9 PASS.
- Related Mythic Tactic / recent boss pressure regression: 34/34 PASS.
- Full worktree regression: 691 test files / 2,189 tests / 2,189 PASS / 0 FAIL.

Quality gates:
- Candidate: `RCQ-F2FDA0B4` PASS
- Release: `RQ-D4630257` PASS
- Raster: 5/5 PASS
  - 16:9 `RR-FE2C6B74`
  - 20:9 `RR-0937F125`
  - 4:3 `RR-4C84B218`
  - foldable `RR-023FFC4B`
  - 32:9 `RR-737044D6`

## Packaging
After commit and fast-forward merge, rerun merged-main full regression and Candidate/Release/Raster gates. Build fresh `dist`, create deterministic Phase2390 full merged ZIP excluding `.git/.worktrees/node_modules`, compare two independently generated archive bytes, extract independently, and run packaged HTTP/runtime plus new/checkpoint/resume verification.
