# Specialist Enemy Intent Identity Integration Design

## Goal

Make the six existing high-impact specialist enemy roles readable at a glance during dense combat by giving each role one consistent static intent icon on the enemy and on AUTO target guidance, without changing AI, combat values, spawn rules, target scoring, persistence, or the 9-action input contract.

## Scope

Phase 1969~1976 is presentation-only and covers exactly these existing enemy roles:

- `bomber` — explosion intent
- `shaman` — healing/support intent
- `shieldbearer` — guard intent
- `assassin` — blink intent
- `siegeGolem` — core-siege intent
- `nullifier` — cooldown suppression intent

No generic enemies, elites, bosses, summons, or hazards receive new intent identities in this pass.

## Architecture

Add `specialist-intent-identity-assets.ts` as the single mapping/presentation contract for the six identities. `Game` asynchronously loads one static atlas and passes it into `EnemyManager.renderEnemies()`; the enemy renderer draws one compact icon with state-derived static emphasis while preserving every current ring, arc, text and range primitive as a fallback. `auto-target-visibility.ts` exposes the specialist intent id for the current target, and `Game.drawAutoTargetVisibility()` reuses the same atlas cell beside the existing AUTO label/target ring.

Image readiness must never gate construction, restart, spawn, update, targeting, input, or rendering.

## Asset contract

Create `assets/enemies/specialist-intent-icons.png` at 288×192, 3 columns × 2 rows, 96×96 cells. Stable order:

1. bomber
2. shaman
3. shieldbearer
4. assassin
5. siegeGolem
6. nullifier

Art is static and text-free. Silhouettes communicate behavior rather than enemy appearance: blast charge, healing cross/rune, guard shield, blink/teleport mark, core-siege reticle, suppression/null field.

## On-body presentation

Every specialist gets at most one 16~18px intent icon. Placement uses one shared helper, centered horizontally and clamped to the 1600×900 logical arena. The preferred position is below the body so it does not cover the existing HP bar above the enemy. Existing bomber/shaman rings, shield arc, assassin dashed ring, `CORE` text, nullifier range circle, sprites, HP bars, collision shapes, and target rings remain untouched.

The specialist icon row and elite-affix row use separate enemy-type domains, so the same enemy cannot own both; the audit still verifies their placement policies do not claim the same semantic slot.

## Active-state emphasis

Emphasis is state-derived and static only:

- bomber: active whenever the bomber role is present; no new fuse timing is introduced.
- shaman: active whenever the shaman role is present; no new heal timer is introduced.
- shieldbearer: emphasized only while `guardHp > 0`.
- assassin: emphasized when the existing `specialistTimer <= 1.2` (pre-blink readability only; timer/reset logic is frozen).
- siegeGolem: emphasized only while `target === 'core'`.
- nullifier: emphasized only while the hero is inside the existing nullifier effect range (`245 + radius`).

No pulse, oscillation, blinking, scale animation or new timer is added. Motion amplitude is 0.

## AUTO target reuse

`autoTargetIndicator()` keeps its existing label, accent, urgency and radius semantics, and adds optional specialist identity metadata only. `drawAutoTargetVisibility()` draws the same icon when the selected target is one of the six roles and the atlas is ready. Auto-target scoring, switch margin, preferred-target stability and target selection remain unchanged.

## Fail-safe

If the specialist atlas is missing, late, corrupt, or fails to load:

- current bomber/shaman telegraphs remain;
- current shield arc remains;
- current assassin dashed ring remains;
- current `CORE` text remains;
- current nullifier range circle remains;
- current AUTO label/ring remains.

No specialist information path becomes image-only.

## Frozen gameplay

Do not change specialist spawn thresholds/probabilities, bomber damage/contact logic, shaman healing logic/radius, shieldbearer 45% guard construction/damage absorption, assassin timer/reset/blink position, siege-golem target routing, nullifier `245 + radius` cooldown pressure or `1.24` cap, `autoPriority()` weights, `AUTO_SWITCH_MARGIN`, enemy radii/collision, economy, spells, bosses, maps, persistence schemas, or 9 Actions.

## Audit and release binding

`auditSpecialistIntentIdentityAssets()` produces a fixed deterministic sample set and verifies 6/6 identity coverage, six unique in-bounds cells, on-body and AUTO-target surface coverage, edge clamp, state-derived emphasis, legacy fallback, load-failure non-blocking, motion amplitude 0, specialist gameplay constants unchanged, auto-target weights/switch margin unchanged, Actions 9/9, and snapshot schema mutation false.

Release Freeze binds `specialistIntentIdentityAssetsPassed` and the exact deterministic sample count. Release Candidate consistency and signature payload include both fields. Forging only upper `passed` state while lower specialist evidence is false must produce REVIEW / `release-freeze`; changing only the sample count must mutate the candidate signature.

## Verification

Use test-first RED→GREEN cycles for the atlas contract, renderer/target integration, audit, and release fail-closed behavior. Then run Fresh TypeScript build, focused specialist regressions, all sorted test files in exhaustive batches if the monolithic Node process stalls, Release Candidate, Release Quality Gate, Raster profiles, merge into the locally reconstructed `main`, repeat full verification, create a full-source ZIP excluding Git/worktree/transient logs, re-extract it to a fresh directory, and repeat build/full tests/release gates from the delivery artifact.
