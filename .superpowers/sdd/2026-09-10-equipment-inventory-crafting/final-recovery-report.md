# Final equipment inventory and crafting recovery report

## Scope

This recovery closes the remaining final-review gaps around shop action ranking and retained ingredient capacity. Top equip and forge actions now require a materially positive projected readiness gain (`>= 0.05` of at least one readiness target metric). A lower-rank stored duplicate that leaves the relevant readiness unchanged or worse therefore cannot outrank an affordable useful purchase. Undiscovered hidden recipes continue to use only the generic `??? 조합 가능` label.

The retained-stack regression uses two copies of each recipe ingredient, so consuming one of each leaves both ingredient stacks in place. With four other distinct stacks, all six inventory slots remain occupied and the result cannot be placed. The failed transaction returns the exact original state object and leaves the nested state unchanged.

## Commits

- `7464d53 fix: require material readiness gains for shop actions`
- The related final-review regression file is staged with this report so its corrected expectation follows the new benefit-qualified behavior.

## Validation

Focused command:

```text
node --test tests/final-equipment-fix.test.mjs tests/shop-guidance.test.mjs tests/equipment-crafting-ui.test.mjs tests/equipment-forge.test.mjs tests/equipment-hidden-set.test.mjs tests/equipment-final-review.test.mjs
```

Result: 46 tests passed, 0 failed.

The focused run includes the lower-rank stored staff versus rank-3 equipped staff plus useful armor purchase regression, the six retained ingredient-stack capacity regression, hidden-recipe secrecy checks, and the equipped-item forge benefit check.

Balance command:

```text
node scripts/equipment-balance-report.mjs
```

Result: exit 0. All 10 five-to-twenty-minute rows passed for the 25% and 45% recovery paths. The unarmed eight-minute path remained at least 20% behind the recommended path on both survival and firepower.

Full parallel verifier:

```text
npx tsc
node scripts/verify-tests-parallel.mjs
```

Result: exit 0 with `1..0`, `# tests 0`, `# pass 0`, `# fail 0`, `# files 1124`, and `# workers 8`. The verifier launched all 1,124 files and reported no failing file; its aggregate parser does not count the child test output. The direct focused run above is the test-count evidence.

## Clean committed-HEAD typecheck evidence

After commit `7464d53`, a temporary archive and extracted snapshot were created outside the repository:

```text
git archive --format=zip --output=C:\Users\우\Documents\Codex\survival-recovery-head-7464d53.zip HEAD
Expand-Archive -LiteralPath C:\Users\우\Documents\Codex\survival-recovery-head-7464d53.zip -DestinationPath C:\Users\우\Documents\Codex\survival-recovery-head-7464d53 -Force
C:\Users\우\Documents\Codex\2026-09-10\https-github-com-asitiso-survival-tree\work\survival\node_modules\.bin\tsc.cmd --noEmit --project C:\Users\우\Documents\Codex\survival-recovery-head-7464d53\tsconfig.json
```

Captured output:

```text
snapshot=C:\Users\우\Documents\Codex\survival-recovery-head-7464d53
archive=C:\Users\우\Documents\Codex\survival-recovery-head-7464d53.zip
tsc_exit=0
```

This archive-based check is the clean committed-HEAD typecheck evidence. It used the existing checkout dependencies while compiling the extracted committed snapshot.

## Historical wording correction

The `71-test` statement in `final-fix-report.md` is historical and is superseded here. The accurate recovery evidence is the directly captured 46-test focused run above plus the full verifier result of 1,124 launched files, zero failures, and an aggregate `# tests 0` parser limitation.

## Concerns

The checkout still contains pre-existing dirty source, test, asset, log, and generated `dist` changes. They were preserved; generated `dist` was not staged. The temporary archive and snapshot are outside the repository and do not affect the worktree.
