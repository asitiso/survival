# Phase 1961~1968 Handoff — Elite Affix Combat Identity Integration

## Delivery basis

This pass was applied to the provided `arcane-last-stand-phase1960-full-merged.zip`. The archive did not contain upstream `.git` metadata, so this handoff does **not** claim an original repository `main` SHA. A local Git baseline was reconstructed from the Phase 1960 delivery solely to isolate, verify, and merge this pass safely.

## Scope

Phase 1961~1968 adds presentation-only visual identity for the existing six elite affixes. Affix selection, modifier values, Danger 7 two-affix behavior, frenzy threshold, mana-shield values, enemy geometry/collision, targeting, economy, persistence schemas, and the 9-action input contract remain unchanged.

### Phase 1961 — Elite Affix Identity Atlas

- Added `assets/enemies/elite-affix-icons.png`.
- Atlas size: **288×192**.
- Grid: **3×2**, cell **96×96**.
- Total identities: **6** — swift / armored / regenerating / frenzied / commander / manaShield.
- Static art only: animation false, motion amplitude 0.
- The visual source was generated specifically for this pass and normalized into exact 96px cells.
- Final asset size: **115,760 bytes**.
- Asset SHA-256: `5896f6f54d3b818bcd0aa191e64657238f5da1f325f303338ac13527120f38b2`.

### Phase 1962 — On-body Identity

- Elite enemies prefer up to two 16~18px affix icons below the body.
- One-affix rows center the icon; two-affix rows stay horizontally centered with a fixed 3px gap.
- Icon row geometry clamps to the 1600×900 logical arena bounds.
- Existing HP bar, body sprite, target ring, collision radius and movement are unchanged.

### Phase 1963 — Text / Asset Fail-safe

- `Game` loads the affix atlas independently and asynchronously.
- Atlas failure does not block construction, restart, enemy spawn, update, render, or input.
- If the atlas is unavailable, existing Korean text such as `신속·철갑` remains the source-of-truth fallback.

### Phase 1964 — Dangerous Affix Emphasis

- `폭주` receives static emphasis only at the existing **HP <= 42%** frenzy threshold.
- `마흡` receives static emphasis only while mana shield remains.
- `재생` is statically emphasized as an always-active affix.
- No pulse, oscillation, blink, or new animation was added.

### Phase 1965~1966 — Priority Readability / Density Arbitration

- The affix row remains compact under existing priority/threat rings rather than adding a new HUD panel.
- One/two-affix layouts share a single geometry helper.
- Edge-positioned elites are clamped so icon centers and extents remain inside the logical canvas.
- Existing priority threat selection and drawing logic is unchanged.

### Phase 1967 — Deterministic Identity Audit

`auditEliteAffixIdentityAssets()` produces **54 deterministic samples** and verifies:

- affix coverage **6/6**;
- unique atlas cells **6/6**;
- single-affix coverage **100%**;
- double-affix coverage **100%**;
- on-body coverage **100%**;
- out-of-bounds **0**;
- overlap-policy violations **0**;
- text fallback **100%**;
- image-load failure non-blocking **100%**;
- motion amplitude **0**;
- modifier mutation **false**;
- enemy geometry mutation **false**;
- early Danger affix count remains **1** and Danger 7+ remains **2**;
- Actions **9/9**;
- Snapshot schema mutation **false**.

### Phase 1968 — Release Fail-Closed

Release Freeze now binds:

- `eliteAffixIdentityAssetsPassed`
- `eliteAffixIdentityAssetsSamples = 54`

Normal Release Candidate on the implementation branch:

- Status: **PASS**
- Signature: `RCQ-C019591F`

If `eliteAffixIdentityAssetsPassed` is forced false while upper Release Freeze `passed` is forged true:

- Candidate status: **REVIEW**
- Issue: `release-freeze`
- Signature: `RCQ-82247A48`

If only sample count is mutated from 54 to 55:

- Candidate remains structurally evaluable and PASS
- Signature changes to `RCQ-23B6CD50`

This verifies both fail-closed evidence binding and signature sensitivity.

## Verification evidence before handoff commit

### Focused regression

- Fresh TypeScript build: **PASS**.
- Phase 1961~1968 plus directly affected legacy tests: **23/23 PASS**.

### Full regression

- Test files: **467**.
- Tests: **1,736**.
- Pass: **1,736**.
- Fail: **0**.
- Full suite executed as six exhaustive sorted batches because one monolithic Node process can stall in this repository.

### Release gates

- Release Candidate: **PASS** — `RCQ-C019591F`.
- Forged lower elite-affix evidence: **REVIEW** — `RCQ-82247A48`.
- Sample-count mutation 54→55: `RCQ-23B6CD50`.
- Release Quality Gate: **PASS** — `RQ-D4630257`.
- Raster profiles: **5/5 PASS**.
- Release Freeze: **PASS**.
- Elite Affix Identity audit: **PASS (54 samples)**.
- Actions: **9/9**.
- Snapshot schema mutation: **false**.

## Packaging note

The final delivery ZIP SHA-256 is intentionally reported alongside the archive rather than embedded here because embedding an archive's own hash inside itself would change the hash. The final ZIP must be re-extracted and independently re-verified before handoff.
