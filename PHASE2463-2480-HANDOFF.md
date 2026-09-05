# Phase 2463-2480 Handoff — 3× Feature Train: Enemy Intent & Affix Readability

## Scope
Three presentation-only feature trains built on Phase 2462. The pass makes regular enemy attacks, elite affix responses, and hero/core target intent readable directly in the battlefield without changing combat formulas, spawn/drop values, the 9-action contract, or snapshot schema.

## Train A — Phase 2463-2468: Regular Enemy Action Lifecycle

### Phase 2463 — Action VFX Atlas
- Added `assets/enemies/regular-enemy-action-vfx.png`.
- 384×256, 3×2, 128×128 cells.
- Archer / Bomber / Shaman × Telegraph / Resolve = 6 states.
- 6/6 cells are non-empty and pixel-unique.

### Phase 2464 — Archer Pre-shot / Release
- Archer pre-shot state appears shortly before the existing ranged attack fires.
- Release burst is queued from the existing projectile creation path.
- Existing `enemy.damage` and `260 * endlessProjectileSpeedMultiplier` projectile contracts are unchanged.

### Phase 2465 — Bomber Fuse / Detonation
- Bomber fuse identity becomes readable close to its existing detonation zone.
- Resolve burst is emitted from `detonateBomber()` before the existing damage callbacks.
- `SPECIALIST_COMBAT_CONTRACT.bomberBlastRadius` and explosion damage remain unchanged.

### Phase 2466 — Shaman Cast / Heal Pulse
- Shaman cast cue is shown near its existing heal cadence.
- Heal pulse only resolves when at least one ally actually receives the existing heal.
- Existing minimum and max-HP-ratio heal formula is unchanged.

### Phase 2467 — Runtime Integration
- Game loads the new atlas independently and passes it only into enemy rendering.
- Image load failure leaves all legacy enemy shapes/telegraphs available.
- Reduced Flash lowers image intensity without hiding the underlying gameplay state.

### Phase 2468 — Deterministic Audit
- `runRegularEnemyActionVfxAudit()` emits exactly 64 deterministic samples.
- Presentation-only, fail-open image loading, unchanged gameplay/snapshot contracts, and 9/9 actions are release-bound.

## Train B — Phase 2469-2474: Elite Affix Lifecycle

### Phase 2469 — Affix Lifecycle Atlas
- Added `assets/enemies/elite-affix-lifecycle-vfx.png`.
- 768×256, 6×2, 128×128 cells.
- Swift / Armored / Regenerating / Frenzied / Commander / Mana Shield × Active / Response = 12 states.
- 12/12 cells are non-empty and pixel-unique.

### Phase 2470 — Active Affix World Identity
- Up to two existing elite affixes render low-alpha world overlays around the elite body.
- Existing compact elite affix identity icons remain intact as the legacy/readability fallback.

### Phase 2471 — Armored / Mana Shield Response
- Existing armored damage path emits an armored response cue.
- Existing mana-shield absorption emits a shield response cue only when damage is actually absorbed.
- Damage multiplier and shield subtraction formulas are unchanged.

### Phase 2472 — Regeneration / Frenzy Response
- Existing passive regeneration emits a bounded response cue when HP actually increases.
- Frenzy emits once the existing 42% HP threshold is crossed by damage.
- Regen and frenzy thresholds/formulas remain unchanged.

### Phase 2473 — Swift / Commander Response
- Existing elite contact attack emits Swift response when the affix is present.
- Existing command-aura lookup emits Commander response when its current aura actually boosts an ally.
- Response queue is deduplicated and bounded to 32 entries to prevent long-run VFX accumulation.

### Phase 2474 — Deterministic Audit
- `runEliteAffixLifecycleVfxAudit()` emits exactly 64 deterministic samples.
- Release Freeze/Candidate bind the atlas, 9-action invariant, presentation-only behavior, fail-open loading, and unchanged gameplay/snapshot contracts.

## Train C — Phase 2475-2480: Enemy Target Pressure

### Phase 2475 — Target Pressure Atlas
- Added `assets/enemies/enemy-target-pressure-vfx.png`.
- 512×256, 4×2, 128×128 cells.
- Regular / Specialist / Elite / Boss × Hero / Core = 8 states.
- 8/8 cells are non-empty and pixel-unique.

### Phase 2476 — Threat Class Mapping
- Existing enemy types map to four visual pressure classes.
- Shieldbearer / Assassin / Siege Golem / Nullifier remain grouped as Specialist.

### Phase 2477 — Clutter-aware Visibility
- Hero-target markers are limited to reaction-relevant ranged, explosive, specialist, elite, and boss enemies.
- Simple grunt/brute hero pressure remains on the legacy outline instead of receiving another icon.
- Core-targeting enemies remain explicit because their destination is otherwise easy to miss in dense waves.

### Phase 2478 — Hero/Core World Marker + Fallback
- Hero/Core target state is image-backed above the enemy body.
- Existing blue-core / dark-hero target outline remains untouched as the fail-open fallback.

### Phase 2479 — Runtime Integration
- Target-pressure atlas loads independently and is supplied only to `EnemyManager.renderEnemies()`.
- No targeting choice, target weights, enemy movement, or action/snapshot contract changes.

### Phase 2480 — Deterministic Audit & Release Binding
- `runEnemyTargetPressureVfxAudit()` emits exactly 64 deterministic samples.
- All three trains are included in Release Freeze pass evidence, Candidate consistency, Candidate signature payload, and markdown evidence.
- Forging any one of the three pass fields changes Candidate to REVIEW with `release-freeze` issue.
- Changing any one sample count changes the Candidate signature.

## Verification
- Verified TDD RED state: 18/18 new contract tests failed before implementation.
- Feature Train contracts after implementation: 18/18 PASS.
- Related enemy / elite / specialist / recent battlefield regressions: 87/87 PASS.
- Full suite: 708 test files / 2,272 tests / 0 failures.
- TypeScript build: PASS.
- `git diff --check`: PASS.
- Candidate audit: `RCQ-6E406895` PASS.
- Release quality gate: `RQ-D4630257` PASS, action invariant 9/9.
- Raster baseline: 5/5 PASS.
- Regular action atlas SHA-256: `92126d70e9113988374c8a5fe0627db0d70ff63e522e62586781f61b6f7bb30c`.
- Elite affix lifecycle atlas SHA-256: `e50f338476ffce4b4d586f867da3dc66c4d0fa283686d011dd65016347057778`.
- Enemy target pressure atlas SHA-256: `e48bcbf5b9ded759da78969373526b5e183670be9a7ca2a26677300813959eb9`.

## Continuation Notes
The next 3× train should not add decoration to already readable surfaces. Prefer either (1) high-frequency battlefield decisions where state is still inferred from tiny motion/geometry, or (2) a real gameplay/UX feature with clear time-to-understand or time-to-act improvement. Preserve bounded VFX queues and presentation fallbacks so additional image work does not create mobile performance or maintenance debt.
