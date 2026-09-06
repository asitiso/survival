# Phase 3561~3614 — Action Origin Coherence & Shared Boss Anchor Cycle

## Integration model
- 3× Incremental Fast Train
- Each train: new TDD RED→GREEN, related regression, build/diff check, separate commit
- Cumulative risk: MEDIUM
- Integration gate: Extended Regression + Raster + Release + Candidate
- `verify:manifest` intentionally deferred to formal package/release work

## Fast Train 1 — Phase 3561~3578
Commit: `48a882f` — `Phase 3561-3578 fast train action origin coherence`

### Phase 3561~3566 — Hero action launch-origin coherence
- Visual spell launch follows the authoritative hero action/body facing rather than divergent locomotion facing.
- Cast/ultimate pose strength contributes only bounded visual offset.
- Fire Bolt and Chain Lightning consume cached action-facing/body-pose presentation state.
- Gameplay projectile origin, trajectory, damage and targeting are unchanged.

### Phase 3567~3572 — Specialist strike-origin coherence
- Specialist visual strike origin follows the same attack/silhouette direction that the body presentation uses.
- Assassin / shieldbearer / siege-golem identity remains differentiated while displacement is bounded.
- A short presentation-only strike-origin cue is queued on real melee resolve.

### Phase 3573~3578 — Boss anticipation-origin coherence
- Boss special warning ring can follow bounded displacement/rebase origin during strong special movement.
- Recovery and stagger yield ownership back toward the body.
- Warning timing and attack logic are unchanged.

Verification:
- New TDD: 18/18 GREEN after live-source wiring contract was added
- Related regression: 114/114 PASS

## Fast Train 2 — Phase 3579~3596
Commit: `7274145` — `Phase 3579-3596 fast train origin handoff continuity`

### Phase 3579~3584 — Hero visual launch handoff
- Rapid chained casts no longer make the visual launch point teleport across the hero.
- Normal and ultimate visual-origin step limits remain bounded.
- Reduced Motion tightens the handoff window and displacement.

### Phase 3585~3590 — Specialist strike arrival
- Strike-origin cue begins at the silhouette-coherent origin and converges toward the actual target contact anchor over its short lifetime.
- The cue never overshoots and does not alter the hit position.

### Phase 3591~3596 — Boss anticipation-origin lock
- A strong active special can briefly retain the ground/rebase warning owner while the underlying desired origin decays.
- Recovery or stagger releases the lock.

Debug note:
- Initial stagger test exposed owner precedence where ground-rebase was checked before stagger.
- Root cause was fixed by making stagger/recovery force body ownership before any rebase hold decision.

Verification:
- New TDD: 18/18 GREEN
- Cumulative related regression: 132/132 PASS

## Fast Train 3 — Phase 3597~3614
Commit: `4dde6b5` — `Phase 3597-3614 fast train shared action origin density`

### Phase 3597~3602 — Hero fan-launch visual anchor
- Multi-projectile visual launches share one hero action anchor.
- Fan center stays on the shared anchor and edge offsets are symmetric and tightly bounded.
- Gameplay projectile positions and spread calculations are unchanged.

### Phase 3603~3608 — Specialist strike-cue density budget
- Sparse strike-origin cues remain fully readable.
- Dense packs retain newest cues first with a bounded visibility count.
- Assassin identity receives a small bounded readability preference.
- Reduced Flash lowers alpha without changing visibility ownership.
- The crowd-budget contract exposed and restored the previously missing live strike-origin cue draw loop.

### Phase 3609~3614 — Shared boss special-origin anchor
- Warning ring and boss visual projectile/hazard launch calculations consume the same bounded special-origin anchor.
- Strong active displacement can use ground ownership; recovery/stagger returns to body ownership.
- Reduced Motion tightens the anchor distance.
- Actual gameplay projectile/hazard coordinates, timing and damage are unchanged.

Debug note:
- A broad replacement temporarily created a self-reference inside `bossSpecialOriginAnchor` initialization.
- Root cause was isolated and fixed with an exact block replacement: the shared-anchor initializer consumes raw rebase state, while downstream anticipation/lock consumers use the shared anchor with raw fallback.

Verification:
- New TDD: 18/18 GREEN
- Cumulative related regression: 25 files / 150 tests / 150 PASS

## Risk-Adaptive Integration Gate
Risk: **MEDIUM**

Reason:
- Live render/origin orchestration changed in `game.ts`, `spells.ts`, `enemies.ts`, and a boss visual-launch helper.
- No combat damage, collision, AI, economy, persistence, cooldown, target-selection, or action-count formulas changed.

Gate evidence:
- Extended Regression: **114 files / 684 tests / 684 PASS**
- Raster: **5/5 PASS**
  - 16:9 `RR-FE2C6B74`
  - 20:9 `RR-0937F125`
  - 4:3 `RR-4C84B218`
  - foldable `RR-023FFC4B`
  - 32:9 `RR-737044D6`
- Release Quality Gate: **PASS** — `RQ-D4630257`
- Action invariant: **9/9**
- Candidate Audit: **PASS** — `RCQ-6006367D`
- `verify:manifest`: intentionally not run for this MEDIUM integration

## Asset policy
No new image atlas was added. Existing hero/enemy/boss assets already had sufficient identity; the higher-value improvement was aligning pose, strike, launch, and warning origins so those assets read as one coherent action.

## Recommended next bounded cycle
1. Couple hero launch-origin coherence to the first 100–150ms of spell travel so muzzle-to-projectile separation remains visually continuous during fast lateral movement.
2. Give specialist melee strike-origin cues a short impact-side directional finish that yields to real damage/guard effects.
3. Keep boss warning/launch shared anchor coherent through the first projectile/hazard travel frames, with strict caps so displacement history never drags the attack visual behind the boss.
