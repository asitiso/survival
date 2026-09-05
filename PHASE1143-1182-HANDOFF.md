# Arcane Last Stand — Phase 1143~1182 Handoff

## Baseline

- Authoritative Phase 1142 source archive comment: `e733727cb01bf45a2b1f40ce424af0dcd9793ee3`
- This workspace reconstructs Git history locally because the supplied Phase 1142 ZIP contains tracked source files but no `.git` directory.
- Phase 1142 gameplay/release behavior was treated as frozen unless explicitly listed below.

## Phase 1143~1150 — Early-Tap Cast Buffer

- Added a transient `CastIntentBuffer` for exactly six cast actions: `spell1~4`, `ultimate1~2`.
- Manual tap may queue only when cooldown remaining is `> 0` and `<= 0.20s`.
- Cooldown-ready taps still cast immediately.
- Taps outside the 0.20s window are not queued.
- Each action owns at most one queued intent; repeated early taps coalesce.
- Queued intent is consumed exactly once when the action becomes ready.

## Phase 1151~1158 — Intent Arbitration

- Discrete manual pressed events are processed through one shared cast-intent path.
- Previously queued manual intent is flushed before fresh presses and before normal hold/AUTO casting.
- Manual intent therefore wins the ready frame without changing AUTO throughput or cooldown calculations.
- Existing four-spell hold casting remains intact.
- `SpellSystem.update(dt)` remains in its original post-arbitration position.

## Phase 1159~1166 — Buffered Readiness Feedback

- Existing spell/ultimate secondary button label changes to `QUEUED` only while that action has a buffered manual intent.
- No new action, button, popup, persisted state, or screen effect was added.
- Frozen action surface remains 9 actions.

## Phase 1167~1174 — Pause / Decision / Lifecycle Safety

Buffered cast intents are cleared on:

- lifecycle/transient input reset (`visibility`, BFCache/pageshow, resize/orientation path),
- manual pause entry,
- first entry into a decision session,
- shop entry,
- new run reset.

The buffer is transient and is not serialized into `RunSnapshot`.

## Phase 1175~1180 — Combat Input Reliability Audit

`auditCombatInputReliability()` provides deterministic evidence:

- 6 cast actions,
- 18 timing samples (`early`, `exact`, `outside-window`),
- duplicate coalescing,
- exactly-once consumption,
- manual-before-AUTO arbitration model,
- lifecycle clear,
- action count 9,
- no snapshot/economy/damage/cooldown/AUTO-throughput mutation.

Total evidence: **25 samples / PASS**.

## Phase 1181~1182 — Release Fail-Closed

- Release Freeze now includes `combatInputReliabilityPassed` and `combatInputReliabilitySamples`.
- Candidate consistency requires combat input reliability PASS.
- Candidate signature includes the reliability sample count.
- Forging the parent freeze `passed=true` while combat input evidence is false still fails Candidate closed.

## Fresh feature verification before final packaging

- Test files: **346**
- Tests: **1,384 / 1,384 PASS**
- FAIL: **0**
- Build: **PASS**
- Candidate: **RCQ-96577EBE / PASS**
- Release Freeze input evidence: **25 samples / PASS**
- Raster: **5/5 PASS**
- Release Gate: **RQ-D4630257 / PASS**
- Action invariant: **9/9**

## Frozen invariants

- No spell damage tuning changes.
- No cooldown duration changes.
- No economy changes.
- No AUTO throughput multiplier changes.
- No new action/button count.
- No RunSnapshot schema changes.
