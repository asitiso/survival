# Phase 1945~1952 Handoff — Deep Run Decision Identity Integration

## Delivery basis

This pass was applied to the provided `arcane-last-stand-phase1944-full-merged.zip`. The archive did not contain upstream `.git` metadata, so this handoff does **not** claim an original repository `main` SHA. A local Git baseline was reconstructed from the Phase 1944 delivery solely to isolate, verify, and merge this pass safely.

## Scope

Phase 1945~1952 adds presentation-only identity and compact recall/progress support to the existing Hero Ascension, Run Contract, and Long Run Oath systems. Ascension modifiers, Contract targets/rewards/timing, Oath targets/rewards/timing, Final Form derivation, economy, map/enemy/boss/spell balance, decision continuity, persistence schemas, and the 9-action contract remain unchanged.

### Phase 1945 — Deep Run Identity Atlas

- Added `assets/ui/deep-run-decision-icons.png`.
- Atlas size: **672×480**.
- Grid: **7×5**, cell **96×96**.
- Total identities: **35**.
  - Hero Ascension: **24**.
  - Run Contract families: **5**.
  - Long Run Oaths: **6**.
- Static art only: animation false, motion amplitude 0.
- Asset size: **30,847 bytes**.
- Asset SHA-256: `2a9272099c911c933bc7f7e6111a04a20c6b540464f566b4ca40f685cdefe811`.

### Phase 1946 — Hero Ascension Choice Identity

- Existing 35/50/65 minute Ascension cards reuse `LevelUpOverlay`.
- `ChoiceCard` gained only an optional `identityIconStyle` presentation field.
- When absent, existing `growthChoiceIconStyle()` behavior remains unchanged.
- Ascension option IDs, callbacks, selected-state mutation, and modifiers are unchanged.

### Phase 1947 — Ascension HUD Recall

- Up to the latest **3 selected Ascension icons** are shown as a compact recall strip in calm combat.
- Active objectives reduce the strip to at most **2** icons.
- Boss combat reduces it to at most **1** icon.
- Mythic/hero-critical/core-critical attention suppresses routine Ascension recall entirely.
- Critical bars and danger telegraphs are explicitly preserved.

### Phase 1948 — Run Contract Identity + Progress

- Contract choice cards use the shared family icon.
- Active Contract HUD line is presentation-only:
  - count contracts: `CONTRACT · SLAYER 18/42`
  - timed contracts: `CONTRACT · WARDEN 12/30s`
- Contract progress calculations, failure rules, rewards, deadlines, and boon values are unchanged.

### Phase 1949 — Long Run Oath Identity

- Existing `서약 · ...` text remains the complete fallback.
- The active Oath line receives the matching shared atlas icon.
- Oath runtime state and progression logic are unchanged.

### Phase 1950 — Deep-run Attention Arbitration

- Priority rule: critical/boss combat information remains primary.
- Active Contract/Oath progress is retained within the existing build-label budget.
- Ascension recall is the first identity layer compressed under pressure.
- No new HUD panel, toggle, button, animation, or input path was added.
- An initial regression where Oath priority displaced Final Form in routine HUD was detected by the full suite; root cause was the raised Oath label priority. Existing Final Form/Oath ordering was restored, while Ascension compression remains handled by the new attention policy.

### Phase 1951 — Deterministic Identity Audit

`auditDeepRunDecisionIdentityAssets()` produces **70 deterministic samples**:

- 35 identities × primary surface.
- 35 identities × fallback/non-blocking surface.
- identity coverage **35/35**.
- unique atlas cells **35/35**.
- out-of-bounds **0**.
- primary coverage **100%**.
- fallback coverage **100%**.
- motion amplitude **0**.
- text fallback **100%**.
- image-load failure non-blocking **100%**.
- Actions **9/9**.
- Snapshot schema mutation **false**.

### Phase 1952 — Release Fail-Closed

Release Freeze now binds:

- `deepRunDecisionIdentityPassed`
- `deepRunDecisionIdentitySamples = 70`

Normal Release Candidate:

- Status: **PASS**
- Signature: `RCQ-EAC7302E`

If `deepRunDecisionIdentityPassed` is forced false while upper Release Freeze `passed` is forged true:

- Candidate status: **REVIEW**
- Issue: `release-freeze`
- Signature: `RCQ-C7CEE399`

If only sample count is mutated from 70 to 71:

- Candidate remains structurally evaluable and PASS
- Signature changes to `RCQ-E6CE88A5`

This verifies both fail-closed evidence binding and signature sensitivity.

## Verification evidence before merge

### Focused regression

- Fresh TypeScript build: **PASS**.
- Phase 1945~1952 focused tests: **12/12 PASS**.
- HUD priority regression after root-cause fix: **PASS**.

### Full regression

- Test files: **458**.
- Tests: **1,713**.
- Pass: **1,713**.
- Fail: **0**.
- Full suite executed as six exhaustive sorted batches because one monolithic Node process can stall in this repository.

### Release gates

- Release Candidate: **PASS** — `RCQ-EAC7302E`.
- Release Quality Gate: **PASS** — `RQ-D4630257`.
- Raster profiles: **5/5 PASS**.
- Release Freeze: **PASS**.
- Deep Run Decision Identity audit: **PASS (70 samples)**.
- Actions: **9/9**.
- Snapshot schema mutation: **false**.

## Packaging note

The final delivery ZIP SHA-256 is intentionally reported alongside the archive rather than embedded here because embedding an archive's own hash inside itself would change the hash. The final ZIP must be re-extracted and independently re-verified before handoff.
