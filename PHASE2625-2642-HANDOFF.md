# Phase 2625~2642 Handoff — World VFX Priority / Critical Occlusion / Occupancy Budget

## Scope

Presentation-only VFX readability pass. This phase deliberately adds **no new image atlas** because the battlefield already has enough visual assets; the higher-value improvement is suppressing, dimming, and budgeting existing world VFX so critical combat information stays readable. No HP, damage, enemy AI, movement, spell, cooldown, objective timing/reward, field-event, boss, economy, input, haptic/audio, Action surface, VFX TTL, or RunSnapshot schema changes.

## Train A — Phase 2625~2630: World VFX Priority Arbitration

- New pure policy: `src/game/world-vfx-priority-arbitration.ts`.
- Priority tiers: `critical > tactical > informational > decorative`.
- Existing `CombatAttentionPrimary` is the authoritative owner; no parallel danger model was introduced.
- Hero/core/damage-critical states:
  - critical alpha 1.0
  - tactical remains visible at reduced alpha
  - informational is strongly attenuated
  - decorative world layers are fully suppressed
- Boss response, heavy damage, and boss countdown preserve tactical cues while reducing informational/decorative competition.
- Normal combat preserves the existing high-quality presentation; medium/low quality progressively reduces low-priority layers.
- `battlefield atmosphere`, `map evolution aftermath`, and recent lifecycle VFX consume the shared arbitration policy.
- Critical projectile visibility and danger telegraphs remain outside low-priority suppression.

## Train B — Phase 2631~2636: Critical Cue Occlusion Guard

- New pure guard: `src/game/world-vfx-occlusion-guard.ts`.
- Hero critical state creates a 112px protected presentation anchor around the live hero position.
- Core critical state creates a 126px protected presentation anchor around the live core position.
- Large world cues overlapping those anchors are handled by priority:
  - critical: never dimmed
  - tactical: retained at 58% occlusion scale
  - informational: retained at 28%
  - decorative: hidden
- Applied to objective activation/completion/failure, field-event lifecycle, boss arena transition, boss hazard aftermath, and elite-pack formation/focus cues.
- Protection is alpha-only presentation logic. It never moves entities, modifies collision, changes TTL, or mutates combat state.

## Train C — Phase 2637~2642: World VFX Screen Occupancy Budget

- New deterministic resolver: `src/game/world-vfx-occupancy-budget.ts`.
- Managed queue families:
  - objective activation
  - objective completion
  - objective failure
  - field-event lifecycle
  - boss arena transition
  - map evolution aftermath
  - boss hazard aftermath
  - elite-pack approach/formation
- Candidate cost is estimated from existing presentation queue count × rendered footprint; gameplay lifetime is untouched.
- High/medium/low presentation quality limits screen occupancy to progressively smaller budgets.
- Hero/core/damage-critical and boss-response/heavy/countdown states tighten those budgets further.
- Tactical candidates are selected before informational, then decorative; deterministic ID ordering resolves ties.
- Critical projectile cues, danger telegraphs, hero/core critical warnings, and other essential combat signals are **not** occupancy-budgeted.
- Suppressed layers continue updating and naturally expire by their original TTL, avoiding stale bursts when they become visible again.

## Release Binding

New deterministic 64-sample audits:

- `world-vfx-priority-arbitration-audit.ts`
- `world-vfx-occlusion-guard-audit.ts`
- `world-vfx-occupancy-budget-audit.ts`

Release Freeze and Candidate signature material bind all three pass bits and sample counts.

Forging any pass bit to false forces Candidate `REVIEW` with `release-freeze`; incrementing any sample count changes Candidate signature.

## Asset Decision

- New PNG atlas: **0**.
- Existing image assets are reused unchanged.
- Reason: adding another atlas would increase battlefield density and maintenance cost while this pass is specifically solving overlap/occlusion. The code-only arbitration gives a clearer gameplay benefit than more decoration.

## Verification

- TDD RED: 18/18 new phase contracts failed before implementation.
- GREEN: 18/18 new phase contracts pass after implementation.
- Related attention / motion / recent VFX / release regressions: 172/172 pass.
- Full regression split through the project 8-worker verifier: 735 test files / 2,434 tests / 2,434 pass / 0 fail.
- Candidate: `RCQ-497044A7` PASS.
- Raster: 5/5 PASS (`16:9`, `20:9`, `4:3`, `foldable`, `32:9`).
- Release: `RQ-D4630257` PASS; Action 9/9; baseline mutation disabled.
- All three new audit pass-bit forgeries: Candidate `REVIEW` + `release-freeze`, signature changed.
- All three new sample-count forgeries: Candidate remains logically PASS but signature changes, proving evidence binding.

## Next Direction

Do not add another broad arbitration subsystem next. The next highest-value VFX work should use this new budget to target a small number of genuine search problems, preferably **enemy spawn-lane readability / projectile impact-source continuity / boss safe-response window confirmation**. Add new art only where it is materially easier to read than the existing Canvas/icon treatment; otherwise reuse current assets and the new arbitration layer.
