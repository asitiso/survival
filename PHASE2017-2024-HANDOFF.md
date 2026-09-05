# Phase 2017~2024 Handoff — Mythic Tactic Combat Identity Integration

## Scope

This pass improves the six Mythic Tactic identities at the three places where their state matters most: SAFE LINK reward acquisition, the short primed window before the next Mythic special, and one-shot Tactic Link consumption. It does not add a HUD row and does not change Mythic Tactic reward rules, attack-link modifiers, expiry/consume behavior, actions, persistence, or RunSnapshot schema.

## Phase 2017 — Mythic Tactic Identity Atlas

Added `assets/ui/mythic-tactic-icons.png`:

- 288×192 RGBA PNG
- 3×2 atlas
- 96×96 cells
- 6 used cells / 6 unique cells
- `ember` — ember/flame break motif
- `brood` — brood crown / linked-node motif
- `iron` — iron shield / verdict motif
- `void` — broken void ring motif
- `twin` — mirrored twin blades motif
- `time` — clock / released-time motif
- PNG size: 4,690 bytes
- no animation
- motion amplitude 0

`src/game/endless/mythic-tactic-identity-assets.ts` owns the atlas contract, archetype mapping, and cell mapping.

## Phase 2018~2022 — Live Combat Integration

`Game` now loads the Mythic Tactic atlas asynchronously and non-blockingly.

When a successful SAFE LINK grants a Mythic Tactic, the existing `${tactic.label} · MYTHIC TACTIC` event toast remains intact while the matching icon is rendered inside the existing toast seam.

While the one-shot Mythic Tactic attack link is primed, the same 24px static icon is rendered above the matching live Mythic boss using the existing world-space boss area. No new HUD row, timer panel, menu, setting, pulse, blink, rotation, or motion animation was added.

When the next Mythic special consumes the link, the existing `${feedback.label} · TACTIC LINK` toast remains intact and receives the same identity icon.

If `Image` is unavailable, loading is late, or the PNG fails to load:

- the original reward toast text remains intact;
- the original consumed-link toast text remains intact;
- the boss remains fully playable without the primed icon;
- combat start/update does not wait for the image;
- reward, attack-link, expiry, and consume calculations remain independent from the asset.

## Gameplay Contracts Preserved

The existing Mythic Tactic reward contract remains locked:

- SAFE LINK success required
- destroyed weakpoint ratio must be `>= 0.5`
- `collapsed` safe-zone phase remains ineligible
- reward duration remains bounded to 4,000~6,500ms
- at destroyed ratio 0.75 / stable: duration 5,500ms, boss damage taken multiplier 1.07975, Signature bonus 2.25, Flow retention 1,175ms
- no gold or XP reward is introduced

The existing six attack-link profiles remain unchanged:

- inferno / `EMBER INTERCEPT`: projectile 0.76, summon 0.92, dash 1, time-warp 1, next cadence 1.08
- summoner / `BROOD SEVER`: projectile 0.92, summon 0.70, dash 1, time-warp 1, next cadence 1.08
- juggernaut / `IRON SIDESTEP`: projectile 0.90, summon 1, dash 0.70, time-warp 1, next cadence 1.10
- abyssWitch / `VOID DISRUPT`: projectile 0.78, summon 0.90, dash 1, time-warp 1, next cadence 1.18
- twinMaw / `TWIN BREAKSTEP`: projectile 0.80, summon 1, dash 0.82, time-warp 1, next cadence 1.12
- timeEater / `TIME RELEASE`: projectile 0.86, summon 0.92, dash 1, time-warp 0.72, next cadence 1.22

The attack link remains matching-archetype only, expires normally, and is consumed once. Actions remain 9/9 and RunSnapshot schema mutation remains false.

## Phase 2023 — 60 Deterministic Samples

Added `auditMythicTacticIdentityAssets()` with exactly 60 deterministic samples (10 per identity) covering:

- identity coverage 6/6
- unique atlas cells 6/6
- sprite body bounds coverage 100%
- reward identity coverage 100%
- primed boss identity coverage 100%
- consumed-link identity coverage 100%
- text fallback coverage 100%
- image load failure non-blocking 100%
- animation false / motion amplitude 0
- reward eligibility and reward values unchanged
- six attack-link modifier profiles unchanged
- matching-archetype, expiry, and one-shot consume behavior unchanged
- Actions 9/9
- Snapshot schema mutation false

## Phase 2024 — Release Fail-Closed

Release Freeze now binds:

- `mythicTacticIdentityAssetsPassed`
- `mythicTacticIdentityAssetsSamples = 60`

Candidate consistency validation and signature generation include both fields. Forging the lower-level Mythic Tactic identity evidence while leaving aggregate release freeze `passed=true` is rejected.

Observed feature-branch candidate signatures:

- normal: `PASS · RCQ-FA658C35`
- forged Mythic Tactic identity evidence: `REVIEW · release-freeze · RCQ-1E24D970`
- sample count 60→61: `PASS · RCQ-DEBF6E7E`

Release Quality Gate remains `PASS · RQ-D4630257` and raster profiles remain 5/5 PASS.

## Verification

Feature worktree verification before integration:

- fresh TypeScript build: PASS
- focused Mythic Tactic / Release regression: 37/37 PASS
- complete regression: 496 test files / 1,788 tests / fail 0
- Release Candidate: PASS · RCQ-FA658C35
- Release Quality Gate: PASS · RQ-D4630257
- Raster: 5/5 PASS
- atlas raster: 288×192 RGBA, 6/6 unique cells
- Actions: 9/9

The final delivery ZIP is additionally re-extracted into a clean directory and re-verified from `npm ci` before handoff.
