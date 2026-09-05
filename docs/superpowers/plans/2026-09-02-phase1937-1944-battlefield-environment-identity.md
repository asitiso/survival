# Phase 1937~1944 Battlefield Environment Identity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add a static 3-map × 3-evolution-stage battlefield identity atlas and reuse it across combat, terrain materials, results/lobby/replay while binding deterministic fail-closed evidence into Release Freeze.

**Architecture:** Keep map identity presentation in a new focused asset-contract module. The existing gradient/grid renderer remains the first-pass fallback, with a single optional raster overlay and presentation-only terrain material profile. Non-combat surfaces consume CSS sprite styles from the same contract, so asset failure never affects gameplay or text.

**Tech Stack:** TypeScript, Canvas 2D, DOM/CSS, Node test runner, local PNG atlas generated offline with Python/Pillow.

**Spec:** `docs/superpowers/specs/2026-09-02-phase1937-1944-battlefield-environment-identity-design.md`

## Global Constraints

- Presentation-only: do not alter map geometry, collisions, map-evolution timing/gameplay mutations, enemy/boss/spell values, Final Form systems, economy, Build Capsule/Replay progress calculations, RunSnapshot schema, or the 9 action controls.
- Raster asset is optional and non-blocking; existing gradient/grid and all text labels remain usable on load failure.
- Motion amplitude for the new battlefield asset path is exactly `0`.
- One local atlas only: 3 maps × 3 stages = 9 unique cells.
- Release Freeze must fail closed if battlefield identity evidence is forged or inconsistent.
- Delivery is based on the uploaded Phase 1936 ZIP; the local Git history created for this run is a verification/workflow history, not the original upstream history.

---

### Task 1: Battlefield asset contract and 9-cell atlas

**Files:**
- Create: `src/game/battlefield-environment-assets.ts`
- Create: `assets/arena/battlefield-environments.png`
- Create: `tests/phase1937-battlefield-environment-assets.test.mjs`

**Interfaces:**
- Consumes: `MapId` from `src/game/map-layouts.ts`, `MapEvolutionStage` from `src/game/map-evolution.ts`.
- Produces: `BATTLEFIELD_ENVIRONMENT_ATLAS`, `BATTLEFIELD_ENVIRONMENT_MAP_IDS`, `battlefieldEnvironmentSprite(mapId, stage)`, `battlefieldEnvironmentIconStyle(mapId, stage)`, `battlefieldTerrainMaterial(mapId)`, `auditBattlefieldEnvironmentAtlas()`.

- [x] **Step 1: Write failing contract tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BATTLEFIELD_ENVIRONMENT_ATLAS,
  BATTLEFIELD_ENVIRONMENT_MAP_IDS,
  battlefieldEnvironmentSprite,
  battlefieldEnvironmentIconStyle,
  battlefieldTerrainMaterial,
  auditBattlefieldEnvironmentAtlas,
} from '../dist/game/battlefield-environment-assets.js';

test('Phase 1937 maps all three battlefields across three evolution stages to unique static cells', () => {
  assert.deepEqual(BATTLEFIELD_ENVIRONMENT_MAP_IDS,['ruinedGate','frozenFen','crystalQuarry']);
  const keys=[];
  for (const mapId of BATTLEFIELD_ENVIRONMENT_MAP_IDS) for (const stage of [0,1,2]) {
    const sprite=battlefieldEnvironmentSprite(mapId,stage);
    keys.push(`${sprite.sx}:${sprite.sy}`);
    assert.equal(sprite.animated,false);
    assert.equal(sprite.motionAmplitude,0);
    assert.equal(sprite.textFallbackPreserved,true);
    assert.match(battlefieldEnvironmentIconStyle(mapId,stage),/battlefield-environments\.png/);
  }
  assert.equal(new Set(keys).size,9);
  assert.equal(auditBattlefieldEnvironmentAtlas().passed,true);
  assert.equal(BATTLEFIELD_ENVIRONMENT_ATLAS.columns,3);
  assert.equal(BATTLEFIELD_ENVIRONMENT_ATLAS.rows,3);
});

test('Phase 1940 terrain material identity is presentation-only and distinct per map',()=>{
  const materials=BATTLEFIELD_ENVIRONMENT_MAP_IDS.map(battlefieldTerrainMaterial);
  assert.equal(new Set(materials.map(x=>x.wallFill)).size,3);
  assert.equal(new Set(materials.map(x=>x.poolCenter)).size,3);
});
```

- [x] **Step 2: Run the focused test and verify it fails**

Run: `npm run build && node --test tests/phase1937-battlefield-environment-assets.test.mjs`
Expected: TypeScript/test import failure because `battlefield-environment-assets.ts` does not exist.

- [x] **Step 3: Implement the contract and generate the atlas**

Create a `3 × 3` atlas with 256×144 cells (`768×432` total). Rows are map IDs in frozen order; columns are stages `0,1,2`. Keep silhouettes low contrast: broken gate masonry, frozen reed/ice channels, crystal quarry seams. Export sprite source rectangles and CSS background positioning. Material profiles only contain colors/line widths used by rendering.

- [x] **Step 4: Run the focused test**

Run: `npm run build && node --test tests/phase1937-battlefield-environment-assets.test.mjs`
Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add src/game/battlefield-environment-assets.ts assets/arena/battlefield-environments.png tests/phase1937-battlefield-environment-assets.test.mjs
git commit -m "feat: add battlefield environment identity atlas"
```

### Task 2: Combat renderer and terrain material integration

**Files:**
- Modify: `src/game/game.ts`
- Modify: `src/game/terrain.ts`
- Create: `tests/phase1938-1940-battlefield-render-integration.test.mjs`

**Interfaces:**
- Consumes: `BATTLEFIELD_ENVIRONMENT_ATLAS`, `battlefieldEnvironmentSprite()`, `battlefieldTerrainMaterial()` from Task 1.
- Produces: one optional `HTMLImageElement` cache in `Game`; `drawArena()` fallback-first overlay; terrain renderer material lookup by `currentLayout.id`.

- [x] **Step 1: Write failing source/invariant tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const terrain=fs.readFileSync(new URL('../src/game/terrain.ts',import.meta.url),'utf8');

test('Phase 1938 arena draws fallback before optional battlefield raster overlay',()=>{
  const fallback=game.indexOf('ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT)');
  const sprite=game.indexOf('battlefieldEnvironmentSprite(');
  const draw=game.indexOf('this.battlefieldEnvironmentAtlasReady',fallback);
  assert.ok(fallback>=0 && sprite>=0 && draw>fallback);
  assert.match(game,/image\.onerror = \(\) => \{ this\.battlefieldEnvironmentAtlasReady = false; \}/);
});

test('Phase 1939 stage selection follows existing terrain evolutionStage without gameplay hooks',()=>{
  assert.match(game,/battlefieldEnvironmentSprite\(this\.terrain\.currentLayout\.id, this\.terrain\.evolutionStage\)/);
});

test('Phase 1940 terrain renderer consumes presentation-only material profile',()=>{
  assert.match(terrain,/battlefieldTerrainMaterial\(this\.currentLayout\.id\)/);
});
```

- [x] **Step 2: Verify tests fail**

Run: `npm run build && node --test tests/phase1938-1940-battlefield-render-integration.test.mjs`
Expected: FAIL because the new asset loader/render/material calls are absent.

- [x] **Step 3: Implement optional image loading and fallback-first draw**

Add `battlefieldEnvironmentAtlasImage`/`Ready`, initialize it beside existing atlas loaders, and after gradient fill draw the selected cell across the logical arena using a conservative alpha. Never gate start/update/render on readiness.

- [x] **Step 4: Implement terrain material identity**

At the start of `TerrainSystem.render`, read `const material=battlefieldTerrainMaterial(this.currentLayout.id)` and replace hard-coded pool/wall presentation colors only. Preserve all geometry loops, crystal state, collision and damage logic unchanged.

- [x] **Step 5: Run focused and existing map tests**

Run: `npm run build && node --test tests/phase1938-1940-battlefield-render-integration.test.mjs tests/map-layouts.test.mjs tests/map-evolution.test.mjs`
Expected: PASS.

- [x] **Step 6: Commit**

```bash
git add src/game/game.ts src/game/terrain.ts tests/phase1938-1940-battlefield-render-integration.test.mjs
git commit -m "feat: integrate battlefield identity into combat rendering"
```

### Task 3: Results, lobby, resume, HUD and replay identity reuse

**Files:**
- Modify: `src/ui/results.ts`
- Modify: `src/ui/lobby.ts`
- Modify: `src/domain/build-replay-guidance.ts`
- Modify: `src/game/game.ts`
- Modify: `src/styles.css`
- Create: `tests/phase1941-1942-battlefield-surface-integration.test.mjs`

**Interfaces:**
- Consumes: `battlefieldEnvironmentIconStyle(mapId, stage)`.
- Produces: `replayGuidanceMapIconStyle(plan)` and map identity icons on existing map-text surfaces only where `mapId` is already available.

- [x] **Step 1: Write failing surface tests**

Create tests that assert: result map identity receives a static icon; lobby recent-run uses `newest.mapId` when present; resume uses `resumeSnapshot.map.id`/stored map id already present in the snapshot; replay exposes target `mapId`; HUD keeps the map name text and draws/labels identity without removing `compactLandscapeStatusLine`.

- [x] **Step 2: Verify failure**

Run: `npm run build && node --test tests/phase1941-1942-battlefield-surface-integration.test.mjs`
Expected: FAIL on absent map identity helpers/styles.

- [x] **Step 3: Implement minimal static surface reuse**

Add a `.battlefield-identity-icon` CSS class using CSS variables from `battlefieldEnvironmentIconStyle`. Do not add new timers or animation. Preserve all existing text, especially map name/status and recent/resume copy.

- [x] **Step 4: Run focused UI/replay tests**

Run: `npm run build && node --test tests/phase1941-1942-battlefield-surface-integration.test.mjs tests/build-replay-guidance.test.mjs tests/lobby-result-identity-assets.test.mjs`
Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add src/ui/results.ts src/ui/lobby.ts src/domain/build-replay-guidance.ts src/game/game.ts src/styles.css tests/phase1941-1942-battlefield-surface-integration.test.mjs
git commit -m "feat: reuse battlefield identity across run surfaces"
```

### Task 4: Deterministic audit and Release Freeze fail-closed binding

**Files:**
- Create: `src/game/battlefield-environment-asset-audit.ts`
- Modify: `src/game/release-freeze-audit.ts`
- Modify: `src/game/release-candidate-audit.ts` only if signature collection requires an explicit field path update; otherwise preserve generic evidence hashing.
- Create: `tests/phase1943-battlefield-environment-audit.test.mjs`
- Create: `tests/phase1944-battlefield-environment-release-gate.test.mjs`

**Interfaces:**
- Produces: `auditBattlefieldEnvironmentAssets()` with exactly 45 deterministic samples = 3 maps × 3 stages × 5 surfaces (`combat`, `hud`, `result`, `lobby-resume`, `replay`).
- Release Freeze fields: `battlefieldEnvironmentAssetsPassed:boolean`, `battlefieldEnvironmentAssetsSamples:45`.

- [x] **Step 1: Write failing audit tests**

Assert 9/9 atlas coverage, 9 unique cells, out-of-bounds 0, surface coverage 100%, motion amplitude 0, fallback 100%, action count 9, snapshot schema mutation false, sample count 45.

- [x] **Step 2: Write failing release-gate tests**

```js
const freeze=auditReleaseFreeze();
assert.equal(freeze.battlefieldEnvironmentAssetsPassed,true);
assert.equal(freeze.battlefieldEnvironmentAssetsSamples,45);
const base=releaseCandidateAudit();
const forged=structuredClone(base.evidence);
forged.releaseFreeze.battlefieldEnvironmentAssetsPassed=false;
forged.releaseFreeze.passed=true;
assert.notEqual(releaseCandidateAudit(forged).status,'PASS');
const changed=structuredClone(base.evidence);
changed.releaseFreeze.battlefieldEnvironmentAssetsSamples+=1;
assert.notEqual(releaseCandidateAudit(changed).signature,base.signature);
```

- [x] **Step 3: Verify tests fail**

Run: `npm run build && node --test tests/phase1943-battlefield-environment-audit.test.mjs tests/phase1944-battlefield-environment-release-gate.test.mjs`
Expected: FAIL because audit and freeze fields are absent.

- [x] **Step 4: Implement audit and bind Release Freeze**

Mirror the Phase 1935/1936 Final Form evidence style, but sample battlefield map-stage-surface tuples. Add a release detail line `battlefield-environment-assets safe (45)` and include both new fields in the freeze consistency checks.

- [x] **Step 5: Run release-focused regressions**

Run: `npm run build && node --test tests/phase1943-battlefield-environment-audit.test.mjs tests/phase1944-battlefield-environment-release-gate.test.mjs tests/phase1935-final-form-identity-audit.test.mjs tests/phase1936-final-form-identity-release-gate.test.mjs tests/release-freeze-gate.test.mjs`
Expected: PASS.

- [x] **Step 6: Commit**

```bash
git add src/game/battlefield-environment-asset-audit.ts src/game/release-freeze-audit.ts src/game/release-candidate-audit.ts tests/phase1943-battlefield-environment-audit.test.mjs tests/phase1944-battlefield-environment-release-gate.test.mjs
git commit -m "test: bind battlefield identity to release freeze"
```

### Task 5: Handoff, complete verification, merge and delivery ZIP

**Files:**
- Create: `PHASE1937-1944-HANDOFF.md`
- Update only if generated by existing tooling: release manifest/candidate artifacts.

**Interfaces:**
- Consumes: all Task 1–4 outputs.
- Produces: verified Phase 1944 worktree commit, merge into the locally reconstructed `main`, and a full-source ZIP excluding `.git`, `.worktrees`, and transient test logs.

- [x] **Step 1: Run fresh TypeScript build**

Run: `npm run build`
Expected: PASS.

- [x] **Step 2: Run focused Phase 1937~1944 regression set**

Run the five new phase tests plus map, evolution, Final Form identity, lobby/result identity, replay guidance, Release Freeze and candidate tests.
Expected: 100% PASS.

- [x] **Step 3: Run full suite in a persistent shell session**

Run: `npm test`
Expected: all test files/tests PASS. Capture the final file/test counts rather than assuming the Phase 1936 count.

- [x] **Step 4: Run release verification**

Run: `npm run verify:candidate` and any existing release/freeze script used by the project.
Expected: Candidate PASS, Release Freeze PASS, Actions 9/9.

- [x] **Step 5: Write handoff with measured evidence**

Record asset dimensions/bytes, exact coverage/sample counts, focused/full regression totals, fresh build, candidate signature, forged/sample mutation behavior, frozen gameplay list, and delivery SHA-256.

- [x] **Step 6: Commit and merge local workflow branch**

```bash
git add PHASE1937-1944-HANDOFF.md
git commit -m "docs: hand off phase1937-1944"
git checkout main
git merge --no-ff work/phase1937-1944 -m "merge: phase1937-1944 battlefield environment identity"
```

- [x] **Step 7: Create and verify delivery ZIP**

Create `arcane-last-stand-phase1944-full-merged.zip` from the merged source without `.git/.worktrees`. Extract to a new directory, run at minimum fresh build + all new Phase 1937~1944 tests there, then `unzip -t` and SHA-256 the final ZIP.
