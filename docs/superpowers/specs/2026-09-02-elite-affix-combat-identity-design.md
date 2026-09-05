# Elite Affix Combat Identity Design

## Goal
Replace the elite enemy's tiny affix-name-first presentation with a compact static icon identity that makes one- and two-affix elites readable at a glance without changing any elite gameplay behavior.

## Scope
Phase 1961~1968 is presentation-only. It adds six static affix identities (`swift`, `armored`, `regenerating`, `frenzied`, `commander`, `manaShield`) and renders at most two icons below an elite body/health bar. Existing affix labels remain the fail-safe when the atlas is not ready.

## Architecture
- Add `elite-affix-identity-assets.ts` as the single source of atlas coordinates and presentation geometry.
- Keep `elite-affixes.ts` as the source of gameplay modifiers and labels; do not move or alter modifier values.
- `Game` loads the atlas asynchronously alongside existing enemy/boss atlases; `EnemyManager` receives the optional image/readiness inputs and uses the helper only while rendering elites.
- Active-state emphasis is static: frenzy is emphasized only below the existing 42% HP threshold, mana shield only while shield remains, regenerating is always marked active. No pulse, oscillation, or new animation is introduced.
- If the atlas is unavailable, render the existing `신속·철갑`-style text unchanged.

## Layout
- Atlas: `assets/enemies/elite-affix-icons.png`, 3 columns × 2 rows, 96×96 cells, 288×192 total.
- On-body icons: nominal 18px; clamp to 16~18px based on enemy radius.
- One affix: centered. Two affixes: horizontally centered with a small fixed gap.
- Vertical anchor stays below the elite body. Geometry helper clamps the row to logical arena bounds so edge-positioned enemies do not clip icons.
- Existing HP bar remains above the enemy and existing mana-shield ring remains around the body. Priority/threat rings are not changed.

## Fail-safe and compatibility
- Atlas readiness must never block construction, reset, spawning, update, or input.
- Text remains the final source-of-truth fallback.
- Existing `eliteAffixModifiers()`, `selectEliteAffixes()`, danger >= 7 two-affix rule, low-HP threshold, shield values, enemy radius, collision and target logic remain unchanged.
- No snapshot schema fields are added.

## Verification
- Deterministic identity audit covers all six cells, one/two-affix row layouts, active-state emphasis, edge clamping, fallback, motion amplitude 0, unchanged modifiers, unchanged enemy geometry, 9/9 actions, and snapshot schema mutation false.
- Release Freeze binds the audit pass flag and deterministic sample count fail-closed.
- Full TypeScript build, exhaustive test suite, Release Candidate, Release Quality Gate, Raster profiles, merge verification, ZIP integrity, and fresh re-extraction verification are required before delivery.
