# Phase 2231~2238 Handoff — Long-Run Oath Requirement + Boon Outcome Identity Integration

This pass was applied to the provided `arcane-last-stand-phase2230-full-merged.zip`. The archive did not contain upstream `.git` metadata, so this handoff does **not** claim an original repository `main` SHA. A local Git baseline was reconstructed from the Phase 2230 delivery solely to isolate, verify, and merge this pass safely.

## Scope

Phase 2231~2238 makes the existing Long-Run Oath loop readable at a glance: the player can identify **what the current oath asks them to do** and **which existing 90-second boon successful completion grants** without adding another HUD row or changing oath gameplay.

### Phase 2231 — Oath Requirement Identity Atlas

- Added `assets/ui/oath-requirement-icons.png`.
- Atlas size: **288×192**.
- Grid: **3×2**, cell **96×96**.
- Total identities: **6** — slayer / elite_hunt / boss_hunt / arcane_flow / core_guard / endure.
- Pixel-unique cells: **6/6**.
- Static art only: animation false, motion amplitude 0.
- Final asset size: **5516 bytes**.
- Asset SHA-256: `88872d501ef888de9cae661c99780c47260c5063d7042b41304a84110cad485c`.

### Phase 2232 — Oath Boon Outcome Identity Atlas

- Added `assets/ui/oath-boon-outcome-icons.png`.
- Atlas size: **384×96**.
- Grid: **4×1**, cell **96×96**.
- Total identities: **4** — prosperity / power / guard / boss.
- Pixel-unique cells: **4/4**.
- Static art only: animation false, motion amplitude 0.
- Final asset size: **3730 bytes**.
- Asset SHA-256: `a458d7c67482e02ef1ca9dc4af6b649afbfe1462d13b46a9e433e79cc32281f2`.

### Phase 2233 — Existing Requirement → Boon Mapping

The presentation helper mirrors the actual existing `boonFor()` behavior:

- slayer → power
- elite_hunt → prosperity
- boss_hunt → boss
- arcane_flow → power
- core_guard → guard
- endure → guard

No new reward type or modifier was introduced.

### Phase 2234 — Oath Start Toast Preview

- Existing Oath identity and text remain the source of truth.
- `oath_started` adds compact requirement + expected-boon helper identities.
- Image loading is asynchronous/non-blocking; existing text remains intact if either atlas is unavailable.

### Phase 2235 — Active Oath Recall

- The existing Oath build-label row remains a single row.
- Compact identity slots reuse the already-proven Contract spacing:
  - requirement: x=377
  - boon preview: x=401
  - existing Oath identity: x=425
- This keeps all three identities inside the existing 440px row; no new HUD row or panel is created.
- Requirement/boon helpers hide during hero critical, core critical, or boss special timer ≤ **1.2s** so critical combat information wins attention.

### Phase 2236 — Completion / Failure Truthfulness

- `oath_completed` reads the **actual active runtime boon** from `endlessState.oaths.boon.kind` and shows that boon identity.
- `oath_failed` and `oath_expired` explicitly clear the helper identity, so failure states never imply a boon was earned.
- Existing Gold/core-heal completion rewards are unchanged.

### Phase 2237 — Deterministic Identity Audit

`auditOathRequirementBoonIdentityAssets()` produces exactly **60 deterministic samples** — 6 oath kinds × 10 checks — and verifies:

- requirement identity coverage **6/6**;
- boon identity coverage **4/4**;
- requirement unique cells **6/6**;
- boon unique cells **4/4**;
- presentation mapping matches actual runtime boon resolution;
- existing six milestone schedule remains unchanged;
- existing boon modifiers remain unchanged;
- boon duration remains **90 seconds**;
- gameplay mutation **false**;
- Actions **9/9**;
- Snapshot schema mutation **false**.

### Phase 2238 — Release Freeze / Candidate Binding

Release Freeze now binds:

- `oathRequirementBoonIdentityAssetsPassed`
- `oathRequirementBoonIdentityAssetsSamples = 60`

Release Candidate fails closed if the child evidence is forged and its signature also binds the sample count.

## Gameplay Freeze

No Long-Run Oath balance or persistence contract changed.

- Milestones: **120 / 150 / 180 / 240 / 300 / 360 minutes**.
- Oath target and deadline formulas: unchanged.
- `core_guard` failure threshold: core damage > **12%** of baseline core HP.
- Successful boon duration: **90 seconds**.
- Existing boon values:
  - prosperity: Gold × **1.16**
  - power: spell power × **1.09**
  - guard: core damage taken × **0.88**
  - boss: boss damage × **1.10**
- Existing completion Gold/core-heal rewards: unchanged.
- Actions: **9/9**.
- Snapshot schema: **unchanged**.

## Verification Evidence Before Handoff Commit

### TDD / focused regression

- New tests were written and observed failing before production implementation.
- Focused Phase 2231~2238 regression after implementation: **10/10 PASS**.
- A HUD spill regression test was then added and observed failing against the initial x=449/x=473 placement before the layout fix.
- Corrected existing-row placement test: **PASS** at x=377/x=401.

### Full regression

- Test files: **615**.
- Tests: **1,985**.
- Pass: **1,985**.
- Fail: **0**.
- The full sorted test set was executed in exhaustive batches because one monolithic Node test process accumulates expensive nested Candidate audits and can exceed the execution window; no test files were omitted.

### Release gates

- Release Candidate: **PASS** — `RCQ-F78E1B43`.
- Release Quality Gate: **PASS** — `RQ-D4630257`.
- Raster profiles: **5/5 PASS**.
  - 16:9 `RR-FE2C6B74`
  - 20:9 `RR-0937F125`
  - 4:3 `RR-4C84B218`
  - foldable `RR-023FFC4B`
  - 32:9 `RR-737044D6`
- Release Freeze: **PASS**.
- Oath Requirement + Boon Identity audit: **PASS (60 samples)**.
- Actions: **9/9**.
- Snapshot schema mutation: **false**.

## Packaging Note

The final delivery ZIP SHA-256 is intentionally reported alongside the archive rather than embedded here because embedding an archive's own hash inside itself would change the hash. The final archive must be produced from the clean reconstructed main commit, reproduced byte-for-byte, re-extracted, and independently re-verified before handoff.
