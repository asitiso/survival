# Phase 303-322 Release Candidate Design

## Goal

Raise Arcane Last Stand from feature-complete endless play toward a release-candidate balance/performance state by smoothing the first 30 minutes, removing early boss difficulty spikes, reducing thermal presentation load without weakening combat logic, keeping long-run rewards meaningful without inflation, and making those guarantees mandatory release evidence.

## Product constraints

- Keep exactly 9 combat actions: four normal spells, two ultimates, potion, shop, AUTO.
- Add no blocking modal, permanent currency, inventory slot, or management screen.
- Do not change Snapshot schema.
- Do not reduce enemy AI, enemy logic caps, collision logic, or danger telegraphs for thermal relief.
- Opening adjustments after minute 10 must be smaller than the existing 0-10 minute opening pacing and return to neutral at minute 30.
- Boss curve adjustment is limited to the first three normal bosses; Apex/Mythic identity scaling remains authoritative.
- Long-run reward density may change transient gold/XP reward multipliers only; no permanent compounding multiplier may be stored.
- Release Manifest remains fail-closed and baseline mutation remains disabled.

## Phase 303-306: First 30 Minute Momentum

Create `src/game/first-thirty-minute-director.ts`.

The existing `openingCombatPacing()` owns 0-10 minutes. The new director is neutral before 10 minutes, provides three mild bands from 10-30 minutes, and becomes neutral at 30 minutes:

- 10-15m `settle`: spawn 1.02, elite interval 0.98, reward 1.01.
- 15-22m `build_test`: spawn 1.03, elite interval 0.96, reward 1.02.
- 22-30m `boss_ready`: spawn 1.04, elite interval 0.94, reward 1.03.
- 30m+: neutral.

It must expose `auditFirstThirtyMinutes()` over 2/5/10/15/20/30 minute checkpoints. The audit checks there is no post-opening pressure cliff, reward multiplier never exceeds 1.10 after composing the existing opening pacing with the new director, and shop/enemy budget multipliers stay exactly 1.

`Game.update()` composes these multipliers with current opening pressure/reward. No additional toast or HUD line is added.

## Phase 307-310: Early Boss Difficulty Curve

Create `src/game/boss-difficulty-curve.ts`.

`bossDifficultyCurve(bossOrdinal, elapsedSeconds, threat)` returns bounded spawn-time modifiers:

- boss 0: health 0.92, damage 0.90, reward 1.05, initial special timer 1.10.
- boss 1: health 0.96, damage 0.94, reward 1.04, initial special timer 1.06.
- boss 2: health 0.99, damage 0.98, reward 1.02, initial special timer 1.03.
- later bosses: neutral.

Threat 4-5 may reduce the easing but must never turn it into extra difficulty; at threat 5 boss 0 remains no harder than neutral. Apex/Mythic transformations are applied after this spawn curve so their existing bounded multipliers remain authoritative.

EnemyManager receives a `bossCurve` function in `EnemyUpdateContext` rather than storing another persistent state. It applies the profile immediately after normal boss spawn and before Apex/Mythic post-processing. The profile affects max HP/current HP, base damage, XP/gold, and initial special timer only.

An audit checks monotonic recovery to neutral, bounded rewards, and no later-boss inflation.

## Phase 311-314: Thermal Budget Director

Create `src/game/endless/thermal-budget-director.ts`.

Inputs: elapsed seconds, smoothed FPS, adaptive pressure, frame-governor tier, device class. Output tier `cool|warm|hot` and presentation-only multipliers/caps.

- `cool`: visual 1.00, particles 1.00, trails 1.00, audio voices 1.00.
- `warm`: visual <=0.88, particles <=0.82, trails <=0.78, audio voices <=0.88.
- `hot`: visual <=0.72, particles <=0.62, trails <=0.56, audio voices <=0.72.

Thermal pressure may rise with sustained low FPS/high adaptive pressure and elapsed time, but danger telegraph multiplier must remain 1 and enemy logic multiplier must remain 1.

`Game.updatePresentationQuality()` composes thermal particle/trail limits after frame governor and long-run comfort. It never changes telegraph cap. `currentAdaptiveDirector()` composes visual densities with thermal visual density. No Snapshot persistence is added; thermal policy is derived every frame.

Create `auditThermalBudget()` for low/mid/high devices at representative 30/120/480 minute stress samples. Low-device hot mode must preserve enemy logic caps and reduce decorative capacity before projectile logic.

## Phase 315-318: Long-Run Reward Density

Create `src/game/endless/long-run-reward-density.ts`.

The function is neutral before 120 minutes and uses bounded, non-compounding multipliers afterward:

- 120-240m: reward density 1.04.
- 240-480m: 1.06.
- 480m+: 1.08 maximum.

A high recent reward-rate input can reduce this boost toward 1.00; a low reward-rate input may receive the full band value. The returned XP and gold multipliers must remain 1.00-1.08 and never affect shop token cadence, boss reward choice count, or permanent progression.

Game composes this policy only into death XP/gold pickup amounts. It is derived from elapsed time and a compact rolling reward-rate estimate kept as transient Game state, not Snapshot state.

Create `auditLongRunRewardDensity()` over 120/240/480/720 minutes to ensure no reward drought and no runaway inflation.

## Phase 319-322: Performance/Balance Release Gate

Create `src/game/release-candidate-audit.ts` aggregating:

- first-30-minute audit,
- boss difficulty curve audit,
- thermal budget audit,
- long-run reward density audit,
- existing eight-hour and twelve-hour auditors,
- balance simulator V3 low/mid/high checks.

The aggregate emits deterministic `RCQ-XXXXXXXX` signature and fail-closed issue list.

Extend `ReleaseManifestInput`/JSON evidence with optional `candidateAudit` while maintaining backward compatibility for legacy callers. The production manifest CLI must always supply the candidate audit and treat a failing candidate audit as REVIEW.

Update `scripts/release-manifest.mjs` and add `npm run verify:candidate`. `verify:manifest` must include candidate performance/balance evidence and a deterministic signature. No baseline file is automatically modified.

## Verification

- TDD RED/GREEN for every module.
- Full existing suite plus new tests.
- `npm run build`.
- `npm run verify:raster`.
- `npm run verify:release`.
- `npm run verify:candidate`.
- `npm run verify:manifest`.
- `git diff --check`.
- Static HTTP smoke for main entry and Phase 303-322 modules.
