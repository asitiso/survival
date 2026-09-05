# Phase 2159~2166 Handoff — Boss Phase Escalation Identity Integration

## Scope
- Added six Phase II escalation identities and six Phase III enrage identities for inferno / summoner / juggernaut / abyssWitch / twinMaw / timeEater.
- Connected the identity to the existing central boss-phase cue.
- Added one compact persistent recall for non-Mythic normal/APEX bosses only.
- Persistent recall is suppressed under hero/core critical or an imminent boss special (<=1.2s).
- Mythic bosses keep their existing dedicated Mythic Phase recall and never render this duplicate recall.
- No boss HP thresholds, tuning values, action count, or endless snapshot schema changes.

## Phase map
- Phase 2159 — Phase II escalation atlas, six static cells.
- Phase 2160 — Phase III enrage atlas, six static cells.
- Phase 2161 — atlas loading and failure-safe fallback.
- Phase 2162 — central boss phase cue identity integration.
- Phase 2163 — non-Mythic persistent escalation recall.
- Phase 2164 — urgent-attention suppression and Mythic duplication guard.
- Phase 2165 — exactly 60 deterministic boss phase escalation identity audit samples.
- Phase 2166 — Release Freeze fail-closed evidence + candidate signature binding.

## Asset contract
### assets/bosses/boss-phase2-escalation-icons.png
- 288x192 RGBA / 3x2 / cell 96x96
- 6/6 used and pixel-unique
- SHA-256: 36a746f4efa0d7605a054f902d9a3515b771019bff332398fec1b22952252da8

### assets/bosses/boss-phase3-enrage-icons.png
- 288x192 RGBA / 3x2 / cell 96x96
- 6/6 used and pixel-unique
- SHA-256: 047daaebd6295377643bbd67850318b57a64f18cf156e2bb0091d80936f8c2b5

Both atlases are static only (animated=false, motionAmplitude=0), preserve text fallback, and image-load failure never blocks gameplay.

## Presentation contract
- Central Phase II/III transition identity reads BossPhaseCue.phase + BossPhaseCue.archetype.
- Persistent recall reads bossPhaseForRatio(current hp/maxHp) directly; no duplicate phase state or timer.
- Persistent recall does not render for Mythic bosses.
- Persistent recall yields to hero/core critical and boss special timer <=1.2s.
- Existing boss-pressure layer is reused; no new HUD row.

## Gameplay freeze
No feature changes to:
- phase boundaries: >0.66 = I, >0.33 = II, <=0.33 = III
- bossArchetypeTuning values for all six archetypes and all three phases
- boss special intervals/projectile/summon/speed/ring/dash tuning
- Actions 9/9
- endless snapshot schema

## Deterministic audit
- auditBossPhaseEscalationIdentityAssets(): exactly 60 samples
- Result: 60/60 PASS, issues 0

## Verification evidence
- TypeScript build: PASS
- 574 test files
- 1,904 tests / 1,904 PASS / 0 FAIL (split full regression; monolithic release-candidate file executed as its 17 named subtests in four groups to stay within harness command limit)
- Release Candidate: PASS RCQ-2B31F1D9
- Release Quality Gate: PASS RQ-D4630257
- Raster 5/5 PASS: RR-FE2C6B74, RR-0937F125, RR-4C84B218, RR-023FFC4B, RR-737044D6

## Reconstructed Git note
The delivered Phase 2158 ZIP did not contain upstream .git history. Git history in this continuation is reconstructed solely for isolation, verification, local merge, and packaging. Resulting SHA values are reconstructed-local SHAs, not upstream repository SHAs.
