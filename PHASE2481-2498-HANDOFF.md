# Phase 2481-2498 Handoff — 3× VFX Feature Train: Final Form / Fusion / Hero Meter World Identity

## Scope
Three battlefield-first presentation trains built on Phase 2480. The pass upgrades high-value hero power moments that were still communicated mainly through circles, particles, impacts, and toasts. It does not change damage, radius, cooldown, fusion eligibility, hero-meter modifiers, the 9-action contract, or snapshot schema.

## Train A — Phase 2481-2486: Final Form World VFX

### Phase 2481 — 12 Final Forms × 2 World States
- Added `assets/heroes/final-form-world-vfx.png`.
- 768×512, 6×4, 128×128 cells.
- 12 final forms × Signature / FLOW = 24 world states.
- 24/24 cells are non-empty and pixel-unique.

### Phase 2482 — Signature Pattern World Identity
- Existing `triggerFinalFormPattern()` queues the image layer only after a valid final-form attack pattern exists.
- The queued state is `signature` normally and `flow` only when the existing FLOW link is active.
- Existing final-form attack-pattern radius/damage data is unchanged.

### Phase 2483 — Bounded World Queue
- Final-form image cues are bounded to 24 entries.
- World size derives from the already-computed attack radius and is presentation-only.
- Queue lifetime is short and is drained by the existing environment-VFX update path.

### Phase 2484 — FLOW Escalation + Legacy Fallback
- FLOW state uses a stronger visual alpha than the base signature state while Reduced Flash lowers both.
- Existing telegraph, impact feedback, FLOW audio, and `${link.label} · 최종형 연계` toast remain unchanged as fallbacks.

### Phase 2485 — Independent Atlas Loading
- Added independent fail-open image loading in `Game`.
- Atlas load errors disable only the new image layer.
- Existing final-form geometry/feedback continues to communicate the attack.

### Phase 2486 — Deterministic Audit
- `runFinalFormWorldVfxAudit()` emits exactly 64 deterministic samples.
- Presentation-only, fail-open loading, unchanged gameplay/snapshot contracts, and 9/9 actions are release-bound.

## Train B — Phase 2487-2492: Fusion Proc / Aftershock World VFX

### Phase 2487 — Six Fusion World Atlas
- Added `assets/heroes/fusion-world-vfx.png`.
- 768×256, 6×2, 128×128 cells.
- Six fusion IDs × Proc / Aftershock = 12 states.
- 12/12 cells are non-empty and pixel-unique.

### Phase 2488 — Actual Proc Integration
- `triggerFusionProc()` queues image VFX at the same origin used by the existing fusion damage pulse.
- Existing component-based `fusionProcForCast()` eligibility remains the source of truth.
- No new action button or manual trigger is introduced.

### Phase 2489 — Two-stage Lifecycle
- A single bounded queue transitions from `proc` to `aftershock` at 48% progress.
- Queue capacity is capped at 32 entries to avoid long-run buildup.
- Reduced Flash lowers visual intensity but does not alter gameplay.

### Phase 2490 — Damage / Radius Preservation
- Existing `52 * spellPower * equipmentSpellPower ...` damage formula is unchanged.
- Existing 105-radius enemy inclusion contract is unchanged.
- Existing `awakened` impact feedback remains intact.

### Phase 2491 — Independent Fail-open Loading
- Fusion world atlas loads independently.
- Legacy `융합 발동 · ...` build-identity toast remains present if the image cannot render.

### Phase 2492 — Deterministic Audit
- `runFusionWorldVfxAudit()` emits exactly 64 deterministic samples.
- Release Freeze/Candidate bind presentation-only behavior, fail-open image loading, unchanged gameplay/snapshot contracts, and 9 actions.

## Train C — Phase 2493-2498: Hero Meter Activation / Active Aura VFX

### Phase 2493 — Four Hero Meter World Atlas
- Added `assets/heroes/hero-meter-world-vfx.png`.
- 512×256, 4×2, 128×128 cells.
- Arkan / Seria / Kain / Edric × Activate / Active = 8 states.
- 8/8 cells are non-empty and pixel-unique.

### Phase 2494 — Actual Activation Burst
- `advanceHeroMeter()` queues the burst only after the existing `transition.activated` gate passes.
- Existing hero-specific active-name toast, meter audio, and `final` impact remain intact.

### Phase 2495 — Active Aura
- Active aura rendering checks the existing `heroMeter.activeTimer > 0` source of truth.
- Each hero receives a distinct low-alpha image-backed aura beneath the hero.
- Activation bursts remain separately bounded to 12 entries.

### Phase 2496 — Modifier Preservation
- Arkan spell power/area, Seria cooldown/area/shatter, Kain cooldown/power/chain, and Edric core-damage/area contracts are unchanged.
- The new VFX code never mutates meter state or modifiers.

### Phase 2497 — Independent Fail-open Loading
- Hero-meter world atlas loads independently.
- Load failure hides only the new image layer; existing meter gameplay, toast, audio, and impact remain.

### Phase 2498 — Deterministic Audit & Release Binding
- `runHeroMeterWorldVfxAudit()` emits exactly 64 deterministic samples.
- All three trains are included in Release Freeze pass evidence, Candidate consistency, Candidate signature payload, and markdown evidence.
- Forging any of the three pass fields changes Candidate to REVIEW with a `release-freeze` issue.
- Changing any of the three sample counts changes the Candidate signature.

## Verification
- TDD RED: 18/18 new feature contracts failed before implementation.
- Feature contracts after implementation: 18/18 PASS.
- Related final-form / fusion / hero-meter / battlefield VFX regressions: 209/209 PASS.
- Full suite: 711 test files / 2,290 tests / 0 failures.
- TypeScript build: PASS.
- Candidate audit: `RCQ-4D9E8057` PASS.
- Release quality gate: `RQ-D4630257` PASS, action invariant 9/9.
- Raster baseline: 5/5 PASS.
- Final-form atlas SHA-256: `7b62703b6d7eb542f129d77374439920dba283eb2ce953733b9a2113d59056f8`.
- Fusion atlas SHA-256: `8759f1ce16bf1baa7e756ffc9d3a3e626a28cef87793e8df0f13b98e5611079e`.
- Hero-meter atlas SHA-256: `f04636edaaa5ee64fd41433054bf4ce94d31cfd287f905802797323049347402`.

## Continuation Notes
The next pass should avoid stacking another decorative layer on these same power moments. Prefer world-space VFX where the player still has to infer state from motion alone: projectile lifecycle, persistent magic zones, obstacle interaction aftermath, boss arena transitions, or enemy crowd-control reactions. Keep every new queue bounded and retain the legacy primitive/feedback layer as fail-open fallback.
