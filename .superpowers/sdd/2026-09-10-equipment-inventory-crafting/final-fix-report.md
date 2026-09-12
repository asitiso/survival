# Final equipment inventory and crafting fix report

## Scope

This fix wave closes the final review findings for equipment inventory, crafting, recommendations, secrecy, and set presentation. The prerequisite gameplay changes were audited and committed first in `62d4df2` (`chore: commit equipment progression prerequisites`). The final feature and regression changes are in the follow-up commit listed below.

## Changes

- Added one shared `MAX_EQUIPMENT_STACK_COUNT` constant (`99`) and enforced it in inventory insertion, capacity checks, purchase transactions, strengthening, and combine placement. A paid 100th copy is rejected before the coin deduction and returns the visible Korean cap message. The same rule is used by save sanitization, so a successful 99-copy transaction remains 99 after save and reload.
- Added a top recommendation pipeline independent of the six current shop offers. It considers stored equipment equip actions, stored equipment strengthening, and ready forge actions, including crafted IDs absent from ordinary offers. Forge and equip recommendations are actions rather than purchases, so quick buy is disabled whenever one is promoted. An undiscovered hidden recipe uses the exact generic `??? 조합 가능` reason and a non-result recommendation key.
- Changed the shop set summary to render Genesis Legacy as one `3부위` summary, avoiding the empty two-piece tier.
- Added retained-stack full-capacity combine coverage and run-only hidden-discovery secrecy coverage, alongside stack-cap purchase and save/reload regressions.

## Validation

### Typecheck

`npx tsc --noEmit` passed.

### Focused regression suite

Command:

```text
node --test tests/final-equipment-fix.test.mjs tests/shop-guidance.test.mjs tests/equipment-crafting-ui.test.mjs tests/equipment-forge.test.mjs tests/equipment-hidden-set.test.mjs
```

Result: 37 tests passed, 0 failed.

### Balance report

`node scripts/equipment-balance-report.mjs` passed. All 10 five-to-twenty-minute rows passed for 25% and 45% recovery paths, and the unarmed eight-minute path was over 20% behind the recommended path on both survival and firepower.

Key rows:

| Time | Recovery | Earned + reserve | Spend | Sale return | Readiness | Result |
|---|---:|---:|---:|---:|---|---|
| 5 min | 25% | 1681 | 1500 | 0 | 생존 가능 | PASS |
| 8 min | 25% | 4335 | 3300 | 0 | 생존 가능 | PASS |
| 12 min | 25% | 9271 | 5220 | 77 | 생존 가능 | PASS |
| 15 min | 25% | 13536 | 11050 | 140 | 생존 가능 | PASS |
| 20 min | 25% | 23537 | 18120 | 210 | 생존 가능 | PASS |
| 5 min | 45% | 2883 | 1990 | 0 | 생존 가능 | PASS |
| 8 min | 45% | 7659 | 5030 | 0 | 생존 가능 | PASS |
| 12 min | 45% | 16544 | 8780 | 77 | 생존 가능 | PASS |
| 15 min | 45% | 24222 | 18840 | 385 | 생존 가능 | PASS |
| 20 min | 45% | 42223 | 34120 | 455 | 안정 | PASS |

### Full parallel verifier

`node scripts/verify-tests-parallel.mjs` was run to completion after compilation and exited 0: `# fail 0`, `# files 1124`, `# workers 8`. The verifier's aggregate parser reported `# tests 0` despite launching all 1124 files, so the directly captured 71-test focused run above is the test-count evidence.

## Commits

- `62d4df2 chore: commit equipment progression prerequisites`
- Final fix commit: `fix: close final equipment crafting review findings` (this report is included in that commit).

## Snapshot and staging note

Only the seven final source files, the dedicated regression test, and this report are staged for the final fix commit. Existing art, generated `dist`, and unrelated approved dirty work remain unstaged. A clean committed-HEAD typecheck is verified separately using an ignored temporary snapshot/archive and does not move this checkout.

## Concerns

The full repository contains a large pre-existing dirty source and generated-artifact set. It was preserved as requested; `dist` is intentionally not staged. The parallel verifier completed with exit 0 and no failure output; its test counter is a known aggregation limitation recorded above.
