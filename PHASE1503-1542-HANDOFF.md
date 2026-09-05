# Phase 1503–1542 Handoff — Critical Combat Attention Arbitration

## Provenance
- Authoritative Phase 1502 input ZIP/main provenance: `825ca3f2dc23bc3a36b62fd98d151d53f1467e8a`
- Working branch: `work/phase1503-1542`

## Scope
Phase 1503–1542 extends the existing combat cue priority policy across critical HP/core warnings and Boss Assist so only one combat warning owns primary motion while lower-priority information remains visible in a steady/compact form.

### 1503–1510 — Unified Combat Focus
- Attention order: hero critical → core critical → critical damage → boss response → heavy damage → normal.
- Hero/core critical states cap projectile clutter without hiding all projectile warnings.
- AUTO/weakpoint labels are suppressed under HP/core critical focus.

### 1511–1518 — Critical Warning Single Motion
- Hero and core warning cards remain visible whenever their existing danger thresholds are active.
- If both are critical, only hero warning owns pulse motion; core warning remains steady.
- When hero exits critical, core can become the single animated primary warning.

### 1519–1526 — Boss Assist Compact Under Critical
- Boss Assist ring remains visible during hero/core critical focus.
- The ring becomes steady and the duplicate top assist label is hidden.
- Action choice, response priority, potion rescue and queued/buffer semantics are unchanged.

### 1527–1534 — Reduced Flash Alignment
- Critical warning pulse amplitude becomes zero under Reduced Flash.
- Warning cards, colors and text remain visible.
- Boss Assist uses the same steady motion policy under critical focus.

### 1535–1540 — Combat Attention Audit
- 25 deterministic samples.
- Max animated primary combat warnings: 1.
- Boss response visibility under critical focus: 100%.
- Critical duplicate assist text: 0.
- Reduced Flash critical motion amplitude: 0.
- Minimum projectile warning budget: >=1.
- Reachable actions: 9/9.
- Snapshot schema mutation: false.

### 1541–1542 — Release Fail-Closed
- `combatAttentionArbitrationPassed` and `combatAttentionArbitrationSamples` are part of Release Freeze evidence.
- Candidate consistency fails closed on false evidence.
- Candidate signature changes when sample count changes.

## Frozen Invariants
- Action count: 9.
- Damage, cooldowns, boss cadence, boss response priority/cycle/acknowledgement unchanged.
- Cast buffer, AUTO throughput, potion/shop economy unchanged.
- Existing hero/core critical thresholds unchanged.
- Snapshot schema unchanged.
- Raster baselines remain immutable.

## Fresh Feature Verification Before Handoff Commit
- Test files: 383.
- Tests: 1,523 / 1,523 PASS, 0 FAIL.
- Build: PASS.
- Combat Attention Arbitration audit: 25/25 PASS.
- Candidate: `RCQ-AB8E5013` PASS.
- Raster: 5/5 PASS.
- Release Gate: `RQ-D4630257` PASS.
- Action invariant: 9/9.
