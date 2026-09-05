# Arcane Last Stand — Phase 323~342 Handoff

## Base and branch

- Starting main: `ece6b23` (Phase 322)
- Work branch: `work/phase323-342`
- Baseline regression: **707/707**
- Combat actions remain **9**.
- Snapshot schema is unchanged.

## Phase 323~326 — Precise 0~30 Minute Timetable

New: `src/game/opening-thirty-timetable.ts`

Modified:
- `src/game/opening-pacing.ts`
- `src/game/first-thirty-minute-director.ts`

The opening bands remain readable, but the 5~10 minute escalation now tapers into the 10-minute handoff instead of dropping abruptly. The 10~30 minute extension keeps the existing `settle / build_test / boss_ready` labels but interpolates inside each band.

Minute-resolution audit result:
- max spawn delta: **0.03**
- max elite interval delta: **0.04**
- max reward delta: **0.02**
- shop interval: always **1.00**
- enemy budget: always **1.00**

Ceremony pulses remain short event beats and are not converted into permanent spawn-budget inflation.

## Phase 327~330 — First Six Boss Clear / Difficulty Audit

New: `src/game/boss-clear-time-audit.ts`

The audit follows the same boss cadence produced by `directorSnapshot()` and the same boss HP source from `enemyStats('boss')`. The only modeled quantity is deterministic expected player DPS progression.

Current checkpoint estimates:

| Boss | Spawn sec | Danger | Curve HP | Estimated clear | Difficulty |
|---:|---:|---:|---:|---:|---:|
| 1 | 120 | 2 | 0.92 | 20.064s | 16.613 |
| 2 | 354 | 5 | 0.96 | 24.951s | 23.188 |
| 3 | 579 | 8 | 0.99 | 30.767s | 31.733 |
| 4 | 795 | 11 | 1.00 | 36.673s | 41.074 |
| 5 | 1002 | 14 | 1.00 | 42.666s | 49.321 |
| 6 | 1200 | 17 | 1.00 | 49.018s | 58.430 |

Release bounds:
- all clears: 15~60 seconds
- max adjacent clear ratio: **1.244** (limit 1.35)
- max adjacent normalized-difficulty ratio: **1.396** (limit 1.50)
- boss ordinal 3+: curve modifiers exactly neutral

## Phase 331~334 — Thermal Recovery Hysteresis

New: `src/game/endless/thermal-recovery-hysteresis.ts`

`thermalBudgetPolicy()` still calculates desired thermal pressure. Game now holds a transient `ThermalRecoveryState` used only by presentation.

- escalation: **45 sustained render frames per tier**
- recovery: **240 sustained recovered frames per tier**
- one-frame cool/hot samples cannot flip tier
- hot policy still preserves `enemyLogicMultiplier=1`
- hot policy still preserves `telegraphMultiplier=1`
- state is reset per run and is not serialized to endless Snapshot

`Game.currentAdaptiveDirector()` and `Game.updatePresentationQuality()` use the effective hysteresis tier, so visual density and particle/trail trimming recover slowly instead of flapping.

## Phase 335~338 — 2~12 Hour Gold/XP Economy Audit

Extended: `src/game/endless/long-run-reward-density.ts`

New audit points:
- 120 / 180 / 240 / 360 / 480 / 600 / 720 minutes
- scenarios: `drought / healthy / saturated`
- total scenarios: **21**

Rules verified:
- all Gold and XP multipliers stay **1.00~1.08**
- saturated scenario always damps to **1.00 / 1.00**
- XP never exceeds the corresponding Gold multiplier
- drought max adjacent Gold delta: **0.02**
- drought max adjacent XP delta: **0.015**

Runtime behavior is unchanged outside the existing transient death Gold/XP multiplier seam. No shop token or permanent meta reward is changed.

## Phase 339~342 — Explicit Candidate Performance Budget Gate

Extended:
- `src/game/release-candidate-audit.ts`
- `src/game/release-manifest.ts`
- `scripts/release-manifest.mjs`

Candidate now requires all of the following to pass:
1. legacy First-30-minute audit
2. minute-resolution 0~30 timetable audit
3. legacy early boss curve audit
4. first-six-boss clear/difficulty audit
5. legacy thermal budget audit
6. thermal recovery hysteresis audit
7. legacy long-run reward density audit
8. 2~12 hour economy audit
9. eight-hour low-device Threat-5 audit
10. twelve-hour low-device Threat-5 audit
11. low/mid/high Balance Simulator V3 plus explicit device ceilings

Explicit ceilings, enemy/projectile/effect:
- low: **220 / 90 / 50** — current **220 / 85 / 47**
- mid: **320 / 140 / 70** — current **320 / 137 / 67**
- high: **420 / 200 / 95** — current **420 / 198 / 90**

Current Candidate signature: **`RCQ-E94B63CD`**.

Release Manifest candidate evidence now accepts an optional compact `summary`. Production manifest always supplies the summary, while legacy direct callers without Candidate evidence remain valid for backward compatibility.

## Tests added in Phase 323~342

- `tests/opening-thirty-timetable.test.mjs` — 4
- `tests/boss-clear-time-audit.test.mjs` — 4
- `tests/endless-thermal-recovery-hysteresis.test.mjs` — 4
- `tests/endless-long-run-economy-audit.test.mjs` — 4
- `tests/release-candidate-audit.test.mjs` — +3
- `tests/release-manifest.test.mjs` — +1
- `tests/phase339-release-budget-integration.test.mjs` — 2

Total added: **22**. Full suite after Phase 342: **729**.

## Verification commands

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

- Exactly 9 combat actions.
- No new blocking modal, permanent currency, or inventory slot.
- Snapshot schema unchanged.
- Thermal relief never lowers enemy logic or danger telegraphs.
- First-six boss audit does not add runtime boss state.
- Boss ordinal 3+ runtime curve remains neutral.
- Long-run Gold/XP correction remains bounded and transient.
- Raster baselines are never auto-written.

## Git lineage note

Phase 323 starts from the verified local `main@ece6b23`. The repository history before Phase 283 had previously been reconstructed from the verified Phase 282 archive; this phase does not change that provenance note.
