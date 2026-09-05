# Arcane Last Stand — Phase 283~302 Handoff

## 1. Source lineage and recovery note

During the Phase 283 session the runtime copy of `/mnt/data/arcane-merge` lost its Git metadata. The Phase 282 full-source archive remained available and was revalidated before any new product code was written:

- archive: `/mnt/data/arcane-last-stand-phase282-full-merged.zip`
- SHA-256: `c799166c46c60b536915dc4c7574e4dc9565a17eb7f520caa7570269eb3eafa7`
- ZIP integrity: clean
- archive comment original revision: `f6b52290bdb7b8489aeae24f4f1a50d2a440d672`
- reconstructed local baseline commit: `94068a0 chore: restore verified phase 282 source`

The reconstructed commit hash is not the original Phase 282 Git history. It is a new local Git baseline made from the verified Phase 282 source archive. Source lineage is therefore the original archive/revision above.

## 2. Phase 283~286 — Tactic Link Success Feedback

New module: `src/game/endless/mythic-tactic-link-feedback.ts`.

`EnemyManager` now passes the consumed Mythic archetype through `onMythicTacticAttackLinkConsumed(archetype)`. `Game` emits the success cue only when the one-shot tactic link is actually consumed by a real Mythic special attack, not when the tactic reward is merely earned.

Six bounded profiles are provided:

- Inferno — `EMBER INTERCEPTED`
- Summoner — `BROOD SEVERED`
- Juggernaut — `IRON LINE BROKEN`
- Abyss Witch — `VOID DISRUPTED`
- Twin Maw — `TWIN PATTERN BROKEN`
- Time Eater — `TIME PRESSURE RELEASED`

The cue is presentation-only: at most 2 rings, 12 particles, 4 trails, and short TTL. It adds no combat/economy modifier.

## 3. Phase 287~290 — Last Law Safe-Zone Lifecycle

New module: `src/game/endless/last-law-safe-zone-lifecycle.ts`.

`mythicSafeZoneState()` now accepts an optional lifecycle. When Last Law is inactive, legacy Mythic timing remains exactly the original 9000 ms cycle. During Last Law the cycle/stable window compress, while destroyed weakpoints partially restore breathing room. Hard bounds keep stable/reform readable.

`Game.currentMythicSafeZone()` is the single state producer used by:

- Mythic safe-zone damage/collision
- safe-zone rendering
- SAFE LANE preference/forecast
- safe-zone pressure composition

A compile-time nullability issue discovered during the pass was fixed by making this private helper non-null and keeping the Mythic guard at its call sites. Regression coverage is in `tests/phase287-safe-zone-type-contract.test.mjs`.

## 4. Phase 291~294 — 12 Final Form audio/palette identity

New module: `src/game/endless/final-form-audio-palette.ts`.

All 12 Final Forms now have unique palette ids, primary/secondary colors, and bounded audio variation. `ArcaneAudio.play()` accepts an optional presentation-only variation while keeping the existing sound scheduler key, priority, and cooldown semantics unchanged.

Bounds:

- frequency multiplier: 0.88–1.16
- duration multiplier: 0.90–1.18
- gain multiplier: 0.90–1.12

The existing execution/chain/control/bulwark combat family values remain authoritative; this phase changes presentation only.

## 5. Phase 295~298 — Foldable Thumb Travel Audit

New module: `src/game/foldable-thumb-travel-audit.ts`.

The audit is read-only and does not alter `InputState`, button coordinates, or touch routing. For the canonical unfolded 2208×1840 profile it verifies:

- 9/9 Action buttons reachable
- no Action path crosses the hinge
- left-thumb max travel <= 370 logical px
- right-thumb max travel <= 560 logical px
- right-thumb average travel <= 360 logical px

Current measured evidence:

- signature: `FT-EA080B43`
- left max: 327.7
- right max: 313.7
- right average: 184.7
- reachable actions: 9/9
- hinge: clear

Because the audit is comfortably inside the thresholds, Phase 295~298 intentionally did not relocate the existing action buttons.

## 6. Phase 299~302 — Release Manifest Gate

New module: `src/game/release-manifest.ts`.
New CLI: `scripts/release-manifest.mjs`.
New npm script: `verify:manifest`.

The command composes all required release evidence:

```bash
npm run verify:manifest -- --out release-manifest.json
```

It runs:

1. `npm test`
2. `npm run build`
3. `npm run verify:raster`
4. `npm run verify:release`
5. foldable thumb travel audit
6. Action count invariant
7. baseline mutation invariant

The pure manifest fails closed if tests/build/raster/release/foldable audit fail, Action count is not 9, profile count is not 5, the hinge audit fails, or baseline mutation is enabled. `--out` writes an explicit JSON evidence artifact only; it does not rewrite or auto-approve raster baselines.

Latest worktree manifest evidence before final integration:

- Status: PASS
- signature: `RM-F88DE017`
- tests: 687
- Raster CI signature: `RCI-4C6D9338`
- Release Gate: `RQ-9085A5AD`
- Action invariant: 9/9
- foldable audit: `FT-EA080B43`
- baseline mutation: disabled

The manifest signature includes source revision, so it is expected to change after the implementation commit is created and again reflects the exact revision being verified.

## 7. Product invariants preserved

- exactly 9 combat Actions
- no new combat button
- no new blocking modal
- no new permanent currency
- no Snapshot schema field added
- non-foldable input behavior unchanged
- Mythic geometry/collision remains authoritative
- Last Law HP threshold unchanged
- Final Form combat family tuning unchanged
- raster baselines never auto-updated

## 8. Tests added in Phase 283~302

- `tests/mythic-tactic-link-feedback.test.mjs`
- `tests/phase283-tactic-feedback-integration.test.mjs`
- `tests/last-law-safe-zone-lifecycle.test.mjs`
- `tests/phase287-last-law-safe-zone-integration.test.mjs`
- `tests/phase287-safe-zone-type-contract.test.mjs`
- `tests/final-form-audio-palette.test.mjs`
- `tests/phase291-finisher-audio-palette-integration.test.mjs`
- `tests/foldable-thumb-travel-audit.test.mjs`
- `tests/release-manifest.test.mjs`
- `tests/phase299-release-manifest-integration.test.mjs`

Phase 282 baseline: 661 tests.
Current Phase 302 worktree full suite: 687 tests.
Net new regression checks: 26.

## 9. Finalization checklist

Before claiming Phase 302 complete on `main`, run fresh on the exact integrated tree:

```bash
npm run build
npm test
npm run verify:raster
npm run verify:release
npm run verify:manifest

git diff --check
git status --porcelain
```

Then perform static HTTP smoke for `/`, `/dist/main.js`, `/dist/game/game.js`, and the new Phase 283~302 modules. Package only the verified Git `HEAD` with `git archive`, validate with `unzip -t`, and record entry count plus SHA-256.
