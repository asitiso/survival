# Arcane Last Stand — Phase 703~722 Handoff

## Baseline
- Source baseline: `main@7c487dd` (`7c487dd89fea1d52c3568c39d72bd55c712d40fd`)
- Baseline regression: 1089/1089 PASS
- Combat action contract: 9/9
- No permanent currency / blocking modal / RunSnapshot schema expansion

## Phase 703~706 — Release Play Journey Smoke
- New `release-play-journey-audit.ts`.
- Replays 20/25/30 minute build progression for 4 heroes x 4 archetypes x Threat 0/3/5 = 48 combinations, 144 samples.
- Current 20-minute minimum build progress: 92%.
- All modeled core builds complete by 25 minutes.
- First-30 flow health remains PASS and modeled blocking dead ends are 0.
- Action count remains 9 and Snapshot mutation is false.
- Candidate issue key: `release-play-journey`.

## Phase 707~710 — Lifecycle Resume Integrity
- New `lifecycle-resume-integrity-audit.ts`.
- 4 heroes x 20/25/30 minute checkpoints = 12 persistence samples.
- Primary snapshot round-trip coverage: 100%.
- Corrupt-primary backup recovery coverage: 100%.
- Corrupt-primary+backup recovery-journal coverage: 100%.
- Endless extension round-trip coverage: 100%; elapsed drift: 0.
- `Game.checkpointForLifecycle()` now checkpoints the run and clears transient input state.
- `visibilitychange`, `pagehide`, `beforeunload`, and `pageshow` are wired in `main.ts` so backgrounding/navigation does not rely on only one browser lifecycle event.
- Existing RunSnapshot version/schema is unchanged.
- Candidate issue key: `lifecycle-resume-integrity`.

## Phase 711~714 — Multi-Touch / Rotation / App-Resume Input Resilience
- New `core/input-lifecycle.ts`.
- Pointer coordinate conversion now survives a temporary zero-size canvas rect during rotation/background restoration instead of producing Infinity/NaN.
- `InputState.resetTransient()` clears joystick pointer, action pointers, held/pressed actions, keyboard state, movement, and active thumb state before app resume.
- Multi-touch model keeps the movement pointer isolated from independent action pointers.
- Existing mobile input regression still preserves 9 reachable actions and foldable hinge safety.
- Candidate issue key: `input-lifecycle-resilience`.

## Phase 715~718 — Accessibility Release Lock
- New `accessibility-release-audit.ts`.
- First-run defaults honor `prefers-reduced-motion: reduce` by starting reduced flash + reduced shake without adding a new saved settings field.
- Stored user settings continue to override system defaults.
- Existing reduced-flash cap, reduced-shake scaling, haptic-off path, and sound mute path all pass.
- Presentation control buttons now expose `aria-label`; boolean toggles expose `aria-pressed`.
- Combat canvas retains its accessible name and critical telegraphs remain visible under reduced presentation settings.
- Candidate issue key: `accessibility-release`.

## Phase 719~722 — Packaged Runtime Smoke Gate
- New `package-runtime-smoke.ts` and `scripts/verify-package-runtime.mjs`.
- Release verification plan is now: build once -> tests -> raster -> release -> candidate -> deterministic archive -> packaged runtime.
- Package smoke creates a fresh `git archive` ZIP from clean HEAD, extracts it to a temp directory, starts the archive's own `scripts/serve.mjs`, and checks 9 required HTTP paths.
- It also verifies the ZIP source comment equals the exact full source revision.
- `release-manifest.ts` now fails closed with `package-runtime-smoke` when this evidence is unhealthy.
- No npm install is required inside the packaged smoke because the archive carries tracked `dist/` and uses the Node built-in HTTP server.

## Verification target
- Regression target: 1109 tests.
- Raster target: 5/5.
- Release signature expected unchanged: `RQ-9085A5AD`.
- Feature-tree Candidate signature before final commit: `RCQ-0E7A90E7`.
- Final Manifest must PASS archive reproducibility and packaged runtime smoke from a clean commit.
