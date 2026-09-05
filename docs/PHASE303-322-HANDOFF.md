# Arcane Last Stand — Phase 303~322 Handoff

## Base

- Starting main: `34cd42a` (Phase 302)
- Work branch: `work/phase303-322`
- Baseline regression: **687/687**
- Combat actions remain **9**.
- Snapshot schema is unchanged.

## Phase 303~306 — First 30 Minute Momentum

New: `src/game/first-thirty-minute-director.ts`

The existing 0~10 minute opening system remains authoritative. This extension is neutral before 600s, active only from 600s to 1799.999s, and neutral again at 1800s.

- 10~15m `settle`: spawn ×1.02, elite interval ×0.98, reward ×1.01
- 15~22m `build_test`: spawn ×1.03, elite interval ×0.96, reward ×1.02
- 22~30m `boss_ready`: spawn ×1.04, elite interval ×0.94, reward ×1.03
- 30m+: neutral

`auditFirstThirtyMinutes()` checks 2/5/10/15/20/30 minute checkpoints. Shop interval and enemy budget stay exactly 1.00.

## Phase 307~310 — Early Boss Difficulty Curve

New: `src/game/boss-difficulty-curve.ts`

The curve is applied in `EnemyManager.update()` immediately after a normal boss spawn and before Apex/Mythic post-processing.

Threat 0 values:

| Boss ordinal | HP | Damage | Reward | Initial special timer |
|---:|---:|---:|---:|---:|
| 0 | 0.92 | 0.90 | 1.05 | 1.10 |
| 1 | 0.96 | 0.94 | 1.04 | 1.06 |
| 2 | 0.99 | 0.98 | 1.02 | 1.03 |
| 3+ | 1.00 | 1.00 | 1.00 | 1.00 |

Threat 5 moves the first-three easing halfway toward neutral instead of creating harder-than-neutral early bosses. Later bosses are exactly neutral so existing danger/variant/Ascension/Mythic systems remain authoritative.

## Phase 311~314 — Thermal Budget Director

New: `src/game/endless/thermal-budget-director.ts`

Inputs:

- elapsed seconds
- smoothed FPS
- adaptive presentation pressure
- frame governor tier
- device class

Output tiers:

- `cool`: visual/particle/trail 1.00
- `warm`: visual 0.88, particle 0.82, trail 0.78
- `hot`: visual 0.72, particle 0.62, trail 0.56

`telegraphMultiplier` and `enemyLogicMultiplier` are hard-coded to **1**. Runtime composition happens only inside adaptive visual density and `PresentationRuntime.trimToBudget()`. It does not alter enemy AI, spawn caps, collision, boss pressure, or the 24-slot danger telegraph reservation.

`auditThermalBudget()` passes low/mid/high devices and verifies presentation-first behavior.

## Phase 315~318 — Long-Run Reward Density

New: `src/game/endless/long-run-reward-density.ts`

The Game keeps only three transient fields:

- `recentGoldPerMinute`
- `rewardRateWindowStartedAt`
- `rewardRateWindowStartGold`

They are reset each run and intentionally absent from Snapshot.

Bounded bands:

| Runtime | Max Gold | Max XP | Target recent Gold/min |
|---|---:|---:|---:|
| <120m | 1.00 | 1.00 | neutral |
| 120~240m | 1.04 | 1.03 | 500 |
| 240~480m | 1.06 | 1.045 | 650 |
| 480m+ | 1.08 | 1.06 | 800 |

If recent reward rate reaches 150% of the target, both boosts return to 1.00. This is applied only to enemy death XP/Gold pickup values. Shop tokens, boss choice count, permanent meta rewards, and Snapshot state are untouched.

## Phase 319~322 — Release Candidate Gate

New:

- `src/game/release-candidate-audit.ts`
- `scripts/release-candidate-audit.mjs`
- package script `verify:candidate`

The candidate audit aggregates:

1. First-30-minute audit
2. Early boss curve audit
3. Thermal budget audit
4. Long-run reward density audit
5. Existing eight-hour low-device Threat-5 audit
6. Existing twelve-hour low-device Threat-5 audit
7. Balance Simulator V3 for low/mid/high devices at Threat 5

Current deterministic candidate signature: **`RCQ-9CC97F19`**.

Current key audit evidence:

- Eight-hour transient estimate: **337**
- Twelve-hour max transient estimate: **271**
- Balance low max: enemy 220 / projectile 85 / effect 47
- Balance mid max: enemy 320 / projectile 137 / effect 67
- Balance high max: enemy 420 / projectile 198 / effect 90

`ReleaseManifestInput` now accepts optional `candidateAudit` for backward compatibility. Legacy callers without the field still work, while the production `scripts/release-manifest.mjs` always runs `verify:candidate`, supplies the evidence, and fails closed if it is not PASS.

## Tests added

- `tests/first-thirty-minute-director.test.mjs` — 4
- `tests/boss-difficulty-curve.test.mjs` — 4
- `tests/endless-thermal-budget-director.test.mjs` — 4
- `tests/endless-long-run-reward-density.test.mjs` — 4
- `tests/release-candidate-audit.test.mjs` — 2
- `tests/phase319-release-candidate-integration.test.mjs` — 2

Total added: **20**. Expected full suite: **707**.

## Release commands

```bash
npm run build
npm test
npm run verify:raster
npm run verify:release
npm run verify:candidate
npm run verify:manifest -- --out release-manifest.json
git diff --check
```

## Constraints preserved

- Combat Action count remains exactly 9.
- No new blocking modal or management screen.
- No permanent currency or inventory slot.
- Snapshot schema unchanged.
- Thermal relief never reduces danger telegraphs or enemy logic.
- First 30-minute extension is neutral after 30 minutes.
- Boss easing is neutral from boss ordinal 3 onward.
- Long-run reward boost never exceeds 1.08 and is damped by recent reward rate.
- Raster baselines are never auto-written.

## Git history note

The local repository history was recreated during Phase 283~302 from the verified Phase 282 archive because runtime Git metadata had disappeared. Phase 303 starts from the recreated, verified `main@34cd42a`; source lineage remains continuous from that verified archive.
