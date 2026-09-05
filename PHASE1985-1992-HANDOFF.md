# Phase 1985~1992 Handoff — Damage Source Combat Identity Integration

## Scope
This pass adds static visual identity to the five existing hero damage-reason sources without changing damage application, source classification, severity thresholds, cue dwell, density arbitration, Actions, or snapshot schema.

## Phase 1985 — Damage Source Atlas
- Sources: `contact`, `projectile`, `explosion`, `arena`, `strain`
- `assets/ui/damage-source-icons.png`
- 288×192, 3×2, cell 96×96
- Five occupied unique cells; sixth cell unused
- Static only: motion amplitude 0
- Text fallback preserved; image load failure non-blocking

## Phase 1986~1990 — Live cue integration
- `Game` asynchronously loads the atlas using the established non-blocking identity-asset pattern.
- Existing Korean reason label and damage amount remain visible.
- Atlas ready: 18/19/20px icon is added for normal/heavy/critical severity.
- Atlas unavailable/failed: the original text-only damage-reason cue remains.
- Existing cue alpha, position, severity colors, timing, merge and density behavior remain authoritative.
- No damage history HUD, settings, controls, pulse, blink, or new gameplay state was added.

## Phase 1991 — 60 deterministic samples
Audit: `auditDamageSourceIdentityAssets()`
- Source coverage: 5/5
- Unique atlas cells: 5/5
- Cue coverage: 100%
- Severity coverage: normal/heavy/critical 100%
- Repeated-source merge coverage: 100%
- Source-switch density-guard coverage: 100%
- Text fallback: 100%
- Image load failure non-blocking: 100%
- Motion amplitude: 0
- Heavy threshold preserved: 12% max HP
- Critical threshold preserved: 32% max HP
- Dwell preserved: 0.72s / 0.95s / 1.15s
- Density guard preserved: 0.22s
- Damage amount mutation: false
- Actions: 9/9
- Snapshot schema mutation: false

## Phase 1992 — Release fail-closed
Release Freeze fields:
- `damageSourceIdentityAssetsPassed = true`
- `damageSourceIdentityAssetsSamples = 60`

Release evidence on feature branch:
- Normal Candidate: `PASS · RCQ-D772AFFD`
- Forged lower evidence (`damageSourceIdentityAssetsPassed=false`, upper `passed=true`): `REVIEW · release-freeze · RCQ-25CCD028`
- Sample count mutation 60→61: `PASS · RCQ-5444A606`
- Release Quality Gate: `PASS · RQ-D4630257`
- Raster profiles: 5/5 PASS

## Regression evidence
Fresh TypeScript build: PASS

Focused Phase 1985~1992 + direct damage/release regression:
- 24 / 24 PASS

Full feature-branch regression:
- 480 test files
- 283 + 275 + 280 + 306 + 310 + 310 = 1,764 tests
- 1,764 / 1,764 PASS
- fail 0

## Frozen gameplay
No changes to:
- damage source classification (`contact`, `projectile`, `explosion`, `arena`, `strain`)
- actual damage application
- Heavy threshold 0.12
- Critical threshold 0.32
- normal/heavy/critical dwell 0.72 / 0.95 / 1.15 seconds
- density guard 0.22 seconds
- same-source merge behavior
- source-switch severity/density arbitration
- combat attention ordering
- 9 Actions
- RunSnapshot schema
