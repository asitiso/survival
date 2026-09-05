# Phase 163–182 Combat Polish Design

## Goal
Raise real mobile combat quality without adding actions or management screens: reward precise arena dodges, strengthen Final Form flow impact, stage early boss entrances, support foldables/ultrawide safe areas, and replace unreliable container Chromium screenshots with deterministic render contracts.

## Global constraints
- Combat actions remain exactly 9: four normal spells, two ultimates, potion, shop, AUTO.
- No new blocking overlay or combat-management menu.
- Existing save schema remains compatible; transient presentation state is not persisted.
- Enemy AI/spawn logic is not reduced to solve presentation load.
- Danger telegraphs remain higher priority than decorative VFX.
- All new rules are deterministic and testable without a browser.

## Phase 163–166 — Arena Dodge Reward
BossArena owns hazard geometry and exposes a transient dodge-window assessment. A dodge is awarded only after the hero enters a telegraphed hazard envelope, exits before activation, and remains outside briefly. Game consumes the award as a short non-stacking `EVADE` boon: small Flow retention/charge and a capped gold-free combat reward. The system never rewards standing in danger or repeatedly crossing the same hazard.

## Phase 167–170 — Flow Hitstop & Impact
Flow feedback gets a deterministic impact profile at streak 2/4/5. Hitstop is presentation-only: it scales decorative effect time and emits one audio/impact cue but does not pause input, enemy simulation, or cooldown clocks. Higher Flow creates stronger but bounded impact, while minimal quality preserves the cue with fewer particles.

## Phase 171–174 — Opening Boss Entrance
The first ten minutes gain a non-blocking entrance sequence centered around the existing 540s boss-horizon beat. It has anticipation, arrival, and release stages with telegraph/audio/camera-pulse metadata. It does not change the boss schedule; it only stages the already-planned encounter and returns to neutral by 600s.

## Phase 175–178 — Foldable & Ultra-wide Safe Area
Landscape safe-area profiling expands from compact/standard/ultrawide to include foldable-hinge and extreme-wide cases. A single profile provides logical insets, joystick bounds, status capacity, and optional hinge exclusion. Input and HUD use the same profile, preventing touch/HUD disagreement.

## Phase 179–182 — Render Contract Harness
A browser-independent render contract converts representative states to deterministic primitive records (rect/circle/line/text/wedge) and hashes them. The harness checks bounds, overlap budgets, required labels, nine-action preservation, and safe-area exclusions for 16:9, 20:9, 4:3, foldable, and extreme-wide viewports. This becomes the authoritative fallback when Chromium cannot launch in the container.

## Integration boundaries
- `BossArenaSystem`: geometry and dodge-window ownership only.
- `Game`: consumes dodge rewards and presentation cues; no new button.
- `final-form-flow-feedback.ts`: pure impact profile functions.
- `opening-boss-entrance.ts`: pure stage profile.
- `landscape-safe-area.ts`: pure viewport classification/profile.
- `render-contract.ts`: browser-independent primitives/signature/audit.
- `InputState`: consumes safe-area profile only.

## Validation
Every subsystem begins with a failing focused test, then targeted green tests. Final gate: full `npm test`, `npm run build`, `git diff --check`, static HTTP smoke, deterministic render-contract audit, Git HEAD ZIP integrity.
