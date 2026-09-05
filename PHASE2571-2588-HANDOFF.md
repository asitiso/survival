# Phase 2571~2588 Handoff — Objective Completion / Ultimate Residue / Safe-Lane Transition VFX

## Scope

Presentation-only 3-Train VFX expansion. No combat balance, objective reward math, spell damage/pull math, movement automation, action count, or snapshot-schema changes.

## Train A — Phase 2571~2576: Objective Completion Ceremony VFX

- New atlas: `assets/arena/objective-completion-ceremony-vfx.png`
- 3 battlefield objectives × 2 states: `burst`, `reward`
- 6 cells, 128×128 each, 3×2 atlas, 384×256
- Completion ceremony is queued only after the existing objective runtime reports a real completion.
- The effect is anchored to the completed objective's actual world position and carries the real reward-list length only as presentation scale metadata.
- Existing reward application, objective streak/shop-token behavior, toast, scheduling and failure rules remain unchanged.
- Queue is capped at 8, reset clears it, TTL advances on safe dt, Reduced Flash caps alpha, and atlas load failure leaves the existing objective marker/reward feedback intact.

## Train B — Phase 2577~2582: Ultimate Post-Impact Residue VFX

- New atlas: `assets/heroes/ultimate-post-impact-residue-vfx.png`
- 4 heroes × 2 ultimate aftermath kinds: `meteorStorm`, `blackHole`
- 8 cells, 128×128 each, 4×2 atlas, 512×256
- Meteor residue is queued from each meteor's actual impact position and radius after the existing impact feedback seam.
- Black Hole residue is queued only when the real hole TTL expires, using that hole's actual position and radius.
- Existing meteor damage, Black Hole pull/tick/duration and target rules are unchanged.
- Residue rendering uses only presentation TTL/radius, is hero-specific, is capped at 16 cues, clears on reset, and remains fail-open when the image is unavailable.

## Train C — Phase 2583~2588: Map Safe-Lane Transition VFX

- New atlas: `assets/arena/map-safe-lane-transition-vfx.png`
- 3 maps × 2 states: `path`, `arrival`
- 6 cells, 128×128 each, 3×2 atlas, 384×256
- Path stamp derives its angle from the actual current hero → `safeLane.target` vector and uses the current terrain layout id.
- Arrival stamp is anchored to the actual safe-lane target.
- Existing dashed safe-lane line/target circle remains the navigation fallback; no hero auto-move, speed multiplier or gameplay route mutation was added.
- Reduced Flash lowers overlay alpha and missing atlas leaves the old safe-lane guidance untouched.

## Release Binding

New deterministic 64-sample audits:

- `objective-completion-ceremony-vfx-audit.ts`
- `ultimate-post-impact-residue-vfx-audit.ts`
- `map-safe-lane-transition-vfx-audit.ts`

Each audit requires presentation-only behavior, fail-open loading, no gameplay formula mutation, no snapshot schema mutation, and Action count 9. Release Freeze and Candidate signature material bind all three pass bits and sample counts.

Forging any new audit pass bit to false produces Candidate `REVIEW` with `release-freeze`; changing any of the three new sample counts changes the Candidate signature.

## Asset Evidence

- `objective-completion-ceremony-vfx.png`: 138,857 bytes; SHA-256 `b84612392d8a5bc82f5b223b0bab50fdab8e91b257e2d8f3e241c9d83e280422`; 6/6 non-empty and pixel-unique.
- `ultimate-post-impact-residue-vfx.png`: 181,299 bytes; SHA-256 `d834ee47cd437c89449e80eca6bd9938d8ca4f23c629e577c98c48f6f6bf0c3c`; 8/8 non-empty and pixel-unique.
- `map-safe-lane-transition-vfx.png`: 124,907 bytes; SHA-256 `cfc468a63b8288eb2170f34531f157e75bfa9b06feb29be3179a80c2d2264f02`; 6/6 non-empty and pixel-unique.

Total: 20/20 non-empty, pixel-unique cells.

## Verification

- Baseline before implementation: build PASS + previous Phase 2553~2570 contracts 18/18 PASS.
- TDD RED: 18/18 new contracts failed before implementation.
- GREEN: 18/18 new contracts pass after implementation.
- Related objective / spell / ultimate / safe-lane / prior VFX / release regressions: 113/113 pass.
- Full regression, split only to stay inside execution time limits: 726 test files / 2,380 tests / 2,380 pass / 0 fail.
- Candidate: `RCQ-93ADA931` PASS.
- Raster: 5/5 PASS (`16:9`, `20:9`, `4:3`, `foldable`, `32:9`).
- Release: `RQ-D4630257` PASS; Action 9/9; Raster 5/5; baseline mutation disabled.
- New audit fail-bit forging: all three force Candidate `REVIEW` + `release-freeze`; all three pass-bit changes alter Candidate signature.
- New sample-count forging: all three alter Candidate signature.

## Next VFX Direction

Do not add more layers to objective completion, ultimate residue or safe-lane guidance next. Higher-value remaining candidates are objective **activation/materialization** cues that help the player find a newly spawned objective, boss **arena-transition entrance/exit** world effects tied to existing arena lifecycle changes, and map-specific **combat boundary/obstacle warning** accents only where the current primitive cues still require visual searching. Prefer only the items that produce a clear navigation or combat-readability gain over existing Canvas feedback.
