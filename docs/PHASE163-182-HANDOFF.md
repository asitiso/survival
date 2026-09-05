# Arcane Last Stand — Phase 163~182 Handoff

## Baseline
- Base: Phase 162 / `57e5526`
- Work branch: `work/phase163-182`
- Baseline regression: 522/522

## Implemented
### Phase 163~166 — Arena Dodge Reward
- Added `src/game/endless/arena-dodge-reward.ts`.
- Arms only while the hero is inside a geometry telegraph and rewards only after a safe exit before activation.
- Actual activation/contact resolves the hazard without reward; each hazard can reward once.
- Reward is combat-only: bounded Flow retention, Signature charge, and short move-speed boost. No gold/currency reward.
- Tracker/boost state is transient and reset on run/boss arena reset.

### Phase 167~170 — Flow Hitstop & Impact
- Added `flowImpactProfile(...)` to `final-form-flow-feedback.ts`.
- Thresholds remain 2/4/5 only; pseudo-hitstop is 20~55ms and presentation-only.
- `PresentationRuntime.update(dt, decorativeTimeScale)` slows particles/trails/death bursts while telegraphs still advance at real dt.
- Added lightweight `flowImpact` Web Audio descriptor; minimal quality lowers particles but keeps audio/impact readability.

### Phase 171~174 — Opening Boss Entrance
- Added `src/game/opening-boss-entrance.ts`.
- 524~535s anticipation, 535~543s arrival, 543~552s release.
- Reuses existing toast, telegraph, bossSpawn/bossPhase audio, and combat feedback.
- Does not change boss scheduling or spawn pressure and is fully neutral outside the short window.

### Phase 175~178 — Foldable / Extreme Safe Area
- `LandscapeAspectClass` now supports `foldable` and `extreme` in addition to compact/standard/ultrawide.
- Foldable profile adds a logical center hinge exclusion and places the top status panel left of the hinge.
- Input and HUD consume the same profile; joystick start rejects hinge points.
- 32:9 gets larger side insets and tighter joystick bounds while existing 16:9, 20:9, and 4:3 behavior remains covered by regression tests.

### Phase 179~182 — Render Contract Harness
- Added `src/game/render-contract.ts`.
- Generates deterministic primitive frames for opening/boss/mythic/final-flow/long-run using the same action layout and safe-area profile.
- Audits exact action count, required frames, logical bounds, and foldable hinge overlap.
- Generates stable `RC-XXXXXXXX` signatures and is exposed together with `?visualProbe=1` via `window.__arcaneRenderContract` and `data-render-contract`.
- This is the authoritative browser-independent fallback for environments where Chromium cannot launch.

## Validation added
- `arena-dodge-reward.test.mjs`
- `final-form-flow-impact.test.mjs`
- `opening-boss-entrance.test.mjs`
- `landscape-foldable-safe-area.test.mjs`
- `render-contract.test.mjs`
- `endless-phase163-182-integration.test.mjs`

## Compatibility
- Exactly 9 Action buttons remain.
- No blocking overlay/control surface was added.
- No endless Snapshot schema field was added for dodge/impact/entrance/safe-area/render-contract state.
- Danger telegraphs are not pseudo-hitstopped and remain reserved under low presentation quality.
- Existing 16:9 / 20:9 / 4:3 safe-area tests remain valid.
