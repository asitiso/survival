# Phase 2499-2516 Handoff — 3× VFX Feature Train: Boss Projectile / Persistent Zone / Crystal Lifecycle

## Scope
Three battlefield-first lifecycle VFX trains built on Phase 2498. This pass targets moments that previously required reading motion/geometry over time: boss projectile travel-to-impact, persistent spell-zone entry-to-expiry, and battlefield crystal charge-to-afterglow. All new layers are presentation-only, bounded, independently loaded, and fail-open. Damage, tick cadence, pull strength, crystal blast threshold, action count, and snapshot schema remain unchanged.

## Train A — Phase 2499-2504: Boss Projectile Lifecycle VFX

### Phase 2499 — Six Archetypes × Two States
- Added `assets/bosses/boss-projectile-lifecycle-vfx.png`.
- 768×256, 6×2, 128×128 cells.
- Inferno / Summoner / Juggernaut / Abyss Witch / Twin Maw / Time Eater × Travel / Impact = 12 states.
- 12/12 cells are non-empty and pixel-unique.

### Phase 2500 — Travel Identity
- Existing boss projectile objects remain the source of truth through `projectile.bossArchetype`.
- Travel images rotate with the existing projectile velocity and layer above the existing primitive/special projectile fallback.
- No new projectile entity or collision branch is introduced.

### Phase 2501 — Impact Identity
- A boss-only impact cue is queued immediately when an existing projectile collision is confirmed.
- Impact position and archetype are copied from the already-resolved projectile.
- Existing hero/core damage callbacks run unchanged afterward.

### Phase 2502 — Bounded Queue + Damage Preservation
- Boss projectile impact queue is capped at 24 entries.
- Existing fan damage `enemy.damage * 0.72` remains unchanged.
- Existing ring damage `enemy.damage * 0.62` remains unchanged.

### Phase 2503 — Independent Fail-open Loading
- Boss projectile lifecycle atlas loads independently in `Game`.
- Atlas load failure hides only the new lifecycle image layer.
- Existing projectile circles and boss-special projectile images remain available.

### Phase 2504 — Deterministic Audit
- `runBossProjectileLifecycleVfxAudit()` emits exactly 64 deterministic samples.
- Presentation-only, fail-open loading, unchanged gameplay/snapshot contracts, and 9/9 actions are release-bound.

## Train B — Phase 2505-2510: Persistent Spell Zone Lifecycle VFX

### Phase 2505 — Four Heroes × Two Zones × Three States
- Added `assets/heroes/persistent-spell-zone-vfx.png`.
- 768×512, 6×4, 128×128 cells.
- Arkan / Seria / Kain / Edric × Flame Field / Black Hole × Enter / Active / Expire = 24 states.
- 24/24 cells are non-empty and pixel-unique.

### Phase 2506 — Flame Field Enter / Active
- Existing flame-field TTL remains the lifecycle source of truth.
- `maxTtl` mirrors the existing duration only for presentation progress.
- Enter transitions into Active without changing `field.tickTimer += field.tick` or damage/slow behavior.

### Phase 2507 — Black Hole Enter / Active
- Existing black-hole TTL remains the lifecycle source of truth.
- Existing pull contract `boss 35 / elite 65 / others 128` remains unchanged.
- Existing `hole.tickTimer += hole.tickInterval` cadence remains unchanged.

### Phase 2508 — Expire Afterglow
- Expire VFX is queued only after the gameplay TTL reaches zero.
- Flame-field/black-hole expiry cues are capped together at 16 entries.
- Expire cues have no gameplay callbacks and cannot extend zone lifetime.

### Phase 2509 — Legacy Rendering Preserved
- Existing radial gradients, battlefield spell stamps, hero spell signatures, and ultimate signatures remain intact.
- The lifecycle atlas is an additional layer only and loads independently.

### Phase 2510 — Deterministic Audit
- `runPersistentSpellZoneVfxAudit()` emits exactly 64 deterministic samples.
- Release Freeze/Candidate bind fail-open presentation behavior, unchanged gameplay/snapshot contracts, and 9 actions.

## Train C — Phase 2511-2516: Crystal Interaction Lifecycle VFX

### Phase 2511 — Three Maps × Four States
- Added `assets/arena/crystal-interaction-lifecycle-vfx.png`.
- 384×512, 3×4, 128×128 cells.
- Ruined Gate / Frozen Fen / Crystal Quarry × Charging / Primed / Blast / Afterglow = 12 states.
- 12/12 cells are non-empty and pixel-unique.

### Phase 2512 — Charging State
- Existing `crystal.charge / Math.max(1, crystal.threshold)` drives only presentation state.
- Charging image appears only after magic has raised existing charge above zero.
- Existing `crystal.charge += strength` remains unchanged.

### Phase 2513 — Primed State
- 70% charge is a presentation-only readability threshold.
- Existing gameplay blast threshold remains `crystal.charge >= crystal.threshold`.
- No early blast or gameplay acceleration is introduced.

### Phase 2514 — Blast / Afterglow
- Existing `crystalBlast` presentation event queues a short image lifecycle.
- The cue transitions Blast → Afterglow at 45% presentation progress.
- Queue is capped at 12 and is cleared on run reset.

### Phase 2515 — Existing Destruction Feedback Preserved
- Existing `environmentDestructionVfxDescriptor(..., 'crystalBlast', ...)`, shockwaves, glow, debris, and battlefield-reaction images remain unchanged.
- New lifecycle atlas load failure cannot block crystal gameplay or legacy destruction feedback.

### Phase 2516 — Deterministic Audit & Release Binding
- `runCrystalInteractionLifecycleVfxAudit()` emits exactly 64 deterministic samples.
- All three trains are included in Release Freeze pass evidence, Candidate consistency, Candidate signature payload, and markdown evidence.
- Forging any new pass field changes Candidate to REVIEW with `release-freeze`.
- Changing any new sample count changes Candidate signature.

## Verification
- TDD RED: 18/18 new feature contracts failed before implementation.
- Feature contracts after implementation: 18/18 PASS.
- Related boss / spell / terrain / battlefield VFX regressions: 146/146 PASS.
- Full suite after implementation: 714 test files / 2,308 tests / 0 failures.
- TypeScript build: PASS.
- Candidate audit: `RCQ-E941D8E9` PASS.
- Release quality gate: `RQ-D4630257` PASS, action invariant 9/9.
- Raster baseline: 5/5 PASS.
- Boss projectile atlas SHA-256: `07ac3e4846b58dc5159f45a67ca6423285e10cfc489551ad69781150ceb0b764`.
- Persistent zone atlas SHA-256: `74f91d5a82baabd29e071ed9cdfafc0f3d687e19d30281c87bf29e08c6264a22`.
- Crystal lifecycle atlas SHA-256: `d9a3abf711afb0b1429295138b0b293a0a45d147d6fa436b68b95fa220edef57`.

## Continuation Notes
The next pass should avoid adding more layers to these same lifecycle moments. Prefer VFX gaps with a clear gameplay-reading benefit: boss arena transition aftermath, obstacle destruction/debris persistence, specialist crowd-control reactions, or map-specific spell/environment interactions. Keep queues bounded, retain Reduced Flash/Motion behavior, and preserve legacy primitive/image fallbacks.
