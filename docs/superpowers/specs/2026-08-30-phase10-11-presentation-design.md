# Phase 10+11 Combat Presentation Design

## Goal
Make the existing landscape mobile combat substantially clearer and more satisfying without adding new progression currencies, menus, or gameplay rules.

## Scope
Phase 10 adds a bounded presentation runtime: spell-family VFX descriptors, enemy hit/status/death cues, boss phase-transition cues, and explicit danger telegraphs. Phase 11 adds HUD readiness states, accessibility/haptics preferences, adaptive effect quality, and presentation budgets that degrade decorative effects before gameplay-critical warnings.

## Architecture
- `presentation-budget.ts` owns hard caps and adaptive quality decisions. It knows only numeric load/fps inputs.
- `spell-vfx.ts` converts hero/spell/evolution information into compact visual descriptors. It does not simulate combat.
- `enemy-presentation.ts` derives hit flash, status rings, death burst, and special-threat telegraphs from enemy state.
- `boss-presentation.ts` tracks phase transitions and returns one-shot transition cues plus special-pattern telegraphs.
- `hud-presentation.ts` derives spell ready/cooldown/ultimate pulse/AUTO labels without mutating spell runtime state.
- `presentation-settings.ts` stores reduced-flash, reduced-shake, haptics, and effect-quality preference with safe defaults.
- `presentation-runtime.ts` owns bounded ephemeral particles/rings/trails and applies settings + budget rules.
- `game.ts` remains the integration point. Gameplay calculations remain authoritative in the existing systems; presentation modules consume state but never change damage, spawn, economy, progression, or reward outcomes.

## Visual rules
1. Enemy danger information always renders above friendly decorative spell particles.
2. Normal hit feedback is subtle. Elite/final-evolution/ultimate/boss cues may be stronger but remain bounded.
3. Boss transitions at 66% and 33% HP get a one-shot banner/ring; repeated frames must not retrigger.
4. Bomber radius and juggernaut charge lane are shown before damage resolves when the underlying attack state allows it.
5. At high load, decorative sparks/trails are reduced first. Telegraphs, boss warnings, cooldown readability, and status indicators never disappear.
6. Reduced-flash limits full-white flashes and alpha spikes. Reduced-shake suppresses presentation shake only; it never changes gameplay.

## Mobile HUD
- Normal spell buttons expose READY vs numeric cooldown.
- Ultimates pulse only when transitioning from cooldown to ready, not continuously at full intensity.
- AUTO uses one clear state label and a stable active outline.
- Relic/synergy text remains compact; tactical center stack retains priority: boss warning, field event, mission, threat directive.

## Performance constraints
- Presentation particles: hard cap 180.
- Trails: hard cap 72.
- Telegraph shapes: hard cap 24, reserved and never evicted by decorative particles.
- Death bursts are aggregated when more than 10 enemies die within 100 ms in a local region.
- Adaptive quality levels: `high`, `medium`, `low`; automatic downgrade uses moving FPS/load thresholds and has hysteresis to avoid flapping.
- Existing enemy cap 320 and enemy projectile cap 150 remain unchanged.

## Non-goals
No audio asset pipeline, no engine migration, no sprite-sheet production, no new equipment/relic/currency/progression systems, no particle physics library.

## Testing
Pure modules are tested for caps, tier decisions, transition edge semantics, telegraph priority, reduced-flash/shake behavior, HUD cooldown states, and stable one-shot cues. Existing 168 tests must remain green.
