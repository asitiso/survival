# Mobile follow camera design

## Goal

Make the phone-landscape battlefield easier to read by zooming the world view and following the hero, without changing combat simulation, HUD controls, or desktop presentation.

## Scope

- Activate only when the existing phone-landscape profile is active.
- Keep the logical world at 1600 by 900 and retain every combat coordinate, collision, spawn, AI, range, and damage formula.
- Keep desktop, tablet, foldable, and portrait layouts on the existing centered camera.
- Keep HUD, joystick, and action buttons outside the world camera transform.

## Camera module

Add a small `mobile-follow-camera` module that owns camera-only math.

- Input: viewport dimensions, phone-landscape activation, arena bounds, hero world position, previous camera center, and frame delta.
- Output: active flag, camera center, base zoom, visible world bounds, and a world-to-screen transform.
- Phone landscape uses base zoom 1.70. Other profiles use a centered camera with zoom 1.00.
- The existing transient combat scale multiplies this base zoom; it is not replaced.

## Follow behavior

- The hero can move inside a centered dead zone covering 36% of visible width and 40% of visible height without moving the camera.
- Outside the dead zone, the camera moves toward the nearest dead-zone boundary with time-based smoothing.
- Clamp the camera center to the arena so the player never sees outside-world space.
- When the hero reaches an arena edge, the camera stops and the hero can move toward the corresponding screen edge.
- The core never takes camera ownership. Core danger remains an HUD and edge-warning concern.

## Rendering and warnings

- `Game.render()` applies the calculated world camera around the existing world draw sequence.
- It preserves current shake offsets and existing transient `cameraScale` effects.
- `ctx.restore()` occurs before HUD and control rendering, so existing mobile HUD and input coordinates remain unchanged.
- Edge threat indicators receive camera-transformed projectile positions, ensuring their direction is based on the visible mobile view rather than the full 1600 by 900 world.

## Error handling and fallback

- Invalid or missing timing and position inputs are sanitized to finite values.
- A non-phone profile returns the exact existing centered-camera behavior.
- A camera state outside the arena is clamped before rendering.

## Tests

- Unit tests for mobile activation, 1.70 zoom, dead-zone stability, soft follow, and all four arena-edge clamps.
- Unit tests that confirm the desktop camera remains centered with 1.00 zoom.
- Edge-indicator projection tests for visible and off-screen projectile directions.
- Existing mobile input, render contract, and full regression suites must remain green.

## Non-goals

- No combat balance changes.
- No screen tap-to-world targeting changes.
- No camera handoff to the core, boss, or projectiles.
- No HUD or action-control redesign in this change.
