# Phase 9 Objectives, Threat Directives, and Mobile Combat UX Design

## Goal

Make long runs continue producing short-term goals and changing enemy priorities without increasing menu friction, while improving at-a-glance danger readability on a landscape phone screen.

## Run Missions

A `RunMissionDirector` starts at 105 seconds and offers one automatic mission at a time. Missions are shown as one compact HUD card, never as a modal. New missions begin 80-110 seconds after the prior mission resolves and are suppressed during the 12-second boss warning window.

Mission types:

- Massacre: kill a danger-scaled number of enemies within 30 seconds. Reward: +1 shop token.
- Elite Hunt: kill 3-5 elites within 40 seconds. Reward: +320 gold.
- Gold Rush: collect 450-900 gold within 35 seconds. Reward: +1 healing potion.

Mission targets scale gently with danger and are bounded. A mission can succeed or expire; failure has no penalty. The system uses delta counters from the mission start, so it does not mutate existing kill/gold counters.

## Threat Directives

Starting at 8 minutes, one threat directive rotates every 120 seconds. This changes enemy composition and tactical priority, not just HP.

- Swarm Front: hound/grunt bias, +18% spawn pressure, fewer brutes.
- Iron March: brute/elite bias, +12% spawn pressure, slightly slower enemies.
- Artillery Line: archer/bomber bias, +10% spawn pressure.
- Hex Convoy: shaman/brute bias, shaman rate materially increased.

`ThreatDirective` exposes spawn weight adjustments and simple global multipliers. `EnemyManager.spawnRegular` uses weights rather than hard-coded threshold branches once directives are active. Before 8 minutes the existing early-game composition remains unchanged.

## Mobile Danger Readability

Add a pure `dangerUiState` model based on hero/core HP ratios and high-priority threats:

- Hero HP <= 30%: red edge vignette and `HP 위험` compact warning.
- Core HP <= 35%: gold/red pulsing core warning with screen-edge arrow toward the core when the hero is far away.
- Shaman, bomber, and boss receive priority rings; only the nearest two non-boss priority targets get the stronger ring to avoid clutter.
- Mission and threat directive banners share one compact stack below the boss warning, preventing overlapping center-screen panels.

Optional haptics use `navigator.vibrate` only for boss spawn, hero entering critical HP, and core entering critical HP. The game must work identically if vibration is unsupported or blocked.

## Architecture

- `src/game/run-missions.ts`: pure mission director and progress/reward model.
- `src/game/threat-directives.ts`: pure directive timing, modifiers, and weighted composition.
- `src/game/danger-ui.ts`: pure danger state and priority threat selection.
- `src/game/enemies.ts`: accept threat composition modifiers for regular spawn selection.
- `src/game/game.ts`: own mission reward application, directive composition, compact HUD rendering, and optional haptic edge transitions.

## Constraints

- No mission selection screen and no mission failure penalty.
- At most one mission, one field event, one catastrophe, and one threat directive can each be active; their HUD is stacked, not overlaid.
- Mission reward application reuses existing shop token, gold, and potion state.
- No change to the 320 enemy performance cap.
- Threat directives do not begin before 8 minutes so the onboarding curve remains readable.
