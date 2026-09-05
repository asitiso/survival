# Phase 1969~1976 Handoff — Specialist Enemy Intent Identity Integration

This pass was applied to the provided `arcane-last-stand-phase1968-full-merged.zip`. The archive did not contain upstream `.git` metadata, so this handoff does **not** claim an original repository `main` SHA. A local Git baseline was reconstructed from the Phase 1968 delivery solely to isolate, verify, and merge this pass safely.

## Scope

Phase 1969~1976 adds presentation-only intent identity for the six existing specialist enemy roles. Specialist AI, spawn thresholds/probabilities, combat values, targeting priorities, enemy geometry/collision, economy, persistence schemas, and the 9-action input contract remain unchanged.

### Phase 1969 — Specialist Intent Identity Atlas

- Added `assets/enemies/specialist-intent-icons.png`.
- Atlas size: **288×192**.
- Grid: **3×2**, cell **96×96**.
- Total identities: **6** — bomber / shaman / shieldbearer / assassin / siegeGolem / nullifier.
- Static art only: animation false, motion amplitude 0.
- Final asset size: **102934 bytes**.
- Asset SHA-256: `3ca69e77fff4179e5a39995ed7d7e2e09adac3bab4bce592e46906d50d5fb95c`.

### Phase 1970 — On-body Intent Identity

- Each specialist can show one compact **16~18px** role/intent icon below the body.
- One shared geometry helper clamps icon centers and extents to the 1600×900 logical arena.
- Existing HP bars, enemy sprites, collision radii and target rings are unchanged.

### Phase 1971 — Active-state Readability

Static emphasis uses only existing state:

- bomber / shaman: role identity remains immediately readable;
- shieldbearer: emphasized only while existing `guardHp > 0`;
- assassin: emphasized only when existing `specialistTimer <= 1.2`;
- siege golem: emphasized only while existing target is `core`;
- nullifier: emphasized only while hero is inside existing `245 + radius` effect range.

No pulse, oscillation, blink, new timer, or motion effect was added.

### Phase 1972 — Threat Consistency

All existing specialist legacy cues remain intact:

- bomber danger body ring;
- shaman support ring / plus mark;
- shieldbearer guard arc;
- assassin dashed ring;
- siege golem `CORE` text;
- nullifier range circle.

If the new atlas is unavailable, these existing primitives remain the visual source of truth.

### Phase 1973 — AUTO Target Recall

- `autoTargetIndicator()` adds optional specialist identity metadata only.
- The current AUTO target reuses the same specialist atlas cell next to the existing target guidance when attention policy allows the label.
- Existing `AUTO`, `AUTO · THREAT`, `AUTO · CORE`, urgency, accent and radius semantics remain unchanged.
- Auto-target score weights and `AUTO_SWITCH_MARGIN = 48` remain unchanged.

### Phase 1974 — Density / Fail-safe Arbitration

- Specialist intent identity and Elite Affix identity use mutually exclusive enemy-type domains, so one enemy cannot own both systems.
- No new HUD panel or text row was added.
- Atlas loading is independent/asynchronous and does not gate game construction, restart, spawn, update, render or input.

### Phase 1975 — Deterministic Identity Audit

`auditSpecialistIntentIdentityAssets()` produces exactly **60 deterministic samples** and verifies:

- specialist coverage **6/6**;
- unique atlas cells **6/6**;
- on-body coverage **100%**;
- AUTO target coverage **100%**;
- active-state accuracy **100%**;
- edge-clamp coverage **100%**;
- overlap-policy violations **0**;
- legacy fallback **100%**;
- image-load failure non-blocking **100%**;
- motion amplitude **0**;
- specialist gameplay mutation **false**;
- auto-target contract mutation **false**;
- enemy geometry mutation **false**;
- Actions **9/9**;
- Snapshot schema mutation **false**.

Existing specialist numbers were centralized without changing their values so the audit can fail closed on future drift:

- bomber blast radius **82**, base damage **34**;
- shield guard ratio **0.45**;
- assassin reset **4.2s**, initial **3.2 + random×1.5s**;
- shaman heal radius **220 + ally radius**, heal **max(10, 10%)**;
- nullifier effect radius **245 + radius**, cooldown step **0.08**, cap **1.24**;
- siege golem target remains **core**.

### Phase 1976 — Release Fail-Closed

Release Freeze now binds:

- `specialistIntentIdentityAssetsPassed`
- `specialistIntentIdentityAssetsSamples = 60`

Normal Release Candidate on the implementation branch:

- Status: **PASS**
- Signature: `RCQ-33865929`

If `specialistIntentIdentityAssetsPassed` is forced false while upper Release Freeze `passed` is forged true:

- Candidate status: **REVIEW**
- Issue: `release-freeze`
- Signature: `RCQ-2B673B64`

If only sample count is mutated from 60 to 61:

- Candidate remains structurally evaluable and PASS
- Signature changes to `RCQ-1E915FC2`

## Verification evidence before handoff commit

### Focused regression

- Fresh TypeScript build: **PASS**.
- Phase 1969~1976 plus directly affected legacy tests: **37/37 PASS**.

### Full regression

- Test files: **472**.
- Tests: **1,750**.
- Pass: **1,750**.
- Fail: **0**.
- Full suite executed as six exhaustive sorted batches because one monolithic Node test process can stall in this repository.

### Release gates

- Release Candidate: **PASS** — `RCQ-33865929`.
- Forged lower specialist-intent evidence: **REVIEW** — `RCQ-2B673B64`.
- Sample-count mutation 60→61: `RCQ-1E915FC2`.
- Release Quality Gate: **PASS** — `RQ-D4630257`.
- Raster profiles: **5/5 PASS**.
- Release Freeze: **PASS**.
- Specialist Intent Identity audit: **PASS (60 samples)**.
- Actions: **9/9**.
- Snapshot schema mutation: **false**.

## Packaging note

The final delivery ZIP SHA-256 is intentionally reported alongside the archive rather than embedded here because embedding an archive's own hash inside itself would change the hash. The final ZIP must be re-extracted and independently re-verified before handoff.
