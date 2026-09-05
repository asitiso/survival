# Phase 2199~2206 Handoff — Field Event Response + Effect Profile Identity Integration

## Scope

This pass closes the field-event interpretation loop without changing event gameplay: the existing event identity stays primary while a compact response cue explains what the player should do and an effect-profile cue explains the actual benefit/trade-off.

## Phase 2199 — Field Event Response Identity

- New `assets/ui/field-event-response-icons.png`
- 480×96 RGBA, 5×1, 96×96 cells
- `chase / retrieve / overcast / harvest / burst-control`
- 5/5 pixel-unique cells
- SHA-256: `93f6a712554a6e9de6cada1f3d70986bd132cfdf544d372e00055d447e177a7e`
- Event mapping:
  - `goldenGoblin → chase`
  - `supplyDrop → retrieve`
  - `manaStorm → overcast`
  - `goldenNight → harvest`
  - `eliteRush → burst-control`
- Static, zero motion amplitude, text fallback preserved, load failure never blocks gameplay.

## Phase 2200 — Field Event Effect Profile Identity

- New `assets/ui/field-event-effect-profile-icons.png`
- 480×96 RGBA, 5×1, 96×96 cells
- `gold-bounty / free-supply / mana-tradeoff / gold-elite-tradeoff / elite-pressure`
- 5/5 pixel-unique cells
- SHA-256: `b1fd71b3c2d7ac2a2254a5c76e69911c0556a7e2b48627f41a91fa788e23296a`
- The profile is descriptive only; it reads the existing field-event contract and creates no new modifiers.

## Phase 2201 — Tactical Row Response + Effect Recall

- Existing tactical field-event row keeps its existing tactical-status event icon and text.
- Adds exactly one response identity plus one effect-profile identity in the existing row's unused lower space.
- No new HUD row and no change to `drawStatusRow(...)` contract.

## Phase 2202 — World Target Response Cue

- `goldenGoblin` and `supplyDrop` receive only the response identity because they are real world targets.
- Golden Goblin response cue follows the actual spawned event enemy id.
- Supply Drop response cue is drawn on the existing crate marker.
- `manaStorm / goldenNight / eliteRush` do not gain world markers.
- Effect-profile identities stay HUD/toast-only to avoid battlefield clutter.

## Phase 2203 — Event Start Toast Link

- Event start toast keeps the existing tactical-status event icon.
- Adds at most two helper identities: response + effect profile.
- End/escape/collection toasts continue to use the existing tactical-status presentation unless they start a new event.

## Phase 2204 — Attention Arbitration

- Only the new field-event helper identities are suppressed during:
  - Hero critical
  - Core critical
  - boss special timer ≤ 1.2 seconds
- Existing field-event row, timer, base event icon, Golden Goblin/Supply Drop gameplay, and event lifetime remain intact.

## Phase 2205 — Deterministic Audit

- Exactly 60 deterministic samples.
- 60/60 PASS.
- Five events × twelve checks each:
  - response mapping
  - response icon contract
  - effect mapping
  - effect icon contract
  - duration
  - cooldown multiplier
  - spawn-pressure multiplier
  - elite-interval multiplier
  - gold multiplier
  - response fallback
  - effect fallback
  - static/no-motion contract
- Additional frozen contracts:
  - first event at 75 seconds
  - 12-second boss safety window
  - next-event interval 85~120 seconds
  - Elite Rush max count 12
  - Actions 9/9
  - no snapshot schema mutation

## Phase 2206 — Release Freeze

- Release Freeze fail-closed evidence:
  - `fieldEventResponseEffectIdentityAssetsPassed`
  - `fieldEventResponseEffectIdentityAssetsSamples = 60`
- Forged child evidence forces Release Candidate to REVIEW.
- Sample-count mutation changes Release Candidate signature.

## Verification Evidence

- TypeScript build: PASS
- Full regression: 599 test files / 1,947 tests / 1,947 PASS / 0 FAIL
- Release Candidate: `RCQ-ADDE9D6B` PASS
- Release Quality Gate: `RQ-D4630257` PASS
- Raster: 5/5 PASS
  - 16:9 `RR-FE2C6B74`
  - 20:9 `RR-0937F125`
  - 4:3 `RR-4C84B218`
  - foldable `RR-023FFC4B`
  - 32:9 `RR-737044D6`

## Gameplay Freeze

- `FIELD_EVENT_SPECS` gameplay values unchanged.
- `fieldEventModifiers()` unchanged:
  - Mana Storm cooldown 0.68 / pressure 1.5
  - Golden Night gold ×2 / elite interval 0.72
  - Elite Rush pressure 1.35 / elite interval 0.42
- Event durations 22 / 30 / 25 / 30 / 14 seconds unchanged.
- First event 75 seconds unchanged.
- Boss safety window 12 seconds unchanged.
- Event interval 85~120 seconds unchanged.
- Elite Rush cap 12 unchanged.
- Actions 9/9 unchanged.
- Endless snapshot schema unchanged.

## Reconstructed Git Note

The distributed source ZIP does not include the original `.git` directory. Git history is reconstructed only to isolate this pass in a worktree, verify it, merge it into a reconstructed `main`, and package the resulting full source.
