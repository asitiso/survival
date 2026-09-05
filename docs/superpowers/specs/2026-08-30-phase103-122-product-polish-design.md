# Phase 103-122 Product Polish Design

## Goal
Improve long-run replayability and mobile usability without adding combat actions, modal screens, or parallel progression systems.

## Product rule
Every new feature must materially reduce confusion or increase combat differentiation. If a feature only adds information without helping a decision, omit it.

## Phase 103-106 — Replay Guidance
Build Replay remains progression-valid: only the start identity/seed is restored. Add a deterministic one-line guidance result that identifies the highest-impact missing target among spell level, relic, fusion, fate, ascension/final form, or archetype. It is derived from the current and target capsules, so no new persistence is required. HUD keeps the existing four-line cap; replay uses one line in the form `REPLAY 62% · 다음: 연쇄 Lv.10`.

## Phase 107-110 — Mythic Arena Identity
Keep the existing BossArenaSystem and Last Law logic. Add an archetype profile that changes arena cadence/radius/orbit/safe-lane pressure per Mythic archetype. The profile only modifies existing hazard generation; it cannot increase the hard hazard cap above 8 and cannot shorten telegraphs below the existing safety floor. Weakpoint destruction remains beneficial.

## Phase 111-114 — Final Form Mobility
Final Form should change movement feel, not just damage. Add stateless per-form mobility profiles: acceleration feel, turn response, dash-like impulse on signature activation, and defensive displacement resistance. Integrate through existing movement modifier and signature activation path; no new input action. Values remain bounded so base movement remains readable.

## Phase 115-118 — Run Milestone Recap
At 120/240/360/480/720 minutes, create a compact non-blocking recap with survival time, kills, bosses, build identity, and one comparative headline. Reuse checkpoint timing and toast/HUD presentation. Persist reached recap milestones in the endless snapshot so resume never repeats them. Store no event log.

## Phase 119-122 — Landscape HUD & Touch Ergonomics
Add pure layout helpers for 16:9 landscape. Keep the same nine actions. Compact the top-center status line when content exceeds width, keep left build panel at max four rows, and define no-touch safety rectangles for critical HUD. Joystick origin is clamped away from the left HUD and bottom edge. Action hit-testing continues nearest-target selection. All logic is deterministic and testable without a browser.

## Compatibility
- Existing 9 Action IDs are unchanged.
- RunSnapshot remains version 1; optional endless extension migrates old saves.
- No enemy/projectile arrays are persisted.
- Existing BossArenaSystem, ResultsOverlay, LobbyOverlay, InputState and Game remain owners of their current responsibilities.
- New modules are focused pure helpers under `src/domain`, `src/game/endless`, or `src/game`.

## Verification
- TDD red/green for each feature bundle.
- Existing full suite remains green.
- `npm run build`, `git diff --check`, working tree clean.
- Static HTTP smoke for `/`, `main.js`, `game.js`, and new compiled modules.
- Final ZIP from verified `main` HEAD and `unzip -t` integrity check.
