# Phase 1953~1960 Handoff — Hero Ability Identity Integration

## Delivery basis

This pass was applied to the provided `arcane-last-stand-phase1952-full-merged.zip`. The archive did not contain upstream `.git` metadata, so this handoff does **not** claim an original repository `main` SHA. A local Git baseline was reconstructed from the Phase 1952 delivery solely to isolate, verify, and merge this pass safely.

## Scope

Phase 1953~1960 adds presentation-only hero-specific visual identity for the existing four normal spells and two ultimates. Spell tuning, cooldowns, cast/target behavior, Fusion, Final Form attack patterns, AUTO, boss assist, upgrade/reward RNG, economy, enemies, bosses, maps, persistence schemas, and the 9-action input contract remain unchanged.

### Phase 1953 — Hero Ability Identity Atlas

- Added `assets/ui/hero-ability-icons.png`.
- Atlas size: **576×384**.
- Grid: **6×4**, cell **96×96**.
- Total identities: **24** = 4 heroes × 6 abilities.
- Hero rows: Arkan / Seria / Kain / Edric.
- Ability columns: spell1 / spell2 / spell3 / spell4 / ultimate1 / ultimate2.
- Static art only: animation false, motion amplitude 0.
- Asset size: **53,882 bytes**.
- Asset SHA-256: `ceea027c4044137aa7696f44be0eeb75b201bc9cfb19d1114f59d5fdd5c62698`.

### Phase 1954 — Combat Action Button Integration

- The six combat spell/ultimate buttons prefer the hero-specific atlas.
- `potion`, `shop`, and `auto` continue to use `action-icons.png`.
- Hero atlas loading is independent and asynchronous; it does not block game construction or run start.
- Combat fallback order is:
  1. hero-specific ability atlas;
  2. existing action icon atlas;
  3. existing text label.
- Touch geometry, cooldown overlay, queued/READY labels, assist cues, and button positions are unchanged.
- Existing `actionIconPresentation(button.radius, this.actionIconAtlasReady)` behavior remains part of the legacy fallback contract.

### Phase 1955 — Level-up Choice Identity

- Spell level-up choices use hero-specific ability icons when hero context is available.
- Missing hero context still resolves to the existing generic spell/action icon.
- Stat, relic, fusion, and build identities retain their existing atlas behavior.

### Phase 1956 — Boss Reward / Evolution Identity

- Ultimate upgrade rewards reuse the same hero-specific icon seen on the combat button.
- Choice builders remain unchanged; a presentation copy is decorated immediately before `LevelUpOverlay.open()`.
- Boss reward RNG, choice order, reward values, relic logic, and fusion logic are unchanged.

### Phase 1957 — Ability Recall Consistency

- The same `(hero, ability)` identity is shared across combat, level-up, and boss reward presentation.
- No extra HUD line, panel, button, toggle, or animation was added.

### Phase 1958 — Legacy Asset Compatibility

- `action-icons.png` remains in place and continues to serve potion/shop/auto plus hero-ability fallback.
- `growthChoiceIcon()` accepts optional hero context; without it, existing behavior is unchanged.
- Text title/description/labels remain the final fallback and source of truth.

### Phase 1959 — Deterministic Identity Audit

`auditHeroAbilityIdentityAssets()` produces **48 deterministic samples**:

- 24 identities × combat surface.
- 24 identities × decision/fallback surface.
- identity coverage **24/24**.
- unique atlas cells **24/24**.
- out-of-bounds **0**.
- hero/action mismatch **0**.
- combat coverage **100%**.
- decision/fallback coverage **100%**.
- motion amplitude **0**.
- text fallback **100%**.
- legacy action-atlas fallback **100%**.
- image-load failure non-blocking **100%**.
- Actions **9/9**.
- Snapshot schema mutation **false**.

### Phase 1960 — Release Fail-Closed

Release Freeze now binds:

- `heroAbilityIdentityAssetsPassed`
- `heroAbilityIdentityAssetsSamples = 48`

Normal Release Candidate on the implementation branch:

- Status: **PASS**
- Signature: `RCQ-FAF22CAE`

If `heroAbilityIdentityAssetsPassed` is forced false while upper Release Freeze `passed` is forged true:

- Candidate status: **REVIEW**
- Issue: `release-freeze`
- Signature: `RCQ-B83F168F`

If only sample count is mutated from 48 to 49:

- Candidate remains structurally evaluable and PASS
- Signature changes to `RCQ-F6F98525`

This verifies both fail-closed evidence binding and signature sensitivity.

## TDD / compatibility regression

All production changes were preceded by failing tests. During Phase 1954 integration, the new hero-specific combat test passed but an older action-icon integration test failed because it deliberately locks the legacy `actionIconPresentation(button.radius, this.actionIconAtlasReady)` invocation as a compatibility contract. The new render path was adjusted to use that legacy presentation result as the actual fallback rather than weakening/removing the prior contract. The old and new tests then passed together.

## Verification evidence before handoff commit

### Focused regression

- Fresh TypeScript build: **PASS**.
- Phase 1953~1960 plus directly affected legacy tests: **22/22 PASS**.

### Full regression

- Test files: **463**.
- Tests: **1,725**.
- Pass: **1,725**.
- Fail: **0**.
- Full suite executed as six exhaustive sorted batches because one monolithic Node process can stall in this repository.

### Release gates

- Release Candidate: **PASS** — `RCQ-FAF22CAE`.
- Forged lower hero-ability evidence: **REVIEW** — `RCQ-B83F168F`.
- Sample-count mutation 48→49: `RCQ-F6F98525`.
- Release Quality Gate: **PASS** — `RQ-D4630257`.
- Raster profiles: **5/5 PASS**.
- Release Freeze: **PASS**.
- Hero Ability Identity audit: **PASS (48 samples)**.
- Actions: **9/9**.
- Snapshot schema mutation: **false**.

## Packaging note

The final delivery ZIP SHA-256 is intentionally reported alongside the archive rather than embedded here because embedding an archive's own hash inside itself would change the hash. The final ZIP must be re-extracted and independently re-verified before handoff.
