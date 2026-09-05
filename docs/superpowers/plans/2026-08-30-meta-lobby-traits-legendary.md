# Phase 6 Meta Lobby, Run Traits, Legendary Equipment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add persistent shard spending, a fast pre-run trait choice, legendary rank-5 equipment evolution, and a lower-friction retry/lobby flow.

**Architecture:** Keep permanent progression in a pure `meta-profile` domain module, run traits in a pure `run-traits` module, and legendary mappings in the existing economy/shop layer. Add small lobby and trait overlays while preserving the canvas combat loop. Apply permanent and trait base adjustments exactly once per run; equipment synchronization remains responsible only for equipment multiplier fields.

**Tech Stack:** TypeScript ES2022, DOM overlays, HTML5 Canvas, browser localStorage, Node built-in test runner.

**Spec:** `docs/superpowers/specs/2026-08-30-meta-lobby-traits-legendary-design.md`

## Global Constraints
- Landscape mobile remains the only target UI.
- Permanent stat tracks are bounded: vitality 5, power 5, bankroll 5, magnet 4.
- Exactly one run trait applies per run.
- Equipment still has only one weapon slot and one armor slot.
- Rank 5 is the maximum and triggers legendary identity automatically.
- No crafting, equipment inventory, sockets, rarity rerolls, or branching meta skill tree.
- Existing 91-test baseline must remain green.

---

### Task 1: Persistent Meta Profile and Spending

**Files:**
- Create: `src/domain/meta-profile.ts`
- Modify: `src/domain/meta-rewards.ts`
- Test: `tests/meta-profile.test.mjs`

**Interfaces:**
- Produces: `MetaProfile`, `defaultMetaProfile()`, `loadMetaProfile(storage)`, `saveMetaProfile(storage, profile)`, `metaUpgradeCost(id, currentLevel)`, `purchaseMetaUpgrade(profile, id)`, `metaBonuses(profile)`.
- Consumes: `KeyValueStorage` shape compatible with existing meta rewards storage.

- [ ] **Step 1: Write failing tests** for migration from the legacy shard key, bounded upgrade costs/caps, insufficient-shard rejection, and deterministic bonus calculations.
- [ ] **Step 2: Run `npm test` and verify the new tests fail because `meta-profile` does not exist.**
- [ ] **Step 3: Implement the version-1 profile, sanitization, migration, spending, and bonus calculations.**
- [ ] **Step 4: Run `npm test` and verify the full suite passes.**
- [ ] **Step 5: Commit `feat: add persistent meta progression profile`.**

### Task 2: Run Trait Model

**Files:**
- Create: `src/game/run-traits.ts`
- Test: `tests/run-traits.test.mjs`

**Interfaces:**
- Produces: `RunTraitId`, `RunTrait`, `RUN_TRAITS`, `runTrait(id)`, `runTraitBonuses(id)`.
- Bonuses include spell power, cooldown, max HP, move speed, gold, hero damage taken, and core damage taken multipliers.

- [ ] **Step 1: Write failing tests** for all four trait tradeoffs and identity metadata.
- [ ] **Step 2: Run the trait test and confirm failure on the missing module.**
- [ ] **Step 3: Implement the four immutable run traits and multiplier helper.**
- [ ] **Step 4: Run the full test suite and confirm green.**
- [ ] **Step 5: Commit `feat: add run-start combat traits`.**

### Task 3: Legendary Equipment Evolution

**Files:**
- Modify: `src/domain/types.ts`
- Modify: `src/domain/economy.ts`
- Modify: `src/game/shop-data.ts`
- Modify: `src/ui/shop.ts`
- Test: `tests/economy.test.mjs`
- Test: `tests/shop-data.test.mjs`

**Interfaces:**
- `EquippedItem.legendary: boolean`.
- `purchaseOffer` converts the rank-4 matching item to rank 5 legendary.
- `legendaryEquipmentName(baseId)` returns the final display identity.
- `equipmentBonuses` increases rank-5 legendary effect beyond a normal rank-5 scale.

- [ ] **Step 1: Add failing tests** for rank-4 duplicate evolution, legendary names, max-rank stability, and stronger legendary bonuses.
- [ ] **Step 2: Run targeted economy/shop tests and confirm RED.**
- [ ] **Step 3: Implement legendary mappings and rank-5 conversion.**
- [ ] **Step 4: Update shop copy so rank-4 duplicate purchase says `전설 진화` and equipped legendary gear is labeled distinctly.**
- [ ] **Step 5: Run the full suite and confirm green.**
- [ ] **Step 6: Commit `feat: evolve max-rank equipment into legendary gear`.**

### Task 4: Lobby and Trait Overlays

**Files:**
- Create: `src/ui/lobby.ts`
- Create: `src/ui/trait-select.ts`
- Modify: `src/styles.css`
- Test: `tests/meta-flow.test.mjs`

**Interfaces:**
- `LobbyOverlay.open(profile, handlers)` supports purchasing four permanent upgrades and continuing to hero select.
- `TraitSelectOverlay.open(heroId, traits, onSelect)` selects exactly one run trait.
- Pure helper `nextStartScreen(action)` in `src/domain/meta-flow.ts` is used to test `lobby`, `hero`, and `trait` transitions without DOM mocking.

- [ ] **Step 1: Write failing pure flow tests** for lobby start, hero-to-trait transition, same-hero retry-to-trait, and result-to-lobby transition.
- [ ] **Step 2: Implement `src/domain/meta-flow.ts` and verify targeted tests pass.**
- [ ] **Step 3: Implement lobby and trait overlays using large landscape touch cards and one primary action.**
- [ ] **Step 4: Add CSS for the new overlays without reducing combat canvas size.**
- [ ] **Step 5: Run full tests and build.**
- [ ] **Step 6: Commit `feat: add meta lobby and run trait setup`.**

### Task 5: Game Integration and Lower-Friction Retry

**Files:**
- Modify: `src/game/game.ts`
- Modify: `src/ui/results.ts`
- Modify: `src/game/entities.ts` only if a clean extra multiplier field is required.
- Test: `tests/final-systems.test.mjs`

**Interfaces:**
- Game owns `MetaProfile` and selected `RunTraitId | null`.
- New-run sequence: lobby → hero select → trait select → combat.
- Same-hero retry: results → trait select → combat.
- Meta/trait base adjustments are applied once after `createHero`, before combat.
- End-run shard earnings add to `profile.shards` and persist the profile.

- [ ] **Step 1: Add failing tests** for a pure `composeRunStartStats` helper that combines hero base stats, meta bonuses, and trait bonuses without touching level-up growth.
- [ ] **Step 2: Implement the helper and verify RED→GREEN.**
- [ ] **Step 3: Integrate lobby/profile, hero select, trait select, shard earning, and both results actions into `Game`.**
- [ ] **Step 4: Preserve equipment synchronization as equipment-only and verify level-up HP/spell growth is not reset after shop use.**
- [ ] **Step 5: Run full tests and `npm run build`.**
- [ ] **Step 6: Commit `feat: connect meta progression to the run loop`.**

### Task 6: Documentation and Release Verification

**Files:**
- Modify: `README.md`
- Create: `/mnt/data/arcane-last-stand-phase6.zip` outside Git.

**Interfaces:**
- Release ZIP contains source, tests, docs, scripts, `package.json`, `tsconfig.json`, `index.html`, and built `dist` while excluding `.git`, `.worktrees`, and `node_modules`.

- [ ] **Step 1: Update README** with the Phase 6 lobby, trait, legendary, and retry flows.
- [ ] **Step 2: Run fresh `npm test` and `npm run build`.**
- [ ] **Step 3: Start the local server on a free port and verify `/`, `/main.js`, `/meta-profile.js`, and new UI modules return HTTP 200 where applicable.**
- [ ] **Step 4: Create the Phase 6 ZIP and run `unzip -t`.**
- [ ] **Step 5: Verify `git status --short` is clean after the final documentation commit.**
