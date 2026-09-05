# Arcane Last Stand — Phase 543~562 Handoff

## Baseline

- Source lineage before this pass: Phase 542 tracked-source archive comment `e7cdb15b1e2e0dd4c6756d9ac011002fdc80faef`
- Baseline archive SHA-256: `5851f466665ae1051d3b0d9ae0c3a8b595986740a1a670aad95ac57b47e26773`
- Baseline regression: 929/929 PASS
- This execution environment restored tracked source from the verified Phase 542 archive, then created a fresh local Git baseline before Phase 543 work.

## Phase 543~546 — Opening AUTO Ready

- New runs enter combat with the existing global AUTO toggle already ON.
- Removes one setup tap and avoids an idle opening before the first spell volley.
- Holding a normal spell still suppresses AUTO for that spell, preserving manual intent and preventing double fire.
- AUTO can still be disabled with the same existing button/key.
- No new Action, input mode, or Snapshot field.

## Phase 547~550 — First-10-Minute Upgrade Guidance

- Ordinary level-up cards remain exactly three choices with unchanged probabilities and upgrade values.
- Before 10:00, exactly one offered card receives `초반 추천` plus a compact reason.
- Priority: immediate HP recovery when low → Lv.10/Lv.5 spell evolution → spell power → cooldown → normal spell growth → mobility/support.
- At 10:00+ the guidance becomes neutral and adds no badge/hint.

## Phase 551~554 — Opening Shop Fast Path

- Reuses the existing safe `추천 바로 구매` control.
- During the first 3 minutes, when a safe quick recommendation exists, the same button appears above the offer grid rather than in the footer.
- Estimated pointer/eye travel reduction: 56%.
- No safe recommendation = no promoted button. After 3 minutes = original shop layout.
- First scheduled shop token shows one existing event toast: `상점권 획득 · 추천 구매 1탭`.

## Phase 555~558 — First Boss Prep Assist

- Active only during the first 3 minutes and 0~12 seconds before a boss spawn.
- If a shop token remains, highlight the existing Shop Action with `준비`.
- Otherwise, when HP <72% and a potion exists, highlight the existing Potion Action with `준비`.
- Healthy/prepared runs stay silent.
- Once a boss exists, the existing boss-special `대응` assist has priority.

## Phase 559~562 — Opening Flow Friction Candidate Gate

Current deterministic audit:

- samples: >=12
- AUTO setup tap reduction: 1
- opening upgrade recommendation coverage: 100%
- first-boss actionable prep coverage: 100%
- opening shop pointer-travel reduction: 56%
- estimated composite opening-friction reduction: 63%
- Action count: 9
- Snapshot mutation: false
- Candidate fail-closed issue id: `opening-flow-friction`

## Verification before integration

- New Phase tests: 20/20 PASS
- Targeted existing regressions: 49/49 PASS
- Full regression: 949/949 PASS
- Raster: 5/5 PASS
- Release Gate: `RQ-9085A5AD`
- Candidate: `RCQ-E797A7E9`
- Candidate Opening Flow Friction: PASS · AUTO tap -1 · shop travel -56% · friction -63%
- Baseline mutation: disabled
- Combat Action invariant: 9/9

## Files added

- `src/game/opening-auto-ready.ts`
- `src/game/opening-upgrade-guidance.ts`
- `src/game/opening-shop-fast-path.ts`
- `src/game/opening-boss-prep.ts`
- `src/game/opening-flow-friction-audit.ts`
- matching `dist/game/*.js`
- 5 test files / 20 Phase tests

## Files changed

- `src/game/game.ts`
- `src/ui/shop.ts`
- `src/game/release-candidate-audit.ts`
- `src/styles.css`
- generated dist mirrors
- `README.md`

## Final integration procedure

1. Commit Phase 543~562 feature tree.
2. Run `npm run verify:manifest -- --out release-manifest.json` on the clean feature commit so archive reproducibility can execute.
3. Merge feature branch into `main`.
4. Re-run full regression and Manifest on merged `main`.
5. Start static server and smoke `/`, `main.js`, `game.js`, five new modules, Candidate/CSS routes.
6. Create final tracked-source ZIP with `git archive` and verify ZIP entries, archive comment, compression integrity, and SHA-256.
7. Remove `work/phase543-562` worktree/branch only after merged-main verification is green.
