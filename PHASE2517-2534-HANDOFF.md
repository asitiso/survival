# Phase 2517-2534 Handoff — 3× VFX Feature Train: Boss Phase Aftermath / Specialist Reactions / Map Evolution Aftermath

## Scope
Three battlefield-first VFX trains built on Phase 2516. This pass targets lifecycle moments that were mechanically clear but visually short-lived: boss phase transitions after the banner pulse, specialist abilities at their actual gameplay trigger, and map evolution after the initial collapse flash. All new layers are presentation-only, bounded, independently loaded, and fail-open. Boss phase thresholds, specialist damage/guard/blink/nullifier rules, map evolution timing/layouts, action count, and snapshot schema remain unchanged.

## Train A — Phase 2517-2522: Boss Phase Aftermath VFX

### Phase 2517 — Six Archetypes × Two Phases × Two States
- Added `assets/bosses/boss-phase-aftermath-vfx.png`.
- 768×512, 6×4, 128×128 cells.
- Inferno / Summoner / Juggernaut / Abyss Witch / Twin Maw / Time Eater × Phase II / III × Burst / Aftermath = 24 states.
- 24/24 cells are non-empty and pixel-unique.

### Phase 2518 — Actual Phase Transition Trigger
- Existing `BossPresentation.update()` remains the source of truth.
- A cue is queued only when the existing Phase II/III transition is returned.
- Boss archetype, phase, and resolved world position are copied into a presentation-only queue.

### Phase 2519 — Burst → Aftermath
- Transition cue uses Burst during the first 34% of its visual lifetime, then Aftermath.
- Phase III is rendered slightly larger than Phase II for hierarchy only.
- Existing boss phase thresholds and phase tuning are unchanged.

### Phase 2520 — Bounded Lifecycle
- Queue capped at 12 cues.
- TTL-driven cleanup in the existing map/presentation update path.
- Queue clears on run reset.

### Phase 2521 — Independent Fail-open Loading
- Atlas loads independently in `Game`.
- Load failure hides only the new world aftermath layer.
- Existing phase telegraph, banner, shockwaves, boss signature VFX, haptics, and camera pressure remain intact.

### Phase 2522 — Deterministic Audit
- `runBossPhaseAftermathVfxAudit()` emits exactly 64 samples.
- Release Freeze/Candidate bind presentation-only, fail-open, gameplay/snapshot preservation, and 9/9 actions.

## Train B — Phase 2523-2528: Specialist Reaction Lifecycle VFX

### Phase 2523 — Four Specialists × Two States
- Added `assets/enemies/specialist-reaction-lifecycle-vfx.png`.
- 512×256, 4×2, 128×128 cells.
- Shieldbearer / Assassin / Siege Golem / Nullifier × Trigger / Afterglow = 8 states.
- 8/8 cells are non-empty and pixel-unique.

### Phase 2524 — Shieldbearer Guard Reaction
- Existing guard formula remains `Math.min(guardHp, remaining * 0.72)`.
- A reaction cue is queued only when guard actually absorbs damage.
- Guard-break crossing is detected for visual duration only; damage calculation is unchanged.

### Phase 2525 — Assassin Blink Reaction
- Existing `assassinBlinkPosition()` and reset cadence remain unchanged.
- Cue stores both actual blink origin and clamped destination.
- Trigger appears at origin and Afterglow resolves at destination.

### Phase 2526 — Siege Golem Slam Reaction
- Existing target selection and contact damage run first.
- A slam cue is then placed at the already-resolved target position.
- No new attack branch or damage multiplier is introduced.

### Phase 2527 — Nullifier Entry Reaction
- Presentation-only edge tracking detects hero entry into the existing nullifier radius.
- Cue fires only on outside→inside transition rather than every frame.
- Reaction queue capped at 24, reset between runs, stale nullifier IDs removed.

### Phase 2528 — Deterministic Audit
- `runSpecialistReactionLifecycleVfxAudit()` emits exactly 64 samples.
- Release Freeze/Candidate bind fail-open presentation behavior and unchanged gameplay/snapshot contracts.

## Train C — Phase 2529-2534: Map Evolution Aftermath VFX

### Phase 2529 — Three Maps × Two Evolution Stages × Three States
- Added `assets/arena/map-evolution-aftermath-vfx.png`.
- 384×768, 3×6, 128×128 cells.
- Ruined Gate / Frozen Fen / Crystal Quarry × Stage I / II × Collapse / Debris / Settle = 18 states.
- 18/18 cells are non-empty and pixel-unique.

### Phase 2530 — Existing Evolution Trigger
- Existing `terrain.updateEvolution(elapsed)` result remains the trigger.
- Queue is created inside the existing `emitMapEvolutionVfx(stage)` path.
- Map ID and actual resulting evolution stage are copied for presentation only.

### Phase 2531 — Collapse → Debris → Settle
- Collapse: first 24%.
- Debris: 24–62%.
- Settle: final 38%.
- Existing obstacle-state images, environment reaction, pulse/glow, and particles remain layered beneath/alongside it.

### Phase 2532 — Bounded Lifecycle
- Queue capped at 8 cues.
- TTL-driven cleanup and run-reset clearing.

### Phase 2533 — Existing Evolution Gameplay Preserved
- Stage I/II wall, pool, and crystal layout mutations remain entirely in `map-evolution.ts`.
- New atlas failure cannot block evolution or existing fallback VFX.

### Phase 2534 — Deterministic Audit & Release Binding
- `runMapEvolutionAftermathVfxAudit()` emits exactly 64 samples.
- All three trains are part of Release Freeze consistency, Candidate signature payload, and markdown evidence.
- Forging any new Passed field forces Candidate REVIEW with `release-freeze`.
- Changing any new sample count changes Candidate signature.

## Verification
- Baseline before implementation: 714 test files / 2,308 tests / 0 failures.
- TDD RED: 18/18 new feature contracts failed before implementation.
- New feature contracts after implementation: 18/18 PASS.
- Related boss / specialist / map / VFX regressions: 154 files / 511 tests / 0 failures.
- Full suite after implementation: 717 test files / 2,326 tests / 0 failures.
- TypeScript build: PASS.
- Candidate audit: `RCQ-0DD4CBD3` PASS.
- Release quality gate: `RQ-D4630257` PASS, action invariant 9/9.
- Raster baseline: 5/5 PASS.
- Boss phase aftermath atlas SHA-256: `30d0e2540ebf222718271f8992fa7fe8c27f1d80ff181eca20096c6747e1c0b8`.
- Specialist reaction atlas SHA-256: `e753c148c4f3bd856923240e4966cd0b5844a068232ad4164d4882d45b6e50dc`.
- Map evolution aftermath atlas SHA-256: `6abde2713828343c6eab9f4476e5c2c2e93cf4dcda3de0ea4fd4cff27cd80bb0`.

## Continuation Notes
Avoid adding more layers to the same boss-phase, specialist-trigger, or map-evolution moments next pass. Higher-value VFX gaps include hero dash/evade path readability, objective activation/completion world effects, crowd-control chain propagation, or boss weakpoint counterplay reward aftermath. Keep queues bounded, preserve Reduced Flash/Motion behavior, and retain all existing primitive/image fallbacks.
