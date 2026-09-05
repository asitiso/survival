# Phase 2239~2246 Handoff — Relic Resonance Projection + Replacement Impact Identity Integration

This pass was applied to the provided `arcane-last-stand-phase2238-full-merged.zip`. The archive did not contain upstream `.git` metadata, so this handoff does **not** claim an original repository `main` SHA. A local Git baseline was reconstructed from the Phase 2238 delivery solely to isolate, verify, and merge this pass safely.

## Scope

Phase 2239~2246 reduces the mental calculation required when replacing a Relic. Boss reward cards now show whether a candidate keeps, raises, or lowers the **existing Relic Resonance tier**, plus the candidate's resulting tier. The active build strip adds only a derived next-tier progress frame around the existing Relic icon. No new HUD row, gameplay modifier, reward rule, or persisted state was introduced.

### Phase 2239 — Resonance Replacement Impact Atlas

- Added `assets/ui/relic-resonance-impact-icons.png`.
- Atlas size: **288×96**.
- Grid: **3×1**, cell **96×96**.
- Identities: **3** — tier-up / steady / tier-down.
- Pixel-unique cells: **3/3**.
- Static art only: animation false, motion amplitude 0.
- Text fallback remains authoritative; image load failure never blocks gameplay.
- Final asset size: **2650 bytes**.
- Asset SHA-256: `2c5e58912d9dbc7194c22a32ee5def157482e1bf55fb252775381af9d19e1548`.

### Phase 2240 — Projected Resonance Tier Atlas

- Added `assets/ui/relic-resonance-tier-icons.png`.
- Atlas size: **384×96**.
- Grid: **4×1**, cell **96×96**.
- Identities: **4** — dormant / tier I / tier II / tier III.
- Pixel-unique cells: **4/4**.
- Static art only: animation false, motion amplitude 0.
- Final asset size: **3984 bytes**.
- Asset SHA-256: `bd6b6fc8d7d58722fa26b90ff85c7f6caa0107a3dcf2913ec4c6f8a0ef24d14d`.

### Phase 2241 — Real Resonance Projection Helper

- Added `projectRelicResonance()`.
- It computes both current and candidate states by calling the existing `deriveRelicResonance()` implementation.
- Replacement impact is derived only from the actual before/after tiers:
  - after > before → tier-up
  - after = before → steady
  - after < before → tier-down
- `relicResonanceNextTierProgress()` derives progress from the frozen **3 / 6 / 9** thresholds and stores nothing.

### Phase 2242 — Boss Reward Replacement Preview

Relic reward cards retain their existing reward data and now add two secondary identities:

1. replacement impact — up / steady / down;
2. resulting tier — dormant / I / II / III.

The compact hint also shows the real existing score transition, for example `2.5→3.5`. Candidate generation, rarity, weighting, hero affinity, and reward selection rules are unchanged.

### Phase 2243 — Active Relic Next-Tier Progress

- No new panel or HUD row was added.
- The first active Relic icon in the existing build identity strip receives a compact perimeter progress frame.
- Progress is derived every render from current resonance score/tier.
- Tier III shows the completed gold frame.
- No progress value is serialized into snapshots.

### Phase 2244 — Equip Confirmation + Toast Lifecycle Safety

- Relic equip confirmation compares the pre-equip tier with the **actual post-equip** runtime tier, then shows the corresponding impact + tier identities beside the existing Relic toast icon.
- Projection helper identities yield to hero critical, core critical, and boss-special countdown ≤ **1.2s**.
- During diff review, a stale-toast lifecycle issue was found: projection icons could remain available for a later unrelated toast.
- A regression test was written and observed failing first; `showEventToast()` now clears `eventToastRelicProjection` before setting any new toast state.
- The projection state is presentation-only and is also reset on a new run.

### Phase 2245 — Deterministic Projection Audit

`auditRelicResonanceProjectionIdentityAssets()` produces exactly **60 deterministic samples** — 4 heroes × 3 replacement outcomes × 5 checks — and verifies:

- replacement identities **3/3**;
- projected tier identities **4/4**;
- impact atlas unique cells **3/3**;
- tier atlas unique cells **4/4**;
- hero-affinity replacement can cross the frozen 3-point threshold in both directions;
- steady replacement preserves tier and score where expected;
- progress ratios remain derived and bounded;
- both atlases remain static/fallback-safe/non-blocking;
- frozen thresholds remain **3 / 6 / 9**;
- tier III frozen modifiers remain unchanged;
- gameplay mutation **false**;
- Actions **9/9**;
- Snapshot schema mutation **false**.

### Phase 2246 — Release Freeze / Candidate Binding

Release Freeze now binds:

- `relicResonanceProjectionIdentityAssetsPassed`
- `relicResonanceProjectionIdentityAssetsSamples = 60`

Release Candidate:

- fails closed when the new child evidence is forged;
- binds the 60-sample count into the candidate signature;
- includes `relic-resonance-projection-identity-assets safe (60)` in the report.

## Gameplay Freeze

No Relic Resonance balance or persistence contract changed.

- Existing score formula: `fusionCount × 1.5 + fateChoiceCount + ascensionSelections + matching hero affinity 1`.
- Existing clamp: **0…16**.
- Existing tier thresholds: **3 / 6 / 9**.
- Existing per-tier modifiers:
  - spell power **+5%**;
  - cooldown **-3%**;
  - area **+3.5%**;
  - Gold **+4%**;
  - core damage taken **-2.5%**.
- Existing Relic definitions/modifiers: unchanged.
- Boss Relic candidate generation: unchanged.
- Hero-affinity rule: unchanged.
- Actions: **9/9**.
- Snapshot schema: **unchanged**.

## Verification Evidence Before Handoff Commit

### TDD / focused regression

- Phase 2239~2246 tests were written and observed failing before production implementation.
- Initial RED: **10 expected failures / 1 frozen-formula pass** because the new modules/integration/evidence did not yet exist.
- Initial GREEN: **11/11 PASS**.
- During diff review, a stale projection-icon lifecycle regression was identified.
- The new stale-toast test was observed failing against `showEventToast()` before the fix.
- After the minimal reset fix, focused Phase 2239~2246 regression: **12/12 PASS**.

### Full regression — final worktree code

- Test files: **619**.
- Tests: **1,997**.
- Pass: **1,997**.
- Fail: **0**.
- The full sorted set was executed exhaustively in batches because the repository's nested Candidate audits are expensive in a single Node process; no test files were omitted.

### Release gates — final worktree code

- Release Candidate: **PASS** — `RCQ-1531D53D`.
- Release Quality Gate: **PASS** — `RQ-D4630257`.
- Raster profiles: **5/5 PASS**.
  - 16:9 `RR-FE2C6B74`
  - 20:9 `RR-0937F125`
  - 4:3 `RR-4C84B218`
  - foldable `RR-023FFC4B`
  - 32:9 `RR-737044D6`
- Release Freeze: **PASS**.
- Relic Resonance Projection Identity audit: **PASS (60 samples)**.
- Actions: **9/9**.
- Snapshot schema mutation: **false**.

## Packaging Note

The final delivery ZIP SHA-256 is intentionally reported alongside the archive rather than embedded here because embedding an archive's own hash inside itself would change the hash. The final archive must be produced from the clean reconstructed main commit, reproduced byte-for-byte, re-extracted, and independently re-verified before handoff.
