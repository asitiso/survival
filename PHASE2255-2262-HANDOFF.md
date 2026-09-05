# Phase 2255~2262 Handoff — Magic Fusion Component + Effective Modifier Projection Integration

This pass is based on the verified `arcane-last-stand-phase2254-full-merged.zip` delivery. The Phase 2254 archive does not contain upstream `.git` metadata, so a local Git baseline was reconstructed only for isolated verification and merging. During session recovery, the prior Phase 2255~2262 handoff contract was reapplied to that verified Phase 2254 delivery and the complete verification suite was rerun from scratch.

## Scope

Phase 2255~2262 removes mental arithmetic from the existing boss-reward Magic Fusion choice flow. Each Fusion candidate now exposes the two real component spells, whether it is a fresh pair or shares one spell with the already-equipped Fusion, and up to two effective modifier vectors derived from the existing frozen fusion composer. No new HUD row, gameplay modifier, reward-generation rule, action, or persisted state was introduced.

A three-state fresh/linked/focus model is intentionally not used: the frozen catalog contains six unique unordered pairs and a run can equip at most two distinct Fusions, so a second valid Fusion can share zero or one component, never both.

### Phase 2255 — Fusion Modifier Identity Atlas

- Added `assets/ui/fusion-modifier-icons.png`.
- 384×192 / 4×2 / cell 96×96.
- Seven identities: damage / area / cooldown / chain / pierce / slow-duration / tick-power.
- Active cells: 7/7 pixel-unique; one cell intentionally unused.
- Static art; animation false; motion amplitude 0; text remains authoritative.
- File size: 4,375 bytes.
- SHA-256: `4eb912b1a313d6eb57fb656b47085595afe42cb74e9a54a3f91c047945d13425`.

### Phase 2256 — Component Relation Identity Atlas

- Added `assets/ui/fusion-component-relation-icons.png`.
- 192×96 / 2×1 / cell 96×96.
- `신규 조합 / 1마법 연결` only.
- 2/2 pixel-unique.
- File size: 1,205 bytes.
- SHA-256: `4f69860784106486a7f299511a38bf36a99d711d96c9298169e7d02beebf59c0`.

### Phase 2257 — Real Fusion Projection

- Added `projectFusionSelection()`.
- Reads the real frozen `composeFusionSpellModifiers()` before and after the candidate.
- Reads candidate components directly from `fusionDefinition()`.
- Existing Hero Ability spell atlas is reused for component identities through a secondary-identity style adapter.
- Effective changes are derived for damage, area, cooldown, chain, pierce, slow duration, and tick power.
- Only the two highest-salience real effects are surfaced.

### Phase 2258 — Boss Fusion Choice Integration

Every Fusion boss-reward card keeps its existing primary Fusion identity and adds:

1. component spell A;
2. component spell B;
3. fresh/linked relation;
4. up to two real effective modifier identities;
5. numerical effective hint from the real composer.

The generic secondary-identity contract remains exactly three icons. A per-choice `secondaryIdentityLimit` was added and only Fusion cards request five. Existing Ascension and Contract cards keep their Phase 2254 behavior.

### Phase 2259 — Equip Confirmation + Attention Safety

- Successful equip shows the computed projection through the existing event-toast seam.
- Existing Fusion build identity remains the primary toast icon.
- Relation + modifier helpers are suppressed when hero critical, core critical, or boss-special countdown ≤1.2s.
- Run reset and `showEventToast()` clear Fusion projection state to prevent stale carryover.
- Successful Fusion confirmation is not immediately overwritten by the generic next-goal toast.

### Phase 2260~2261 — Deterministic Projection Audit

`auditFusionProjectionIdentityAssets()` emits exactly 60 deterministic samples:

- 4 heroes × 6 Fusion candidates in fresh states = 24;
- 4 heroes × 6 candidates with one deterministic linked prior Fusion = 24;
- 12 frozen aggregate contracts = 12.

Audit contracts include 7/7 modifier identities, 2/2 relation identities, six unique unordered Fusion pairs, Lv.10 eligibility, Lv.9 ineligibility, max-two Fusion cap, five remaining candidates with one Fusion equipped, Actions 9/9, and no snapshot/gameplay mutation.

### Phase 2262 — Release Freeze / Candidate Binding

Release Freeze binds:

- `fusionProjectionIdentityAssetsPassed`;
- `fusionProjectionIdentityAssetsSamples = 60`.

Release Candidate fails closed when this evidence is forged, includes sample count in its signature payload, and reports `fusion-projection-identity-assets safe (60)`.

## Gameplay Freeze

The following files were verified unchanged from the Phase 2254 baseline:

- `src/game/spell-fusions.ts`
- `src/game/fusion-integration.ts`

Therefore the following contracts remain frozen:

- six unordered Fusion pairs;
- both component spells must be Lv.10;
- maximum two Fusions per run;
- hero-specific Fusion names;
- all existing `fusionModifiers()` values;
- all existing `composeFusionSpellModifiers()` composition and caps;
- boss reward generation/order rules;
- Actions 9/9;
- Snapshot schema unchanged.

## Regression Found and Fixed

The first restored implementation replaced the generic literal `secondaryIdentityStyles.slice(0,3)` path with a variable cap. Although the default value was still 3, the pre-existing Hero Ascension integration contract correctly failed because that exact compatibility path had been removed.

Root-cause fix:

- materialize the common secondary style array;
- preserve the original default branch `secondaryIdentityStyles.slice(0,3)`;
- use `secondaryIdentityLimit` only when explicitly supplied;
- Fusion cards alone supply `5`.

The existing Phase 2249~2252 Ascension integration test and the new Fusion integration test were then run together: 10/10 PASS.

## Verification Evidence Before Handoff Commit

### TDD / focused regression

- Initial new Phase tests observed RED: 10/10 expected failures before production implementation.
- Final focused Phase 2255~2262 tests: 10/10 PASS.
- Ascension + Fusion compatibility focused tests: 10/10 PASS.

### Full regression — final worktree code

- Test files: 627.
- Tests: 2,017.
- Pass: 2,017.
- Fail: 0.
- Entire sorted set executed after the compatibility fix in bounded batches; no test file omitted.

### Release gates — final worktree code

- Build: PASS.
- Release Candidate: PASS — `RCQ-A360A8C1`.
- Release Quality Gate: PASS — `RQ-D4630257`.
- Raster profiles: 5/5 PASS.
  - 16:9 `RR-FE2C6B74`
  - 20:9 `RR-0937F125`
  - 4:3 `RR-4C84B218`
  - foldable `RR-023FFC4B`
  - 32:9 `RR-737044D6`
- Fusion Projection Identity audit: PASS (60 samples).
- Actions: 9/9.
- Snapshot schema mutation: false.

## Packaging Note

The final delivery archive must be produced from the clean merged reconstructed main, generated deterministically twice, byte-compared, re-extracted, and independently verified before handoff. Its archive SHA-256 is therefore reported with the final artifact rather than embedded here.
