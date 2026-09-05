# Arcane Last Stand — Phase 183~202 Handoff

## Baseline
- Base: Phase 182 / `c35adf3`
- Work branch: `work/phase183-202`
- Baseline regression: 540/540

## Implemented
### Phase 183~186 — Perfect Evade Chain
- Added `src/game/endless/arena-dodge-chain.ts`.
- Consecutive valid PERFECT EVADE results within a 3.2s window build up to ×5.
- Active Mythic hazard damage immediately breaks the chain.
- Chain rewards remain combat-tempo only: extra Flow retention, bounded Signature charge, short move-speed/boost duration. No gold, XP, or shop currency is created.
- Chain state is transient and resets with the run; Snapshot schema is unchanged.

### Phase 187~190 — Mythic Safe Lane
- Added `src/game/endless/mythic-safe-lane.ts`.
- Scores deterministic candidate escape points using the same geometry collision function as the real Mythic arena.
- Ring geometry can prefer the safe inner pocket; corridor/cross geometry naturally favors lateral escape.
- Game rendering shows a low-alpha dashed `SAFE LANE` guide only while geometry hazards exist. It never auto-moves the hero.

### Phase 191~194 — Flow × Final Form Link
- Added `src/game/endless/final-form-flow-link.ts`.
- Flow 5 upgrades the next Final Form Signature attack with mobility-family-specific bounded modifiers.
- Surge favors damage, Flow favors chain count, Drift favors radius/slow, Anchor favors push/control.
- Link caps: damage ≤1.22, radius ≤1.18, push ≤1.25, chain bonus ≤4.
- After a linked Signature, Flow drops to 3 instead of remaining permanently maxed, creating a rebuild loop without a new button.

### Phase 195~198 — Foldable Dual Panel
- Extended `LandscapeSafeAreaProfile` with explicit `heroPanel` and `statusPanel` logical rectangles.
- Foldable 2208×1840-class layout keeps the hero/build panel left of the center hinge and moves time/Threat/status to the right of the hinge.
- Foldable status panel is narrowed to avoid overlap with the existing guardian-core HUD.
- Standard/compact/ultrawide/extreme layouts retain their current centered status placement.
- Render Contract consumes the same panel rectangles as the live HUD contract.

### Phase 199~202 — Raster Contract Approximation
- Added `src/game/render-raster-contract.ts`.
- Converts logical render primitives into a deterministic 64×36 occupancy raster for each representative frame.
- Roles are weighted (`critical-hud` > `interactive` > `telegraph` > `label` > `decorative`) so critical layout drift contributes more strongly.
- Provides `RR-XXXXXXXX` raster signatures and a normalized similarity score.
- Detects missing critical HUD and large geometry movement without requiring Chromium screenshots.
- This complements, rather than replaces, the Phase 179~182 primitive audit.

## Validation added
- `arena-dodge-chain.test.mjs`
- `mythic-safe-lane.test.mjs`
- `final-form-flow-link.test.mjs`
- `foldable-dual-panel.test.mjs`
- `render-raster-contract.test.mjs`
- `phase183-202-integration.test.mjs`

## Intentional contract update
- `landscape-foldable-safe-area.test.mjs` previously required the foldable status header to remain left of the hinge.
- Phase 195~198 intentionally changes that product contract to hero/build left + status right, so the old assertion was updated to verify both panels remain on opposite sides of the hinge.

## Compatibility
- Exactly 9 combat actions remain: normal spells ×4, ultimates ×2, potion, shop, AUTO.
- No new blocking overlay or combat menu was added.
- No Phase 183~202 transient state is serialized into the endless Snapshot schema.
- SAFE LANE is guidance only and does not move the hero.
- Existing Mythic collision remains the source of truth for both hazard damage and safe-lane scoring.
- Standard 16:9, 20:9, 4:3, foldable, and 32:9 render contracts remain auditable.
