# Phase 2063~2070 Handoff — Nemesis Adaptation Combat Identity Integration

## Scope
Phase 2063~2070 exposes the five existing Nemesis adaptations during learning and future boss encounters without changing Nemesis scoring, adaptation selection, boss modifiers, Actions, or snapshot schemas.

## Phase 2063 — Nemesis Adaptation Atlas
Added `assets/ui/nemesis-adaptation-icons.png` and `nemesis-adaptation-identity-assets.ts`.

Atlas contract:
- 288×192 RGBA
- 3×2 grid
- cell 96×96
- five used cells / one unused cell
- `spell_guard` — 주문 방벽
- `blink_hunt` — 점멸 추적
- `core_siege` — 코어 공성
- `enrage_clock` — 격노 가속
- `mirror_affinity` — 속성 반사
- five used raster cells are unique
- static only: animation false, motion amplitude 0
- image load failure cannot block gameplay

Atlas SHA-256:
`0a4fc1aefbe13c2d7b122192fc5a16d4d7edde811b2c8b290a83224995e2ae9b`

## Phase 2064 — Learning toast identity
The existing `네메시스 학습 · N개 대응 패턴` text remains unchanged.
After `nemesis_updated`, the current learned adaptations are resolved from the updated Nemesis state and up to three static icons are rendered inside the existing toast surface.
Each icon carries a small I / II / III rank badge.

## Phase 2065~2067 — Boss encounter active recall
During an active boss encounter the existing Boss pressure presentation reuses the same atlas and shows up to three learned adaptation icons near the boss pressure area.
- normal boss: 18px identity icons
- Mythic or 4h+ density: 16px compact icons
- no new HUD row
- rank I / II / III remains visible
- `mirror_affinity` keeps a tiny affinity text cue on its icon
- atlas failure simply omits the icon layer; combat remains unchanged

## Gameplay contract freeze
The following gameplay/schema files are unchanged:
- `src/game/endless/nemesis.ts`
- `src/game/endless/snapshot.ts`
- `src/game/endless/types.ts`

Existing Nemesis rules remain unchanged:
- marks clamp: 0…9
- adaptation rank: `min(3, ceil(score / 2))`
- active adaptation cap: 3
- tie-break ORDER: `core_siege → enrage_clock → blink_hunt → spell_guard → mirror_affinity`
- mirror affinity continues to use the highest accumulated affinity with lexical tie behavior from the existing implementation
- Spell Guard boss damage taken reduction remains `rank × 3.5%` with existing clamp
- Mirror Affinity boss damage taken remains ×0.94 with existing clamp
- Blink Hunt dash distance remains `+rank × 5%` with existing clamp
- Core Siege summon count remains `+rank × 5%` with existing clamp
- Enrage Clock special cadence remains `-rank × 4%` with existing clamp
- Actions remain 9/9
- no RunSnapshot or Endless snapshot schema mutation

## Phase 2068~2069 — 60 deterministic samples
`auditNemesisAdaptationIdentityAssets()` validates exactly 60 deterministic samples.

Results:
- identity coverage: 5/5
- unique cells: 5/5
- learning toast coverage: 100%
- boss recall coverage: 100%
- fallback coverage: 100%
- max visible recall icons: 3
- text fallback preserved: true
- image load failure non-blocking: true
- motion amplitude: 0
- rank contract mutation: false
- ORDER tie-break mutation: false
- mirror affinity mutation: false
- modifier contract mutation: false
- Actions: 9/9
- snapshot schema mutation: false

## Phase 2070 — Release Fail-Closed
Release Freeze now binds:
- `nemesisAdaptationIdentityAssetsPassed`
- `nemesisAdaptationIdentityAssetsSamples = 60`

Candidate evidence before merge:
- Normal: `PASS · RCQ-4855650B`
- Forged child evidence false while parent passed remains true: `REVIEW · release-freeze · RCQ-531BCCDA`
- Sample count 60→61: `PASS · RCQ-FC39BEDC`
- Release Quality Gate: `PASS · RQ-D4630257`
- Raster baseline: 5/5 PASS

## Regression evidence before merge
Feature worktree:
- 524 test files
- 1,830 tests
- 1,830 PASS
- fail 0
- Fresh TypeScript build PASS
- Relevant focused regression: 15/15 PASS

## Delivery policy
The Phase 2062 source delivery did not contain the original repository `.git` history. Any Git SHA reported for Phase 2070 is therefore a reconstructed-delivery SHA and must not be represented as the original upstream repository SHA.
