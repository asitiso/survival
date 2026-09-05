# Boss Weakpoint Node Identity Design

## Goal
Replace the six boss weakpoint node text glyphs with a compact static icon identity while preserving every gameplay, fallback, attention, and AUTO weakpoint contract.

## Scope
Phase 1977-1984 covers six existing node kinds only: `flamePylon`, `summonCore`, `armorPlate`, `curseAnchor`, `mawSigil`, `clockShard`.

## Architecture
Add one 3x2 static atlas and one focused identity module keyed directly by `BossEncounterNode['kind']`. `Game` loads the image asynchronously and draws it inside existing node circles; when unavailable, current PYLON/CORE/PLATE/CURSE/MAW/TIME text remains. Primary weakpoint selection continues to use `primaryWeakpointNode()` and AUTO spell aiming continues to use `autoWeakpointAimPoint()` unchanged.

## Frozen gameplay contracts
- `tierHp = 210 + variantTier * 55`.
- `armorPlate` radius 27; all other weakpoint nodes radius 31.
- Existing `BossEncounterSystem.modifiers` values are unchanged.
- Existing HP ratio -> distance -> id weakpoint selection is unchanged.
- No new motion, pulse, flash, timer, input, button, storage field, or snapshot field.
- 9 actions remain 9/9.

## Rendering and fallback
Atlas-ready nodes show a static icon centered inside the existing node body. Atlas unavailable or failed keeps existing English text. Existing HP bar, node outline, weakpoint ring, danger attention ordering and reduced-motion behavior remain intact.

## Audit and release
A deterministic audit covers 6 identities across node-body and primary surfaces plus fallback and immutable gameplay contracts, targeting 60 samples. Release Freeze and Candidate consistency/signature must fail closed on the audit evidence and sample count.
