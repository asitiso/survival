# Phase 23~42 Integration Handoff

## Integration shape

Phase 22의 소유권을 유지하면서 신규 장기런 로직은 `src/game/endless/`에 집중했습니다. 본체 연결은 `game.ts`, `enemies.ts`, `run-snapshot.ts`, `lobby.ts`, `results.ts`로 제한합니다.

## Important compatibility rules

1. 전투 Action 수는 9개에서 늘리지 않습니다.
2. 새 선택은 기존 3카드 선택 오버레이를 재사용합니다.
3. Snapshot은 적/탄막 좌표 배열을 저장하지 않습니다.
4. V1 RunSnapshot과 legacy endless raw payload는 계속 읽습니다.
5. Ascension X 이후 공격/체력 수치 배율은 더 증가시키지 않습니다.
6. 저사양 부하 대응은 전투 판정보다 장식/표현 밀도를 먼저 줄입니다.

## Main extension entry points

- `src/game/endless/runtime.ts` — Phase 23~27 orchestration
- `src/game/endless/host.ts` — legacy Game adapter / modifier composition
- `src/game/endless/hero-ascension.ts` — 35/50/65 minute hero choices
- `src/game/endless/mythic-boss.ts` — 60m+ Threat 4+ three-channel bosses
- `src/game/endless/ascension-mutator-runtime.ts` — Phase 38 real mutator effects
- `src/game/endless/mythic-counterplay.ts` — weakpoint reward counterplay
- `src/game/endless/balance-simulator-v3.ts` — 10~180 minute balance checks
- `src/game/endless/soak-auditor.ts` — 360 minute low-device guard
- `src/domain/run-history.ts` — recent five run fingerprints
- `src/domain/run-snapshot.ts` — primary + previous-valid backup checkpoint

## Verification

Run from repository root:

```bash
npm test
npm run build
git diff --check
npm run serve
```

HTTP smoke targets:

- `/`
- `/dist/main.js`
- `/dist/game/game.js`
- `/dist/game/endless/runtime.js`
- `/dist/game/endless/mythic-boss.js`
- `/dist/game/endless/ascension-mutator-runtime.js`
- `/dist/game/endless/soak-auditor.js`
- `/dist/domain/run-snapshot.js`
- `/dist/domain/run-history.js`
