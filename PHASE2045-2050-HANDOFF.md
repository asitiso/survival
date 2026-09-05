# Phase 2045~2050 Handoff — Run Contract Boon Active Recall Integration

## Scope

This pass improves long-run Run Contract readability without adding a new image asset or a new HUD row. It reuses the five existing Contract cells in `assets/ui/deep-run-decision-icons.png` for the accept/outcome toast lifecycle and the post-success 90-second boon recall.

## Phase 2045 — Shared Contract Recall Identity

- Reused Contract families: `slayer / warden / arcane / hunter / survivor`.
- Existing atlas remains `672×480 RGBA`, `7×5`, cell `96×96`.
- Contract cells remain unique `5/5`.
- Existing atlas SHA-256 remains `2a9272099c911c933bc7f7e6111a04a20c6b540464f566b4ca40f685cdefe811`.
- New PNG assets: `0`.
- New presentation helper: `run-contract-boon-recall-assets.ts`.
- Static identity only: animation `false`, motion amplitude `0`.
- Image load failure never blocks gameplay and text fallback remains available.

## Phase 2046 — Contract Accept Toast

The existing `런 계약 수락 · ...` toast now carries the selected Contract family icon. Existing text and decision behavior are unchanged.

## Phase 2047 — Contract Outcome Toast

- Success toast `런 계약 성공 · 90초 강화 획득` derives the family from the newly-active boon and shows the matching family icon.
- Failure toast `런 계약 실패 · 다음 계약을 노리세요` uses the failed effect family icon.
- Existing toast wording remains unchanged.

## Phase 2048 — Active Boon Compact Recall

After a successful Contract, the existing compact identity area shows:

- one `18px` Contract family icon,
- remaining boon time in seconds,
- no new HUD row,
- no pulse/blink/rotation animation.

Natural Contract cadence keeps normal gameplay to one active boon at a time; the presentation helper intentionally displays only the latest active boon if a restored/tampered state contains overlap.

## Frozen Gameplay Contracts

No changes were made to:

- `src/game/endless/contracts.ts`
- `src/game/endless/snapshot.ts`
- `src/game/endless/types.ts`
- `assets/ui/deep-run-decision-icons.png`

The following remain unchanged:

- offer schedule: 4 / 9 / 14 / 19 minutes, then every 7 minutes,
- three unique choices per offer,
- recent-family blocking behavior,
- Warden failure only beyond 20% baseline Core loss,
- Survivor failure on hero damage,
- boon duration: 90 seconds,
- Slayer: XP ×1.12 / Mastery ×1.08,
- Warden: Core damage ×0.88 / Potion ×1.10,
- Arcane: Fusion ×1.10 / Cooldown ×0.92,
- Hunter: Gold ×1.15 / Boss damage ×1.08,
- Survivor: Core damage ×0.92 / Potion ×1.15,
- existing modifier clamps,
- Actions 9/9,
- Endless snapshot schema and round-trip behavior.

## Phase 2049 — 60 Deterministic Samples

`auditRunContractBoonRecallAssets()` covers exactly 60 deterministic samples:

- Contract identity coverage 5/5,
- unique cells 5/5,
- accept toast coverage 100%,
- success toast coverage 100%,
- failure toast coverage 100%,
- active boon recall coverage 100%,
- countdown coverage 100%,
- text fallback 100%,
- image load failure non-blocking 100%,
- maximum visible boon icons 1,
- motion amplitude 0,
- offer schedule mutation false,
- offer choice mutation false,
- failure-condition mutation false,
- boon duration mutation false,
- modifier mutation false,
- expiry mutation false,
- Actions 9/9,
- snapshot schema mutation false.

## Phase 2050 — Release Fail-Closed

Release Freeze now binds:

- `runContractBoonRecallAssetsPassed`
- `runContractBoonRecallAssetsSamples = 60`

Observed candidate evidence before final packaging:

- normal: `PASS · RCQ-8029FA8D`
- forged child evidence (`passed=false`, parent forced true): `REVIEW · release-freeze · RCQ-B6999798`
- sample count 60→61: `PASS · RCQ-09A60696`

Release Quality Gate remains `PASS · RQ-D4630257` and Raster remains `5/5 PASS`.

## Feature Branch Regression

- Test files: 512
- Tests: 1,812
- Pass: 1,812
- Fail: 0

The merged-main and final extracted-delivery verification results are recorded in the final delivery message after packaging.
