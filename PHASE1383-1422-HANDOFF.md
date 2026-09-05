# Phase 1383–1422 Handoff — Boss Assist Response Acknowledgement

## Input baseline
- Authoritative Phase 1382 archive provenance: `c00ea89e84ddd73ed82f49d6576e124bea81583e`
- The release ZIP contains no `.git`; local Git history was reconstructed only for isolated implementation/integration.
- Local reconstructed import commit: `0a08165189f97ee3c7afe25b32a43422f796fe48`

## Scope
Phase 1383–1422 stops boss assist from immediately asking for another response after the player has already made a valid manual response. It also keeps a queued buffered response visually stable until the buffered cast resolves.

### Phase 1383–1390 — Response Acknowledgement
- A successful manual response during the active boss special window is acknowledged transiently for `0.40s`.
- Ordinary boss assist cues are suppressed during acknowledgement.
- State is transient only and keyed by boss id and archetype.

### Phase 1391–1398 — Valid Alternative Respect
- Any action inside the existing `bossResponseActions(archetype)` response map is accepted as a valid manual response, not only the currently displayed cue.
- AUTO casts explicitly do not create acknowledgement.

### Phase 1399–1406 — Queued Intent Awareness
- If the remembered response action is inside the Phase 1182 cast-intent buffer, its cue can remain stable even while cooldown makes it temporarily absent from `readyActions`.
- A successful buffered manual cast becomes acknowledgement.
- Queue cancellation through lifecycle/pause/decision/shop/new-run reset removes the transient intent and allows normal reprompting.

### Phase 1407–1414 — Safety Override / Boundary Reset
- Critical-health potion rescue (`hpRatio <= 0.34`) overrides acknowledgement immediately.
- Boss disappearance, boss/archetype change, and `specialTimer > 1.05` clear acknowledgement.
- Lifecycle, pause, decision, shop, and new-run boundaries clear acknowledgement through the existing transient combat reset path.
- A boundary bug found during verification was corrected: an acknowledged `null` cue clears only cue memory, while leaving the 0.40s acknowledgement alive; combat-window exit clears both.

### Phase 1415–1420 — Deterministic Acknowledgement Audit
`auditBossResponseAcknowledgement()` produces 25 deterministic samples across all 6 boss archetypes.

Release evidence at implementation verification:
- acknowledgement coverage: `100%`
- alternative valid-response coverage: `100%`
- queued cue coverage: `100%`
- potion rescue coverage: `100%`
- special-window reset coverage: `100%`
- queued-cancel reprompt coverage: `100%`
- acknowledgement window: `0.40s`
- actions: `9`
- snapshot schema mutation: `false`

### Phase 1421–1422 — Release Fail-Closed
- `bossResponseAcknowledgementPassed` and `bossResponseAcknowledgementSamples` are part of Release Freeze.
- Candidate consistency requires the new evidence.
- Candidate signature binds the evidence sample count.
- Spoofing top-level freeze PASS while boss-response acknowledgement is false fails closed.

## Frozen behavior
- No new action button; `ACTION_BUTTONS.length === 9`.
- No auto-cast, auto-potion, auto-shop, or auto-selection introduced.
- Boss response priority map unchanged.
- Phase 1382 cue-memory window remains `0.45s`.
- Boss patterns/timers, spell cooldowns, damage, AUTO throughput, potion condition, economy, and reward probability unchanged.
- Snapshot schema unchanged; acknowledgement state is transient only.

## Feature implementation commit
- `e93b7732fcf9355fdc8894a1e82ed336350b7f24` — `feat: acknowledge boss assist responses`

## Verification before handoff commit
- Build: PASS
- Test files: 371
- Tests: 1,490 / 1,490 PASS
- Candidate: `RCQ-C54D08AE` PASS
- Boss Response Acknowledgement: 25/25 PASS
- Raster profiles: 5/5 PASS
- Release gate: `RQ-D4630257` PASS
- Action invariant: 9/9

Final merged-main archive/manifest evidence is recorded in the external final handoff generated after main integration.
