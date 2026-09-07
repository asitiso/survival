# Cast-to-Impact / Action-Result Readability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add concise result confirmation that distinguishes ordinary contact from weakpoint/guard/boss/kill outcomes while preserving all combat balance.

**Architecture:** Add a pure `action-result-readability.ts` policy module that classifies result importance, assigns Canvas presentation, and defines coalescing/budget rules. Extend `CombatFeedbackSystem` with a lightweight result cue and route guard/boss outcomes from `EnemyManager`; return weakpoint hit/break metadata from `BossEncounterSystem.hitMagic()` so `SpellSystem` can acknowledge resolved weakpoint results. Existing projectile lineage/response ownership remains authoritative and is not replaced.

**Tech Stack:** TypeScript, Canvas 2D, Node `node:test`, npm build/test scripts.

**Spec:** `docs/superpowers/specs/2026-09-07-cast-impact-readability.md`

## Global Constraints
- No damage, cooldown, reward, save, targeting, AUTO/manual timing, or weakpoint aim blend changes.
- No new image atlas.
- Boss/critical warnings and safe-lane guidance remain higher priority.
- Reduced Motion removes pulse/expansion motion; Reduced Flash lowers intensity.
- Full regression/release/candidate gates run once after all three Fast Trains.

---

### Task 1: Phase 4353-4358 Result Ownership Policy

**Files:**
- Create: `src/game/action-result-readability.ts`
- Test: `tests/phase4353-4358-action-result-ownership.test.mjs`

**Interfaces:**
- Produces: `ActionResultKind`, `actionResultPresentation(input)`, `actionResultMinimumGap(kind)`.
- `actionResultPresentation` returns `{visible, priority, alpha, radius, lineWidth, rayCount, connectorAlpha, pulseAmplitude}`.

- [ ] **Step 1: Write the failing test**

```js
import { actionResultPresentation, actionResultMinimumGap } from '../dist/game/action-result-readability.js';
const normal=actionResultPresentation({kind:'normalHit',battlefieldStress:0});
const weak=actionResultPresentation({kind:'weakpointHit',battlefieldStress:0});
const broken=actionResultPresentation({kind:'weakpointBreak',battlefieldStress:0});
assert.ok(normal.alpha < weak.alpha && weak.alpha < broken.alpha);
assert.ok(actionResultMinimumGap('weakpointHit') > actionResultMinimumGap('weakpointBreak'));
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run build && node --test tests/phase4353-4358-action-result-ownership.test.mjs`
Expected: FAIL because `dist/game/action-result-readability.js` does not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
export type ActionResultKind='normalHit'|'weakpointHit'|'weakpointBreak'|'guardBreak'|'bossStagger'|'enemyKill';
export function actionResultMinimumGap(kind:ActionResultKind):number {
  return kind==='normalHit'?.18:kind==='weakpointHit'?.14:.02;
}
```

Implement presentation precedence so break/stagger/kill outcomes outrank weakpoint contact, while ordinary hits remain subtle.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run build && node --test tests/phase4353-4358-action-result-ownership.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/action-result-readability.ts tests/phase4353-4358-action-result-ownership.test.mjs dist/game/action-result-readability.js
git commit -m "feat: classify resolved combat action results"
```

### Task 2: Phase 4359-4364 Resolved Result Integration

**Files:**
- Modify: `src/game/combat-feedback.ts`
- Modify: `src/game/enemies.ts`
- Modify: `src/game/boss-encounters.ts`
- Modify: `src/game/spells.ts`
- Test: `tests/phase4359-4364-meaningful-impact-confirmation.test.mjs`

**Interfaces:**
- `CombatFeedbackSink.addActionResult(pos, kind, source?)` records a short result cue.
- `MagicTargetSink.hitMagic(pos,strength)` returns `{hit,nodeId,destroyed,allDestroyed}`.
- `EnemyManager.damage` keeps its boolean return contract; it emits `guardBreak`, `bossStagger`, and `enemyKill` result cues internally.

- [ ] **Step 1: Write the failing test**

```js
const encounter=new BossEncounterSystem();
encounter.begin(1,'inferno',{x:400,y:220},0);
const node=encounter.nodes[0];
const first=encounter.hitMagic(node.pos,10);
assert.equal(first.hit,true);
assert.equal(first.destroyed,false);
const broken=encounter.hitMagic(node.pos,node.maxHp);
assert.equal(broken.destroyed,true);
```

Also assert `CombatFeedbackSystem` coalesces repeated `weakpointHit` cues but retains `weakpointBreak` after the contact cue.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run build && node --test tests/phase4359-4364-meaningful-impact-confirmation.test.mjs`
Expected: FAIL because `hitMagic` currently returns `void` and `addActionResult` does not exist.

- [ ] **Step 3: Write minimal implementation**

Return weakpoint result metadata from `BossEncounterSystem.hitMagic`. In `SpellSystem`, translate hit/break results to `world.feedback?.addActionResult(...)`. In `EnemyManager.damage`, preserve current guard/boss/kill behavior and additionally emit the matching resolved result kind. `CombatFeedbackSystem` keeps per-kind cooldowns using `actionResultMinimumGap` so repeated contact is coalesced while break/stagger/kill results remain visible.

- [ ] **Step 4: Run focused tests**

Run: `npm run build && node --test tests/phase4353-4358-action-result-ownership.test.mjs tests/phase4359-4364-meaningful-impact-confirmation.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/combat-feedback.ts src/game/enemies.ts src/game/boss-encounters.ts src/game/spells.ts tests/phase4359-4364-meaningful-impact-confirmation.test.mjs dist/game
git commit -m "feat: confirm meaningful combat outcomes"
```

### Task 3: Phase 4365-4370 Battlefield Causality Budget

**Files:**
- Modify: `src/game/action-result-readability.ts`
- Modify: `src/game/combat-feedback.ts`
- Modify: `src/game/game.ts`
- Test: `tests/phase4365-4370-action-result-budget.test.mjs`

**Interfaces:**
- `CombatFeedbackSystem.render(ctx,quality,context?)` accepts `{battlefieldStress,protectedWarning,safeLaneVisible,reducedMotion,reducedFlash}`.
- `actionResultPresentation` uses the same context to demote result cues without suppressing break/stagger/kill outcomes.

- [ ] **Step 1: Write the failing test**

```js
const calm=actionResultPresentation({kind:'weakpointBreak',battlefieldStress:0});
const dense=actionResultPresentation({kind:'weakpointBreak',battlefieldStress:1});
const warning=actionResultPresentation({kind:'weakpointBreak',protectedWarning:true});
assert.ok(calm.alpha>dense.alpha);
assert.ok(warning.alpha<calm.alpha);
assert.equal(actionResultPresentation({kind:'bossStagger',reducedMotion:true}).pulseAmplitude,0);
```

Add the 4 heroes x 6 Threat tiers x manual/AUTO matrix and require finite, nonzero presentation for meaningful results.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run build && node --test tests/phase4365-4370-action-result-budget.test.mjs`
Expected: FAIL until budget/accessibility behavior is implemented.

- [ ] **Step 3: Write minimal implementation**

Pass game-level battlefield stress, critical/boss warning ownership, safe-lane state, and presentation accessibility settings into `CombatFeedbackSystem.render`. Render result cues as short Canvas arcs/rings/connectors with alpha/ray/motion values from the pure policy; do not introduce new assets.

- [ ] **Step 4: Run Fast Train regression**

Run: `npm run build && node --test tests/phase4353-4358-action-result-ownership.test.mjs tests/phase4359-4364-meaningful-impact-confirmation.test.mjs tests/phase4365-4370-action-result-budget.test.mjs tests/phase4317-4322-control-difficulty-foundation.test.mjs tests/phase4323-4328-control-difficulty-threat-scaling.test.mjs tests/phase4329-4334-control-difficulty-matrix.test.mjs tests/phase4335-4340-target-intent-ownership.test.mjs tests/phase4341-4346-target-switch-readability.test.mjs tests/phase4347-4352-target-intent-budget.test.mjs`
Expected: PASS.

- [ ] **Step 5: Run final gates**

Run: `npm test && node scripts/raster-regression.mjs && npm run audit:release && npm run audit:candidate && git diff --check`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add src/game/action-result-readability.ts src/game/combat-feedback.ts src/game/game.ts tests/phase4365-4370-action-result-budget.test.mjs dist/game
git commit -m "feat: budget action result readability"
```
