# Arcane Last Stand — Phase 343~362 Handoff

## Baseline
- Starting main: `e54a16c` (Phase 342).
- Baseline regression: 729/729 pass before Phase 343 work.
- Work branch: `work/phase343-362` in `.worktrees/phase343-362`.
- Product invariant: exactly 9 combat actions; no new blocking modal, permanent currency, or snapshot field.

## Phase 343~346 — Hero × Threat Release Balance
New files:
- `src/game/hero-release-model.ts`
- `src/game/hero-threat-release-audit.ts`
- `tests/hero-threat-release-audit.test.mjs`

The read-only release model derives role indices from existing hero base HP/speed/spellPower/cooldown and all six hero spell identities. It does not modify runtime combat stats.

Current role model:

| Hero | Offense | Control | Survival | Core Guard | Composite |
| --- | ---: | ---: | ---: | ---: | ---: |
| Arkan | 1.3043 | 1.0880 | 1.0431 | 1.0431 | 1.1612 |
| Seria | 1.1329 | 1.3224 | 1.1069 | 1.1338 | 1.1247 |
| Kain | 1.3084 | 1.0000 | 0.9550 | 0.9711 | 1.1145 |
| Edric | 0.9968 | 1.2560 | 1.2520 | 1.5814 | 1.1759 |

Release spreads:
- Offense: 1.3126 <= 1.35.
- Survival: 1.3110 <= 1.35.
- Core Guard: 1.6285 <= 1.70.
- Composite role value: 1.0551 <= 1.10.

The audit samples 72 points: four heroes × Threat 0/3/5 × minutes 5/10/15/20/25/30. Threat pressure increases monotonically and every hero's release margin decreases monotonically from Threat 0 to 3 to 5.

## Phase 347~350 — Hero-Specific First-Six Boss TTK
New files:
- `src/game/hero-boss-ttk-audit.ts`
- `tests/hero-boss-ttk-audit.test.mjs`

The audit reuses `firstSixBossCheckpoints()` for actual boss cadence/HP progression and combines offense, control and mobility into a boss uptime index. Runtime boss HP/damage is not modified.

Per-boss hero TTK ranges:
- Boss 1: 18.463~23.536 sec.
- Boss 2: 22.960~29.269 sec.
- Boss 3: 28.312~36.091 sec.
- Boss 4: 33.747~43.019 sec.
- Boss 5: 39.261~50.049 sec.
- Boss 6: 45.106~57.501 sec.

Guards:
- Max hero TTK spread: 1.275 <= 1.30.
- Max adjacent boss TTK ratio: 1.244 <= 1.35.
- All TTKs stay within 15~75 sec.
- Bosses 4~6 preserve exact neutral early-boss easing multipliers.

## Phase 351~354 — Damage / Guardian-Core Distribution
New files:
- `src/game/hero-damage-distribution-audit.ts`
- `tests/hero-damage-distribution-audit.test.mjs`

Relative release exposure is derived from contact, projectile, arena, boss-special and core-siege sources using hero speed/control/survival/core-guard identity. This is deterministic release evidence, not a frame replay or hidden runtime correction.

Current release guards:
- Hero loss spread: 1.2731 <= 1.55.
- Core loss spread: 1.3638 <= 1.75.
- No hero-damage source >55%.
- No core-damage source >60%.
- All source shares normalize to 1.
- Threat 0→3→5 increases both hero and core loss for every hero.
- Edric remains the strongest core-protection identity without breaking the spread ceiling.

At Threat 3 relative loss indices are:
- Arkan: hero 5.8009 / core 5.9463.
- Seria: hero 5.2322 / core 5.4838.
- Kain: hero 6.1654 / core 6.2812.
- Edric: hero 4.8427 / core 4.6057.

## Phase 355~358 — Thermal Worst-Case VFX
New files:
- `src/game/endless/thermal-worst-case-audit.ts`
- `tests/endless-thermal-worst-case-audit.test.mjs`

The audit reproduces the same presentation-budget composition used by `Game.updatePresentationQuality()` using minimal frame governor, long-run comfort and sustained hot thermal policy.

Checkpoints: low/mid/high × 2h/8h/12h = 9.

Worst-case invariants:
- enemy logic multiplier = 1.00 everywhere;
- danger telegraph cap = 24 everywhere;
- particles stay 48~64 and currently settle at 48 under sustained hot/minimal conditions;
- trails stay 20~28 and currently settle at 20;
- visual density is 0.3110 at 2h and 0.2281 at 8~12h;
- projectile visual density is 0.2722 at 2h and 0.1996 at 8~12h;
- audio voice multiplier = 0.72 under sustained hot conditions.

## Phase 359~362 — Candidate / Manifest Lock
Modified:
- `src/game/release-candidate-audit.ts`
- `tests/release-candidate-audit.test.mjs`
- `tests/phase319-release-candidate-integration.test.mjs`

`ReleaseCandidateEvidence` now requires:
- `heroThreatBalance`;
- `heroBossTtk`;
- `damageDistribution`;
- `thermalWorstCase`.

Any failed new audit adds a fail-closed issue:
- `hero-threat-balance`;
- `hero-boss-ttk`;
- `damage-distribution`;
- `thermal-worst-case`.

Candidate summary now preserves:
- device budgets;
- hero composite spread;
- boss TTK spread;
- hero/core loss spreads;
- worst-case particle/trail/telegraph budget.

Current deterministic Candidate signature before final integration: `RCQ-F23029AA`.

## Verification target
Phase 342 baseline: 729 tests.
Phase 343~362 adds 20 tests, target total 749.

Required before integration:
- `npm run build`.
- `npm test` => 749/749.
- `npm run verify:raster` => 5/5 PASS.
- `npm run verify:release` => `RQ-9085A5AD` PASS.
- `npm run verify:candidate` => `RCQ-F23029AA` PASS.
- `npm run verify:manifest` => PASS with candidate balance summary.
- `git diff --check` clean.
- static HTTP smoke for root/main/game/new audit modules.
- final ZIP created only from verified tracked `main` via `git archive`.

## Important non-goals / caveats
1. These audits are deterministic release models, not frame-accurate replay simulation.
2. No hidden per-hero runtime normalization was added because current role-value and TTK spreads already pass the release ceilings.
3. Edric intentionally remains the strongest core-protection hero and Kain/Arkan remain stronger raw damage identities.
4. Thermal worst-case reduces presentation only; it does not reduce enemy AI or hazard telegraphs.
5. Existing 9-action combat surface and snapshot schema remain unchanged.
