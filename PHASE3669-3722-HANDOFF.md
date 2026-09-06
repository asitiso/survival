# Phase 3669~3722 — Impact Identity Retirement & Materialization Ownership Cycle

## Scope

This cycle continues battlefield presentation continuity without changing gameplay formulas, projectile physics, collision, AI, target selection, cooldowns, economy, persistence, or action count.

The cycle focused on three seams:

1. retiring hero launch-travel ownership cleanly when multihit/impact identity takes over,
2. giving specialist impact finishes role-specific directional identity and a stable late-window handoff,
3. extending the boss shared special anchor into hazard materialization while keeping dense combat readable.

No new atlas or raster asset was required. Existing projectile, specialist, boss, and hazard visuals were sufficient; the higher-value work was temporal ownership, handoff, and density control.

## Fast Train 1 — Phase 3669~3686

Commit: `755a177` — `Phase 3669-3686 fast train impact identity handoff`

### Phase 3669~3674 — Projectile launch-history impact retirement

- First impact explicitly retires absolute launch-travel presentation ownership.
- Removes `visualLaunchWorldOrigin`, `visualLaunchTravelTtl`, and `visualLaunchTravelMaxTtl` once impact identity owns the projectile.
- Subsequent multihits do not request duplicate retirement.
- Terminal first impact also retires travel ownership.
- Projectile gameplay position, velocity, damage, collision, and targeting remain unchanged.

### Phase 3675~3680 — Specialist role-specific impact finish vector

- Siege Golem keeps a heavy normal finish.
- Assassin resolves into a strong positive tangent finish.
- Shieldbearer keeps a mostly normal deflection.
- Nullifier resolves into the opposite tangent signature.
- All finishes still start beyond the target impact side and remain presentation-only.

### Phase 3681~3686 — Boss hazard materialization footprint

- New footprint begins biased toward the shared boss launch anchor.
- Footprint expands and converges toward the final hazard location.
- Final hazard/telegraph gameplay position remains authoritative and unchanged.
- Reduced Flash only lowers the secondary footprint alpha.

New TDD: 18 RED→GREEN.

Related regression: **52 files / 307 tests / 307 PASS**.

## Fast Train 2 — Phase 3687~3704

Commit: `7ddd391` — `Phase 3687-3704 fast train impact handoff settling`

### Phase 3687~3692 — Post-impact canonical trail handoff

- Continuing projectile receives a very short post-impact presentation handoff.
- Canonical projectile sprite settles softly from the impact transition back to full ownership.
- Terminal projectile receives no unnecessary post-impact handoff.
- Reduced Motion completes the handoff faster.

### Phase 3693~3698 — Specialist role-finish blend

- Specialist finish starts nearer the impact normal and rotates into the role signature through the late strike window.
- Assassin/nullifier tangent identities emerge progressively rather than snapping.
- Siege Golem remains normal throughout the blend.
- Role direction sign stays stable under Reduced Motion.

### Phase 3699~3704 — Hazard footprint→telegraph ownership handoff

- Early materialization gives the footprint more visual weight.
- As the footprint reaches the destination, brightness ownership transfers to the authoritative telegraph.
- The destination telegraph is never fully hidden.
- Expired footprint returns telegraph ownership to exactly full scale.

New TDD: 18 RED→GREEN.

Related regression: **55 files / 325 tests / 325 PASS**.

## Fast Train 3 — Phase 3705~3722

Commit: `d500c00` — `Phase 3705-3722 fast train transition density ownership`

### Phase 3705~3710 — Hero post-impact handoff density budget

- Sparse continuing projectiles keep the transition effect unchanged.
- Dense volleys reserve the transition effect for newer projectiles.
- Older projectiles are never hidden; they immediately return to the canonical full sprite state.
- Reduced Motion uses a tighter transition-effect capacity.

### Phase 3711~3716 — Specialist role-finish crowd budget

- Sparse packs preserve all finish accents.
- Dense assassin/nullifier tangent finishes use tighter capacity than the heavier Siege Golem normal finish.
- The newest relevant finish keeps a slot.
- Crowd limiting changes presentation accents only; actual hits remain untouched.

### Phase 3717~3722 — Boss hazard footprint density budget

- Sparse materialization footprints remain visible.
- Dense hazard spawns retire older footprint accents while keeping all authoritative telegraphs.
- Newest footprint receives priority.
- Reduced Motion tightens capacity and Reduced Flash lowers only the footprint alpha.

New TDD: 18 RED→GREEN.

Related regression after source-contract compatibility update: **56 files / 331 tests / 331 PASS**.

### Compatibility note

The Phase 3687 source-contract originally required a direct `postImpactHandoff.spriteAlphaScale` draw reference. Train 3 introduced `postImpactSpriteScale` as the owner that combines the existing handoff with the new density budget. The legacy test contract was widened to verify that ownership chain instead of requiring the old direct expression. This was a test-source contract update only, not a gameplay or render-behavior regression fix.

## Risk-Adaptive Integration Gate

Risk: **MEDIUM**

Reason:

- Changes touch live presentation orchestration in `spells.ts` and `game.ts`.
- Changes add/adjust transient rendering metadata and cue-density helpers.
- No changes to damage formulas, projectile physics, collision, enemy AI, target selection, spell cooldowns, economy, persistence schema, safe-lane scoring, or action count.

### Extended regression

- Phase 2931+ presentation continuity set
- **132 files / 792 tests / 792 PASS**

### Fresh build / diff

- `npm run build` — PASS
- `git diff --check` — clean

### Raster gate

`npm run verify:raster` — **5/5 PASS**

- 16:9 — `RR-FE2C6B74`
- 20:9 — `RR-0937F125`
- 4:3 — `RR-4C84B218`
- foldable — `RR-023FFC4B`
- 32:9 — `RR-737044D6`
- baseline auto-update disabled

### Release gate

`npm run verify:release` — PASS

- Signature: `RQ-D4630257`
- Action invariant: 9/9
- Raster profiles: 5/5
- Visual effects: PASS

### Candidate gate

`npm run verify:candidate` — PASS

- Signature: `RCQ-6006367D`
- Evidence: `{"ok":true,"signature":"RCQ-6006367D","issues":[]}`
- 8h / 12h audits: PASS
- balance low/mid/high: PASS
- lifecycle/input/accessibility/release freeze: PASS

`verify:manifest` was intentionally not run under the established MEDIUM integration policy.

## Integration status

Feature branch before integration: `work/phase3669-3722`

Expected local integration method: fast-forward only into `main`, then run the nine new Phase tests (54 tests total), fresh build, diff check, and clean-status verification on the merged SHA.

## Recommended next direction

Continue visual continuity rather than adding more independent effects:

1. **Phase 3723+ — Chain/multihit impact identity transfer**
   - carry projectile lineage from the retired launch owner into the first/secondary impact identity without resurrecting the old travel bridge,
   - keep multihit/chain bursts readable when targets change rapidly.

2. **Specialist impact finish → locomotion recovery ownership**
   - role-specific tangent finish should collapse back into the correct locomotion direction without a silhouette snap,
   - preserve hit/stagger priority.

3. **Boss hazard footprint → persistent hazard lifecycle ownership**
   - final materialization footprint should retire exactly when persistent hazard/lifecycle VFX becomes authoritative,
   - cap simultaneous secondary transition cues while retaining all danger telegraphs.
