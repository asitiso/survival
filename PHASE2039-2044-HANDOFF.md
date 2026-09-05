# Phase 2039~2044 Handoff — Long-Run Oath Active Identity Recall Integration

## Scope

This pass reuses the six Oath cells already present in `assets/ui/deep-run-decision-icons.png`. No new PNG or loader is added. The goal is to make the current 2h+ Oath recognizable at start and resolution without changing the existing single-slot HUD or any gameplay contract.

## Phase 2039 — Reused Oath identity contract

- Existing atlas reused: `deep-run-decision-icons.png`
- Atlas: 672×480 RGBA / 7×5 / cell 96×96
- File size: 30,847 bytes
- SHA-256: `2a9272099c911c933bc7f7e6111a04a20c6b540464f566b4ca40f685cdefe811`
- Oath cells: `slayer`, `elite_hunt`, `boss_hunt`, `arcane_flow`, `core_guard`, `endure`
- Oath unique cells: 6/6
- Added `longRunOathRecallIcon()` and title→kind presentation mapping.
- No new image asset, no duplicate atlas, no animation, motion amplitude 0.

## Phase 2040 — Oath start toast identity

- Existing `${milestone}분 서약 · ${title}` text remains unchanged.
- The matching Oath cell is drawn at the existing event-toast icon seam.
- Image load failure leaves the existing text-only toast intact.

## Phase 2041 — Active Oath recall

- The existing `서약 · ... progress/target` tactical status row already used `drawDeepRunDecisionIdentityHud()` before this pass.
- No duplicate HUD implementation was added.
- The existing single-slot 17px Oath icon is retained and now explicitly covered by the Phase 2043 recall audit.
- No new HUD row, modal, timer, pulse, blink, or rotating effect.

## Phase 2042 — Oath outcome toast identity / fallback

The same Oath identity is now used for existing text-only outcome toasts:

- `서약 완수 · ...`
- `서약 실패 · ...`
- `서약 종료 · ...`

The Oath kind is derived only in the presentation layer from the existing Oath title. Gameplay effects and `long-run-oaths.ts` are unchanged.

## Frozen gameplay contracts

The following production gameplay/data files are unchanged:

- `src/game/endless/long-run-oaths.ts`
- `src/game/endless/types.ts`
- `src/game/endless/snapshot.ts`
- `assets/ui/deep-run-decision-icons.png`

Locked behavior:

- milestones: 120 / 150 / 180 / 240 / 300 / 360 minutes
- recent 2 Oath kinds avoided when choosing the next kind
- one active Oath slot
- exact target/deadline formulas unchanged
- core guard failure threshold remains strictly above 12% baseline core HP
- completion reward formula unchanged
- boon duration: 90 seconds
- prosperity: gold ×1.16
- power: spell power ×1.09
- guard: core damage ×0.88
- boss: boss damage ×1.10
- Actions: 9/9
- Endless snapshot round-trip unchanged

## Phase 2043 — 60 deterministic samples

`auditLongRunOathRecallAssets()` covers exactly 60 deterministic checks:

- identity coverage: 6/6
- unique cells: 6/6
- start toast coverage: 100%
- active recall coverage: 100%
- outcome toast coverage: 100%
- fallback coverage: 100%
- max visible recall icons: 1
- text fallback preserved: true
- image load failure non-blocking: true
- motion amplitude: 0
- milestone contract mutation: false
- recent-choice contract mutation: false
- target/deadline contract mutation: false
- core-damage failure contract mutation: false
- boon/modifier contract mutation: false
- Actions: 9/9
- Snapshot schema mutation: false

## Phase 2044 — Release Fail-Closed

Release Freeze now binds:

- `longRunOathRecallAssetsPassed`
- `longRunOathRecallAssetsSamples = 60`

Feature-branch candidate verification:

- Release Candidate: PASS · RCQ-3F5ED1B3
- Release Quality Gate: PASS · RQ-D4630257
- Raster: 5/5 PASS
- forged lower evidence with top-level `passed=true`: REVIEW · release-freeze · RCQ-07F03FB2
- sample count 60→61: PASS · RCQ-F5E079C4

## Feature-branch regression

- test files: 508
- tests: 1,806
- pass: 1,806
- fail: 0
- fresh TypeScript build: PASS
- focused Oath/Deep-Run identity regression: 23/23 PASS
- `git diff --check`: clean
- no new/modified PNG asset

Final delivery must still be revalidated after reconstructed-main merge and after ZIP extraction from a fresh directory.
