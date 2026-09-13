# Mobile Follow Camera Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make phone-landscape combat subjects materially larger with a bounded hero-follow camera while preserving desktop gameplay and add a collapsed-by-default mobile minimap as a secondary aid.

**Architecture:** A pure `mobile-follow-camera` module calculates activation, clamped center, zoom, and world-to-screen projection. `Game` owns only camera state and applies the resulting transform around its existing world pass. A separate minimap module owns mobile geometry and bounded markers; its toggle is an auxiliary input, never a tenth combat action.

**Tech Stack:** TypeScript, Canvas 2D, Node built-in test runner, existing mobile-landscape and input systems.

**Spec:** `docs/superpowers/specs/2026-09-13-mobile-follow-camera-design.md`

## Global Constraints

- Activate follow camera and minimap only for the existing phone-landscape profile.
- Keep the 1600×900 logical world, combat formulas, AI, spawning, collision, ranges, HUD controls, and desktop/tablet/foldable/portrait presentation unchanged.
- Use base mobile zoom exactly `1.70`; multiply the existing transient combat camera scale on top.
- Keep the core out of camera ownership; core danger remains HUD and edge-warning information.
- Keep minimap state transient and collapsed by default.
- Preserve exactly nine combat action buttons; minimap is not an `ActionId`.

---

### Task 1: Pure mobile follow-camera math

**Files:**
- Create: `src/game/mobile-follow-camera.ts`
- Create: `tests/mobile-follow-camera.test.mjs`

**Interfaces:**
- Consumes: `mobileLandscapePresentationProfile(width, height)` from `src/game/mobile-landscape-presentation.ts`.
- Produces: `MobileFollowCameraState`, `createMobileFollowCamera`, `advanceMobileFollowCamera`, `cameraWorldToScreen`, and `cameraTransform`.

- [ ] **Step 1: Write the failing camera behavior tests**

```js
test('phone camera uses zoom 1.70 and remains still inside dead zone', () => {
  const start = createMobileFollowCamera({ width: 844, height: 390, arena, hero: { x: 800, y: 450 } });
  const next = advanceMobileFollowCamera(start, { width: 844, height: 390, arena, hero: { x: 850, y: 470 }, deltaSeconds: 1 / 60 });
  assert.equal(start.active, true);
  assert.equal(start.zoom, 1.70);
  assert.deepEqual(next.center, start.center);
});

test('phone camera follows outside dead zone and clamps at arena edges', () => {
  const start = createMobileFollowCamera({ width: 844, height: 390, arena, hero: { x: 800, y: 450 } });
  const moved = advanceMobileFollowCamera(start, { width: 844, height: 390, arena, hero: { x: 1400, y: 760 }, deltaSeconds: 1 });
  assert.ok(moved.center.x > start.center.x);
  assert.ok(moved.visible.right <= arena.right);
  assert.ok(moved.visible.bottom <= arena.bottom);
});

test('desktop camera remains an identity projection', () => {
  const state = createMobileFollowCamera({ width: 1600, height: 900, arena, hero: { x: 200, y: 200 } });
  assert.equal(state.active, false);
  assert.equal(state.zoom, 1);
  assert.deepEqual(cameraWorldToScreen({ x: 200, y: 200 }, state), { x: 200, y: 200 });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm run build; node --test tests/mobile-follow-camera.test.mjs`

Expected: FAIL because `dist/game/mobile-follow-camera.js` does not exist.

- [ ] **Step 3: Implement the minimal camera module**

```ts
export interface CameraPoint { x: number; y: number; }
export interface CameraArena { left: number; top: number; right: number; bottom: number; }
export interface CameraInput { width: number; height: number; arena: CameraArena; hero: CameraPoint; }
export interface CameraAdvanceInput extends CameraInput { deltaSeconds: number; }
export interface MobileFollowCameraState { active: boolean; zoom: number; center: CameraPoint; visible: CameraArena; }
export function createMobileFollowCamera(input: CameraInput): MobileFollowCameraState;
export function advanceMobileFollowCamera(state: MobileFollowCameraState, input: CameraAdvanceInput): MobileFollowCameraState;
export function cameraWorldToScreen(point: CameraPoint, state: MobileFollowCameraState): CameraPoint;
export function cameraTransform(state: MobileFollowCameraState, combatScale: number): { center: CameraPoint; scale: number; };
```

Sanitize finite values; derive the visible area from 1600×900 divided by zoom; use 36% width and 40% height dead zone; use a bounded time-based follow factor; clamp the final center before returning it.

- [ ] **Step 4: Run the test and verify GREEN**

Run: `npm run build; node --test tests/mobile-follow-camera.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit**

Run: `git add src/game/mobile-follow-camera.ts tests/mobile-follow-camera.test.mjs; git commit -m "feat: add mobile follow camera math"`

### Task 2: Apply the camera to world rendering and edge warnings

**Files:**
- Modify: `src/game/game.ts:3502-3595`
- Modify: `src/game/game.ts:6070-6095`
- Modify: `src/game/visual-rhythm.ts:17-27`
- Create: `tests/mobile-follow-camera-game.test.mjs`
- Modify: `tests/phase943-950-edge-threat-vfx.test.mjs`

**Interfaces:**
- Consumes: `advanceMobileFollowCamera`, `cameraTransform`, and `cameraWorldToScreen` from Task 1.
- Produces: one camera state refreshed per render frame, a world-only Canvas transform, and a `projectEdgeThreatPosition` pure helper used by edge warnings.

- [ ] **Step 1: Write the failing render and projection tests**

```js
test('projected edge warning uses the mobile camera screen direction', () => {
  const state = createMobileFollowCamera({ width: 844, height: 390, arena, hero: { x: 1200, y: 450 } });
  const projected = projectEdgeThreatPosition({ x: 1520, y: 450 }, state);
  assert.ok(projected.x > 1600);
  assert.equal(edgeThreatIndicator(projected, 1600, 900).edge, 'right');
});
```

The test must derive its expected edge from the explicit projected point, not from the helper being tested.

- [ ] **Step 2: Run the tests and verify RED**

Run: `npm run build; node --test tests/mobile-follow-camera-game.test.mjs tests/phase943-950-edge-threat-vfx.test.mjs`

Expected: FAIL because `Game` does not use the follow camera yet.

- [ ] **Step 3: Integrate the camera without moving simulation entities**

```ts
private mobileCamera = createMobileFollowCamera({ width: LOGICAL_WIDTH, height: LOGICAL_HEIGHT, arena: this.cameraArena(), hero: this.hero.pos });

private updateMobileCamera(): void {
  const rect = this.canvas.getBoundingClientRect();
  this.mobileCamera = advanceMobileFollowCamera(this.mobileCamera, {
    width: rect.width || LOGICAL_WIDTH, height: rect.height || LOGICAL_HEIGHT,
    arena: this.cameraArena(), hero: this.hero.pos, deltaSeconds: this.renderDeltaSeconds(),
  });
}
```

At the existing `ctx.save()` in `render()`, refresh the state, apply shake, then transform around `cameraTransform(this.mobileCamera, cameraScale).center` using its combined scale. Keep every world drawing call inside that save/restore pair. After restore, call `projectEdgeThreatPosition(projectile.visualPos ?? projectile.pos, this.mobileCamera)` before `edgeThreatIndicator`.

- [ ] **Step 4: Run directly coupled tests and verify GREEN**

Run: `npm run build; node --test tests/mobile-follow-camera.test.mjs tests/mobile-follow-camera-game.test.mjs tests/phase943-950-edge-threat-vfx.test.mjs tests/render-contract.test.mjs tests/mobile-input-regression-audit.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit**

Run: `git add src/game/game.ts src/game/visual-rhythm.ts tests/mobile-follow-camera-game.test.mjs tests/phase943-950-edge-threat-vfx.test.mjs; git commit -m "feat: follow hero with mobile camera"`

### Task 3: Add collapsed mobile-only minimap and auxiliary input

**Files:**
- Create: `src/game/mobile-minimap.ts`
- Modify: `src/core/input.ts:1-220`
- Modify: `src/game/game.ts:2658-2670,3502-3595,5026-5100`
- Create: `tests/mobile-minimap.test.mjs`
- Modify: `tests/mobile-input-regression-audit.test.mjs`

**Interfaces:**
- Consumes: phone-landscape activation and live hero, core, and enemy state.
- Produces: `MobileMinimapLayout`, `MobileMinimapMarkerInput`, `mobileMinimapLayout`, `mobileMinimapMarkers`, `handleMobileAuxiliaryTap`, and `consumeAuxiliaryPressed('minimap')` without changing `ActionId`.

- [ ] **Step 1: Write the failing minimap and auxiliary-input tests**

```js
test('phone minimap is collapsed by default and absent on desktop', () => {
  assert.equal(mobileMinimapLayout(844, 390, false).visible, false);
  assert.equal(mobileMinimapLayout(1600, 900, true).visible, false);
});

test('opened minimap emits only bounded strategic markers', () => {
  const markers = mobileMinimapMarkers({ hero, core, enemies: [grunt, boss, elite, coreThreat] });
  assert.deepEqual(markers.map((marker) => marker.kind), ['hero', 'core', 'boss', 'elite', 'core-threat']);
});

test('minimap toggle is auxiliary and keeps nine combat actions', () => {
  assert.equal(ACTION_BUTTONS.length, 9);
  input.handleMobileAuxiliaryTap({ x: 42, y: 178 });
  assert.equal(input.consumeAuxiliaryPressed('minimap'), true);
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `npm run build; node --test tests/mobile-minimap.test.mjs tests/mobile-input-regression-audit.test.mjs`

Expected: FAIL because minimap layout, marker filtering, and auxiliary input do not exist.

- [ ] **Step 3: Implement bounded minimap data, input, and rendering**

```ts
export type MobileMinimapMarkerKind = 'hero' | 'core' | 'boss' | 'elite' | 'core-threat';
export interface MobileMinimapLayout { visible: boolean; toggle: { x: number; y: number; width: number; height: number; }; panel: { x: number; y: number; width: number; height: number; } | null; }
export interface MinimapEnemy { pos: CameraPoint; alive: boolean; type: 'boss' | 'elite' | 'grunt'; targetsCore: boolean; }
export interface MobileMinimapMarker { kind: MobileMinimapMarkerKind; x: number; y: number; }
export interface MobileMinimapMarkerInput { hero: CameraPoint; core: CameraPoint; enemies: readonly MinimapEnemy[]; }
export function mobileMinimapLayout(width: number, height: number, open: boolean): MobileMinimapLayout;
export function mobileMinimapMarkers(input: MobileMinimapMarkerInput): readonly MobileMinimapMarker[];
```

Use a phone-only toggle rect and place the opened translucent map below the hero HUD. Add `consumeAuxiliaryPressed(id: 'minimap')` to `InputState`; process its phone-only hit before joystick ownership. In `Game`, store `private minimapOpen = false`, toggle it from auxiliary input, reset it on new run/reset, and draw it after `drawHud(ctx)` but before controls. Do not add a combat action, persistence field, ordinary enemy marker, projectile marker, or VFX marker.

- [ ] **Step 4: Run minimap and input regressions and verify GREEN**

Run: `npm run build; node --test tests/mobile-minimap.test.mjs tests/mobile-input-regression-audit.test.mjs tests/mobile-action-layout.test.mjs tests/foldable-touch-density.test.mjs`

Expected: PASS with exactly nine combat actions.

- [ ] **Step 5: Commit**

Run: `git add src/game/mobile-minimap.ts src/core/input.ts src/game/game.ts tests/mobile-minimap.test.mjs tests/mobile-input-regression-audit.test.mjs; git commit -m "feat: add optional mobile minimap"`

### Task 4: End-to-end regression and visual verification

**Files:**
- Modify only files from Tasks 1-3 when an actual regression is reproduced.
- Test: `tests/mobile-follow-camera.test.mjs`, `tests/mobile-follow-camera-game.test.mjs`, `tests/mobile-minimap.test.mjs`, and the full suite.

**Interfaces:**
- Consumes: the completed camera, rendering, warning, minimap, and auxiliary-input interfaces from Tasks 1-3.
- Produces: verified phone-landscape readability with unchanged desktop and combat surfaces.

- [ ] **Step 1: Run the focused end-to-end suite**

Run: `npm run build; node --test tests/mobile-follow-camera.test.mjs tests/mobile-follow-camera-game.test.mjs tests/mobile-minimap.test.mjs tests/mobile-action-layout.test.mjs tests/mobile-landscape-presentation.test.mjs tests/mobile-input-regression-audit.test.mjs tests/render-contract.test.mjs`

Expected: PASS.

- [ ] **Step 2: Verify a phone-landscape browser viewport visually**

Run the local server at a phone-landscape viewport of 844×390 and start a run. Confirm all of the following:

```text
Hero, enemies, spells, and terrain are visibly larger from the 1.70 world zoom.
HUD, joystick, and all nine action buttons retain screen-space positions.
Movement inside dead zone does not move the world; leaving it follows smoothly.
Arena edges reveal no outside-world space.
Core danger preserves hero camera ownership and appears through HUD/edge warning.
Minimap starts collapsed, opens with its mobile toggle, and does not cover hero HUD.
```

- [ ] **Step 3: Run the complete regression suite**

Run: `npm test`

Expected: exit code 0.

- [ ] **Step 4: Restore generated outputs and inspect the final diff**

Run: `git restore --worktree --source=HEAD -- dist; git status --short; git diff --check`

Expected: no tracked generated `dist` changes and no whitespace errors.

- [ ] **Step 5: Request review after all verification is green**

Run: `git status --short; git log --oneline -4`

Expected: only the Task 1-3 commits exist, no generated `dist` changes remain, and the branch is ready for repository review.

## Plan Self-Review

- Spec coverage: Task 1 implements phone activation, zoom, dead zone, soft follow, clamp, desktop fallback, and projection. Task 2 applies it only to the world render pass and corrects edge warnings. Task 3 implements the optional, collapsed, mobile-only minimap with no persistence or tenth action. Task 4 verifies camera readability and every stated invariant.
- Placeholder scan: no unresolved implementation markers or deferred steps remain.
- Type consistency: Task 1 defines all camera functions Task 2 consumes. Task 3 keeps `minimap` separate from `ActionId` and limits later code to its declared auxiliary-input method.
