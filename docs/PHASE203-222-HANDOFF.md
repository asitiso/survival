# Arcane Last Stand — Phase 203~222 Handoff

## Baseline
- Input baseline: Phase 202 / commit `8eaba5f`
- Working branch: `work/phase203-222`
- Combat actions remain exactly 9.
- No Phase 203~222 transient state was added to the Run Snapshot schema.

## Phase 203~206 — Perfect Evade Finisher
Files:
- `src/game/endless/arena-dodge-finisher.ts`
- `tests/arena-dodge-finisher.test.mjs`

Behavior:
- Edge triggers only on evade chain transition `<5 → 5`.
- One bounded automatic shockwave around the hero.
- Bounded damage, push, slow, and Signature charge.
- No economy reward and no repeated trigger while already capped.

## Phase 207~210 — Safe Lane Link
Files:
- `src/game/endless/safe-lane-link.ts`
- `tests/safe-lane-link.test.mjs`

Behavior:
- Reaching the SAFE LANE target arms a 1.5 second transient window.
- The next PERFECT EVADE can add 1–2 Flow stacks, retain Flow, add bounded Signature charge, and grant a short movement tempo bonus.
- Final Form mobility family changes reward emphasis.
- No auto movement and no snapshot field.

## Phase 211~214 — Mythic Safe Zone Lifecycle
Files:
- `src/game/endless/mythic-safe-zone.ts`
- `src/game/endless/mythic-safe-lane.ts`
- `tests/mythic-safe-zone.test.mjs`

Behavior:
- 9-second deterministic lifecycle: stable, collapse warning, collapsed, reform.
- Six Mythic archetypes use different zone placement sequences.
- Reform previews the next cycle's stable position.
- Weakpoint destruction slightly increases zone radius.
- Stable/reform zones reduce arena hazard damage; collapsed zones do not.
- SAFE LANE can prefer active safe zones, but any candidate that intersects real Mythic geometry is rejected regardless of preference weight.

## Phase 215~218 — Foldable Density Director
Files:
- `src/game/foldable-density-director.ts`
- `tests/foldable-density-director.test.mjs`

Behavior:
- Non-foldable layouts preserve existing density.
- Foldable boss pressure reduces status characters and build labels.
- Foldable Mythic pressure hides EXP numeric text and hero-meter text first.
- HP numbers and HP/EXP/meter bars remain visible.
- Time, Threat, map/danger status remain in the right panel.

## Phase 219~222 — Raster Baseline Gate
Files:
- `src/game/render-raster-baseline.ts`
- `tests/render-raster-baseline.test.mjs`

Behavior:
- Captures deterministic raster references.
- Audits global weighted similarity and critical-cell similarity separately.
- Critical cells are HUD/action coverage weights >= 4.
- Small decorative drift can pass configurable thresholds.
- Critical HUD drift fails even when global similarity is still high.
- Default exact signatures:
  - 16:9 `RR-FE2C6B74`
  - 20:9 `RR-0937F125`
  - 4:3 `RR-4C84B218`
  - foldable `RR-023FFC4B`
  - 32:9 `RR-737044D6`

## Game integration seams
`src/game/game.ts` only uses existing seams:
1. arena dodge reward branch — evade finisher + SAFE LINK consume,
2. Mythic boss arena update — safe-zone lifecycle + SAFE LANE preference + hazard protection,
3. boss-arena rendering — safe-zone lifecycle cue,
4. landscape HUD — foldable density policy.

No new combat action, blocking modal, or combat menu was introduced.

## Tests added in this pass
- `arena-dodge-finisher.test.mjs`
- `safe-lane-link.test.mjs`
- `mythic-safe-zone.test.mjs`
- `foldable-density-director.test.mjs`
- `render-raster-baseline.test.mjs`
- `phase203-222-integration.test.mjs`

The Phase 202 baseline had 558 tests. The Phase 203~222 tree contains 583 tests after adding 25 tests.

## Merge/release procedure
1. `npm run build`
2. `npm test`
3. `git diff --check`
4. verify `auditDefaultRasterBaselines().ok === true`
5. commit the feature branch
6. repeat build/tests on committed branch
7. fast-forward `main` only if it is still at Phase 202 baseline
8. repeat verification on merged `main`
9. run static HTTP smoke for root, main game, and Phase 203~222 modules
10. create final ZIP from verified Git HEAD and run `unzip -t`
