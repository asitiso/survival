# Phase 3507~3560 — Character Action Pose & Visual Density Cycle

## Workflow
3× Incremental Fast Train → Risk-Adaptive Integration Gate.
Each Train used new TDD RED→GREEN, related regression, fresh build/diff checks, and a separate commit. Full regression / `verify:manifest` remained reserved for HIGH-risk or formal package checkpoints.

## Fast Train 1 — Phase 3507~3524
Commit: `d504ae6` — `Phase 3507-3524 fast train action pose emphasis`

### Phase 3507~3512 — Hero action pose emphasis
- Cast pose gains bounded forward commitment and vertical compression.
- Ultimate windup lifts/expands while release shifts farther along the retained facing direction.
- Recovery returns scale toward neutral instead of popping directly back to locomotion.
- Hit pressure yields decorative pose amplitude before body readability.
- Existing hero battle/cast/motion atlases are reused; no new image atlas.

### Phase 3513~3518 — Specialist attack silhouette emphasis
- Windup / strike / resolve receive distinct silhouette geometry.
- Assassin strike elongates most strongly along attack direction.
- Shieldbearer windup stays taller and more planted.
- Hit ownership suppresses exaggeration first.
- Specialist ghost shape now uses ellipse width/height and bounded lateral offset.

### Phase 3519~3524 — Boss special anticipation emphasis
- Boss special ring intensity and body scale share one anticipation strength.
- Phase 3 is stronger than Phase 1 without changing special timing.
- Archetype-specific body compression/lift remains visible.
- Stagger/recovery yield body exaggeration and ring alpha.
- Reduced Flash lowers alpha without moving warning geometry.

TDD: 18 RED → 18 GREEN.
Related regression: 35 files / 208 tests / 208 PASS.

## Fast Train 2 — Phase 3525~3542
Commit: `0b1950a` — `Phase 3525-3542 fast train pose and anticipation handoff`

### Phase 3525~3530 — Hero action pose handoff
- Cast / ultimate / recovery / hit now have a single presentation owner.
- Ultimate suppresses duplicate ordinary cast pose.
- Recovery avoids cast + recovery overlays peaking simultaneously.
- Release accent gets only a bounded early-recovery carry.
- Strong hit takes visual ownership over decorative action pose.

### Phase 3531~3536 — Specialist silhouette phase handoff
- Strike owns over simultaneous resolve residue.
- Early resolve keeps a small bounded strike carry.
- Late resolve fully retires strike carry.
- Hit has highest presentation ownership.
- Reduced Motion removes carry interpolation.

### Phase 3537~3542 — Boss anticipation / recovery handoff
- Active charge owns warning rings while recovery is absent.
- Recovery retires the secondary ring before restoring body/outline readability.
- Stagger overrides anticipation and recovery.
- Reduced Flash changes alpha only, not geometry ownership.

TDD: 18 RED → 18 GREEN.
Related regression: 38 files / 226 tests / 226 PASS.

## Fast Train 3 — Phase 3543~3560
Commit: `f5670cd` — `Phase 3543-3560 fast train visual layer budgets`

### Phase 3543~3548 — Hero action layer budget
- Idle / movement / cast / recovery / crest overlays share one action-density budget.
- Cast suppresses movement/idle clutter around the spell pose.
- Ultimate preserves crest identity while capping ordinary cast competition.
- Recovery restores movement texture gradually.
- Hit pressure suppresses decorative overlays before hero body readability.

### Phase 3549~3554 — Specialist silhouette crowd budget
- Active specialist count is calculated once per render pass.
- Crowded specialist packs reduce ghost alpha/trail length before hiding current attack identity.
- Strike retains more visibility than resolve at equal density.
- Hit ownership is most aggressively simplified.
- Reduced Motion caps crowded trail distance.

### Phase 3555~3560 — Boss special cue budget
- Base boss outline / primary warning ring / secondary ring / phase overlay share one visual budget.
- Active special promotes the primary ring while reducing ordinary outline competition.
- Phase 3 identity remains visible without overlay and warning ring both peaking fully.
- Recovery retires warning rings before restoring base outline.
- Stagger suppresses the secondary warning ring first.

TDD: 18 RED → 18 GREEN.
Related regression: 41 files / 244 tests / 244 PASS.

## Risk-Adaptive Integration Gate
Risk: **MEDIUM**.

Reason:
- Real-time render orchestration in `game.ts` and `enemies.ts` changed.
- Changes are pose offsets, scale, rotation, alpha, silhouette geometry, and render-density budgets only.
- No damage, collision, AI, save, economy, balance, cooldown, or input action formula changed.

Verification:
- Extended Regression: **105 files / 630 tests / 630 PASS** (Phase 2931+ presentation continuity suite).
- Production build: PASS.
- `git diff --check`: clean.
- Raster CI: **5/5 PASS**
  - 16:9 `RR-FE2C6B74`
  - 20:9 `RR-0937F125`
  - 4:3 `RR-4C84B218`
  - foldable `RR-023FFC4B`
  - 32:9 `RR-737044D6`
- Release Gate: **PASS `RQ-D4630257`**
- Candidate Audit: **PASS `RCQ-6006367D`**
- Action invariant: **9/9**

`verify:manifest` remains reserved for formal release/package checkpoints because it internally re-runs full test/archive/package verification.

## Asset policy
No new image atlas was added. Existing hero battle/cast/motion sprites and enemy/boss presentation assets already contain sufficient visual identity; this cycle increased quality by making those assets obey a single action owner and a bounded visual-density budget.

## Integration policy
Fast-forward tested feature SHA plus this documentation-only handoff commit to local `main`; then run fresh build + the 54 new Phase 3507~3560 tests as main smoke. Do not repeat the extended/full suite after the byte-identical production fast-forward.

## Suggested next direction
- Hero cast/ultimate contact shadow and weapon/spell launch origin coherence with the new action pose offset.
- Specialist strike silhouette alignment with projectile/melee resolve origin.
- Boss anticipation ring origin coherence during displacement/rebase so warnings remain attached to the authoritative body/ground origin.
