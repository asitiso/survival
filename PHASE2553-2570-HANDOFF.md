# Phase 2553~2570 Handoff — Perfect Evade / Crowd Control / Counterplay Reward VFX

## Scope

Presentation-only 3-Train VFX expansion. No combat balance, spawn/drop, action-count, or snapshot-schema changes.

## Train A — Phase 2553~2558: Perfect Evade Trail VFX

- New atlas: `assets/heroes/perfect-evade-trail-vfx.png`
- 4 heroes × 3 states: `escape`, `slipstream`, `success`
- 12 cells, 128×128 each, 4×3 atlas, 512×384
- Perfect Evade records the hero's actual facing vector and rotates/travels the VFX along that direction.
- Existing arena evade reward, FLOW retention, signature charge, movement multiplier, response VFX and final-form finisher rules remain unchanged.
- Queue capped at 12, reset clears it, Reduced Flash caps alpha, image load failure leaves existing feedback intact.

## Train B — Phase 2559~2564: Crowd-Control Propagation VFX

- New atlas: `assets/heroes/crowd-control-propagation-vfx.png`
- 4 heroes × 3 control spells: `chainLightning`, `frostNova`, `blackHole`
- 12 cells, 128×128 each, 4×3 atlas, 512×384
- Chain Lightning overlays actual arc segments, Frost Nova expands from the existing nova radius/TTL, Black Hole anchors to the existing hole radius.
- Existing chain jump budget, damage, slow, Frost Nova radius/duration, Black Hole pull multiplier/tick/duration are unchanged.
- Added as optional render parameters at the end of `SpellSystem.render()` to preserve existing call compatibility.
- Reduced Flash lowers the overlay alpha; missing atlas leaves all existing spell rendering intact.

## Train C — Phase 2565~2570: Boss Counterplay Reward VFX

- New atlas: `assets/bosses/boss-counterplay-reward-vfx.png`
- 6 boss archetypes × 2 states: `burst`, `aura`
- 12 cells, 128×128 each, 6×2 atlas, 768×256
- Final weakpoint completion queues a short reward burst at the actual weakpoint completion center.
- Persistent aura is not driven by a fake presentation timer. It renders only while `bossCounterplayBenefitActive(archetype, bossEncounter.modifiers)` is actually true.
- Inferno therefore follows the existing 6-second vulnerability timer; other archetypes follow their existing modifier lifecycle.
- Burst queue capped at 8, reset clears it, atlas failure preserves existing break icon/toast/world VFX.

## Release Binding

New deterministic 64-sample audits:

- `perfect-evade-trail-vfx-audit.ts`
- `crowd-control-propagation-vfx-audit.ts`
- `boss-counterplay-reward-vfx-audit.ts`

Each audit requires presentation-only behavior, fail-open loading, no gameplay formula mutation, no snapshot schema mutation, and Action count 9. Release Freeze and Candidate signature material bind all three pass bits and sample counts.

## Verification

- TDD RED: 18/18 new contracts fail before implementation.
- GREEN: 18/18 pass after implementation.
- New atlas cells: 36/36 non-empty and pixel-unique.
- Related evade/spell/weakpoint regressions: 92/92 pass.
- Full feature-branch regression: 723 test files / 2,362 tests / 2,362 pass / 0 fail.
- Candidate: `RCQ-664D883F` PASS.
- Release: `RQ-D4630257` PASS; Action 9/9; Raster 5/5.
- Forging any new audit pass bit to false produces Candidate REVIEW with `release-freeze`; changing any new sample count changes the Candidate signature.

## Asset Evidence

- `perfect-evade-trail-vfx.png`: 12,347 bytes; SHA-256 `080990897aa98f081bfa06aa25a302eeed7a54cd8327d5e06eff133e2fb346fa`
- `crowd-control-propagation-vfx.png`: 18,648 bytes; SHA-256 `fddf06a53fe4667e4a4501994f60325bfd37e1f01f6405073f5c8583aa187df2`
- `boss-counterplay-reward-vfx.png`: 19,079 bytes; SHA-256 `23754cb6269f571fc675c719421d7da742f96827ae7de3626f1af43b5bf0f59e`

## Next VFX Direction

Avoid adding more layers to these exact events. Higher-value remaining candidates are objective world completion ceremonies, hero ultimate post-impact residues that are still generic, and map-specific traversal/safe-lane transition VFX where the player must make a movement decision.
