# Phase 203~222 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Implement Phase 203~222 high-skill combat polish and deterministic render regression gates.

**Architecture:** Add five focused pure modules under `src/game/endless/` or `src/game/`, integrate them at existing dodge, Mythic arena, Final Form, HUD, and render-contract seams. Keep all new combat state transient and preserve the 9-action surface.

**Tech Stack:** TypeScript, Canvas 2D, Node test runner.

**Spec:** `docs/superpowers/specs/2026-08-30-phase203-222-design.md`

## Global Constraints
- Exactly 9 combat actions.
- No blocking modal or new combat button.
- No new snapshot schema field for these phases.
- TDD: failing test before production implementation.
- Existing aspect classes and legacy behavior remain valid.

---

### Task 1: Perfect Evade Finisher
**Files:**
- Create: `src/game/endless/arena-dodge-finisher.ts`
- Test: `tests/arena-dodge-finisher.test.mjs`
- Modify: `src/game/game.ts`

**Interfaces:**
- Consumes previous and next evade chain counts plus Final Form combat context.
- Produces a bounded one-shot finisher profile and `shouldTriggerArenaDodgeFinisher(previous,next)`.

- [x] Write tests proving x5 edge-trigger behavior, bounded reward, and no economy reward.
- [x] Run test and verify RED due to missing module.
- [x] Implement finisher profile and trigger predicate.
- [x] Wire one-shot shockwave into the existing dodge reward branch.
- [x] Run focused tests and build.

### Task 2: Safe Lane Link
**Files:**
- Create: `src/game/endless/safe-lane-link.ts`
- Test: `tests/safe-lane-link.test.mjs`
- Modify: `src/game/game.ts`

**Interfaces:**
- Consumes current SAFE LANE hint, hero position, time, Final Form mobility family, and PERFECT EVADE.
- Produces transient armed state and bounded Flow/Signature/movement bonuses.

- [x] Write tests for arming, expiry, family-specific rewards, and no auto-move.
- [x] Verify RED.
- [x] Implement transient tracker and reward resolver.
- [x] Integrate update/render dodge seam without snapshot changes.
- [x] Run focused tests and build.

### Task 3: Mythic Safe Zone Lifecycle
**Files:**
- Create: `src/game/endless/mythic-safe-zone.ts`
- Test: `tests/mythic-safe-zone.test.mjs`
- Modify: `src/game/endless/mythic-safe-lane.ts`
- Modify: `src/game/game.ts`

**Interfaces:**
- Consumes boss archetype, encounter elapsed milliseconds, arena bounds, and destroyed weakpoint ratio.
- Produces deterministic stable/collapse/collapsed/reform zone state and optional preferred SAFE LANE target.

- [x] Write tests for deterministic boss-specific cycles and bounded zone placement.
- [x] Verify RED.
- [x] Implement lifecycle profile.
- [x] Extend SAFE LANE scoring with optional active safe-zone preference while preserving collision authority.
- [x] Render lifecycle cue and pass preferred zone to SAFE LANE.
- [x] Run focused tests and build.

### Task 4: Foldable Density Director
**Files:**
- Create: `src/game/foldable-density-director.ts`
- Test: `tests/foldable-density-director.test.mjs`
- Modify: `src/game/game.ts`

**Interfaces:**
- Consumes safe-area class and boss/Mythic/long-run context.
- Produces status character budget, build-label limit, XP-detail visibility, and meter-detail visibility.

- [x] Write tests showing only foldable layouts compress and critical data stays visible.
- [x] Verify RED.
- [x] Implement density policy.
- [x] Apply policy to HUD text and build label count.
- [x] Run focused tests and build.

### Task 5: Raster Baseline Gate
**Files:**
- Create: `src/game/render-raster-baseline.ts`
- Test: `tests/render-raster-baseline.test.mjs`
- Modify: `src/game/render-raster-contract.ts` only if a reusable frame similarity helper is required.

**Interfaces:**
- Consumes baseline/current raster contracts and threshold policy.
- Produces pass/fail audit with global and critical similarity.

- [x] Write tests for exact pass, tolerated decorative drift, and rejected critical drift.
- [x] Verify RED.
- [x] Implement baseline capture and audit.
- [x] Add deterministic representative baseline specifications after current signatures are calculated.
- [x] Run five-aspect audit.

### Task 6: Integration and Release Verification
**Files:**
- Create: `tests/phase203-222-integration.test.mjs`
- Modify: `README.md`
- Create: `docs/PHASE203-222-HANDOFF.md`

**Interfaces:**
- Verifies action count, snapshot non-growth, Game wiring, aspect audits, and baseline gates.

- [x] Write integration assertions.
- [x] Run focused integration tests.
- [x] Run full `npm test`.
- [x] Run `git diff --check` and documentation placeholder scan.
- [x] Commit verified branch, re-run verification, fast-forward `main`, and verify merged `main`.
- [x] Run HTTP smoke, create `git archive` ZIP, validate with `unzip -t`, and record SHA-256.
