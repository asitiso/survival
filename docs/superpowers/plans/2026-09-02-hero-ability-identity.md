# Hero Ability Identity Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 24 hero-specific ability identities to combat buttons and spell decision cards while preserving the legacy icon/text fallback and all gameplay behavior.

**Architecture:** A dedicated atlas module owns `(hero, action/spell)→cell` mapping. Combat rendering loads the atlas independently and falls back to existing action icons; decision cards receive optional hero-aware CSS identity at the presentation boundary. A deterministic audit is fail-closed through Release Freeze and Release Candidate signatures.

**Tech Stack:** TypeScript, Canvas 2D, DOM/CSS, Node test runner, PNG atlas generated with Pillow.

**Spec:** `docs/superpowers/specs/2026-09-02-hero-ability-identity-design.md`

## Global Constraints

- Exactly 24 hero ability identities: 4 heroes × 6 spell/ultimate actions.
- Atlas: `assets/ui/hero-ability-icons.png`, 576×384, 6×4, cell 96×96.
- Static art only: animation false, motion amplitude 0.
- Potion/shop/auto remain on the existing action atlas.
- Combat fallback order: hero-specific atlas → legacy action atlas → existing text.
- Decision cards preserve existing text and generic behavior when hero context is absent.
- Do not modify spell balance, cooldown, RNG/order, inputs, 9 Action IDs, or snapshot schema.
- Release audit sample count is exactly 48.

---

### Task 1: Hero ability atlas contract

**Files:**
- Create: `src/game/hero-ability-identity-assets.ts`
- Create: `assets/ui/hero-ability-icons.png`
- Test: `tests/phase1953-hero-ability-identity-assets.test.mjs`

**Interfaces:**
- Consumes: `HeroId`, `ActionId`, `SpellId`.
- Produces: `HERO_ABILITY_IDENTITY_ATLAS`, `HERO_ABILITY_ACTIONS`, `heroAbilityIdentityIcon(heroId, actionId)`, `heroAbilitySpellIdentityIcon(heroId, spellId)`, `heroAbilityIdentityStyle(heroId, spellId)`, `auditHeroAbilityIdentityAtlas()`.

- [ ] Write a failing test requiring 576×384/6×4/96 metadata, 24 unique in-bounds hero/action cells, stable spell→action mapping, static/fallback metadata, and a real PNG at the declared path.
- [ ] Run `npm run build && node --test tests/phase1953-hero-ability-identity-assets.test.mjs` and verify RED because the new module does not exist.
- [ ] Implement the minimal atlas module and generate the 24-cell PNG with four established hero palettes and six distinct action silhouettes.
- [ ] Re-run the focused test and verify GREEN.
- [ ] Commit the task.

### Task 2: Combat button integration with legacy fallback

**Files:**
- Modify: `src/game/game.ts`
- Test: `tests/phase1954-hero-ability-combat-integration.test.mjs`

**Interfaces:**
- Consumes: `heroAbilityIdentityIcon()` and existing `actionIconSprite()`.
- Produces: asynchronous hero-ability atlas load state plus render selection that uses hero art only for the six combat spells.

- [ ] Write a failing structural/integration test requiring independent atlas initialization, six-action hero-specific draw path, and untouched legacy paths for potion/shop/auto.
- [ ] Run focused test and verify RED.
- [ ] Add independent image load state, initialize it without blocking construction, draw hero art when ready and otherwise execute the existing action-icon draw path.
- [ ] Re-run focused test plus existing action-icon integration tests and verify GREEN.
- [ ] Commit the task.

### Task 3: Hero-aware decision card identity

**Files:**
- Modify: `src/game/growth-choice-icon-assets.ts`
- Modify: `src/game/game.ts`
- Test: `tests/phase1955-1958-hero-ability-decision-integration.test.mjs`

**Interfaces:**
- Consumes: `heroAbilityIdentityStyle(heroId, spellId)` and existing `LevelUpOverlay` optional `identityIconStyle`.
- Produces: `growthChoiceIcon(choiceId, kind?, heroId?)`, `growthChoiceIconStyle(choiceId, kind?, heroId?)`; spell choices decorated with hero-specific styles before overlay rendering.

- [ ] Write failing tests proving spell choices with hero context use the hero atlas, missing hero context stays on `action-icons.png`, generic/relic/fusion identities remain unchanged, and game decision presentation decorates normal upgrades and boss ultimate rewards without changing builder data.
- [ ] Run focused tests and verify RED.
- [ ] Extend growth icon functions with optional hero context and decorate only spell/ultimate choices at the overlay boundary.
- [ ] Re-run focused tests plus existing growth-choice/decision tests and verify GREEN.
- [ ] Commit the task.

### Task 4: Deterministic 48-sample audit

**Files:**
- Create: `src/game/hero-ability-identity-asset-audit.ts`
- Test: `tests/phase1959-hero-ability-identity-audit.test.mjs`

**Interfaces:**
- Consumes: atlas contract and `ACTION_BUTTONS`.
- Produces: `auditHeroAbilityIdentityAssets()` with 48 deterministic samples and immutable `snapshotSchemaMutation:false`.

- [ ] Write a failing test asserting 48 samples, 24/24 coverage, 24 unique cells, no mismatches/bounds errors, primary/fallback coverage 1, motion 0, text/legacy/non-blocking fallbacks true, actions 9, snapshot mutation false.
- [ ] Run focused test and verify RED.
- [ ] Implement the minimal audit with one combat and one decision/fallback sample per identity.
- [ ] Re-run focused audit test and verify GREEN.
- [ ] Commit the task.

### Task 5: Release fail-closed binding

**Files:**
- Modify: `src/game/release-freeze-audit.ts`
- Modify: `src/game/release-candidate-audit.ts`
- Test: `tests/phase1960-hero-ability-identity-release-gate.test.mjs`

**Interfaces:**
- Consumes: `auditHeroAbilityIdentityAssets()`.
- Produces: Release Freeze fields `heroAbilityIdentityAssetsPassed`, `heroAbilityIdentityAssetsSamples`; Release Candidate consistency/signature binding.

- [ ] Write a failing test showing normal evidence passes, forged upper PASS with lower hero ability evidence false yields `REVIEW`/`release-freeze`, and sample-count mutation changes candidate signature.
- [ ] Run focused test and verify RED.
- [ ] Bind the new audit to Release Freeze `passed`, returned evidence, Candidate consistency, signature payload, and report line.
- [ ] Re-run focused release test and verify GREEN.
- [ ] Commit the task.

### Task 6: Handoff, full verification, merge, package

**Files:**
- Create: `PHASE1953-1960-HANDOFF.md`

**Interfaces:**
- Consumes: completed Phase 1953~1960 implementation.
- Produces: verified reconstructed-main delivery ZIP, handoff, and standalone atlas copy.

- [ ] Run Fresh TypeScript build and all Phase 1953~1960 focused tests.
- [ ] Run every `tests/*.test.mjs` file exactly once in sorted exhaustive batches and sum pass/fail counts.
- [ ] Run `npm run verify:candidate`, `npm run verify:release`, and `npm run verify:raster`.
- [ ] Write Handoff with exact fresh evidence, asset metadata/hash, candidate normal/forged/sample-mutation signatures, and reconstructed-Git caveat.
- [ ] Commit docs, re-run the full suite on branch HEAD, merge locally into reconstructed `main`, and re-run the full suite/release gates on merged main.
- [ ] Remove owned worktree/feature branch only after merged verification succeeds.
- [ ] Create `arcane-last-stand-phase1960-full-merged.zip` without `.git`/`node_modules`, test ZIP integrity, compute SHA-256, extract to a fresh directory, and repeat Fresh build/full suite/release gates from the extracted delivery.
