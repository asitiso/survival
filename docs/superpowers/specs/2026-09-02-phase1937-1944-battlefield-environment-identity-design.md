# Phase 1937~1944 — Battlefield Environment Identity Integration Design

## Goal
Make the three existing battlefields immediately distinguishable during long landscape-mobile runs without changing gameplay geometry, balance, persistence schema, or action controls.

## Scope
Presentation-only integration across the existing map/evolution surfaces:
- Ruined Gate
- Frozen Marsh
- Mana Quarry
- Evolution stages 0/1/2

## Design

### 1. Environment atlas
Create one local raster atlas at `assets/arena/battlefield-environments.png` containing 9 static cells (3 maps × 3 evolution stages). Keep the artwork low-frequency and low-contrast so enemies, projectiles, hazards, terrain and HUD remain the primary combat signals.

The atlas is decorative. Failure or late loading must leave the existing gradient/grid battlefield fully usable.

### 2. Battle renderer integration
Add a small `battlefield-environment-assets` contract that maps map id + evolution stage to atlas cells and presentation metadata. `drawArena()` continues drawing the current fallback first, then overlays the matching environment cell if loaded.

No timer, collision, spawn, navigation or map-evolution logic may depend on raster availability.

### 3. Evolution continuity
Use the current map-evolution state to select stage 0/1/2 artwork. Switching stages is static and immediate; no pulse, parallax, camera shake or animated layer is introduced. Motion amplitude remains 0.

### 4. Terrain material identity
Reuse existing canvas terrain primitives, but choose presentation-only material accents by map identity. Functional geometry and collision remain unchanged.

### 5. Persistent identity surfaces
Reuse the same atlas identity on existing non-combat surfaces where map identity already exists in data:
- HUD map label
- run result
- lobby recent run
- resumable run
- build replay target when a target map is available

Text remains primary fallback and must remain visible when image loading fails.

### 6. Audit and release fail-closed
Add deterministic audit evidence for:
- 3/3 maps
- 9/9 map-stage cells
- unique atlas cells
- in-bounds atlas coordinates
- static/motion amplitude 0
- text fallback coverage 100%
- image-load failure non-blocking contract
- 9 Actions 9/9
- no RunSnapshot schema mutation

Bind the audit result and deterministic sample count into Release Freeze and Release Candidate signature generation. A forged upper-level PASS with failed battlefield evidence must yield REVIEW / release-freeze.

## Frozen gameplay
Do not change:
- map geometry / collisions / terrain dimensions
- map evolution timing and gameplay mutations
- enemy, boss, projectile or spell values
- Final Form, Flow, Signature, Mobility or Finisher logic
- economy or rewards
- Build Capsule / Replay progress calculations
- RunSnapshot schema
- 9 action controls

## Testing
Use test-first coverage for the new asset contract, audit, renderer-facing helpers, lobby/result/replay surface helpers, and release-freeze fail-closed behavior. Run focused regressions, fresh TypeScript build, full node test suite, release candidate/freeze verification, action count checks, and ZIP integrity checks on a freshly extracted delivery artifact.
