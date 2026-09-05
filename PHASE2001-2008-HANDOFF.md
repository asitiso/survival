# Phase 2001~2008 Handoff — Catastrophe Combat Identity Integration

## Scope

This pass improves late-run catastrophe readability without changing catastrophe timing, order, combat modifiers, action count, persistence, or snapshot schema.

## Phase 2001 — Catastrophe Identity Atlas

Added `assets/ui/catastrophe-icons.png`:

- 288×192 RGBA PNG
- 3×2 atlas
- 96×96 cells
- 5 used cells / 1 unused cell
- `goldenNight` — crescent + coin motif
- `frenzy` — claw/slash motif
- `arcaneSurge` — arcane lightning motif
- `redMoon` — red moon + elite crown motif
- `guardianGrace` — shield + halo motif
- no animation
- motion amplitude 0

`src/game/catastrophe-identity-assets.ts` owns the atlas contract and cell mapping.

## Phase 2002~2006 — Live Combat Integration

`Game` now loads the catastrophe atlas asynchronously and non-blockingly.

The existing catastrophe banner keeps the original name and description at the original text coordinates while adding the identity icon on the left side.

During an active catastrophe, a compact 28px icon is also drawn inside the existing top status panel. No new HUD row, menu, setting, pulse, blink, or gameplay state was added.

If `Image` is unavailable, loading is late, or the PNG fails to load:

- the existing banner text remains intact;
- the existing landscape status line still contains the catastrophe name;
- combat start/update does not wait for the asset;
- gameplay calculations remain independent from the asset.

## Gameplay Contracts Preserved

The existing `catastropheAt()` and `catastropheModifiers()` behavior remains locked:

- catastrophe start: 1200s
- rotation interval: 180s
- order: `goldenNight → frenzy → arcaneSurge → redMoon → guardianGrace → repeat`
- Golden Night: gold ×2
- Frenzy: enemy speed ×1.22
- Arcane Surge: cooldown ×0.82, enemy speed ×1.10
- Red Moon: spawn pressure ×1.32, elite interval ×0.58
- Guardian Grace: core damage ×0.78, spawn pressure ×1.08
- neutral modifiers remain all ×1

No action, economy, persistence, RunSnapshot, or catastrophe-domain schema changes were made.

## Phase 2007 — 60 Deterministic Samples

Added `auditCatastropheIdentityAssets()` with 60 deterministic samples covering:

- catastrophe coverage 5/5
- unique atlas cells 5/5
- icon body coverage 100%
- rotation coverage 100%
- text fallback coverage 100%
- image load failure non-blocking 100%
- animation false / motion amplitude 0
- catastrophe names and descriptions locked
- timing start/rotation/loop locked
- all catastrophe modifier values locked
- neutral modifier contract locked
- Actions 9/9
- Snapshot schema mutation false

## Phase 2008 — Release Fail-Closed

Release Freeze now binds:

- `catastropheIdentityAssetsPassed`
- `catastropheIdentityAssetsSamples = 60`

Candidate evidence includes both fields in consistency validation and signature generation. Forging the lower-level catastrophe identity evidence while leaving aggregate release freeze `passed=true` is rejected as `REVIEW · release-freeze`.

Observed feature-branch candidate signatures:

- normal: `PASS · RCQ-6356AA81`
- forged catastrophe identity evidence: `REVIEW · RCQ-37E8B40C`
- sample count 60→61: `PASS · RCQ-A75FB85A`

Release Quality Gate remains `PASS · RQ-D4630257` and raster profiles remain 5/5 PASS.

## Verification

Feature worktree verification before integration:

- fresh TypeScript build: PASS
- focused catastrophe/field-node/pressure regression: 21/21 PASS
- complete regression: 488 test files / 1,776 tests / fail 0
- Release Candidate: PASS
- Release Quality Gate: PASS
- Raster: 5/5 PASS
- Actions: 9/9

The final delivery ZIP is additionally re-extracted into a clean directory and re-verified from `npm ci` before handoff.
