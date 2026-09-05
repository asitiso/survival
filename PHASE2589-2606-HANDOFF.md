# Phase 2589~2606 Handoff — Objective Activation / Boss Arena Transition / Boundary Warning VFX

## Scope

Presentation-only 3-Train VFX expansion. No combat balance, objective scheduling/reward math, boss stats/pattern timing, hero movement, terrain collision, action count, or snapshot-schema changes.

## Train A — Phase 2589~2594: Objective Activation / Materialization VFX

- New atlas: `assets/arena/objective-activation-materialization-vfx.png`
- 3 objectives × 2 states: `materialize`, `locator`
- 6 cells, 128×128 each, 3×2 atlas, 384×256
- A cue is queued only from a real `BattlefieldObjectiveDirector` start transition after `chooseObjectiveAnchor(...)` and `objectiveRuntime.begin(...)` use the actual selected anchor.
- The materialization stamp stays on the objective's true world position.
- The locator stamp derives its angle from the live hero → objective vector, helping the player acquire a newly spawned objective without adding auto-navigation.
- Queue is capped at 8, reset clears it, TTL advances on safe dt, Reduced Flash caps alpha, and missing atlas leaves the existing objective marker/toast flow intact.

## Train B — Phase 2595~2600: Boss Arena Transition World VFX

- New atlas: `assets/bosses/boss-arena-transition-world-vfx.png`
- 6 boss archetypes × 2 lifecycle states: `entrance`, `exit`
- 12 cells, 128×128 each, 6×2 atlas, 768×256
- Entrance cue is queued only from the existing first-seen boss spawn presentation seam and is anchored to the real boss position/radius.
- Exit cue is queued only from the existing real boss death event and is anchored to the actual death position.
- Existing boss spawn/death cinematics, HP, phase thresholds, pattern timers, rewards, camera pressure, and encounter state are unchanged.
- Queue is capped at 12, reset clears it, Reduced Flash lowers alpha, and atlas load failure is non-blocking.

## Train C — Phase 2601~2606: Map Combat Boundary / Obstacle Warning VFX

- New atlas: `assets/arena/map-combat-boundary-warning-vfx.png`
- 3 maps × 2 warning kinds: `boundary`, `obstacle`
- 6 cells, 128×128 each, 3×2 atlas, 384×256
- Arena warning derives proximity from the real arena rectangle: `ARENA_MARGIN`, `ARENA_MARGIN + 38`, `LOGICAL_WIDTH`, `LOGICAL_HEIGHT`.
- Only the nearest arena edge is accented, and only when the hero is within 118 logical pixels.
- Obstacle warning derives the closest point on each real terrain wall rectangle using the existing wall geometry, shows only walls within 112 logical pixels, sorts by distance, and caps to 3 warnings.
- No collision radius, speed multiplier, pathfinding, wall geometry, or movement rule is changed.
- Missing atlas leaves the normal terrain sprites/border fully usable; Reduced Flash lowers warning alpha.

## Release Binding

New deterministic 64-sample audits:

- `objective-activation-materialization-vfx-audit.ts`
- `boss-arena-transition-world-vfx-audit.ts`
- `map-combat-boundary-warning-vfx-audit.ts`

Each audit requires presentation-only behavior, fail-open loading, no gameplay formula mutation, no snapshot schema mutation, and Action count 9. Release Freeze and Candidate signature material bind all three pass bits and sample counts.

Forging any new audit pass bit to false produces Candidate `REVIEW` with `release-freeze`; changing any of the three new sample counts changes the Candidate signature.

## Asset Evidence

- `objective-activation-materialization-vfx.png`: 57,760 bytes; SHA-256 `9c648dfc67e6329e40e1492098fc9654850e152ff66ffb03cf9a22bd6a172ef0`; 6/6 non-empty and pixel-unique.
- `boss-arena-transition-world-vfx.png`: 164,238 bytes; SHA-256 `2312de5a64a626f91358e4880773e9a2a082da46e55f35c793eeee3960b1d123`; 12/12 non-empty and pixel-unique.
- `map-combat-boundary-warning-vfx.png`: 30,314 bytes; SHA-256 `03e95f2469e7afb716a76b1397e3e9ac00f033d17d1acb77cb3e5d7d4f64b372`; 6/6 non-empty and pixel-unique.

Total: 24/24 non-empty, pixel-unique cells.

## Verification

- Baseline before implementation: build PASS + Phase 2571~2588 contracts 18/18 PASS.
- TDD RED: 18/18 new contracts failed before implementation.
- GREEN: 18/18 new contracts pass after implementation.
- Related objective / boss arena / previous VFX / release regressions: 94/94 pass.
- Full regression, split only to stay inside execution time limits: 729 test files / 2,398 tests / 2,398 pass / 0 fail.
- Candidate: `RCQ-FAB4B5DB` PASS.
- Raster: 5/5 PASS (`16:9`, `20:9`, `4:3`, `foldable`, `32:9`).
- Release: `RQ-D4630257` PASS; Action 9/9; Raster 5/5; baseline mutation disabled.
- New audit fail-bit forging: all three force Candidate `REVIEW` + `release-freeze`; all three change Candidate signature.
- New sample-count forging: all three change Candidate signature while the unchanged evidence remains PASS.

## Next VFX Direction

Do not stack more layers onto objective activation, boss arena entrance/exit, or boundary proximity next. Higher-value remaining candidates are objective **failure/dissolve** feedback at the real failed anchor, field-event **entrance/exit world cues** tied to the existing event lifecycle, and **elite pack approach/formation** accents only when they improve threat acquisition beyond the current enemy/edge telegraphs. Prefer features that remove visual searching rather than decorative effects that merely add motion.
