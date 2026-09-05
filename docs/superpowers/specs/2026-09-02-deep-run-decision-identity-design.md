# Deep Run Decision Identity Integration Design

## Goal

Reduce re-reading and memory burden during long runs by giving the existing Hero Ascension, Run Contract, and Long Run Oath systems a shared static visual identity layer without changing gameplay, persistence, or action controls.

## Scope

Phase 1945~1952 covers 35 existing identities only:

- 24 Hero Ascensions: six per hero.
- 5 Run Contract families: slayer, warden, arcane, hunter, survivor.
- 6 Long Run Oaths: slayer, elite_hunt, boss_hunt, arcane_flow, core_guard, endure.

No new choices, rewards, modifiers, milestones, buttons, actions, snapshot fields, or progression rules are introduced.

## Asset architecture

Create one static `assets/ui/deep-run-decision-icons.png` atlas with 35 96×96 cells arranged as 7 columns × 5 rows (672×480). The first 24 cells map Hero Ascensions, the next 5 cells map Contract families, and the last 6 cells map Oath kinds. Every identity has a unique cell. The atlas is presentation-only, animation false, motion amplitude 0, and all text remains visible when the image is unavailable.

`src/game/deep-run-decision-identity-assets.ts` owns the atlas contract, cell mapping, style helpers, sprite coordinates, runtime ID guards, and atlas bounds audit. Consumers do not duplicate atlas geometry.

## Decision-card integration

`LevelUpOverlay` gains an optional `identityIconStyle` card property. Existing cards continue to use `growthChoiceIconStyle()` when this property is absent. Hero Ascension cards are presentation-mapped at `openPendingHeroAscension()` and Contract cards receive the same optional style in `contractChoiceCards()`. No selection IDs, callbacks, or decision continuity behavior changes.

## HUD recall and progress

Add a small presentation-only deep-run identity strip to the existing left build-status area. The strip reuses the atlas and displays at most three selected Ascension icons when attention permits.

Active Contract and active Long Run Oath progress are represented by existing text plus one identity icon. Contract progress is formatted as a compact `CONTRACT · <family> <progress>/<target>` line; time-based Contract families display seconds. Oath text continues to come from the existing `oathHudLine()` function and receives the corresponding icon.

No new HUD panel or settings toggle is added.

## Attention arbitration

`src/game/deep-run-decision-attention.ts` defines a deterministic presentation policy. Boss, mythic, hero-critical, and core-critical states outrank routine recall. Active Contract/Oath progress outranks selected Ascension recall. In critical/boss states, routine Ascension icons are hidden while Contract/Oath progress remains available only within the existing build-label budget. The policy changes presentation density only; it cannot suppress critical bars or gameplay telegraphs.

## Failure behavior

The atlas is loaded asynchronously. Image failure never blocks run startup, decisions, accepting a Contract, selecting Ascension, Oath progression, or HUD text. Card text and existing Oath text are always rendered. Canvas identity drawing is conditional on atlas readiness.

## Audit and release binding

`auditDeepRunDecisionIdentityAssets()` validates:

- 35/35 identities covered.
- 35/35 unique cells.
- zero out-of-bounds cells.
- decision/HUD/progress surfaces use the shared atlas.
- motion amplitude 0.
- text fallback 100%.
- asset failure non-blocking 100%.
- Actions 9/9.
- snapshot schema mutation false.

The deterministic audit uses 70 samples: every identity on its primary surface (35), all identities on a fallback/non-blocking surface (35). Release Freeze binds `deepRunDecisionIdentityPassed` and `deepRunDecisionIdentitySamples = 70`. Release Candidate consistency and signature payload include both fields so forged upper PASS values fail closed and sample-count mutations change the signature.

## Verification

Required verification after implementation:

- Red/green focused tests for atlas mapping, choice-card integration, HUD progress/attention, asset audit, and Release Freeze binding.
- Fresh TypeScript build.
- Full repository test suite, split into deterministic batches if one Node test process stalls.
- Release Candidate PASS and Release Quality Gate PASS.
- ZIP integrity test.
- Re-extract final ZIP into a fresh directory and repeat build, full tests, Candidate, and release gate.
