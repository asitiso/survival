# Phase 2009~2016 Handoff — Mythic Last Law Combat Identity Integration

## Scope

This pass improves the six Mythic Last Law identities at the exact two places where late-run players must recognize them fastest: the activation toast and the existing SAFE lane / Last Law timeline. It does not add a new HUD row and does not change Last Law gameplay, safe-zone timing, actions, persistence, or RunSnapshot schema.

## Phase 2009 — Mythic Last Law Identity Atlas

Added `assets/ui/mythic-last-law-icons.png`:

- 288×192 RGBA PNG
- 3×2 atlas
- 96×96 cells
- 6 used cells / 6 unique cells
- `solar-rupture` — ruptured sun motif
- `brood-crown` — brood crown / egg motif
- `iron-verdict` — iron shield / verdict motif
- `null-eclipse` — null eclipse motif
- `twin-cataclysm` — mirrored twin fracture motif
- `broken-hour` — fractured clock motif
- PNG size: 56,870 bytes
- no animation
- motion amplitude 0

`src/game/endless/mythic-last-law-identity-assets.ts` owns the atlas contract and cell mapping.

## Phase 2010~2014 — Live Combat Integration

`Game` now loads the Last Law atlas asynchronously and non-blockingly.

When a Mythic Last Law first activates, the existing event toast keeps the exact text (`LAST LAW · ... · 약점 파괴로 최종 압박 완화`) while the matching identity icon is rendered inside the existing toast seam.

During the active Last Law state, the same identity icon is rendered at the existing SAFE lane / Last Law timeline seam. The existing SAFE lane label, forecast text, timeline text, urgency bar, hazard timing, and informational-only behavior remain present.

No new HUD row, menu, setting, pulse, blink, rotation, or motion animation was added.

If `Image` is unavailable, loading is late, or the PNG fails to load:

- the original event toast text remains intact;
- the original SAFE lane / Last Law text remains intact;
- combat start/update does not wait for the image;
- Last Law calculations and safe-zone lifecycle remain independent from the asset.

## Gameplay Contracts Preserved

The existing Last Law activation and identity contracts remain locked:

- Mythic Last Law activates at boss HP ratio `<= 0.15`
- HP ratio `0.151` remains inactive
- weakpoint destruction still relieves Last Law pressure
- six identity labels remain:
  - `LAST LAW · SOLAR RUPTURE`
  - `LAST LAW · BROOD CROWN`
  - `LAST LAW · IRON VERDICT`
  - `LAST LAW · NULL ECLIPSE`
  - `LAST LAW · TWIN CATACLYSM`
  - `LAST LAW · BROKEN HOUR`
- boss damage taken / special cadence / summon / dash / projectile density / reward multipliers are unchanged
- existing hard caps remain unchanged
- non-Last-Law safe-zone lifecycle remains exactly 9000 / 4800 / 6200 / 7800 / 9000ms with radius multiplier 1
- active Last Law safe-zone lifecycle and weakpoint relief remain unchanged
- SAFE lane remains informational and never auto-moves the hero
- Actions remain 9/9
- RunSnapshot schema mutation remains false

## Phase 2015 — 60 Deterministic Samples

Added `auditMythicLastLawIdentityAssets()` with exactly 60 deterministic samples (10 per identity) covering:

- Last Law identity coverage 6/6
- unique atlas cells 6/6
- sprite body bounds coverage 100%
- activation toast identity coverage 100%
- SAFE lane identity coverage 100%
- text fallback coverage 100%
- image load failure non-blocking 100%
- animation false / motion amplitude 0
- activation threshold unchanged
- six identity labels and modifier values unchanged
- weakpoint counterplay direction unchanged
- safe-zone lifecycle unchanged
- Actions 9/9
- Snapshot schema mutation false

## Phase 2016 — Release Fail-Closed

Release Freeze now binds:

- `mythicLastLawIdentityAssetsPassed`
- `mythicLastLawIdentityAssetsSamples = 60`

Candidate consistency validation and signature generation include both fields. Forging the lower-level Last Law identity evidence while leaving aggregate release freeze `passed=true` is rejected.

Observed feature-branch candidate signatures:

- normal: `PASS · RCQ-CD89951B`
- forged Last Law identity evidence: `REVIEW · release-freeze · RCQ-B655C94A`
- sample count 60→61: `PASS · RCQ-671C5DAC`

Release Quality Gate remains `PASS · RQ-D4630257` and raster profiles remain 5/5 PASS.

## Verification

Feature worktree verification before integration:

- fresh TypeScript build: PASS
- focused Last Law / SAFE lane regression: 34/34 PASS
- complete regression: 492 test files / 1,782 tests / fail 0
- Release Candidate: PASS · RCQ-CD89951B
- Release Quality Gate: PASS · RQ-D4630257
- Raster: 5/5 PASS
- Actions: 9/9

The final delivery ZIP is additionally re-extracted into a clean directory and re-verified from `npm ci` before handoff.
