# Phase 2607~2624 Handoff — Objective Failure / Field Event Lifecycle / Elite Pack Approach VFX

## Scope

Presentation-only 3-Train VFX expansion focused on reducing visual searching after failure and during time-limited battlefield events. No objective reward/timing math, field-event modifier math, enemy spawn count, elite stats/AI, movement, collision, economy, action count, or snapshot-schema changes.

## Train A — Phase 2607~2612: Objective Failure / Dissolve VFX

- New atlas: `assets/arena/objective-failure-dissolve-vfx.png`
- 3 objectives × 2 states: `fracture`, `dissolve`
- 6 cells, 128×128 each, 3×2 atlas, 384×256
- Director timeout failure captures the active objective's real position before `failActive()` clears runtime state, then queues the failure VFX on that exact anchor.
- Objective-rule failure from `objectiveRuntime.update(...)` queues the same VFX from the still-live `active.pos` before the battlefield objective is completed/cleared.
- The cue transitions from fracture to dissolve using presentation TTL only; it never changes failure rules, streak reset, or rewards.
- Queue cap 8, reset clears it, safe-dt TTL, Reduced Flash cap, atlas load failure is fail-open.

## Train B — Phase 2613~2618: Field Event Lifecycle World VFX

- New atlas: `assets/arena/field-event-lifecycle-world-vfx.png`
- 5 events × 2 lifecycle states: `entrance`, `exit`
- 10 cells, 128×128 each, 5×2 atlas, 640×256
- Event start records one world anchor after event-specific spawning:
  - Golden Goblin: the actual randomized event spawn position.
  - Supply Drop: the actual crate position.
  - Elite Rush: centroid of the elites spawned by that event.
  - Mana Storm / Golden Night: hero position at activation because the events are global and have no independent world entity.
- Timed expiry and early completion (Golden Goblin kill / Supply Drop pickup) both emit exit VFX using the retained event anchor.
- Existing event duration, cooldown/spawn/gold/elite modifiers, rewards, and scheduling stay unchanged.
- Queue cap 10, reset clears cue + retained anchor, Reduced Flash cap, atlas load failure is fail-open.

## Train C — Phase 2619~2624: Elite Pack Approach / Formation VFX

- New atlas: `assets/enemies/elite-pack-approach-formation-vfx.png`
- 2 targets (`hero`, `core`) × 3 states (`approach`, `formation`, `focus`)
- 6 cells, 128×128 each, 2×3 atlas, 256×384
- Only elites spawned by the existing `eliteRushCount(danger)` loop are tracked; no extra enemies are created.
- The dominant target is presentation metadata only and is derived from the same per-enemy target choices already made by the spawn loop.
- Every render samples only living tracked elites, recomputes their real centroid and spread, and points the approach accent from that centroid toward the live hero/core target position.
- Formation ring remains around the moving pack; focus stamp only appears as the pack gets close enough to the target.
- VFX lasts 4.4s, queue cap 3, reset clears it, Reduced Flash cap, atlas load failure is fail-open.
- No elite damage, speed, target AI, affix, interval, or spawn-count formulas are changed.

## Release Binding

New deterministic 64-sample audits:

- `objective-failure-dissolve-vfx-audit.ts`
- `field-event-lifecycle-world-vfx-audit.ts`
- `elite-pack-approach-formation-vfx-audit.ts`

Each audit requires presentation-only behavior, fail-open loading, no gameplay formula mutation, no snapshot schema mutation, and Action count 9. Release Freeze and Candidate signature material bind all three pass bits and sample counts.

Forging any new audit pass bit to false produces Candidate `REVIEW` with `release-freeze`; changing any of the three sample counts changes the Candidate signature.

## Asset Evidence

- `objective-failure-dissolve-vfx.png`: 64,174 bytes; SHA-256 `c5f1306e53063996825acc46078f77eda02459f0b1a967ce7af15e35b501457d`; 6/6 non-empty and pixel-unique.
- `field-event-lifecycle-world-vfx.png`: 97,670 bytes; SHA-256 `07e2138aa6030c413f767536e6ae15932595f845c87076d3c8fc5cbf709dd9ab`; 10/10 non-empty and pixel-unique.
- `elite-pack-approach-formation-vfx.png`: 58,393 bytes; SHA-256 `10b86808b3f12c27ef168886d448cb76b6a69114e16ac6eef5b9f64b9f3682ec`; 6/6 non-empty and pixel-unique.

Total: 22/22 non-empty, pixel-unique cells.

## Verification

- Baseline build before implementation: PASS.
- TDD RED: 18/18 new contracts failed before implementation.
- GREEN: 18/18 new contracts pass after implementation.
- Related objective / field-event / elite / previous VFX / release regressions: 102/102 pass.
- Full regression, split into 8 balanced groups: 732 test files / 2,416 tests / 2,416 pass / 0 fail.
- Candidate: `RCQ-588538C5` PASS.
- Raster: 5/5 PASS (`16:9`, `20:9`, `4:3`, `foldable`, `32:9`).
- Release: `RQ-D4630257` PASS; Action 9/9; Raster 5/5; baseline mutation disabled.
- New audit fail-bit forging: all three force Candidate `REVIEW` + `release-freeze` and change signature.
- New sample-count forging: all three change Candidate signature.

## Next Direction

Do not stack more decorative layers onto objective failure, field-event entrance/exit, or elite-rush formation next. The VFX stack is now dense enough that the highest-value next pass should prioritize **overlap arbitration and occlusion control** before adding more art: suppress low-priority world VFX under hero/core critical states, keep boss-special/critical projectile cues above decorative aftermath, and cap simultaneous large-area image effects by screen occupancy. If new images are added after that, prefer only cues that remove a real search problem rather than additional ambient motion.
