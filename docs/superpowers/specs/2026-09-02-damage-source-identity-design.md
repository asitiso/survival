# Damage Source Combat Identity Integration Design

## Goal
Reduce the time required to understand why the hero lost HP by adding five static damage-source identities to the existing damage-reason cue without changing damage, severity, dwell, density, actions, or snapshot behavior.

## Scope
- Sources: `contact`, `projectile`, `explosion`, `arena`, `strain`.
- New static atlas: 3×2 cells, 96×96 each, five occupied cells and one unused cell.
- Existing Korean reason labels and damage amount remain visible.
- Existing normal/heavy/critical severity thresholds and cue lifetime remain authoritative.
- Same-source merge and source-switch density arbitration remain authoritative.
- Asset load failure falls back to the existing text-only cue and never blocks gameplay.
- No new history panel, settings, controls, damage calculations, or animation.

## Architecture
Create a small `damage-source-identity-assets.ts` module that maps each existing `DamageReasonSource` to one atlas cell and describes static/fallback guarantees. `Game` loads the atlas asynchronously using the same non-blocking pattern as other identity atlases. `drawDamageReasonFeedback()` keeps its current text, sizing, severity border, alpha and timing, adding one small icon and only the horizontal space needed for it.

A deterministic audit validates all five sources on cue/fallback surfaces, three severities, merge/density contracts, timing/threshold constants, 9 Actions, and snapshot non-mutation. Release Freeze and Candidate consistency/signature bind the audit evidence fail-closed.

## Frozen Gameplay Contracts
- Heavy threshold: 12% max HP.
- Critical threshold: 32% max HP.
- Dwell: normal 0.72s, heavy 0.95s, critical 1.15s.
- Density guard: 0.22s.
- Same-source active cues merge amount; source switches remain subject to current severity/density rules.
- Damage application amounts and source classification are unchanged.
- Action count remains 9.
- RunSnapshot schema is unchanged.
