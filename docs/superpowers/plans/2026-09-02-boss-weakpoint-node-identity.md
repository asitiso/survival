# Boss Weakpoint Node Identity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give all six existing boss weakpoint node kinds stable icon identity on node bodies and primary weakpoint recall without changing boss gameplay or AUTO selection.

**Architecture:** Add a 3x2/96px static atlas plus `boss-weakpoint-identity-assets.ts`. `Game` loads it asynchronously and uses it only in existing weakpoint rendering with text fallback. A deterministic audit locks asset geometry and existing `BossEncounterSystem`/AUTO contracts, then Release Freeze and Candidate fail closed on that evidence.

**Tech Stack:** TypeScript, Canvas 2D, Node test runner, PNG atlas.

**Spec:** `docs/superpowers/specs/2026-09-02-boss-weakpoint-node-identity-design.md`

## Global Constraints
- Do not change boss weakpoint HP, radius, modifiers, node count, archetype mapping, or spawn geometry.
- Do not change `primaryWeakpointNode()` or `autoWeakpointAimPoint()` selection order.
- Image load failure must preserve current English node labels and never block gameplay.
- Motion amplitude remains 0 for the new asset identity.
- Snapshot schema remains unchanged and actions remain 9/9.

---

### Task 1: Static weakpoint identity atlas
**Files:** Create `src/game/boss-weakpoint-identity-assets.ts`; create `assets/bosses/boss-weakpoint-icons.png`; test `tests/phase1977-boss-weakpoint-identity-assets.test.mjs`.
**Interfaces:** Produces `BOSS_WEAKPOINT_IDENTITY_KINDS`, `BOSS_WEAKPOINT_IDENTITY_ATLAS`, `bossWeakpointIdentityIcon(kind)`, `auditBossWeakpointIdentityAtlas()`.
- [ ] Write a failing test for six kinds, six unique cells, bounds, motion=0 and fallback flags.
- [ ] Run it and confirm failure because the module does not exist.
- [ ] Implement the minimal module and 3x2 96px PNG.
- [ ] Build and rerun the test to green.
- [ ] Commit.

### Task 2: Node body and primary recall integration
**Files:** Modify `src/game/game.ts`; test `tests/phase1978-1982-boss-weakpoint-identity-integration.test.mjs`.
**Interfaces:** Consumes `bossWeakpointIdentityIcon`; produces icon-first body rendering while keeping existing text fallback, HP bar, weakpoint ring and primary label policy.
- [ ] Write a failing source/integration test requiring async atlas load, icon draw path, and preserved text fallback.
- [ ] Run RED.
- [ ] Add loader state/import and icon-first render branch without changing node geometry or guidance motion.
- [ ] Build and rerun focused weakpoint tests to green.
- [ ] Commit.

### Task 3: Deterministic immutable-contract audit
**Files:** Create `src/game/boss-weakpoint-identity-asset-audit.ts`; test `tests/phase1983-boss-weakpoint-identity-audit.test.mjs`.
**Interfaces:** Produces `auditBossWeakpointIdentityAssets()` with exactly 60 deterministic samples and immutable-contract booleans.
- [ ] Write RED audit expectations for 6/6 coverage, 6/6 unique cells, body/primary/fallback coverage, node HP/radius/modifier/AUTO selection immutability, actions 9/9 and snapshot mutation false.
- [ ] Run RED.
- [ ] Implement the audit using existing production APIs and constants without mutating gameplay.
- [ ] Build and rerun focused audits to green.
- [ ] Commit.

### Task 4: Release fail-closed
**Files:** Modify `src/game/release-freeze-audit.ts`, `src/game/release-candidate-audit.ts`; test `tests/phase1984-boss-weakpoint-identity-release-gate.test.mjs`.
**Interfaces:** Adds `bossWeakpointIdentityAssetsPassed` and `bossWeakpointIdentityAssetsSamples` to Release Freeze and Candidate consistency/signature/report payloads.
- [ ] Write RED test showing forged lower evidence currently passes and sample mutation does not affect signature.
- [ ] Run RED.
- [ ] Bind audit evidence into Freeze `passed`, returned evidence, Candidate consistency, signature inputs and report text.
- [ ] Run focused release tests to green.
- [ ] Commit.

### Task 5: Full verification, handoff and package
**Files:** Create `PHASE1977-1984-HANDOFF.md`; update generated `dist/`; package final ZIP.
- [ ] Fresh TypeScript build and focused regression suite.
- [ ] Run every test file in six deterministic batches and sum pass/fail counts.
- [ ] Run Candidate, Release Quality, Raster, forged evidence and sample mutation checks.
- [ ] Write handoff with exact evidence and commit.
- [ ] Re-run full branch verification, merge to reconstructed `main`, re-run full verification, remove worktree/branch.
- [ ] Create ZIP, verify archive integrity/SHA-256, extract into a fresh directory and repeat install/build/full tests/Candidate/Release/Raster.
