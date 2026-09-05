# Phase 1343–1382 Handoff — Boss Assist Cue Stability

## Input baseline
- Authoritative Phase 1342 archive provenance: `c20678af2bdcb309c63a5660ae1a0895651da1cd`
- The release ZIP contains no `.git`; local Git history was reconstructed only for isolated implementation/integration.
- Local reconstructed import commit: `5bdba48fa7ff571bf4e57864f79cf8b4a480c0c6`

## Scope
Phase 1343–1382 reduces boss-action-assist cue switching without adding automation, controls, combat power, or persistent state.

### Phase 1343–1350 — Cue Memory
- Existing legal boss response cue is retained for up to `0.45s` while it remains ready.
- Memory is transient and keyed in Game by boss id and archetype.

### Phase 1351–1358 — Urgent Override
- Critical-health potion rescue (`hpRatio <= 0.34`) overrides remembered combat cues immediately.
- A remembered action that becomes unavailable falls through immediately to the current legal response.
- Expired memory falls through to current response priority.

### Phase 1359–1366 — Window / Boss Boundary Safety
- `specialTimer > 1.05`, missing boss, boss-id change, or archetype change cannot reuse stale memory.
- The next special window starts from a clean cue state.

### Phase 1367–1374 — Prep / Combat Separation
- Opening boss prep remains a separate fallback (`actionAssist ?? prepAssist`).
- Boss combat cue state is cleared by the same transient transition paths that clear buffered combat intents, including lifecycle/decision/pause/shop/new-run boundaries.

### Phase 1375–1380 — Deterministic Stability Audit
`auditBossAssistStability()` produces 25 deterministic samples across all 6 boss archetypes.

Release evidence at implementation verification:
- baseline cue switches: `6`
- stabilized cue switches: `0`
- response coverage: `100%`
- potion rescue coverage: `100%`
- special-window reset coverage: `100%`
- actions: `9`
- snapshot schema mutation: `false`

### Phase 1381–1382 — Release Fail-Closed
- `bossAssistStabilityPassed` and `bossAssistStabilitySamples` are part of Release Freeze.
- Candidate consistency requires the new evidence.
- Candidate signature binds the evidence sample count.
- Spoofing top-level freeze PASS while boss-assist stability is false fails closed.

## Frozen behavior
- No new action button; `ACTION_BUTTONS.length === 9`.
- No auto-cast, auto-potion, auto-shop, or auto-selection introduced.
- Existing boss response priority map unchanged.
- Boss patterns/timers, spell cooldowns, damage, economy, AUTO combat throughput unchanged.
- Snapshot schema unchanged; cue memory is transient only.
- Opening boss prep behavior remains separate.

## Feature implementation commit
- `e5188fdd5bd3d7dd9f965466fc9e263fe0d1970b` — `feat: stabilize boss assist cues`

## Verification before handoff commit
- Build: PASS
- Test files: 367
- Tests: 1,476 / 1,476 PASS
- Candidate: `RCQ-57750433` PASS
- Raster profiles: 5/5 PASS
- Release gate: `RQ-D4630257` PASS
- Action invariant: 9/9

Final merged-main archive/manifest evidence is recorded in the external final handoff generated after main integration.
