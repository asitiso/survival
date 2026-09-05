# Arcane Last Stand — Phase 1103~1142 Decision Continuity Port Design

## Authoritative baseline

This design targets only the Phase 1102 release lineage:

- main: `bdf956114b09414999b3f2c23a0376983c58193b`
- short: `bdf9561`
- base: `9cecaf6d6fd4f56ccc3c3b55f608dad466c34c73`
- baseline tests: 334 files / 1,334 pass / 0 fail
- manifest: `RM-46C9976C`
- candidate: `RCQ-BED00083`
- raster: `RCI-BD91A2A2`
- release gate: `RQ-D4630257`
- archive SHA-256: `63a9434e67b6f5a099d318712aa7a09b95ce6169147926507d04d5b0af968ad0`

The older Phase 1103~1142 implementation based on reconstructed `387a7ae...` is reference material only. No commit, manifest, candidate signature, archive hash, generated file, or release evidence from that lineage may be copied as release evidence for this port.

## Product goal

Remove repeated close/re-open decision modal churn and accidental second selections when multiple player decisions queue, without changing reward generation, combat/economy values, Snapshot schema, or the 9-action control surface.

The change is accepted only if it materially reduces interaction friction. It must not add a new modal, new button, new input mode, or automatic selection.

## Frozen invariants

- combat actions remain exactly 9
- `ACTION_BUTTONS` ids / x / y / radius remain unchanged
- no auto-selection
- no new gameplay button or input mode
- `RunSnapshot` schema unchanged
- reward probabilities unchanged
- combat values unchanged
- shop/economy values unchanged
- decision priority remains:
  1. Fate
  2. Hero Ascension
  3. Run Contract
  4. Boss Reward
  5. Level Up

## Phase 1103~1110 — Continuous Decision Session

Introduce a transient `DecisionSession` owned by the runtime flow, not persistence.

Responsibilities:

- inspect existing pending decision flags
- resolve the preserved priority order
- open one pause session for the first pending decision
- keep the session active until the queue is empty
- track only transient generation/progress information
- never select a reward automatically

A decision session is not serialized into `RunSnapshot`.

## Phase 1111~1118 — Double-Pick Guard / In-Place Advance

Add a transient exactly-once pick guard.

Required behavior:

- each rendered decision generation gets one consumable generation id/token
- first valid card selection consumes the generation
- duplicate callback from the same generation is ignored
- after a successful selection, the newly rendered next generation is protected by a 160ms transition barrier
- the barrier blocks stale outgoing input only; it must not create a visible extra confirmation step
- card content advances in-place when the same overlay can represent the next decision
- Fate uses the same exactly-once contract
- lifecycle transient reset invalidates stale pre-background input without clearing pending decisions

The 160ms value is a bounded stale-input barrier, not a gameplay delay target. It may be implemented with monotonic time or generation timestamps, but must remain transient and deterministic in tests.

## Phase 1119~1134 — Queue Serialization / Resume Safety

Game/runtime owns one continuation path:

1. inspect pending decision state
2. resolve highest-priority pending decision
3. keep `paused=true` while any decision exists
4. render or advance the corresponding overlay
5. apply exactly one accepted selection
6. return to the same continuation function
7. close decision UI and unpause only when no decision remains

Remove or bypass patterns that create pause churn between selections, including:

- setting `paused=false` between queued picks
- close-then-`queueMicrotask()` reopen behavior
- separate callback paths that can race to reopen different overlays

Hero Ascension and Run Contract should reuse the existing card overlay path where compatible rather than adding parallel UI machinery.

Background / visibility / resume handling:

- clear transient pointer/click acceptance state
- preserve pending decisions
- preserve the currently valid decision generation or regenerate it deterministically from existing state
- do not mutate Snapshot schema
- do not unpause if a decision is still pending

## Phase 1135~1140 — Deterministic Decision Continuity Audit

Add a read-only release audit `auditDecisionContinuity()`.

Minimum coverage:

- stacked level-up count 1 through 6
- repeated boss reward sequence
- all five decision priority levels plus empty state
- exactly-once callback behavior
- rapid second click against newly advanced cards
- background / visibility / resume stale-input protection
- pending decision preservation
- no automatic selection
- 9-action geometry unchanged
- Snapshot schema mutation = false
- economy mutation = false

The older reference implementation reported 113 deterministic samples. For this lineage, sample count may differ if current source structure requires it; release acceptance is based on complete coverage and PASS, not on copying the old number.

## Phase 1141~1142 — Release Fail-Closed

Extend current release evidence using current `bdf9561` lineage structures.

Release Freeze must carry:

- `decisionContinuityPassed`
- `decisionContinuitySamples`

Requirements:

- Release Freeze cannot pass if decision continuity fails
- Candidate independently checks child evidence even if a caller forges top-level `passed=true`
- Candidate signature input includes the decision continuity evidence
- Manifest consumes the updated Candidate/Freeze through the existing single-build verification path

Do not hard-code or reuse the divergent lineage's old signatures.

## Expected touched areas

Exact paths must be confirmed against the Phase 1102 source before editing, but expected seams are:

- runtime/game decision orchestration (`src/game/...game...`)
- level-up/card overlay (`src/ui/...level...`)
- Fate decision UI seam
- transient decision-session / pick-guard helper(s)
- release freeze audit
- release candidate audit
- manifest/candidate tests as required by current architecture
- new deterministic decision-continuity audit tests

No unrelated refactor is in scope.

## TDD sequence

1. Baseline: verify `bdf9561` source identity and clean tree.
2. RED: add focused tests for decision priority, one-session continuity, duplicate callback rejection, 160ms stale-input barrier, resume safety, and fail-closed evidence.
3. GREEN: implement minimal transient session/guard and integrate one continuation path.
4. Focused regression around level-up, boss reward, Fate, ascension, contract, lifecycle, pause state.
5. Full `npm test`.
6. `npm run build`.
7. `npm run verify:candidate`.
8. `npm run verify:raster`.
9. `npm run verify:release`.
10. `npm run verify:manifest -- --out phase1142-main-release-manifest.json`.
11. Fast-forward merge to `main` only after clean feature verification.
12. Repeat full regression + manifest on merged main.
13. Remove feature branch/worktree.
14. Generate full-source ZIP twice from the exact clean main HEAD.
15. Verify tracked-file parity, ZIP integrity, archive comment, provenance critical files, packaged HTTP runtime, and new/checkpoint/resume.
16. Require byte-identical SHA-256 across both archives and manifest reproducibility evidence.

## Acceptance criteria

The port is complete only when all of the following are true on the `bdf9561` descendant lineage:

- queued decisions remain in one pause session
- no valid reward is auto-selected
- double callbacks cannot mutate state twice
- stale input cannot select the next card immediately
- background/resume preserves pending decisions safely
- decision priority is unchanged
- 9-action geometry unchanged
- Snapshot schema unchanged
- reward/combat/economy values unchanged
- decision continuity audit PASS
- Release Freeze/Candidate fail closed on forged inconsistent child evidence
- full tests/build/release verification PASS
- merged main clean with only intended branch state
- deterministic final ZIP reproduced byte-for-byte twice

## Explicit lineage exclusion

The following older reference evidence is NOT valid for this port and must never be reported as the result of the `bdf9561` implementation:

- old base/main `387a7ae...` / `c4c114ff...`
- old 1,356 test count
- old `RM-06D921CB`
- old `RCQ-C18ED5A7`
- old ZIP SHA-256 `f8580f...`

Those values belong to another reconstructed lineage and are reference-only.
