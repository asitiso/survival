# Arcane Last Stand — Phase 63~82 Handoff

## 기준점

- Base: Phase 62 merged main (`e6f2ca2`)
- Feature branch: `work/phase63-82`
- 전투 Action 계약: 일반마법 4 + 궁극기 2 + 물약 + 상점 + AUTO = **9개 유지**
- 신규 전투 버튼: **0개**
- 신규 관리 화면: **0개**

## Phase 63~66 — Final Form Signature

80분 이후 Hero Final Form이 결정되면 12개 최종형마다 다른 자동 Signature를 사용합니다.

- `src/game/endless/final-form-signature.ts`
- 기존 `spell_cast / enemy_killed / boss_defeated / hero_damaged / core_damaged` 이벤트만 사용
- 별도 게이지 버튼 없이 charge 100에서 자동 발동
- 폭발 / 순환 / 영역 / 수호 4계열의 전투 성격을 유지하되 12개 이름·색·배율을 분리
- spell ≤ 1.16 / area ≤ 1.20 / boss ≤ 1.15 / fusion ≤ 1.12 등 상한 적용
- Snapshot에는 `charge / activeUntilMs / cooldownUntilMs / activations / formId`만 저장
- 기존 Phase 62 Snapshot에서 해당 필드가 없으면 기본값으로 자동 마이그레이션

## Phase 67~70 — Mythic Last Law

Mythic 보스 HP 15% 이하에서만 `MYTHIC LAST LAW` 최종 페이즈가 활성화됩니다.

- `src/game/endless/mythic-last-law.ts`
- 기존 Mythic 3-Phase와 Boss Encounter weakpoint 시스템 위에 합성
- 약점이 많이 남을수록 special cadence / projectile / summon / dash 압박 증가
- 약점을 파괴할수록 공격 압박이 줄고 보스 받는 피해가 증가
- 보스마다 한 번만 최종 페이즈 cue를 노출
- 적 수를 새로 폭증시키지 않고 기존 패턴 채널을 강화

## Phase 71~74 — Long-Run Oaths

120분 이후 장기 플레이가 단순 생존만 되지 않도록 자동 목표 한 슬롯을 추가합니다.

- `src/game/endless/long-run-oaths.ts`
- milestone: 120 / 150 / 180 / 240 / 300 / 360분
- 종류: Slayer / Elite Hunt / Boss Hunt / Arcane Flow / Core Guard / Endure
- 기존 처치·정예·보스·마법·수호핵 이벤트만 소비
- 현재 목표가 다음 milestone까지 끝나지 않으면 만료시켜 이후 목표를 막지 않음
- 보상은 기존 Gold / Core heal / 90초 boon만 사용
- HUD에는 활성 Oath 한 줄만 노출
- Snapshot V2에 active/history/완료·실패·만료 milestone/boon만 저장

## Phase 75~78 — Build Capsule

Run Code가 판의 결과를 식별한다면 Build Capsule은 **실제 빌드 구성**을 재현·비교하기 위한 코드입니다.

- `src/domain/build-capsule.ts`
- 저장 대상: hero / trait / threat / map / deterministic seed / final form / ascensions / fate / relic / fusions / archetype / normal spell levels
- `BLD1.<body>.<checksum>` versioned format
- 고정 사전 인덱스 + base36으로 압축해 일반적인 완성 빌드가 약 50자 수준
- checksum mismatch / 범위 밖 토큰은 decode 거부
- 결과 화면과 최근 5런 기록에서 기존 UI 안에 노출
- Same-Condition Retry Blueprint는 즉시 재시작 전용, Build Capsule은 빌드 기록/비교 전용으로 역할 분리

## Phase 79~81 — Mobile Frame Governor

기존 Adaptive Director와 Presentation Quality를 교체하지 않고 위에 히스테리시스 안전 레이어를 합성합니다.

- `src/game/endless/mobile-frame-governor.ts`
- 상태: `full / reduced / minimal`
- 지속 압박 약 90 render frame 후 한 단계 하향
- 안정 상태 약 240 render frame 후 한 단계 회복
- 짧은 FPS spike는 상태 전환을 일으키지 않음
- reduced: visual 0.72 / projectile visual 0.68 / max medium
- minimal: visual 0.48 / projectile visual 0.42 / max low
- enemy AI / spawn pressure / enemy logic cap에는 직접 손대지 않음
- Snapshot V2에 tier/counters/transitions만 저장

## Phase 82 — Twelve-Hour Stability Audit

- `src/game/endless/twelve-hour-auditor.ts`
- checkpoint: 480 / 600 / 720분
- low / Threat 5 / Ascension X에서도 enemy logic cap 유지
- projectile/effect 표현 예산을 governor와 performance budget으로 먼저 감축
- `presentationFirst`가 false면 audit 실패
- transient entity 수는 hard cap으로 clamp

## Game Host 연결 지점

`src/game/game.ts`는 신규 시스템의 규칙을 직접 소유하지 않고 다음 bridge만 담당합니다.

1. Signature combat modifier + telegraph/toast
2. Long-Run Oath reward/modifier/HUD
3. Mythic Last Law HP + weakpoint ratio 전달
4. Build Capsule 생성 후 기존 Results/Run History에 전달
5. render frame에서 Mobile Frame Governor 상태 한 단계 advance
6. 기존 Presentation Quality에 governor max quality/density만 합성

## 저장/호환성

- Endless schema는 기존 `schemaVersion: 2` 유지
- 새 optional state가 없는 Phase 62 payload는 default로 복구
- 적 320마리 위치, 적 탄막 좌표, 파티클 배열은 추가 저장하지 않음
- Build Capsule은 RunHistory의 optional string이므로 legacy record 정상 로드
- 기존 primary / backup / recovery journal 구조 유지

## 검증 포인트

- `tests/endless-final-form-signature.test.mjs`
- `tests/endless-mythic-last-law.test.mjs`
- `tests/endless-long-run-oaths.test.mjs`
- `tests/build-capsule.test.mjs`
- `tests/endless-mobile-frame-governor.test.mjs`
- `tests/endless-phase63-82-integration.test.mjs`

최종 release는 전체 Node test, TypeScript build, `git diff --check`, 병합된 main 재검증, HTTP smoke, ZIP integrity를 모두 새로 실행한 결과만 기준으로 합니다.
