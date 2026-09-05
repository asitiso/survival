# Phase 2247~2254 Handoff — Hero Ascension Effective Modifier + Build Direction Projection Integration

This pass was applied to the provided `arcane-last-stand-phase2246-full-merged.zip`. The archive did not contain upstream `.git` metadata, so this handoff does **not** claim an original repository `main` SHA. A local Git baseline was reconstructed from the Phase 2246 delivery solely to isolate, verify, and merge this pass safely.

## Scope

Phase 2247~2254 removes mental arithmetic from the existing 35 / 50 / 65 minute Hero Ascension choice flow. Each Ascension card now shows which **real frozen modifiers** the candidate changes, whether it **expands / hybridizes / focuses** the current build, and the candidate's **effective incremental percentage** against the already-selected Ascensions. No new HUD row, gameplay modifier, selection rule, action, or persisted state was introduced.

### Phase 2247 — Ascension Modifier Identity Atlas

- Added `assets/ui/hero-ascension-modifier-icons.png`.
- Atlas size: **384×192**.
- Grid: **4×2**, cell **96×96**.
- Identities: **8** — spell-power / cooldown / area / move-speed / hero-guard / core-guard / fusion-power / boss-damage.
- Pixel-unique cells: **8/8**.
- Static art only: animation false, motion amplitude 0.
- Text remains authoritative and image load failure is non-blocking.
- Final asset size: **6066 bytes**.
- Asset SHA-256: `3292b60d9111ffbcbece62201d6c1aa2e6ceb0512134593b631860374c619f4d`.

### Phase 2248 — Build Direction Identity Atlas

- Added `assets/ui/hero-ascension-build-direction-icons.png`.
- Atlas size: **288×96**.
- Grid: **3×1**, cell **96×96**.
- Identities: **3** — expand / hybrid / focus (`확장 / 혼합 / 집중`).
- Pixel-unique cells: **3/3**.
- Static art only: animation false, motion amplitude 0.
- Final asset size: **1684 bytes**.
- Asset SHA-256: `dca2f3e2eb0cdab73d1a1c12ca30a2fe1c010c8f63b537f1d3602f6d039a22a9`.

### Phase 2249 — Real Effective Modifier Projection

- Added `projectHeroAscensionSelection()`.
- It calls the existing frozen `heroAscensionModifiers()` for both before and after states instead of duplicating the balance mapping.
- Only properties that actually change are exposed as projection effects.
- Reduction modifiers (`cooldown`, `hero-guard`, `core-guard`) are expressed as effective reductions; amplification modifiers use effective gains.
- Existing active modifiers decide the build-direction identity:
  - none of the affected vectors already active → **expand**;
  - some already active → **hybrid**;
  - all already active → **focus**.
- The projection stores nothing in gameplay or snapshots.

### Phase 2250 — Ascension Choice Card Integration

Every pending Hero Ascension card keeps its existing primary Ascension identity and adds compact decision helpers:

1. build direction icon;
2. up to two actual modifier-vector icons;
3. `확장 / 혼합 / 집중` badge;
4. real incremental hint, e.g. `실효 · 마법 피해 +10% · 융합 위력 +11%`.

The existing secondary-identity row is reused. Its display cap changes from two to three icons so the direction + two modifier vectors fit without adding a new row. Existing Contract cards still supply only their existing two identities.

### Phase 2251 — Selection Confirmation + Attention Safety

- After selection, the existing Ascension toast keeps the selected Ascension as its primary identity and adds the computed direction + modifier vectors.
- Helper identities yield to hero critical, core critical, or boss-special countdown ≤ **1.2s**.
- `showEventToast()` clears the Ascension projection state before any unrelated new toast state is installed, preventing stale helper carry-over.
- New-run/reset also clears the presentation-only projection state.

### Phase 2252 — Gameplay Freeze + Copy Truthfulness

No Hero Ascension gameplay values were changed. During deterministic audit development, an existing description mismatch was found:

- `phoenix-cycle` previously said `쿨타임과 생존성 강화`.
- The actual frozen composer only applies `cooldownMultiplier *= 0.92` and does **not** modify hero damage taken.
- A regression test was written and observed failing first.
- The description was corrected to **`쿨타임 강화`** while the gameplay modifier remained untouched.

### Phase 2253 — Deterministic Projection Audit

`auditHeroAscensionProjectionIdentityAssets()` produces exactly **60 deterministic samples**:

- 24 first-pick projections — 4 heroes × 6 options;
- 24 second-pick projections — deterministic prior-selection coverage;
- 12 aggregate contracts for both atlases, three direction states, 35/50/65 milestones, 3-selection cap, and Actions 9/9.

The audit verifies:

- modifier identities **8/8**;
- direction identities **3/3**;
- modifier unique cells **8/8**;
- direction unique cells **3/3**;
- projection output matches the actual `heroAscensionModifiers()` composer;
- milestone schedule remains **35 / 50 / 65 minutes**;
- max selected Ascensions remains **3**;
- gameplay mutation **false**;
- Actions **9/9**;
- Snapshot schema mutation **false**.

### Phase 2254 — Release Freeze / Candidate Binding

Release Freeze now binds:

- `heroAscensionProjectionIdentityAssetsPassed`;
- `heroAscensionProjectionIdentityAssetsSamples = 60`.

Release Candidate:

- fails closed when the new child evidence is forged;
- binds the 60-sample result into the Candidate signature;
- reports `hero-ascension-projection-identity-assets safe (60)`.

## Gameplay Freeze

The existing Hero Ascension gameplay contract remains unchanged.

- Milestones: **35 / 50 / 65 minutes**.
- Maximum selected Ascensions: **3**.
- Existing option pool and offer rules: unchanged.
- Existing modifiers remain:
  - spell power × **1.10** where mapped;
  - move speed × **1.07** where mapped;
  - cooldown × **0.92** where mapped;
  - area × **1.09** where mapped;
  - hero damage taken × **0.93** where mapped;
  - core damage taken × **0.91** where mapped;
  - fusion power × **1.11** where mapped;
  - boss damage × **1.10** where mapped.
- Existing clamps remain unchanged, including spell power max **1.45** and cooldown min **0.72**.
- Actions: **9/9**.
- Snapshot schema: **unchanged**.

## Verification Evidence Before Handoff Commit

### TDD / focused regression

- New tests were written and observed failing before production implementation.
- Initial RED: **8 expected failures / 1 frozen-gameplay pass** because new modules/integration/evidence did not exist.
- During the audit pass, the Phoenix Cycle copy mismatch was converted into a new failing regression before correcting the copy.
- Final focused Phase 2247~2254 regression: **10/10 PASS**.

### Full regression — final worktree code

- Test files: **623**.
- Tests: **2,007**.
- Pass: **2,007**.
- Fail: **0**.
- The full sorted set was executed exhaustively in batches because nested Candidate audits are expensive in one Node process; no test files were omitted.

### Release gates — final worktree code

- Release Candidate: **PASS** — `RCQ-E5119F17`.
- Release Quality Gate: **PASS** — `RQ-D4630257`.
- Raster profiles: **5/5 PASS**.
  - 16:9 `RR-FE2C6B74`
  - 20:9 `RR-0937F125`
  - 4:3 `RR-4C84B218`
  - foldable `RR-023FFC4B`
  - 32:9 `RR-737044D6`
- Release Freeze: **PASS**.
- Hero Ascension Projection Identity audit: **PASS (60 samples)**.
- Actions: **9/9**.
- Snapshot schema mutation: **false**.

## Packaging Note

The final delivery ZIP SHA-256 is intentionally reported alongside the archive rather than embedded here because embedding an archive's own hash inside itself would change the hash. The final archive must be produced from the clean reconstructed main commit, reproduced byte-for-byte, re-extracted, and independently re-verified before handoff.
