# Phase 363~382 Combination Release Locks Design

## Goal
Lock release fairness across hero, trait, build archetype, threat, boss rewards, long-horizon failure margin, and build completion speed without adding combat inputs, permanent economy, or snapshot state.

## Constraints
- Combat action count remains exactly 9.
- No blocking modal, permanent currency, inventory slot, or snapshot schema field is added.
- Existing hero identities, run trait values, boss reward generation, and runtime combat modifiers remain authoritative.
- New work is deterministic release auditing unless an audit demonstrates an actual out-of-bound runtime value.
- Candidate and Manifest fail closed when any new audit fails.

## Phase 363~366 — Hero/Trait/Archetype/Threat Matrix
Audit only combinations that can exist for a hero: four global run traits plus that hero's mastery trait. Cross those five traits with four build archetypes and Threat 0/3/5 for 240 checkpoints. Derive offense, survival, core-guard, economy, and viability from the existing hero release model plus real trait multipliers and bounded archetype role profiles. Keep role asymmetry while preventing a single legal combination from becoming a release trap.

## Phase 367~370 — Boss Reward Fairness
Audit all four heroes against all six boss archetypes at three representative progression states. Use the real `buildBossRewardChoices` and relic/fusion eligibility. Require three choices, one relic, growth access, valid fusion behavior, no self-relic repetition, and equal structural access across heroes.

## Phase 371~374 — 30/60/120 Failure Margin
Extend the existing hero/core loss model into deterministic 30/60/120 minute release margins at Threat 0/3/5. The audit measures relative reserve rather than fabricated death probability. Hero and core reserve must remain positive and threat-monotonic while preserving Edric's core-guard identity.

## Phase 375~378 — Build Completion Speed
Use existing projected level growth and fixed build focus efficiencies for burst/cycle/domain/fortress to estimate when a coherent archetype reaches its critical investment threshold. Audit hero/archetype/threat completion windows and ensure no legal hero is materially delayed by identity alone.

## Phase 379~382 — Candidate/Manifest Matrix Gate
Add the four audits to `ReleaseCandidateEvidence`, fail closed on any violation, include compact matrix/fairness/failure/completion metrics in candidate summaries, and preserve them through the existing Manifest candidate-summary path. No baseline or gameplay state mutation is permitted.
