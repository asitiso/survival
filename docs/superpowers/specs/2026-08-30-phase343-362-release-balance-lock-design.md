# Phase 343-362 Release Balance Lock Design

## Goal
Lock release-candidate balance across all four heroes and representative Threat levels without adding combat actions, permanent power systems, currencies, or snapshot fields.

## Product constraints
- Combat actions remain exactly 9.
- Hero identities remain asymmetric: Arkan/Kain may lead damage, Seria may lead control, Edric may lead durability/core protection.
- Release fairness is judged on a composite role-value index, not raw DPS equality.
- Threat 0/3/5 must be monotonically harder for every hero.
- First-six-boss hero TTK spread must remain bounded without making every hero identical.
- Damage-source and guardian-core-loss distributions must not collapse into one unavoidable source.
- Thermal worst-case audit may reduce presentation only; enemy logic and danger telegraphs remain 100%.
- Existing Raster, Release, Candidate, Manifest and baseline-mutation protections remain mandatory.
- No new snapshot schema fields.

## Architecture

### 1. Shared hero release model
Create `src/game/hero-release-model.ts` as a deterministic read-only model built from existing `HERO_PROFILES` and `heroSpellIdentity()` values. It exposes offense, control, mobility/survival and core-guard indices. The model is only for release audits; runtime combat math remains authoritative and unchanged.

### 2. Hero x Threat first-30-minute audit (Phase 343-346)
Create `src/game/hero-threat-release-audit.ts`.
- Heroes: Arkan, Seria, Kain, Edric.
- Threat levels: 0, 3, 5.
- Checkpoints: 5, 10, 15, 20, 25, 30 minutes.
- Runtime sources: `directorSnapshot`, `openingThirtyMinuteSample`, `threatLevelModifiers`.
- Evidence: offense index, survival index, core-guard index, pressure index and composite release margin.
- Gates:
  - all 72 checkpoints finite and positive;
  - same-checkpoint raw offense spread <= 1.35;
  - survival spread <= 1.35;
  - core-guard spread <= 1.70;
  - composite role-value spread <= 1.10;
  - Threat 0 -> 3 -> 5 pressure is strictly monotonic;
  - every hero's release margin decreases monotonically with Threat.

### 3. Hero-specific first-six-boss TTK audit (Phase 347-350)
Create `src/game/hero-boss-ttk-audit.ts`.
- Reuse `firstSixBossCheckpoints()` for actual boss cadence/HP growth.
- Convert shared hero release offense/control/mobility indices into boss uptime power.
- Produce 24 TTK checkpoints (4 heroes x 6 bosses).
- Gates:
  - all TTK estimates 15-75 seconds;
  - per-boss hero max/min TTK spread <= 1.30;
  - each hero's adjacent-boss TTK ratio <= 1.35;
  - boss 4-6 stay neutral with respect to early boss easing.

### 4. Damage and guardian-core distribution audit (Phase 351-354)
Create `src/game/hero-damage-distribution-audit.ts`.
- Model five release-relevant sources from current runtime semantics: contact, projectile, arena, boss-special and core-siege.
- Use hero HP/speed/control/core-guard model to derive relative exposure, not random simulation.
- Sample Threat 0/3/5 at 30 minutes for all heroes.
- Gates:
  - normalized source shares sum to 1;
  - no hero-damage source exceeds 55%;
  - no core-loss source exceeds 60%;
  - relative hero-loss spread <= 1.55;
  - relative core-loss spread <= 1.75;
  - damage load rises monotonically with Threat;
  - Edric may lead core protection but cannot exceed the spread guardrail.

### 5. Thermal worst-case VFX audit (Phase 355-358)
Create `src/game/endless/thermal-worst-case-audit.ts`.
- Reproduce the actual presentation-budget composition using `mobileFrameGovernorPolicy`, `longRunComfortPolicy`, `thermalBudgetPolicy` and `thermalPolicyForEffectiveTier`.
- Devices: low/mid/high.
- Worst-case checkpoints: 2h, 8h, 12h under sustained stress and minimal governor.
- Evidence: particle cap, trail cap, telegraph cap, visual density, projectile visual density, audio voice multiplier.
- Gates:
  - danger telegraph cap remains 24;
  - enemy logic multiplier remains 1;
  - particle/trail caps never exceed governor caps;
  - low-device hot caps are no greater than mid/high at equivalent stress;
  - all caps remain above the existing gameplay-readable floors (48 particles, 20 trails).

### 6. Release Candidate and Manifest enforcement (Phase 359-362)
Extend `ReleaseCandidateEvidence` with four required release-lock audits:
- heroThreatBalance;
- heroBossTtk;
- damageDistribution;
- thermalWorstCase.

`releaseCandidateAudit()` fails closed if any new audit fails and includes compact hero/budget summary text in markdown/signature payload.

Extend the optional candidate manifest evidence summary only through the existing `candidateAudit` field; do not add an independent duplicate manifest subsystem. `scripts/release-manifest.mjs` continues to obtain authoritative candidate evidence from `releaseCandidateAudit()`.

## Testing strategy
Use TDD for each audit module and integration edge:
1. failing import/module test;
2. deterministic model assertions;
3. fail-closed mutation test;
4. Candidate integration test;
5. full test suite;
6. `verify:raster`, `verify:release`, `verify:candidate`, `verify:manifest`;
7. build and `git diff --check`;
8. static HTTP smoke and final `git archive` ZIP.

## Non-goals
- No live AI-based auto-balance.
- No hidden per-hero damage correction in runtime unless an audit actually breaches a release ceiling.
- No replay recording or frame-accurate simulator.
- No new menus, buttons, permanent stats, currencies, inventory or snapshot fields.
