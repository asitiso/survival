# Arcane Last Stand — Phase 1936 Final Form Identity Locked Candidate

가로형 모바일 무한 액션 디펜스의 첫 플레이어블 빌드입니다. 외부 런타임 패키지 없이 TypeScript + HTML5 Canvas로 구성되어 있습니다.





## Phase 1929~1936 — Final Form Identity Asset Integration

- 12종 Final Form을 4×3 단일 atlas `assets/ui/final-form-icons.png`로 직접 제작해 각 최종형을 이름을 읽기 전에 실루엣과 색으로 구분할 수 있게 했습니다.
- 같은 자산을 최종 변신 cue / 전투 HUD / FLOW·SIGNATURE / Run Result / 로비 최근 기록·이어하기 / Replay 목표에 재사용합니다.
- 로딩 실패 시 기존 `최종형 · 이름`, SIGNATURE, FLOW, BUILD 텍스트가 그대로 남으며 이미지 로딩은 런 시작을 block하지 않습니다.
- Final Form derivation, Ascension, Flow, Signature, Finisher, Build Capsule, Replay progress, Snapshot schema, 9 Actions는 변경하지 않았습니다.
- 60 deterministic samples에서 12/12 atlas coverage, unique cell 12/12, surface coverage 100%, motion amplitude 0, text fallback 100%, Snapshot mutation false를 검증했습니다.
- Release Freeze/Candidate signature에 `finalFormIdentityAssetsPassed/Samples`를 fail-closed로 결박했습니다.
- 전체 회귀: 448 test files / 1,689 tests / 1,689 PASS.
- 최종 Candidate: `RCQ-A1EC777E`.

## Phase 1913~1920 — Reduced Motion Live Combat Propagation

- live combat의 hero/core critical, boss countdown, opening prep, AUTO target, boss weakpoint, battlefield objective motion을 `reducedMotion`에 직접 연결했습니다.
- Secondary Motion 6종과 Residual Motion 5종도 Flash가 아니라 explicit Motion state로 animation 여부를 결정합니다.
- Boss Assist / Ultimate READY outer ring과 boss health-pressure envelope도 Motion LOW에서 정보는 유지하고 steady가 됩니다.
- `FLASH LOW + MOTION ON`은 밝기만 줄이고 motion은 유지하며, `FLASH ON + MOTION LOW`는 motion만 0으로 내려 두 설정을 완전히 분리합니다.
- 과거 호출자가 `reducedMotion`을 생략하면 기존 Reduced Flash 기반 동작을 유지하는 compatibility fallback을 둬 이전 audit 계약을 깨지 않습니다.
- 80 deterministic samples에서 Motion LOW 최대 amplitude 0, Flash-only motion preserved, visibility 100%, Secondary/Residual owner coverage 100%, Action 9/9, Snapshot mutation false를 검증했습니다.
- Release Freeze/Candidate signature에 `reducedMotionLiveCombatPassed/Samples`를 fail-closed로 결박했습니다.
- 전체 회귀: 440 test files / 1,678 tests / 1,678 PASS.
- 최종 Candidate: `RCQ-0379C51C`.

## Phase 1903~1912 — Reduced Motion Accessibility Completion

- `MOTION ON/LOW`을 별도 저장 설정으로 추가해 FLASH/SHake와 독립적으로 제어합니다.
- 신규 프로필은 OS `prefers-reduced-motion`을 초기 기본값으로 따르며, 기존 4필드 설정은 자동 마이그레이션됩니다.
- 보스 등장/페이즈, Kill Chain, 사망 잔광, 궁극기 aftermath, Final Form 반응, 맵 ambient/evolution/debris의 장식 이동·반경 확장을 줄입니다.
- Reduced Motion에서도 위험 텔레그래프·색·범위·텍스트·파티클 존재 자체는 유지합니다.
- Presentation Runtime은 TTL 정리와 위치 이동을 분리해 Motion LOW에서도 transient가 영구 누적되지 않습니다.
- 12개 기능 경로를 64 deterministic samples로 감사하고 Release Freeze/Candidate signature에 fail-closed로 결박했습니다.
- 전체 회귀: 436 test files / 1,670 tests / 1,670 PASS.
- 최종 Candidate: `RCQ-8D6AD15C`.


## Phase 1895~1902 — Residual Combat Motion Alignment

- 한 번의 실행에서 6개 기능을 정리했습니다: 황금 적 링 / 폭탄병 본체 링 / 지형 수정결정 / 최종형 Flow 오라 / 블랙홀 vortex / Reduced Flash 화면효과 확장 motion.
- 새 `residualCombatMotionPolicy()`가 Combat Attention과 Secondary Motion 아래에서 저우선순위 motion owner를 최대 1개로 제한합니다.
- 의미 있는 secondary cue가 있거나 hero/core critical, critical/heavy damage, boss response, Reduced Flash 상태이면 residual pulse는 모두 steady로 내려갑니다.
- 가장 낮은 `core-ambient` pulse는 블랙홀·수정결정·황금 적 등 더 의미 있는 residual cue에 양보합니다.
- 지형 수정결정 렌더링의 `performance.now()` 의존 pulse를 deterministic update clock으로 교체했습니다.
- 블랙홀 motion이 억제돼도 정적 orbit arc와 영역은 유지되어 공격 범위 식별성을 잃지 않습니다.
- Reduced Flash에서는 shockwave/pulse/glow의 radial expansion을 scale 1로 고정하지만 효과 자체와 기존 alpha cap은 유지합니다.
- 48-sample audit를 Release Freeze/Candidate signature에 fail-closed로 결박했습니다.
- 최종 Candidate: `RCQ-4785B17A`.


## Phase 1703~1742 — Action Icon Asset Integration

- 전투의 9 Actions에 직접 생성한 판타지 액션 아이콘을 추가했습니다.
- 원본 9장을 런타임에서 각각 읽지 않고 `assets/ui/action-icons.png` 384×384 단일 3×3 atlas로 통합해 약 300KB로 제한했습니다.
- 매핑: 일반마법 4 / 궁극기 2 / 물약 / 상점 / AUTO = 9개 모두 고유 cell을 사용합니다.
- 아이콘은 정적 식별 정보만 제공하며 새 pulse·shake·haptic·audio를 추가하지 않습니다.
- atlas가 로드되지 않으면 기존 텍스트 버튼 레이아웃으로 fail-safe fallback되어 조작을 막지 않습니다.
- 버튼 좌표·반경·터치 판정·쿨다운·AUTO·물약·상점·보스 Assist·Snapshot schema는 변경하지 않았습니다.
- 25-sample Action Icon Asset audit를 Release Freeze/Candidate signature에 fail-closed로 결박했습니다.
- 최종 Candidate: `RCQ-1929AD6E`.

## 실행

```bash
npm run build
npm run test
npm run serve
```

브라우저에서 `http://localhost:4173`을 엽니다. `npm run serve`는 외부 패키지 없이 Node.js 내장 HTTP 서버를 사용합니다. 이미 `dist/`가 포함된 배포 묶음에서는 별도 설치 없이 바로 실행할 수 있습니다.

## 조작

- 모바일: 왼쪽 터치 드래그로 이동, 오른쪽 마법 버튼을 누르고 있으면 쿨타임마다 연사하며, AUTO 버튼으로 일반마법 4개를 자동 난사할 수 있습니다.
- PC: WASD/방향키 이동, 1~4 일반마법, Q/E 궁극기, Space 물약, B 상점, R AUTO 난사.
- 상점 이용권은 45초 후 첫 지급, 이후 75초마다 지급되며 보스 처치 시 추가 지급됩니다.

## 현재 구현

- 마력석 영구성장 로비 → 4영웅 선택 → 런 특성 1개 선택 → 즉시 전투 흐름
- 영구강화 4종: 생명 각인 / 마력 각인 / 전투 자금 / 마력 자석 — 모두 낮은 상한으로 초반 전투를 무력화하지 않음
- 런 특성 4종: 파괴 본능 / 신속 영창 / 황금 감각 / 수호 맹세 — 장점과 작은 대가가 함께 적용
- 4영웅 선택 + 영웅별 6개 스킬 체감 분리: 아르칸 폭발 / 세리아 빙결제어 / 카인 고속연쇄 / 에드릭 수호·밀어내기
- 무한 적 생성 + 일반/사냥개/중갑/원거리/자폭병/주술사/엘리트/보스
- 일반마법 4개 + 궁극기 2개 + 영웅별 스킬명/색/행동 modifier + 보스 처치 궁극기 성장 선택
- 모든 마법 Lv.5 1차 진화 / Lv.10 최종 진화: 투사체 수·관통·연쇄·범위·틱 속도·넉백·궁극기 밀도가 실제로 변화
- 경험치/금화 필드 드랍, 자동 흡수, 레벨업 3택
- 런 내부 상점, 무기 4종/방어구 4종 랜덤 진열, 자동 장착 및 중복 랭크업, 체력 물약
- 모든 무기/방어구는 5단계 도달 즉시 전설 장비로 진화하며 별도 합성/인벤토리 화면이 필요 없음
- 전설 장비 8종은 단순 수치 증가를 넘어 킬 누적·저체력·연속 이동·수호핵 위기 같은 조건에서 고유 효과가 자동 발동: 대마도사의 심장 폭주 / 크로노스 셉터 가속 / 성운 파괴봉 노바 / 미다스의 손 정예·보스 추가금 / 불멸의 로브 위기 방어 / 폭풍군주의 망토 질주 / 심연의 자석망토 전역 흡수 / 영원의 성벽 수호핵 회복·방어
- 전설 장비 + 유물 + 런 특성 + 영웅 조합을 자동 감지하는 시너지 10종. 별도 세트 메뉴 없이 HUD에 최대 2개만 표시
- 보스 전용 유물 7종 + 런 중 유물 1슬롯: 공용 3종(심연의 눈 / 크로노 파편 / 수호자의 심장) + 영웅 전용 4종(잿불 왕관 / 영원의 겨울심장 / 폭풍핵 / 수호의 맹세인)
- 모든 보스 보상은 `유물 1장 + 기존 보스 성장 2장`으로 표시되며, 유물을 고르면 별도 인벤토리 없이 즉시 장착/교체
- 보스 고유 유물 3종 추가: 화염 폭군 `폭군의 화핵` / 소환 군주 `군주의 소환인` / 돌진 거인 `거인의 동력핵`; 해당 보스를 쓰러뜨렸을 때만 전용 풀에 등장
- 유물은 런마다 초기화되며 영구 메타에는 저장되지 않고, HUD와 게임오버 결과에서 현재 유물만 간단히 표시
- 피해 숫자·처치 링·보스 접근 카운트다운 전투 피드백
- 강타/최종진화/궁극기/엘리트/보스에만 적용되는 제한적 화면 진동과 충격 링 — HUD/조작 UI는 고정
- 수호핵 방어
- 런마다 자동 선택되는 3개 전장: 폐허 관문 / 빙결 습지 / 마력 채석장
- 맵별 벽, 둔화 웅덩이, 마법 충전 폭발수정 배치 차별화
- 보스 3단계 체력 페이즈 + 3개 순환 보스 개체: 화염 폭군(탄막/원형탄막) / 소환 군주(호위대/주술사) / 돌진 거인(장거리 돌진/충격탄막), 개체별 경고색
- 75초부터 보스 직전 구간을 피해 발생하는 필드 이벤트 5종: 황금 고블린 / 보급 상자 / 마력 폭풍 / 황금의 밤 / 정예 습격
- 105초부터 자동으로 반복되는 런 미션 3종: 섬멸 명령 / 정예 사냥 / 전장 수금. 실패 페널티 없이 기존 상점권·금화·물약만 보상해 새 화폐나 메뉴를 늘리지 않음
- 8분 이후 2분마다 전투 지시가 순환: 군집 전선 / 철갑 행군 / 포격 전선 / 주술 호위대. 단순 HP 증가가 아니라 적 조합·스폰 압박·정예 간격이 달라짐
- 황금 고블린 도주 AI + 대량 금화 보상, 보급상자 물약/무료 장비 보상, 이벤트별 쿨타임·스폰·정예·금화 배율
- 20분 이후 재앙 5종 순환: 황금의 밤 / 적의 광분 / 마력 폭주 / 붉은 달 / 수호의 은총
- 게임오버 시 생존시간·보스·위험도·처치량으로 마력석 계산, 버전형 메타 프로필에 누적
- 기존 단일 마력석 저장값은 새 메타 프로필로 자동 이전
- 게임오버 결과에서 이번/누적 마력석 표시, `같은 조건으로 재도전`은 영웅·특성·Threat·전장·seed를 재사용해 설정 화면 없이 즉시 재시작, `로비로 돌아가기`에서 영구강화 가능
- 모바일 위험 가독성: HP 30% / 수호핵 35% 진입 시에만 햅틱 경고, 화면 가장자리 비네트, 가까운 자폭병·주술사 최대 2개와 보스만 강조
- HUD 재배치: 왼쪽 영웅·유물·시너지 / 중앙 보스·필드 이벤트·런 미션·전투 지시 / 오른쪽 수호핵으로 역할을 분리해 상태창 겹침을 제거
- Phase 10+11 전투 프레젠테이션: 영웅별 화염/빙결/번개/성광 VFX, Lv.5/Lv.10 진화 밀도 변화, 적 상태 링·사망 버스트·보스 페이즈 전환 연출
- 위험 텔레그래프 우선 레이어: 적 탄막과 자폭/보스 위험 신호를 아군 장식 VFX보다 위에 렌더링하고, 돌진 거인은 돌진 레인·화염 폭군은 원형 위험권·소환 군주는 소환 영역으로 구분
- 모바일 스킬 HUD 마감: READY/쿨다운 표기 분리, 궁극기 준비 전환 시 1회 펄스, AUTO ON 상태 명확화
- 접근성/표현 옵션: VFX 품질 HIGH/MEDIUM/LOW, FLASH LOW, SHAKE LOW, MOTION LOW, HAPTIC ON/OFF를 전투 화면에서 바로 전환하고 브라우저에 저장
- 적응형 프레젠테이션 품질: FPS와 장식 이펙트 부하에 따라 high→medium→low로 자동 하향하고 회복에는 히스테리시스를 적용해 품질 플래핑 방지
- 프레젠테이션 성능 예산: 장식 파티클 하드캡 180, 트레일 72, 위험 텔레그래프 전용 24칸 예약. 짧은 구간 10마리 이상 동시 사망은 지역 버스트로 자동 병합
- Phase 12 영웅 고유 전투 게이지: 아르칸 `HEAT → INFERNO`, 세리아 `ABSOLUTE ZERO`, 카인 `SURGE`, 에드릭 `JUDGMENT`. 새 전투 버튼 없이 기존 이동·시전·처치·방어 행동으로 자동 충전되며 발동 시 영웅별 화력·제어·연쇄·수호 성격이 강화
- 카인 SURGE 발동 중 체인 라이트닝 추가 점프 +2, 세리아 ABSOLUTE ZERO 중 냉기 처치 시 파쇄 광역 피해, 에드릭 JUDGMENT 발동 시 수호핵 주변 자동 충격파·회복, 아르칸 INFERNO 중 연쇄 폭발 확률·범위 강화
- Phase 13 전장 진화: 8분/16분에 현재 맵이 2단계로 변형. 폐허 관문은 벽이 무너지며 새 동선이 열리고, 빙결 습지는 둔화 영역이 이동·확장되며, 마력 채석장은 폭발 수정 네트워크가 강화
- 엘리트 변이 6종: 신속 / 철갑 / 재생 / 폭주 / 지휘관 / 마력흡수. 위험도가 높아지면 엘리트 하나에 최대 2개까지 조합되고 추격·내구·회복·저체력 광폭·주변 강화·보호막으로 대응법이 달라짐
- 반복 보스 변종 3단계: 동일 보스 재등장 횟수와 Threat 보너스를 합쳐 `원형 / 강화 / 극한` 패턴으로 진화. 특수기 간격·탄막 밀도·소환 수·돌진 속도 등이 강화되지만 보스 체력만 단순 배수로 올리지는 않음
- Phase 14 Threat 0~5: 안정 / 긴장 / 위험 / 악몽 / 재앙 / 종말. 플레이어 공격력을 깎지 않고 적 밀도·엘리트 빈도·적 속도·보스 변종 압박·마력석 보상을 단계적으로 증가
- Threat는 현재 최고 해금 단계에서 생존/보스 조건을 달성해야 다음 단계가 한 단계씩 열리며, 낮은 Threat 반복 플레이만으로 상위 단계가 열리지 않음
- 영웅 × 맵 × Threat 조합별 최고 기록 저장: 생존시간·킬·보스·위험도를 점수화하고 최근 런은 10개까지만 보관. 신기록 시 결과 화면에 `NEW RECORD` 표시
- Web Audio 기반 경량 SFX: 화염/빙결/번개/성광/궁극기/엘리트/금화/레벨업/전설/보스 등장·페이즈/구매/영웅 게이지 발동을 외부 오디오 파일 없이 생성. 종류별 쿨다운과 동시 보이스 기본 상한 8로 난사 시 소리 겹침 제한
- 전투 화면 접근성 컨트롤에 SOUND ON/OFF 및 볼륨 순환을 추가하고 기존 VFX/FLASH/SHAKE/HAPTIC 옵션과 함께 즉시 변경·저장
- Phase 12~14 전체에서도 전투 버튼 수는 증가하지 않으며, Threat 선택만 로비에 한 줄로 추가되어 런 중 조작 복잡도는 유지
- Phase 15 전장 목표 3종: 균열 봉인 / 비콘 방어 / 저주 제단. 150초부터 보스 경고 구간을 피해 하나씩 발생하며, 실패 페널티는 작게 유지하고 성공 시 기존 금화·상점권·물약·20초 임시 화력 보상만 사용
- 전장 목표는 현재 맵과 8분/16분 진화 단계에 맞는 3개 안전 앵커 중 영웅에게서 먼 위치를 선택해, 단순 중앙 체류가 아니라 이동 판단을 만들고 연속 성공 기록을 추적
- Phase 16 보스 전장전: 화염 폭군 `화염 기둥 2개`, 소환 군주 `소환 핵 2개`, 돌진 거인 `갑주 판 3개`를 파괴 가능한 마법 타깃으로 추가. 최대 3개 오브젝트만 유지해 성능 비용 제한
- 보스 약점 파괴 효과: 화염 기둥 전부 파괴 시 6초 취약, 소환 핵 파괴 시 소환 수·특수기 압박 감소, 갑주 판 파괴 시 돌진 거리 감소와 보스 받는 피해 증가
- 보스 전용 환경 위험: 화염 지대 / 소환 문양 / 충격 레인이 1초 이상 사전 텔레그래프 후 활성화되며 동시에 최대 6개로 제한
- 기존 6개 마법이 별도 공격 버튼 없이 보스 약점 오브젝트에도 자연스럽게 피해를 전달하며, 적 공격·보스 위험 신호가 여전히 아군 장식 VFX보다 우선 렌더링
- Phase 17 ARCANE COMBO 4계열: 아르칸 `잿불 연쇄`, 세리아 `절대영도 지배`, 카인 `초전도 폭풍`, 에드릭 `불멸의 성채`. 마법 진화·전설장비·유물·시너지·고유 게이지·목표 연속 성공을 자동 분석
- ARCANE COMBO는 `LINK → SURGE → ASCENDANCY` 3단계이며 최대 마법 화력 +12% / 범위 +12% / 쿨다운 6% 감소로 상한을 고정해 기존 빌드보다 조합 완성도를 보상
- 게임오버 전술 결산: 전장 목표 성공/실패·최고 연속 성공·보스 약점 파괴 수·최고 ARCANE COMBO를 표시하고 기록 점수에 최대 +12,000점의 제한된 전술 보너스를 반영
- Phase 15~17에서도 전투 버튼은 추가되지 않으며 기존 적 320 / 적 탄막 150 / 피드백 96 / 파티클 180 상한을 그대로 유지

## 구조

- `src/domain`: 경험치, 위험도, 경제, 재앙, 메타 프로필/마력석 소비 등 브라우저와 무관한 규칙
- `src/game`: 전투 엔티티, 적 디렉터, 마법, 드랍, 상점 데이터, 지형
- `src/core`: 입력, 고정 타임스텝, 벡터 유틸리티
- `src/ui`: 마력석 로비, 영웅/특성 선택, 레벨업, 상점, 결과 DOM 오버레이
- `tests`: Node 내장 테스트 러너 기반 순수 로직 테스트

## Phase 15~17 검증

- Node 내장 테스트 러너: Phase 15~17 전체 회귀를 최종 검증에서 다시 실행
- TypeScript 빌드: `npm run build`
- 로컬 HTTP 확인 대상: `/`, `/dist/main.js`, `/dist/game/hero-meters.js`, `/dist/game/map-evolution.js`, `/dist/game/elite-affixes.js`, `/dist/domain/threat-level.js`, `/dist/domain/run-records.js`, `/dist/game/audio.js`, `/dist/game/game.js`
- Threat·기록·사운드 설정은 기존 마력석 메타 프로필과 별도 키로 저장해 기존 저장 데이터 마이그레이션 위험을 줄임
- 영웅 고유 게이지는 기존 입력을 재사용하며 별도 전투 버튼을 추가하지 않음
- 전장 진화는 8분/16분 두 번만 적용해 런 중 동선 변화를 만들면서 완전 절차 생성의 디버깅 비용은 피함
- 최근 런 기록은 10개, Web Audio 동시 보이스는 기본 8로 제한
- 적 최대 320개, 적 탄막 최대 150개, 전투 피드백 최대 96개, 프레젠테이션 파티클 180 / 트레일 72 / 위험 텔레그래프 24의 기존 모바일 성능 상한 유지
- 프레젠테이션 품질 저하 시 장식 밀도만 줄고 보스 경고·적 위험 텔레그래프·HUD는 유지됨


## Phase 18~22 최대 확장

- **Phase 18 · 마법 융합**: 일반마법 4개의 6개 조합을 보스 보상에서 해금합니다. 두 구성 마법이 모두 Lv.10일 때만 후보가 열리고, 런당 최대 2개만 장착됩니다. 기존 스킬 버튼을 재사용하며 영웅별 이름/효과가 달라집니다.
- **Phase 19 · 운명 경로**: 6분 / 12분 / 18분에 `광란의 길 / 황금의 길 / 수호의 길` 3택이 등장합니다. 선택은 런 내부에만 누적되며 적 압박·XP·금화·상점·수호핵·보스 변종에 상한이 있는 배율로 적용됩니다.
- **Phase 20 · 적/보스 확장**: 방패병 / 순간이동 암살자 / 공성 골렘 / 마법 봉쇄자를 추가하고, 보스를 심연의 마녀 / 쌍두 마수 / 시간 포식자까지 총 6종으로 확장했습니다. 20분 이후 높은 Threat에서는 기존 보스가 두 패턴 채널을 조합하는 APEX 형태로 등장할 수 있습니다.
- **Phase 21 · 영웅 숙련도 Mastery**: 영웅별 Mastery Lv.1~20을 저장합니다. 생존시간·보스·Threat·킬로 숙련 XP를 얻으며, 끝없는 공격력 증가 대신 Lv.3/6/10/15/20 마일스톤에서 진화 선택·전용 특성·융합·전용 유물·칭호 같은 선택 폭이 열립니다.
- **Phase 22 · 제품 완성도**: 수동 Pause와 앱 백그라운드 자동 Pause, 15초 간격의 경량 Run Snapshot, 로비 **이어하기**, 실제 행동으로 진행되는 6단계 첫 플레이 온보딩, 10/20/30/45분 밸런스 시뮬레이터를 추가했습니다. Snapshot은 적 320마리나 탄막 좌표를 저장하지 않고 영웅·마법·장비·유물·융합·운명·Threat·맵 진화·핵심 진행도만 저장해 전장을 재구성합니다.
- HUD는 Mastery / 유물 / 융합 / 시너지 / 운명을 최대 4줄로 압축하고, 결과 화면에도 `FINAL BUILD` 결산을 남깁니다.
- **온보딩**은 이동 → 일반마법 → 궁극기 → 레벨업 → 상점 → 수호핵의 실제 행동 신호가 들어왔을 때만 진행되며 완료 상태를 저장합니다.
- **밸런스 자동 검사**는 10분 / 20분 / 30분 / 45분의 적 예산, 스폰 압박, 정예 압박, XP 요구량, 골드/분, 영웅 DPS 범위를 계산합니다. Threat가 높아져도 플레이어 DPS를 깎지 않고 적 320 / 적 탄막 150 / 파티클 180 / 텔레그래프 24 등의 기존 상한을 유지합니다.
- Phase 18~22에서도 전투 Action은 `일반마법4 + 궁극기2 + 물약 + 상점 + AUTO`의 기존 9개를 유지하며 새로운 전투 버튼을 추가하지 않습니다.

## Phase 23~42 장기런 / 모바일 안정성 확장

- **Phase 23 · Run Contracts**: 4/9/14/19분 이후 7분 주기의 3택 런 계약. 동시 1개만 활성화하고 최근 선택 반복을 억제합니다. 기존 3카드 선택 UI를 재사용합니다.
- **Phase 24 · Battlefield Evolution**: 8분마다 Stormfront / Ruins / Mana Bloom / Blood Moon / Sanctuary 상태가 교대하며, seed 기반 필드 노드를 재구성합니다. 적/탄막 좌표는 Snapshot에 저장하지 않습니다.
- **Phase 25 · Nemesis Boss**: 긴 전투·수호핵 피해·패배·마법 성향을 보스별로 기억해 최대 3개의 적응 패턴을 적용합니다.
- **Phase 26 · Endless Ascension**: 30분부터 10분 간격으로 Tier X까지 상승합니다. Tier X 이후 수치 배율은 정지하지만 런 시간은 계속 무한으로 진행됩니다.
- **Phase 27 · Deterministic Recovery**: seed+cursor를 저장해 이어하기 후 절차적 선택을 재현하고, aggregate telemetry와 low/mid/high 성능 예산을 적용합니다.
- **Phase 28 · Boss Arena Mutations**: 보스 아키타입과 Ascension에 따라 위험지대의 반경·주기·텔레그래프가 달라집니다.
- **Phase 29 · Hero Ascension**: 35/50/65분에 영웅 전용 3택이 등장하며 기존 LevelUp 3카드 UI를 재사용합니다.
- **Phase 30 · Relic Resonance**: 현재 유물·융합·운명·영웅 승천을 자동 분석해 별도 인벤토리 없이 공명 효과를 합성합니다.
- **Phase 31 · Adaptive Director**: 저사양/고부하에서 적 AI를 먼저 줄이지 않고 장식·탄막 표현 밀도를 우선 줄입니다.
- **Phase 32 · Chronicle**: 45/60/90/120/180분 장기 생존 이정표와 소규모 금화·수호핵 회복 보상을 제공합니다.
- **Phase 33 · Mythic Boss**: 60분 이후 Threat 4+에서 일부 보스가 기존 6개 보스 채널 중 3개를 결합합니다. 적 수를 폭증시키지 않고 패턴 복잡도를 올립니다.
- **Phase 34 · Run Fingerprint**: 최종 빌드에서 `ARC-XXXX-XXXX` Run Code를 생성해 결과 화면에 남깁니다.
- **Phase 35 · Snapshot Integrity**: endless payload에 체크섬 envelope를 적용하고 기존 raw V2 payload도 자동 이전합니다.
- **Phase 36 · Endless Scaling Bridge**: Ascension 체력/피해/탄막 스케일을 EnemyManager에 상한과 함께 실제 연결합니다.
- **Phase 37 · Balance V3**: 10/20/30/45/60/90/120/180분과 Ascension X를 자동 검증합니다.
- **Phase 38 · Ascension Mutator Runtime**: 가속 탄막 / 강화 정예 / 폭발성 죽음 / 희소 상점이 실제 탄속·정예 체력·엘리트/자폭 사망 위험·상점권 간격에 반영됩니다.
- **Phase 39 · Mythic Counterplay**: Mythic 보스 약점 오브젝트를 전부 파괴하면 보스가 더 많은 피해를 받고 특수기·소환 압박이 일시적으로 완화됩니다. 별도 버튼은 없습니다.
- **Phase 40 · Dual Snapshot Backup**: 현재 Snapshot 저장 전 직전 정상 Snapshot을 백업 슬롯에 보관합니다. 주 슬롯 JSON이 손상되면 직전 정상 체크포인트로 자동 fallback합니다.
- **Phase 41 · Recent Run History**: 최근 5런의 영웅·Threat·생존시간·점수·Run Code를 별도 경량 키에 저장하고 로비에서 최신 기록을 바로 보여줍니다.
- **Phase 42 · Six-hour Soak Audit**: low 기기 / Threat 5 / 360분까지 Ascension X, 적·탄막·효과 예산의 하드캡을 자동 검사합니다.
- Phase 23~42 전체에서도 전투 Action은 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9개** 그대로입니다.


## Phase 43~62 최종형 / Mythic 다중 페이즈 / 재도전·8시간 안정성

- **Phase 43~45 · Hero Final Form**: 80분부터 35/50/65분 Hero Ascension 선택을 재분석해 각 영웅 3개 중 하나의 최종형으로 자동 변신합니다. 새 선택창이나 버튼은 없습니다.
- **Phase 46~47 · Build Archetype + Overdrive**: 현재 빌드를 폭발/순환/영역/수호 4계열로 자동 판정하고 마법·융합·정예·보스 행동으로 게이지를 쌓아 12초 Overdrive를 자동 발동합니다.
- **Phase 48~52 · Mythic 3-Phase**: Mythic HP 70%/35%에서 페이즈가 바뀌고 기존 3개 보스 패턴 channel의 우선순위·특수기 간격·소환·돌진 압박이 회전합니다. 약점 파괴는 압박을 실제로 완화합니다.
- **Phase 53~57 · Same-Condition Retry**: 결과창의 기존 재도전 버튼 하나로 영웅·특성·Threat·맵·deterministic seed를 그대로 재사용합니다. 최근/개인 최고 대비 생존시간·점수 차이도 같은 결과창에서 짧게 표시합니다.
- **Phase 58~59 · Recovery Journal**: 15초 primary/backup 외에 60초마다 최대 3개의 compact journal을 보관하며 복구는 primary → backup → journal 순서입니다.
- **Phase 60~62 · Eight-Hour Stability**: 240/300/360/480분 성능 예산을 검사하고 Snapshot/History 시간 상한을 8시간(28,800초)으로 맞췄습니다. 저사양에서는 적 AI/판정보다 장식·이펙트 표현을 먼저 줄입니다.
- Phase 43~62에서도 전투 Action은 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9개** 그대로이며, 적/탄막 좌표 배열은 Snapshot에 저장하지 않습니다.


## Phase 63~82 Final Form Signature / Mythic Last Law / 장기런 목표 / Build Capsule / 모바일 안정성

- **Phase 63~66 · Final Form Signature**: 80분 이후 결정된 12개 최종형마다 고유 Signature를 부여합니다. 기존 마법·융합·정예·보스 이벤트만으로 자동 충전·발동하며 새 버튼은 없습니다. Signature의 공격/범위/쿨다운/방어/보스/융합 배율은 상한을 고정하고 Snapshot V2에 charge/활성 종료/쿨다운/발동 횟수만 compact 저장합니다.
- **Phase 67~70 · Mythic Last Law**: Mythic 보스 HP 15% 이하에서 한 번만 최종 법칙 페이즈로 진입합니다. 기존 약점 오브젝트가 남아 있을수록 탄막·소환·돌진 압박이 강하고, 약점을 파괴할수록 보스 취약도와 패턴 완화가 실제로 커져 마지막 구간도 공략형 전투가 됩니다.
- **Phase 71~74 · Long-Run Oaths**: 120/150/180/240/300/360분에 한 슬롯의 자동 장기 목표가 등장합니다. 처치·정예·보스·마법·수호핵 방어 같은 기존 행동만 사용하고, 실패/만료가 다음 목표를 막지 않으며 보상은 기존 Gold/Core heal/90초 boon만 사용합니다. HUD에는 활성 목표 한 줄만 추가됩니다.
- **Phase 75~78 · Build Capsule**: 실제 seed·영웅·특성·Threat·맵·Final Form·Ascension·운명·유물·융합·빌드 계열·일반마법 레벨을 versioned checksum 코드로 압축합니다. JSON 원문 대신 사전 인덱스/base36을 사용해 일반적인 완성 빌드가 약 50자 수준이며 결과창과 최근 런에서 바로 확인할 수 있습니다. 같은 조건 재도전 Blueprint와 역할을 분리해 기존 즉시 재도전 UX는 유지합니다.
- **Phase 79~81 · Mobile Frame Governor**: 기존 적응형 VFX 품질 위에 `full / reduced / minimal` 히스테리시스 레이어를 추가했습니다. 약 90프레임의 지속 압박에서만 한 단계 낮아지고, 약 240프레임의 안정 상태가 유지돼야 회복해 순간 렉으로 품질이 출렁이지 않습니다. 적 AI·스폰 로직은 유지하고 장식/VFX·투사체 표현 밀도만 먼저 줄입니다.
- **Phase 82 · Twelve-Hour Audit**: 480/600/720분, low device, Threat 5, Ascension X 환경까지 적/탄막/효과 예산을 검사합니다. enemy logic cap은 유지한 채 presentation budget이 먼저 축소되는지 자동 확인합니다.
- Phase 63~82에서도 전투 Action은 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9개** 그대로이며 신규 전투 버튼·신규 관리 메뉴는 없습니다.

## Phase 83~102 Build Replay / Mythic Identity / 최종형 공격 / 장기 체크포인트 / 모바일 조작 마감

- **Phase 83~86 · Progression-valid Build Replay**: 결과 화면의 기존 재도전 버튼을 그대로 사용해 Build Capsule의 영웅·특성·Threat·맵·deterministic seed만 즉시 복원합니다. 완성 장비·마법·유물은 지급하지 않으며 정상 진행으로 다시 획득해야 합니다. HUD의 기존 빌드 요약 안에서 `REPLAY xx%`로 목표 빌드 재현도를 표시하고, `replayCapsule`만 Snapshot에 compact 저장합니다.
- **Phase 87~90 · Mythic Last Law Identity**: Mythic HP 15% 이하 Last Law를 6개 보스 정체성으로 분리했습니다. Inferno=`SOLAR RUPTURE`, Summoner=`BROOD CROWN`, Juggernaut=`IRON VERDICT`, Abyss Witch=`NULL ECLIPSE`, Twin Maw=`TWIN CATACLYSM`, Time Eater=`BROKEN HOUR`이며 특수기 주기·소환·돌진·탄막 비중이 서로 다릅니다. 기존 약점 파괴 완화 규칙은 모든 보스에서 유지됩니다.
- **Phase 91~94 · Final Form Attack Pattern**: 12개 Final Form Signature 발동 순간에 한 번만 Nova / Chain / Shockwave / Domain 중 하나의 고유 공격 펄스를 발생시킵니다. 보호형은 밀쳐내기·수호핵 회복에, 폭발형은 순간 피해에 더 무게를 두며 지속 탄막 엔진은 추가하지 않아 성능·관리 비용을 제한합니다.
- **Phase 95~98 · Non-blocking Run Checkpoints**: 90/180/300/480/720분 도달 시 런을 멈추지 않고 현재 Run Snapshot과 recovery journal을 즉시 갱신하고 짧은 저장 완료 피드백만 보여줍니다. 오래된 Snapshot에서 여러 이정표를 한 번에 넘겨 복귀해도 가장 최근 알림 하나만 표시하고, 도달 이력은 endless Snapshot에 저장해 중복 알림을 막습니다.
- **Phase 99~100 · Mobile Touch Accuracy**: 확대된 Action touch target이 겹치면 배열 순서가 아니라 손가락 위치에서 정규화 거리가 가장 가까운 버튼을 선택합니다. 이동 스틱은 작은 radial deadzone과 연속 remap을 사용해 미세 드리프트를 줄이면서 최대 입력은 유지합니다.
- **Phase 101~102 · Immediate Visual Shedding**: 기존 Mobile Frame Governor의 full/reduced/minimal 히스테리시스를 유지하면서 각 단계에 particle/trail/telegraph cap을 명시했습니다. 단계 하향 시 이미 화면에 쌓인 장식 파티클·트레일까지 즉시 예산 안으로 정리하되 위험 텔레그래프 24개 슬롯은 보존합니다. 적 AI와 스폰 로직은 먼저 줄이지 않습니다.
- Phase 83~102에서도 전투 Action은 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9개** 그대로이며, 신규 전투 버튼·별도 Replay 설정 메뉴·체크포인트 모달을 추가하지 않습니다.


## Phase 103~122 Replay Guidance / Mythic Arena / Final Form Mobility / 장기런 결산 / 가로 모바일 UX

- **Phase 103~106 · Replay Guidance**: Build Replay의 진행률만 보여주던 HUD를 확장해 현재 목표 Capsule과의 차이 중 점수 기여가 가장 큰 다음 목표 하나를 결정론적으로 안내합니다. 유물/마법 레벨/융합/Ascension/Fate/Final Form/빌드 계열을 비교하며 완성 빌드를 지급하지 않고 정상 진행으로 재현하는 기존 원칙을 유지합니다. 안내는 기존 최대 4줄 빌드 HUD 안에서 `REPLAY xx% · 다음 목표` 한 줄로 끝납니다.
- **Phase 107~110 · Mythic Arena Identity**: 기존 Boss Arena hazard 엔진을 재사용해 6개 Mythic 보스가 Solar Crucible / Brood Field / Iron Lane / Void Orbit / Twin Crossfire / Broken Clock의 서로 다른 전장 리듬을 가집니다. cadence·반경·회전·텔레그래프·피해·동시 hazard 수만 합성하며 hazard는 최대 8개, 위험 텔레그래프 안전 하한을 유지합니다. 약점 파괴 비율이 높을수록 전장 압박도 함께 완화됩니다.
- **Phase 111~114 · Final Form Mobility**: 12개 Final Form을 surge / flow / drift / anchor 4개 이동 감각으로 분리합니다. Final Form이 없을 때는 기존 이동 벡터를 그대로 반환해 초반 조작감을 바꾸지 않으며, 최종형 이후에만 가속 응답·소폭 이동 배율이 달라집니다. Signature 발동 순간에는 현재 바라보는 방향으로 상한이 있는 1회 추진이 자동 적용됩니다.
- **Phase 115~118 · Run Milestone Recap**: 120/240/360/480/720분에 처치·보스 증가량만 계산한 비차단 장기런 결산을 표시합니다. 오래된 Snapshot으로 복귀해 여러 이정표를 건너뛰어도 가장 최근 결산 하나만 노출하고, 도달 이력과 마지막 aggregate 수치만 Snapshot에 저장해 이벤트 로그를 늘리지 않습니다.
- **Phase 119~122 · Landscape HUD & Touch Ergonomics**: 상단 상태줄을 화면 폭에 맞춰 자동 압축하면서 맵·Threat·위험도는 항상 보존합니다. HUD 영역은 joystick 시작 금지 구역으로 지정하고, 시작점은 안전 범위 안으로 보정해 가로형 모바일에서 HUD를 누르다 이동이 시작되는 오입력을 줄였습니다. 기존 9개 Action 버튼과 버튼 배치는 그대로 유지합니다.
- Phase 103~122에서도 전투 Action은 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9개** 그대로이며, 신규 메뉴·신규 전투 버튼·장기런 모달을 추가하지 않습니다.


## Phase 123~142 Combat Feel / Long-Run Comfort / Landscape Final Pass

- **Phase 123 · Mythic Geometry Catalog**: 6개 Mythic 보스에 `ring / pockets / corridor / orbit / cross / clock`의 서로 다른 전장 형상 ID를 부여합니다.
- **Phase 124 · Geometry Placement**: 같은 원형 hazard를 색만 바꾸는 대신 보스별 geometry가 위험지대 위치 자체를 다르게 생성합니다.
- **Phase 125 · Geometry Rendering**: corridor/cross는 레인, ring은 중공 원, orbit은 타원, clock은 쐐기 형태로 실제 Canvas 형상이 달라집니다.
- **Phase 126 · Weakpoint Geometry Relief**: 보스 약점을 파괴할수록 geometry pressure·회전·배치 반경이 완화되고 safe gap이 넓어집니다.
- **Phase 127 · Final Form Flow State**: 최종형 상태에서 이동하며 마법을 연속 시전하면 최대 5스택의 4.2초 transient Flow가 자동 생성됩니다.
- **Phase 128 · Mobility-family Flow**: surge는 순간 화력, flow는 쿨다운/기동, drift는 균형, anchor는 안정 화력에 더 큰 보너스를 받습니다.
- **Phase 129 · Flow Combat Wiring**: Flow 배율은 기존 CombatBuild의 spell power / cooldown / move speed 체인에만 합성됩니다. 별도 스킬 버튼은 없습니다.
- **Phase 130 · Flow HUD**: 2스택 이상일 때 기존 빌드 HUD 안에서만 `FLOW ×N`으로 표시하고, 종료 시 자동 사라집니다.
- **Phase 131 · Long-Run Comfort Tier**: 2시간/4시간/8시간 이후 presentation density를 단계적으로 낮춰 장시간 시각 피로를 줄입니다.
- **Phase 132 · Decorative VFX Relief**: particle/trail cap만 줄이고 위험 telegraph cap은 그대로 보존합니다. 적 AI·스폰 압박은 줄이지 않습니다.
- **Phase 133 · HUD Density Relief**: 장기런일수록 빌드 정보 최대 줄 수를 4→3→2로 자동 축소합니다.
- **Phase 134 · Toast Dwell Relief**: 장기런에서는 비차단 이벤트 toast 체류시간을 점진적으로 짧게 해 알림 피로를 줄입니다.
- **Phase 135 · Opening Ignition**: 0~2분은 스폰을 소폭 빠르게 하고 보상을 보정해 시작 직후 공백을 줄입니다.
- **Phase 136 · Opening Momentum**: 2~5분은 정예 등장 간격을 조금 당겨 전투 밀도를 올립니다.
- **Phase 137 · Opening Escalation**: 5~10분은 첫 장기 루프 진입 전까지 압박을 부드럽게 높인 뒤 10분부터 완전히 기존 표준값으로 돌아갑니다.
- **Phase 138 · Opening Reward Pacing**: 초반 압박 증가만큼 XP/Gold를 최대 +8% 안에서 보정하며 상점 토큰 주기와 enemy budget은 바꾸지 않습니다.
- **Phase 139 · Landscape Label Priority**: Signature / Overdrive / Flow / Replay / Final Form 등 현재 전투에 즉시 필요한 상태를 과거 빌드 기록보다 우선 표시합니다.
- **Phase 140 · Boss HUD Compression**: 보스전에서는 최대 3줄만 남겨 중앙 전투 시야를 확보합니다.
- **Phase 141 · Mythic HUD Compression**: Mythic + 장기런에서는 최대 2줄까지 줄이되 활성 전투 상태를 우선 보존합니다.
- **Phase 142 · Integration Contract**: 기존 `일반마법4 + 궁극기2 + 물약 + 상점 + AUTO` 9 Action을 유지하고 Snapshot schema를 늘리지 않습니다. Final Form Flow는 의도적으로 transient 상태라 이어하기 데이터에 저장하지 않습니다.

Phase 123~142는 새 메뉴나 새 전투 입력을 추가하지 않고 **같은 조작으로 보스 공간·최종형 연계·초반 속도감·장기런 가독성**이 달라지도록 마감한 패스입니다.


## Phase 143~162 Physical Arena / Flow Feedback / Opening Ceremony / Safe-Area / Visual Probe

- **Phase 143~146 · Physical Mythic Arena Collision**: ring/orbit/corridor/cross/clock의 Canvas 형상과 실제 피격 판정을 일치시켰습니다. 중공 ring 중앙은 안전하고, corridor/cross는 회전 레인, clock은 좁은 방사형 wedge로 판정됩니다. 충돌 시 작은 밀쳐내기·감속만 적용하고 기존 boss damage 상한은 유지합니다.
- **Phase 147~150 · Final Form Flow Feedback**: Flow 2/4/5스택 임계점에서만 제한된 impact cue를 내고, 영웅 주변 aura/trail 밀도가 스택에 따라 커집니다. Mobile Frame Governor가 reduced/minimal이면 장식 segment만 줄이고 aura는 항상 남겨 상태를 읽을 수 있습니다.
- **Phase 151~154 · Opening Wave Ceremony**: 첫 10분에 30초 `FIRST CONTACT`, 120초 `PRESSURE RISE`, 300초 `ELITE BREAK`, 540초 `BOSS HORIZON`의 7초 이하 non-blocking pulse를 추가했습니다. 기존 OpeningPacing 위에 짧게 합성되고 10분 이후 완전히 중립으로 돌아갑니다.
- **Phase 155~158 · Adaptive Landscape Safe Area**: 16:9 / 20:9 / 4:3 viewport를 구분해 status 길이와 joystick 허용 범위를 자동 조정합니다. 20:9는 양쪽 gesture/cutout 공간을 더 남기고, 4:3은 상단 HUD와 joystick 사이의 수직 여유를 더 확보합니다. Action 버튼 수와 좌표 계약은 바꾸지 않습니다.
- **Phase 159~162 · Visual Regression Probe**: `?visualProbe=1` 쿼리에서 viewport/safe-area/9 Action/대표 5개 combat state를 deterministic probe로 DOM에 노출합니다. Node 테스트로 signature 안정성을 검증합니다. 컨테이너 Chromium 실제 screenshot은 DBus/zygote 환경 문제로 타임아웃되어, HTTP/DOM 계약과 전체 회귀를 최종 fallback 증거로 사용합니다.
- Phase 143~162에서도 전투 Action은 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9개** 그대로이며 Snapshot schema는 확장하지 않습니다.


## Phase 163~182 Arena Dodge / Flow Impact / Boss Entrance / Foldable Safe-Area / Render Contract

- **Phase 163~166 · Arena Dodge Reward**: Mythic geometry telegraph 안에 진입했다가 활성화 전에 빠져나온 경우에만 `PERFECT EVADE`를 1회 인정합니다. 활성 hazard에 남아 실제 충돌하면 즉시 취소되며, 금화 대신 Flow 유지시간·Final Form Signature 소량 충전·1초 안팎의 이동 보너스만 지급해 반복 파밍을 막습니다.
- **Phase 167~170 · Flow Hitstop & Impact**: Flow 2/4/5스택 임계점에 presentation-only pseudo-hitstop을 추가했습니다. 입력·적 AI·스킬 쿨다운·위험 telegraph 시간은 멈추지 않고 장식 파티클/트레일만 20~55ms 수준으로 눌리며 전용 `flowImpact` SFX와 제한된 impact ring이 재생됩니다. minimal 품질에서는 장식 수만 줄고 타격 cue는 유지됩니다.
- **Phase 171~174 · Opening Boss Entrance**: 첫 10분의 기존 보스 스케줄을 바꾸지 않고 524~552초 사이 `BOSS SIGNAL → BOSS BREACH → ENGAGE` 3단계 비차단 진입 연출을 합성합니다. 기존 boss spawn/phase 사운드와 telegraph를 재사용하고 10분 이후 완전히 중립입니다.
- **Phase 175~178 · Foldable / Extreme Safe Area**: 기존 compact/standard/ultrawide에 `foldable`과 `extreme`을 추가했습니다. 2208×1840 계열 펼친 화면은 중앙 hinge exclusion을 Input/HUD가 공유하고 상단 상태 패널 자체를 힌지 왼쪽으로 이동합니다. 32:9 extreme은 side gesture 공간과 joystick bounds를 더 보수적으로 잡으며 기존 16:9/20:9/4:3 계약은 유지합니다.
- **Phase 179~182 · Deterministic Render Contract Harness**: Chromium 실행 여부와 무관하게 opening/boss/mythic/final-flow/long-run 5개 대표 상태를 rect/circle/text primitive 계약으로 생성합니다. 16:9/20:9/4:3/foldable/32:9에서 Action 9개, logical bounds, hinge 침범, 필수 frame을 자동 감사하고 FNV 기반 `RC-XXXXXXXX` signature를 생성합니다. `?visualProbe=1`에서는 기존 Visual Probe와 Render Contract/Audit를 DOM에 함께 노출합니다.
- Phase 163~182에서도 전투 Action은 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9개** 그대로이며, 새 blocking overlay·관리 메뉴·Snapshot schema를 추가하지 않습니다.

## Phase 183~202 Perfect Evade Chain / Safe Lane / Flow Link / Foldable Dual Panel / Raster Contract

- **Phase 183~186 · Perfect Evade Chain**: 연속 PERFECT EVADE가 3.2초 안에 이어지면 최대 ×5까지 올라갑니다. 실제 Mythic hazard에 맞으면 즉시 끊기고, 보상은 Flow 유지·Signature 소량 충전·짧은 이동 보너스뿐이라 금화/XP 파밍 수단이 되지 않습니다.
- **Phase 187~190 · Mythic Safe Lane**: 현재 Mythic geometry의 실제 충돌 판정을 그대로 사용해 안전 후보 지점을 계산하고 `SAFE LANE` 점선 가이드를 표시합니다. 자동 이동은 하지 않으며 ring은 안쪽 포켓, corridor/cross는 측면 이탈처럼 전장 형상에 맞춰 안내가 달라집니다.
- **Phase 191~194 · Flow × Final Form Link**: Flow 5에서 다음 Final Form Signature가 mobility family에 따라 강화됩니다. surge=순간 피해, flow=연쇄, drift=범위/감속, anchor=밀쳐내기/제어에 무게를 두며 상한을 고정했습니다. 발동 후 Flow를 3으로 내려 다시 쌓는 순환을 만듭니다.
- **Phase 195~198 · Foldable Dual Panel**: 펼친 폴더블에서는 영웅/빌드 정보를 힌지 왼쪽, 시간·Threat·상태 정보를 힌지 오른쪽으로 분리합니다. 오른쪽 상태 패널은 수호핵 HUD와 겹치지 않도록 폭을 제한하며 기존 16:9/20:9/4:3/32:9 배치는 유지합니다.
- **Phase 199~202 · Raster Contract Approximation**: 기존 Render Contract primitive를 64×36 논리 raster로 변환해 `RR-XXXXXXXX` signature와 유사도를 계산합니다. 브라우저 screenshot이 불가능한 환경에서도 critical HUD 누락·큰 위치 이동·layout drift를 자동 검출합니다.
- Phase 183~202에서도 전투 Action은 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9개** 그대로이며, 신규 전투 버튼·blocking modal·Snapshot schema 필드는 추가하지 않습니다.

## Phase 203~222 — High-skill Mythic polish

Phase 203~222 keeps the combat surface at nine actions while making high-skill Mythic play more readable and rewarding.

- **203~206 Evade Finisher:** the first transition to `PERFECT EVADE ×5` triggers one bounded automatic `EVADE FINISH` shockwave. Staying capped at five cannot spam it, and it grants no gold or XP.
- **207~210 Safe Lane Link:** physically reaching the current `SAFE LANE` arms a short window. A subsequent PERFECT EVADE converts into Final Form-specific Flow, Signature, and movement tempo without auto-moving the hero.
- **211~214 Mythic Safe Zone:** every Mythic archetype cycles `stable → collapse → collapsed → reform`. Reform previews the next zone, stable zones materially reduce arena hazard damage, collapsed zones provide no protection, and SAFE LANE prefers active zones without ignoring real collision.
- **215~218 Foldable Density Director:** unfolded devices retain HP/EXP/meter bars, time, Threat, and danger while progressively hiding secondary numeric text and reducing build-line density during boss/Mythic pressure.
- **219~222 Raster Baseline Gate:** five representative landscape classes now have fixed raster signatures plus global and critical-cell similarity thresholds. Decorative drift can be tolerated while critical HUD movement fails the gate.

Representative raster baselines:

- 16:9 — `RR-FE2C6B74`
- 20:9 — `RR-0937F125`
- 4:3 — `RR-4C84B218`
- Foldable — `RR-023FFC4B`
- 32:9 — `RR-737044D6`

Phase 203~222 validation target: full TypeScript build, full Node regression suite, `git diff --check`, five-aspect render/raster audit, static HTTP module smoke, and ZIP integrity.

## Phase 223~242 — Final Form Evade Identity / Safe Forecast / Safe-Zone Pressure / Foldable Touch / Raster Approval

- **Phase 223~226 · Final Form EVADE FINISH Identity**: 기존 PERFECT EVADE ×5 피니시 한 지점을 12개 Final Form 정체성에 맞춰 `execution / chain / control / bulwark` 4계열로 분화합니다. execution은 순간 피해, chain은 바깥 추가 타깃, control은 범위 감속, bulwark는 강한 밀쳐내기와 제한된 수호핵 회복에 무게를 둡니다. ×5 첫 진입 1회 자동 발동과 Gold/XP 무보상 원칙은 유지합니다.
- **Phase 227~230 · SAFE LANE Forecast**: 현재 SAFE LANE 목적지뿐 아니라 다음 Mythic safe-zone 위치와 phase 전환까지 남은 시간을 계산합니다. collapse/collapsed처럼 긴급도가 높은 구간에서만 다음 경로를 추가 점선으로 보여주며 자동 이동은 하지 않습니다.
- **Phase 231~234 · Mythic Safe-Zone Pressure Sync**: `stable → collapse → collapsed → reform` 안전지대 생명주기를 기존 Mythic special cadence / summon / dash modifier chain에 직접 합성합니다. stable/reform은 숨 쉴 틈, collapsed는 최고 압박이며 약점 파괴가 많을수록 최고 압박도 낮아집니다. 보스별 소환/돌진/특수기 정체성은 유지합니다.
- **Phase 235~238 · Foldable Touch Density**: 폴더블에서만 9개 Action의 보이는 위치와 크기는 그대로 두고 실제 touch hit radius를 주변 버튼 혼잡도·힌지 거리 기준으로 조정합니다. 일반 화면은 기존 `hitTestActionButton(p)` + 1.30× touch scale 경로를 그대로 사용합니다.
- **Phase 239~242 · Raster Baseline Approval Report**: 기존 5개 Raster baseline에 변경 리포트를 추가해 expected/current signature, 전체/critical similarity, changed-cell 수, deterministic `RB-XXXXXXXX` approval token을 생성합니다. baseline 변경은 토큰이 명시적으로 일치할 때만 승인 결과를 만들며 소스 파일을 자동 rewrite하지 않습니다.
- Phase 223~242에서도 전투 Action은 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9개** 그대로이며 신규 전투 버튼·blocking modal·Snapshot schema 필드는 추가하지 않습니다.

## Phase 243~262 — Finisher Feedback / SAFE Timeline / Mythic Tactic / Foldable Thumb Zones / Raster CI

- **Phase 243~246 · Final Form Finisher Feedback**: PERFECT EVADE ×5 피니시의 기존 전투 수치는 그대로 두고 `execution / chain / control / bulwark` 네 계열에 서로 다른 ring/particle/trail/SFX 프로필을 합성합니다. 장식은 최대 particle 18, ring 3, trail 8, TTL 0.5초로 제한합니다.
- **Phase 247~250 · SAFE Telegraph Timeline**: SAFE ZONE phase 전환 시간과 실제 BossArena hazard의 남은 telegraph 시간을 동일한 초 단위 축으로 합쳐 `HOLD / PREPARE / MOVE / CRITICAL` 결정을 표시합니다. Mythic collision geometry가 실제 위협 여부의 권위를 유지하고 자동 이동은 없습니다.
- **Phase 251~254 · Mythic Tactic Break**: Mythic 전투에서 SAFE LINK에 성공하고 약점 50% 이상을 파괴한 경우에만 4~6.5초의 짧은 공략 보너스를 줍니다. 보스 취약도는 최대 ×1.08, Signature +3 이내, Flow 유지 연장만 제공하며 Gold/XP와 영구 저장은 없습니다.
- **Phase 255~258 · Foldable Thumb Zones**: 펼친 폴더블에서만 왼쪽 하단은 joystick, 오른쪽 하단은 Action, 중앙 hinge 주변은 neutral로 분리합니다. 9개 버튼의 보이는 좌표/반경은 유지하고 일반 화면은 기존 `hitTestActionButton(p)` 경로를 그대로 사용합니다.
- **Phase 259~262 · Raster CI Diff Summary**: `npm run verify:raster`가 16:9 / 20:9 / 4:3 / foldable / 32:9 baseline을 PASS/REVIEW 형식으로 출력합니다. 변경 시 similarity, critical similarity, changed cells, approval token을 표시하지만 baseline 파일을 자동 갱신하지 않습니다.
- Phase 243~262에서도 전투 Action은 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9개** 그대로이며 신규 blocking UI와 Snapshot schema 필드는 추가하지 않습니다.

## Phase 263~282 — Mythic Tactic Link / Last Law Timeline / 12-Form Finisher / Foldable Dead-Space / Release Gate

- **Phase 263~266 · Mythic Tactic Attack Link**: Phase 251~254의 Mythic Tactic Break가 이제 다음 고유 특수기 1회에 직접 연결됩니다. Inferno는 탄막, Summoner는 소환, Juggernaut는 돌진, Abyss Witch는 탄막/소환, Twin Maw는 양쪽 대칭 팬, Time Eater는 시간 압박을 각각 완화하며 특수기가 실제 실행된 프레임에 즉시 소비됩니다. 모든 배율은 0.70~1.25 범위 안에 고정되고 economy 보상은 없습니다.
- **Phase 267~270 · Last Law SAFE Timeline**: 기존 SAFE TIMELINE에 Mythic HP와 Last Law identity를 합쳐 HP 22% 이하에서는 `LAST LAW · PREPARE`, 실제 15% Last Law 진입 후에는 보스별 Last Law 이름을 같은 타임라인에서 표시합니다. Last Law 발동 기준과 실제 collision/SAFE geometry는 변경하지 않고 `autoMove:false`를 유지합니다.
- **Phase 271~274 · Twelve Final-Form Finisher Signatures**: PERFECT EVADE ×5 피니시의 전투 수치는 기존 execution/chain/control/bulwark 가족 프로필이 계속 권위를 가지며, 12개 Final Form은 ring scale·angle·particle spoke·trail skew·secondary accent·고유 label로 각각 구별됩니다. 즉 같은 계열 안에서도 `SOLAR CROWN`, `PHOENIX WING`, `ZERO HALO`, `THUNDER THRONE`, `RADIANT JUDGMENT` 등 최종형별 시각 정체성이 생깁니다.
- **Phase 275~278 · Foldable Dead-Space Resolver**: 펼친 폴더블에서 실제 hinge는 끝까지 neutral로 남기고, 힌지 왼쪽의 제한된 dead strip은 안전한 joystick origin으로 회수합니다. 오른쪽 패널의 빈 공간은 기존 Action 중심과 150 logical px 이내일 때만 최근접 Action으로 연결해 오발을 막습니다. non-foldable 화면은 기존 입력 경로를 그대로 유지합니다.
- **Phase 279~282 · Raster Release Quality Gate**: `npm run verify:release`가 Raster CI 5종, Action 9개, baseline mutation 금지를 하나의 릴리스 게이트로 검사합니다. 현재 release signature는 `RQ-9085A5AD`이며 정상 시 PASS, 문제 발생 시 REVIEW와 issues를 반환합니다. 선택적으로 markdown report를 파일로 저장할 수 있지만 baseline은 자동 수정하지 않습니다.
- Phase 263~282에서도 전투 Action은 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9개** 그대로이며, 신규 전투 버튼·blocking modal·Snapshot schema 필드는 추가하지 않습니다.


## Phase 283~302 — Product Gate / Tactic Feedback / Last Law Safe-Zone / 12-Form Identity / Foldable Travel

- **Phase 283~286 · Tactic Link Success Feedback**: Mythic Tactic Attack Link가 보상 획득 순간이 아니라 실제 보스 특수기에 소비된 순간에만 보스별 성공 cue를 1회 냅니다. Inferno/Summoner/Juggernaut/Abyss Witch/Twin Maw/Time Eater가 서로 다른 label·accent·ring·particle·trail을 사용하며 전투 수치는 추가하지 않습니다.
- **Phase 287~290 · Last Law Safe-Zone Lifecycle**: Last Law 활성 상태를 같은 safe-zone lifecycle에 합쳐 collision·render·SAFE LANE·safe-zone pressure가 동일한 주기/phase를 사용합니다. 일반 Mythic은 기존 9000ms 주기를 정확히 유지하고, Last Law에서는 cycle이 짧아지지만 약점 파괴가 stable breathing room과 radius를 일부 회복합니다.
- **Phase 291~294 · Twelve Final-Form Audio/Palette Identity**: 12개 Final Form 각각에 고유 palette id, primary/secondary color, bounded oscillator pitch/duration/gain variation을 부여합니다. 새 SoundKind 12개를 늘리지 않고 기존 finisher sound scheduler/cooldown/priority를 유지합니다. 기존 family combat finisher 수치도 그대로입니다.
- **Phase 295~298 · Foldable Thumb Travel Audit**: 펼친 폴더블에서 좌측 이동 anchor와 우측 Action anchor 기준 실제 엄지 이동거리를 정량 감사합니다. 현재 9개 Action은 모두 도달 가능하고 hinge crossing은 0이며 대표 2208×1840 profile에서 left max 327.7, right max 313.7, right avg 184.7 logical px입니다. 이 모듈은 입력을 변경하지 않는 read-only audit입니다.
- **Phase 299~302 · Release Manifest Gate**: `npm run verify:manifest` 하나가 전체 Node regression, 별도 TypeScript build, Raster CI, Release Gate, Action 9개 invariant, Foldable Thumb Travel, baseline mutation 금지를 deterministic `RM-XXXXXXXX` manifest로 통합합니다. `--out`으로 JSON 증거 파일을 만들 수 있지만 raster baseline을 자동 수정하지 않습니다.
- **Phase 283~302에서도 전투 Action은 일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9개** 그대로이며 신규 blocking UI·영구 통화·Snapshot schema 필드는 추가하지 않습니다.

### Phase 302 verification command

```bash
npm run verify:manifest -- --out release-manifest.json
```

이 작업 세션에서는 런타임의 Git metadata가 사라져 Phase 282의 검증된 full-source archive를 SHA-256과 archive comment의 원본 commit `f6b52290bdb7b8489aeae24f4f1a50d2a440d672`로 확인한 뒤 소스를 복원했습니다. 복원 baseline Git commit은 새 로컬 metadata 때문에 `94068a0`이며, 소스 lineage는 원본 Phase 282 archive를 기준으로 합니다.


## Phase 303~322 — Release Candidate Balance / Thermal / Long-Run Gate

- **Phase 303~306 · First 30 Minute Momentum**: 기존 0~10분 OpeningPacing은 그대로 두고 10~30분만 `settle → build_test → boss_ready`로 연결합니다. 10~15분은 spawn ×1.02 / elite interval ×0.98 / reward ×1.01, 15~22분은 ×1.03 / ×0.96 / ×1.02, 22~30분은 ×1.04 / ×0.94 / ×1.03이며 30분부터 완전히 중립으로 돌아갑니다. Shop token 주기와 enemy budget은 변경하지 않습니다.
- **Phase 307~310 · Early Boss Difficulty Curve**: 첫 3보스만 체력/피해/초기 특수기 타이밍을 완만하게 시작합니다. T0 기준 보스 1~3은 HP `0.92 → 0.96 → 0.99`, damage `0.90 → 0.94 → 0.98`, initial special delay `1.10 → 1.06 → 1.03`이며 4번째부터 정확히 1.00입니다. Threat 5에서도 easing이 줄어들 뿐 extra difficulty로 역전되지 않습니다. Apex/Mythic 후처리는 기존 순서 그대로 적용됩니다.
- **Phase 311~314 · Thermal Budget Director**: FPS/adaptive pressure/frame governor/device class/장시간 플레이를 합쳐 `cool / warm / hot` presentation tier를 계산합니다. `hot`에서도 enemy logic과 danger telegraph는 정확히 1.00을 유지하고 visual density 0.72, particle cap 0.62, trail cap 0.56처럼 장식 예산부터 줄입니다. Snapshot 상태는 추가하지 않습니다.
- **Phase 315~318 · Long-Run Reward Density**: 2시간 전에는 완전 중립이며, 2~4시간 최대 Gold ×1.04 / XP ×1.03, 4~8시간 Gold ×1.06 / XP ×1.045, 8~12시간 Gold ×1.08 / XP ×1.06으로 제한합니다. 최근 분당 Gold가 이미 충분하면 multiplier는 자동으로 1.00까지 감소해 economy inflation을 막습니다. Shop token·boss reward choice·영구 메타에는 적용하지 않습니다.
- **Phase 319~322 · Release Candidate Performance/Balance Gate**: `npm run verify:candidate`가 First-30m, Boss Curve, Thermal, Long-Run Reward, 8-hour, 12-hour, V3 low/mid/high balance를 deterministic `RCQ-XXXXXXXX` audit로 묶습니다. `npm run verify:manifest`는 기존 test/build/raster/release/foldable evidence와 이 candidate audit를 함께 요구하며 하나라도 실패하면 REVIEW로 닫힙니다.
- Phase 303~322에서도 전투 Action은 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9개** 그대로이며 신규 blocking UI·영구 통화·Snapshot schema 필드는 추가하지 않습니다.

### Phase 322 release-candidate commands

```bash
npm run verify:candidate
npm run verify:manifest -- --out release-manifest.json
```

현재 Candidate audit의 deterministic signature는 `RCQ-9CC97F19`입니다. Manifest signature는 Git HEAD를 포함하므로 각 최종 커밋마다 새로 생성됩니다.


## Phase 323~342 — Release Tuning / Six-Boss Audit / Thermal Recovery / 12h Economy / Budget Gate

- **Phase 323~326 · Precise 0~30 Minute Timetable**: 기존 0~10분의 band 정체성은 유지하면서 5~10분 `escalation`을 10분 진입값까지 부드럽게 taper하고, 10~30분 `settle → build_test → boss_ready`도 밴드 내부를 선형 보간합니다. 1분 단위 감사에서 최대 spawn delta 0.03, elite delta 0.04, reward delta 0.02이며 shop interval/enemy budget은 항상 1.00입니다.
- **Phase 327~330 · First Six Boss Clear Audit**: 실제 `directorSnapshot()` boss cadence와 `enemyStats('boss')`, 기존 `bossDifficultyCurve()`를 사용해 첫 6보스 예상 클리어 시간을 감사합니다. 현재 약 20.1 → 25.0 → 30.8 → 36.7 → 42.7 → 49.0초이며 최대 인접 clear-time ratio 1.244, difficulty ratio 1.396입니다. 4번째 보스부터 기존 curve는 정확히 neutral입니다.
- **Phase 331~334 · Thermal Recovery Hysteresis**: stateless thermal pressure 계산 위에 transient recovery state를 추가합니다. 더 뜨거운 단계는 45프레임 지속 시 한 단계 상승하지만 회복은 240프레임 지속을 요구해 품질 플래핑을 막습니다. state는 Snapshot에 저장하지 않으며 hot에서도 enemy logic과 danger telegraph는 1.00을 유지합니다.
- **Phase 335~338 · 2~12 Hour Gold/XP Economy Audit**: 120/180/240/360/480/600/720분을 drought/healthy/saturated 세 시나리오로 감사합니다. 모든 Gold/XP multiplier는 1.00~1.08이며 saturated economy는 항상 1.00으로 감쇠합니다. drought 기준 최대 인접 Gold delta 0.02, XP delta 0.015입니다.
- **Phase 339~342 · Explicit Performance Budget Gate**: Candidate Audit가 기존 First-30/Boss/Thermal/Reward/8h/12h/V3 balance에 precise timetable, first-six bosses, thermal recovery, 2~12h economy를 추가로 요구합니다. device ceiling은 low `220/90/50`, mid `320/140/70`, high `420/200/95` (enemy/projectile/effect)이며 하나라도 넘으면 REVIEW입니다. Release Manifest는 Candidate budget summary를 보존하지만 legacy caller의 optional candidate 입력 호환성은 유지합니다.
- Phase 323~342에서도 전투 Action은 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9개** 그대로이며 신규 blocking UI·영구 통화·Snapshot schema 필드는 추가하지 않습니다.

### Phase 342 release commands

```bash
npm run build
npm test
npm run verify:raster
npm run verify:release
npm run verify:candidate
npm run verify:manifest -- --out release-manifest.json
```

현재 Candidate audit의 deterministic signature는 `RCQ-E94B63CD`입니다. Release Manifest signature는 Git HEAD를 포함하므로 최종 커밋마다 새로 생성됩니다.

## Phase 343~362 — Hero Balance Lock / Boss TTK / Damage Distribution / Thermal Worst Case

- **Phase 343~346 · Hero × Threat Release Balance**: 4영웅 × Threat 0/3/5 × 5/10/15/20/25/30분 = 72개 체크포인트를 실제 `HERO_PROFILES`, 영웅별 6스킬 identity, Director, Opening timetable, Threat modifier로 감사합니다. raw offense spread는 1.3126으로 영웅 정체성을 유지하지만 survival 1.3110, core-guard 1.6285, 역할 종합 composite spread는 1.0551로 릴리스 상한 안입니다. Threat가 0→3→5로 갈수록 모든 영웅의 pressure가 증가하고 release margin은 단조 감소합니다.
- **Phase 347~350 · Hero-Specific First-Six Boss TTK**: 기존 `firstSixBossCheckpoints()`의 실제 boss cadence/HP 곡선을 재사용하고 영웅별 공격·제어·기동 uptime만 반영합니다. 보스 1~6에서 영웅별 TTK 범위는 약 18.5~23.5 / 23.0~29.3 / 28.3~36.1 / 33.7~43.0 / 39.3~50.0 / 45.1~57.5초이며, 최대 영웅 spread는 1.275, 인접 보스 증가 ratio는 1.244입니다. 4번째 보스부터 기존 early easing은 정확히 neutral입니다.
- **Phase 351~354 · Hero/Core Damage Distribution Audit**: 접촉·탄막·전장·보스 특수기와 수호핵 siege source를 영웅 HP/속도/제어/core-guard 기준으로 상대 노출 모델링합니다. 모든 source share는 정규화되고 단일 hero source 55%, core source 60%를 넘지 않으며, Hero loss spread 1.2731 / Core loss spread 1.3638입니다. Edric은 수호핵 보호 1위를 유지하지만 role spread guardrail 안입니다.
- **Phase 355~358 · Thermal Worst-Case VFX Audit**: low/mid/high × 2h/8h/12h의 9개 지속 stress 체크포인트에서 실제 `minimal governor × long-run comfort × thermal hot` 조합을 재현합니다. 최악조건에서도 enemy logic=1.00, danger telegraph=24/24를 보존하고 particle/trail은 48/20의 읽기 가능한 하한까지 먼저 축소합니다. 2시간 visual density 0.3110은 8~12시간 0.2281까지 감소하지만 위험 정보는 줄지 않습니다.
- **Phase 359~362 · Candidate/Manifest Hero Balance Lock**: `verify:candidate`가 Hero×Threat, Hero Boss TTK, Damage Distribution, Thermal Worst Case를 기존 First-30/Boss/Thermal/Economy/8h/12h/Device budget evidence와 함께 필수 검사합니다. 하나라도 실패하면 Candidate와 Manifest가 REVIEW로 닫힙니다. 현재 Candidate signature는 `RCQ-F23029AA`이며 Manifest candidate summary는 `hero role 1.0551 · boss TTK 1.275 · damage H/C 1.2731/1.3638 · thermal 48/20/24`를 보존합니다.
- Phase 343~362에서도 전투 Action은 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9개** 그대로이며 신규 전투 버튼·blocking modal·영구 통화·Snapshot schema 필드는 추가하지 않습니다.

### Phase 362 release commands

```bash
npm run build
npm test
npm run verify:raster
npm run verify:release
npm run verify:candidate
npm run verify:manifest -- --out release-manifest.json
```

## Phase 363~382 — Combination Matrix / Reward Fairness / Failure Margin / Build Completion

- **Phase 363~366 · Hero × Trait × Archetype × Threat Matrix**: 4영웅 × 각 영웅의 합법 특성 5개(공용 4 + 자신의 숙련 특성 1) × `burst/cycle/domain/fortress` × Threat 0/3/5 = 240개 조합을 릴리스 감사합니다. 실제 hero release model, run trait multiplier, Overdrive archetype 정체성, Threat pressure를 사용하며 최대 viability spread 1.2156, Threat-5 최저 release margin 0.7735, release trap 0개입니다.
- **Phase 367~370 · Boss Reward Fairness**: 실제 `buildBossRewardChoices`를 4영웅 × 6보스 × early/fusion-ready/late = 72개 상태에서 검사합니다. 모든 상태가 3장, 유물 1장, 성장 경로를 유지하고 영웅 structural access/relic-pool spread는 1.0/1.0, invalid sample은 0개입니다.
- **Phase 371~374 · 30/60/120m Failure Margin**: Director + Threat + Ascension 압박과 hero survival/core-guard identity를 조합해 36개 장기 reserve checkpoint를 검사합니다. 최저 hero/core reserve는 0.6826/0.7289, 최대 spread는 1.3111/1.6285이며 Threat가 높을수록 모든 reserve가 단조 감소합니다. Edric의 core-guard 1위 정체성은 유지합니다.
- **Phase 375~378 · Build Completion Speed**: 기존 projected level 성장으로 384개 progress sample과 48개 hero/archetype/threat 완료 조합을 검사합니다. coherent archetype의 critical-investment 완료는 20~25분, hero completion spread는 1.25이며 Threat는 level-driven 선택 속도를 몰래 늦추지 않습니다.
- **Phase 379~382 · Candidate / Manifest Combination Gate**: Candidate가 위 네 감사를 필수 evidence로 요구하고 하나라도 실패하면 REVIEW로 닫힙니다. compact summary는 `matrix 1.2156 · reward fair 1/1 · reserve 0.6826/0.7289 · build 20-25m`을 보존하며 Manifest가 같은 summary를 그대로 전달합니다.
- Phase 363~382에서도 전투 Action은 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9개** 그대로이며 신규 blocking UI·영구 통화·Snapshot schema 필드는 추가하지 않습니다.

### Phase 382 release commands

```bash
npm run build
npm test
npm run verify:raster
npm run verify:release
npm run verify:candidate
npm run verify:manifest -- --out release-manifest.json
```

## Phase 383~402 — Completed Build Meta / Boss Matchups / Purchasing Power / Choice Diversity

- **Phase 383~386 · Completed Build Meta Audit**: 실제 유물 후보 8개 × 6개 융합의 2개 조합 15개 × 영웅별 Final Form 3개 × `burst/cycle/domain/fortress` 4개 × Threat 0/3/5를 4영웅 전체에 펼쳐 **17,280개 완성 빌드**를 검사합니다. 기존 `relicModifiers`, `fusionModifiers`, `finalFormModifiers`, `overdriveModifiers`, hero release model과 Threat pressure를 그대로 합성하며 런타임 수치는 보정하지 않습니다. 최대 hero-top spread 1.0703, 영웅 내부 spread 1.2326, Threat-5 최저 release margin 0.697, release trap 0개입니다.
- **Phase 387~390 · Six-Boss Completed-Build Matchup Audit**: Threat 5 완성 빌드 5,760개를 실제 6보스 정체성에 각각 대입해 **34,560개 matchup**을 감사합니다. 보스별 공격/기동/영역/생존/수호핵 요구를 기존 boss tuning에서 가져오며 최대 최적/최악 빌드 spread 1.3188, 영웅별 top spread 1.0855, 최악 release margin 0.6984입니다. 특정 보스 때문에 한 영웅이나 빌드만 필수 선택이 되는 상태는 없습니다.
- **Phase 391~394 · 30/60/120m Gold · XP · Shop Purchasing Power Audit**: Threat 0/3/5 × 30/60/120분 × conservative/neutral/gold 3개 경제 밴드 = 27개 상태에서 기존 balance projection, 실제 상점 토큰 주기, Gold 밀도를 함께 검사합니다. 최악 조건에서도 핵심 구매 가능 횟수 24회, available shop당 Gold 519.54, 경제 밴드 spread 1.32이며 Gold/레벨/구매력은 시간에 따라 단조 증가합니다. Threat가 레벨 성장 자체를 몰래 늦추지 않는 parity도 유지합니다.
- **Phase 395~398 · Long-Run Build Choice Diversity Audit**: 4영웅 × Threat 0/3/5 × 30/60/120분 = 36개 near-optimal 선택 스냅샷에서 상위 빌드군의 고착도를 검사합니다. 최대 집중도는 유물 0.224, 융합쌍 0.085, Final Form 0.681, archetype 0.451이며 fixation 0개입니다. 모든 스냅샷에서 유물 8종, 융합쌍 15종, Final Form 3종, archetype 4종의 대안이 near-optimal 풀에 남습니다.
- **Phase 399~402 · Completed-Build Meta Candidate / Manifest Gate**: `verify:candidate`가 위 네 감사를 필수 evidence로 요구하며 하나라도 실패하면 Candidate와 Manifest를 REVIEW로 닫습니다. 현재 Candidate signature는 `RCQ-2A81A675`, compact summary는 `complete meta 1.0703/1.2326 · boss gap 1.3188 · buy power 24 · diversity 0.681`을 보존합니다. Manifest는 기존 candidate fail-closed 경로를 그대로 사용하므로 별도 중복 게이트 코드를 추가하지 않았습니다.
- Phase 383~402에서도 전투 Action은 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9개** 그대로이며 신규 전투 버튼·blocking modal·영구 통화·Snapshot schema 필드는 추가하지 않습니다. 네 감사 모듈은 모두 release-time read-only 계산이라 실제 프레임 비용을 늘리지 않습니다.

### Phase 402 release commands

```bash
npm run build
npm test
npm run verify:raster
npm run verify:release
npm run verify:candidate
npm run verify:manifest -- --out release-manifest.json
```

## Phase 403~422 — Pivot Recovery / Boss Gauntlet / 12h Meta Drift / Hero Long-Run Efficiency

- **Phase 403~406 · Build Pivot Recovery Audit**: 4영웅 × Threat 0/3/5 × 30/60/120분 × `relic/fusion/finalForm/archetype` 4개 축 = 144개 one-axis pivot을 감사합니다. 현재 완성빌드 #1에서 나머지 세 축을 고정하고 한 축만 바꾼 최선 대안을 찾아 실제 재선택 회복 여유를 측정합니다. 최소 recovery ratio 0.9504, 최대 손실 0.0496, 영웅 recovery spread 1.0466, dead pivot 0개이며 Threat는 선택 회복성을 몰래 악화시키지 않습니다. 별도 리스펙 UI를 추가하지 않고 현재 선택 구조가 충분히 관대한지 먼저 검증하는 read-only audit입니다.
- **Phase 407~410 · Six-Boss Gauntlet Versatility Audit**: Threat 5의 5,760개 완성 빌드를 6보스 전부에 걸친 하나의 gauntlet으로 다시 묶습니다. 각 보스에서 영웅별 specialist 최고점 대비 일반ist 빌드의 normalized floor를 계산해 연속 보스전 범용성을 검사합니다. 영웅별 최상위 gauntlet build의 최저 versatility floor는 0.9994, specialist gain 상한은 1.0006, hero gauntlet spread는 1.082, catastrophic generalist는 0개입니다.
- **Phase 411~414 · 2/4/8/12h Long-Run Meta Drift Audit**: 4영웅 × Threat 0/3/5 × 2/4/8/12시간 = 48개 near-optimal meta snapshot을 검사합니다. 장기전일수록 생존/수호핵 비중을 아주 완만하게 높이되 후보 threshold는 동일하게 유지해 감사 모델 자체가 후보 폭을 인위적으로 좁히지 않게 했습니다. 최대 구성 집중도 변화는 0.062, 2h→12h top-pool retention은 1.0, 최대 집중도는 유물 0.230 / 융합쌍 0.086 / Final Form 0.705 / archetype 0.460, fixation 0개입니다.
- **Phase 415~418 · Hero Long-Run Efficiency Audit**: 4영웅 × Threat 0/3/5 × 2/4/8/12시간 = 48개 checkpoint에서 완성빌드 최상위 효율, 기존 Threat pressure, 실제 long-run Gold/XP density policy를 함께 검사합니다. 최대 영웅 효율 spread 1.1112, Threat-5 최소 효율 유지율 0.7835, 12시간 최소 retention 1.0이며 Threat가 올라갈수록 모든 영웅 효율이 정상적으로 단조 감소합니다.
- **Phase 419~422 · Candidate / Manifest Long-Run Meta Health Gate**: `verify:candidate`가 위 네 감사를 필수 evidence로 요구하며 하나라도 실패하면 REVIEW로 닫힙니다. compact summary에 `pivot 0.9504 · gauntlet 0.9994/1.0006 · meta drift 0.062/1 · long hero 1.1112/0.7835`가 추가됩니다. Manifest는 기존 candidate fail-closed seam을 그대로 사용하므로 중복 게이트 코드는 추가하지 않았습니다.
- Phase 403~422에서도 전투 Action은 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9개** 그대로이며 신규 전투 버튼·blocking modal·영구 통화·Snapshot schema 필드는 추가하지 않습니다. 네 감사 모듈은 모두 release-time read-only 계산이라 런타임 프레임 비용을 늘리지 않습니다.

### Phase 422 release commands

```bash
npm run build
npm test
npm run verify:raster
npm run verify:release
npm run verify:candidate
npm run verify:manifest -- --out release-manifest.json
```

## Phase 423~442 — Reward Clarity / Shop Guidance / Build Recovery / AUTO Targeting / Long-Run HUD Focus

- **Phase 423~426 · Boss Reward Clarity**: 기존 3장 보스 보상의 순서·확률·효과는 바꾸지 않고 카드 상단에 `궁극기 성장 / 첫 유물 / 유물 교체 / 빌드 융합` 역할 배지를 붙입니다. 융합처럼 현재 빌드 완성에 직접 연결되는 선택 1개만 `추천`으로 강조하고, 유물 교체는 새 슬롯처럼 오해하지 않도록 `현재 유물과 교체`를 명시합니다. 선택 수는 항상 기존 3장 그대로입니다.
- **Phase 427~430 · Shop Build Guidance**: 상점의 6개 상품은 그대로 유지하면서 현재 영웅과 `burst/cycle/domain/fortress` Archetype, 현재 장비 랭크를 이용해 최대 2개 상품만 `추천`으로 표시합니다. 같은 장비를 다시 사는 경우 `현재 장비 강화`로 설명하고 이미 전설 5단계인 장비는 추천에서 제외합니다. 가격·리롤 비용·상품 생성·구매 효과는 변경하지 않습니다.
- **Phase 431~434 · One-Line Build Recovery Guidance**: 10분 이전에는 아무 안내도 띄우지 않고, 이후 빌드가 비어 있을 때만 기존 좌측 Build HUD에 `RECOVER` 한 줄을 추가합니다. 우선순위는 빈 무기/방어구 → 첫 유물 → 현재 주문 레벨에서 가장 가까운 융합 조건이며, 융합 2개와 핵심 구조가 갖춰지면 안내가 자동으로 사라집니다. 별도 리스펙 메뉴나 신규 통화는 추가하지 않습니다.
- **Phase 435~438 · AUTO Targeting Feel**: AUTO로 발사된 일반마법만 수호핵을 직접 압박하는 적, 보스/정예, 위험 특수 적을 거리와 함께 점수화해 우선 타격합니다. 720 logical px 밖의 적은 자동 우선순위에서 제외하고 동일 점수는 enemy id로 deterministic하게 해결합니다. 손으로 누른 일반마법과 궁극기는 기존 `core attacker → elite/boss → nearest` 규칙을 그대로 사용합니다.
- **Phase 439~442 · Long-Run HUD Focus**: 2/4/8시간에 따라 상태 문자열·빌드 라벨·EXP 숫자·비활성 고유 게이지 텍스트만 단계적으로 줄입니다. HP/EXP/gauge bar, 수호핵 bar, 위험 텔레그래프와 전투 Action은 항상 유지합니다. 보스/Mythic에서는 선택적 텍스트를 한 단계 더 줄이지만 active meter 이름은 계속 표시합니다.
- Phase 423~442에서도 전투 Action은 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9개** 그대로입니다. 신규 blocking modal·Snapshot schema·영구 통화·추가 설정 토글은 없으며, 사용자 판단을 빠르게 만드는 정보만 기존 UI에 얹었습니다.

### Phase 442 release commands

```bash
npm run build
npm test
npm run verify:raster
npm run verify:release
npm run verify:candidate
npm run verify:manifest -- --out release-manifest.json
```


## Phase 443~462 — Damage Reason / AUTO Visibility / Purchase Impact / Opening HUD / Thumb Comfort

- **Phase 443~446 · Damage Reason Feedback**: 적 접촉·투사체·폭발·보스 위험지대·불안정 지대 체력 소모를 기존 전투 화면 상단의 짧은 비차단 cue로 구분합니다. 피해량이 최대 HP의 12%/32%를 넘을 때만 heavy/critical로 단계 상승하고, 같은 원인의 연속 피격은 하나의 cue에 합쳐 숫자 스팸을 막습니다. 상태는 0.72~1.15초 뒤 사라지며 Snapshot에는 저장하지 않습니다.
- **Phase 447~450 · AUTO Target / Boss Weakpoint Visibility**: AUTO 일반마법이 현재 고른 실제 target을 기존 `chooseSpellTarget()` 결과 그대로 읽어 `AUTO · CORE/BOSS/ELITE/THREAT` 링으로 표시합니다. 별도 타겟 로직을 만들지 않으므로 전투 수치는 바뀌지 않습니다. 살아 있는 보스 약점 노드는 `약점` 링을 한 겹 추가해 왜 약점을 먼저 부숴야 하는지 바로 보이게 하고, 파괴 즉시 표시가 사라집니다.
- **Phase 451~454 · Shop Purchase Impact Feedback**: Phase 427~430의 추천이 실제 구매 후 무엇이 좋아졌는지 바로 연결되도록 상점 패널 안에 `구매 효과` 한 줄을 표시합니다. 지팡이/완드/로브/갑주 등은 마법 화력·재사용·광역·금화·받는 피해·이동·자원 회수·수호핵 방어 채널로 번역하고, 같은 장비 강화는 새 rank를 함께 보여줍니다. 리롤하면 이전 구매 메시지는 지워집니다.
- **Phase 455~458 · First-10-Minute HUD Focus**: 0~2분은 build label 1개/tactical row 2개, 2~5분은 2/2개, 5~10분은 3/3개로 제한하고 10분 이후 기존 4/4 구조로 완전히 복귀합니다. HP/EXP/고유 게이지/수호핵 같은 critical bar는 항상 유지합니다. 새 튜토리얼 창 없이 초반에 실제로 읽어야 할 정보량만 줄입니다.
- **Phase 459~462 · Mobile Thumb Soft-Follow**: 기존 floating joystick의 보이는 위치와 Action 버튼 좌표는 그대로 두고, 포인터가 기준점에서 92 logical px보다 멀어질 때 joystick base가 초과 거리만큼 따라가도록 했습니다. 작은 움직임에는 anchor가 움직이지 않으므로 미세 조작 감각은 보존하고, 길게 한 방향으로 이동할 때만 엄지 최대 뻗음이 92px 안으로 제한됩니다. 신규 입력 모드/설정 토글은 없습니다.
- Phase 443~462에서도 전투 Action은 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9개** 그대로이며 신규 blocking modal·영구 통화·Snapshot schema 필드는 추가하지 않습니다.

### Phase 462 release commands

```bash
npm run build
npm test
npm run verify:raster
npm run verify:release
npm run verify:candidate
npm run verify:manifest -- --out release-manifest.json
```

## Phase 463~482 — Feedback Density / Stable AUTO / Weakpoint Focus / Quick Shop / Thumb Fatigue Audit

- **Phase 463~466 · Damage Cue Density Guard**: 서로 다른 normal 피격 원인이 0.22초 안에 연속되면 기존 cue를 유지해 `근접/투사체/폭발` 라벨이 프레임마다 교체되는 현상을 억제합니다. 같은 원인은 기존처럼 피해량을 합산하고, 더 높은 heavy/critical 피해는 density guard 안에서도 즉시 새 원인으로 승격됩니다. `DamageReasonState` 필드는 기존 5개 그대로라 Snapshot이나 영구 상태는 늘지 않습니다.
- **Phase 467~470 · Stable AUTO Target Lock**: AUTO는 기존 target이 720px 안에서 살아 있고 새 후보의 우선도 이득이 48점 미만이면 기존 target을 유지합니다. 수호핵 직접 위협처럼 차이가 큰 후보는 즉시 전환하고, 죽거나 화면권 밖으로 나간 target은 바로 해제합니다. Game이 유지하는 target id를 실제 일반마법과 target ring이 같이 사용하며 manual spell/ultimate targeting은 기존 규칙 그대로입니다.
- **Phase 471~474 · Weakpoint Cue Density**: 보스 약점 여러 개가 동시에 살아 있어도 가장 손상된 노드 1개만 `약점` 텍스트를 표시합니다. 동일 HP 비율이면 영웅과 가까운 노드, 그다음 node id로 deterministic하게 선택합니다. 나머지 살아 있는 노드는 작은 링만 남겨 공격 가능성은 보존하면서 반복 라벨을 제거하고, 파괴 노드는 즉시 후보에서 빠집니다.
- **Phase 475~478 · One-Tap Recommended Shop Return**: Phase 427~430 guidance의 `best` 중 점수가 가장 높은 실제 추천 상품 1개를 기존 상점 footer에 `추천 바로 구매`로 노출합니다. 누르면 구매 성공 후 바로 전투로 복귀하므로 `추천 카드 구매 → 전투 복귀` 2탭을 1탭으로 줄입니다. 기존 카드 구매·리롤·복귀는 그대로 유지되고 별도 shop mode나 combat Action은 없습니다.
- **Phase 479~482 · Long-Drag Thumb Fatigue Audit**: 4방향 × 24샘플 = 96개 sustained drag를 고정 anchor와 soft-follow로 비교합니다. 평균 유효 reach는 100 → 80.12px, soft-follow 시작점(72px)을 넘는 누적 뻗음 부담은 60.68% 감소하며 최대 soft reach 92px, 최대 anchor shift 68px입니다. audit은 read-only이며 Action 좌표와 입력 모드를 바꾸지 않습니다.
- Phase 463~482에서도 전투 Action은 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9개** 그대로입니다. 상점 안의 `추천 바로 구매`는 기존 blocking shop overlay의 선택 편의 기능일 뿐 전투 Action/Snapshot/영구 통화를 추가하지 않습니다.

### Phase 482 release commands

```bash
npm run build
npm test
npm run verify:raster
npm run verify:release
npm run verify:candidate
npm run verify:manifest -- --out release-manifest.json
```

## Phase 483~502 — Weakpoint AUTO / Projectile Danger / Boss Action Assist / Quick-Buy Safety / Mobile Input Gate

- **Phase 483~486 · AUTO Weakpoint Aim**: 기존 `chooseSpellTarget()`의 적 선택 우선순위는 그대로 유지하고, AUTO가 실제 보스를 선택한 경우에만 targeted spell의 조준점을 현재 가장 손상된 살아 있는 보스 약점으로 보정합니다. manual cast, 다른 보스 ID, 파괴된 노드, 760px 밖 약점은 기존 보스 중심점을 그대로 사용합니다. Fire Bolt/Flame Field/Meteor/Black Hole의 중심점과 Chain Lightning의 encounter impact가 같은 약점 보정을 공유합니다.
- **Phase 487~490 · Projectile Danger Visibility**: 적 투사체의 속도 벡터와 hero/core 충돌 반경을 이용해 1.45초 안에 실제로 접근하는 탄막만 조기 분류합니다. `watch/danger/critical` 3단계로 최대 6개까지만 짧은 trail/ring을 추가하며, 멀리 지나가거나 이미 멀어지는 탄막은 표시하지 않습니다. core-target은 실제 48px 수호핵 반경을 포함해 누락을 줄입니다.
- **Phase 491~494 · Boss Special Action Assist**: 보스 특수기 timer가 1.05초 안으로 들어올 때만 기존 Action 버튼 중 현재 cooldown이 끝난 대응 후보 1개를 `대응`으로 강조합니다. HP 34% 이하이고 물약이 있으면 회복을 최우선으로 하며, 그 외에는 보스 archetype별 기존 spell/ultimate만 사용합니다. `상점/AUTO`는 절대 대응 후보가 되지 않고 신규 버튼은 없습니다.
- **Phase 495~498 · Quick-Buy Mispurchase Guard**: `추천 바로 구매`는 현재 추천/가격/상품이 클릭 시점에도 그대로 유효한지 다시 검사합니다. 다른 장비로 교체하면서 기존 장비가 rank 3 이상 또는 전설이면 1탭 quick-buy에서 제외해 성장 장비 덮어쓰기를 막고, 같은 장비 rank 4→5 강화와 물약은 계속 1탭 구매가 가능합니다. 일반 카드 구매는 그대로 남아 사용자가 원하면 교체할 수 있습니다.
- **Phase 499~502 · Mobile Input Regression Gate**: 4개 landscape profile, 96개 sustained-drag 샘플, 9개 Action 도달성, foldable hinge crossing, soft-follow 부담 감소를 하나의 release-time audit로 통합했습니다. 현재 Action 9/9, reachable 9/9, hinge clear, reach burden -60.68%, max soft reach 92px이며 `actionLayoutMutation=false`입니다. 이 audit이 실패하면 `verify:candidate`가 `mobile-input-regression`으로 REVIEW를 반환합니다.
- Phase 483~502에서도 전투 Action은 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9개** 그대로이며 신규 영구 통화·Snapshot schema·추가 입력 모드·blocking modal은 없습니다.

### Phase 502 release commands

```bash
npm run build
npm test
npm run verify:raster
npm run verify:release
npm run verify:candidate
npm run verify:manifest -- --out release-manifest.json
```

## Phase 503~522 — Weakpoint Effect / Cue Priority / Assist Audit / Quick-Buy Regret / Fast Manifest

- **Phase 503~506 · AUTO Weakpoint Effect Audit**: Phase 483의 약점 조준이 실제로 의미가 있는지 Lv.10 기준 5개 targeted spell × 약점 offset 6단계 = 30샘플로 비교합니다. boss-center aim 대비 평균 약점 contact gain은 +33.24%, Fire Bolt/Chain Lightning direct 계열은 +80.21%, area 계열은 +1.93%이며 auto contact floor는 1.0입니다. 단순 접촉 모델의 예상 약점 파괴시간 감소는 24.95%이고 issue는 0입니다. 전투 수치는 바꾸지 않는 read-only audit입니다.
- **Phase 507~510 · Combat Cue Priority**: 평상시에는 기존 projectile cue 6개와 AUTO/약점 label을 그대로 유지하지만, 보스 특수기 0.75초 이내에는 projectile cue를 3개로 줄이고 AUTO text를 숨깁니다. heavy 피격은 4개, critical 피격은 2개까지 줄이며 critical 동안 AUTO/약점 text만 잠시 숨깁니다. ring과 실제 위험 telegraph는 유지하므로 정보 삭제가 아니라 우선순위 정리입니다.
- **Phase 511~514 · Boss Action Assist Audit**: 6보스 × 8 readiness/timing case = 48샘플에서 기존 Action 대응 안내를 감사합니다. mapped action response 100%, low-HP potion rescue 100%, early false prompt 0, invalid action 0이며 Candidate의 필수 evidence로 연결했습니다.
- **Phase 515~518 · Quick-Buy Regret Audit**: 4영웅 × 4 archetype × empty/upgrade/protected/legendary = 64상태에서 1탭 추천을 감사합니다. rank3+/legendary protected replacement 0, unaffordable 0, high-regret 0, same-item safe upgrade 100%, risky swap block 100%이며 Candidate fail-closed evidence입니다.
- **Phase 519~522 · Single-Build Release Manifest**: `verify:manifest`가 더 이상 `npm test`와 `verify:*` npm wrapper를 중첩 호출해 TypeScript build를 여러 번 반복하지 않습니다. build 1회 후 Node test runner, Raster CI, Release Gate, Candidate Audit entrypoint를 직접 순차 실행합니다. 같은 fail-closed evidence를 유지하면서 실제 909-test Manifest가 25.86초에 정상 종료했습니다.
- Phase 503~522에서도 전투 Action은 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9개** 그대로이며 신규 blocking modal·영구 통화·Snapshot schema·추가 입력 모드는 없습니다.

### Phase 522 release command

```bash
npm run verify:manifest -- --out release-manifest.json
```

이 명령 하나가 build 1회, 전체 test, Raster, Release, Candidate, Foldable/Action invariant를 모아 최종 Manifest를 생성합니다.

## Phase 523~542 — Boss Cue Density / AUTO Transition / Quick-Shop Dwell / Long-Run Control / Archive Reproducibility

- **Phase 523~526 · Boss Combat Cue Density Audit**: Phase 507~510의 cue priority를 boss-special frame 중심으로 3 damage severity × 4 timer = 12상태에서 다시 조합합니다. 특수기 임박 프레임의 최대 표시 단위는 6, critical frame은 최대 4, projectile cue는 최대 3이며 boss 대응 cue와 최소 1개 위험 projectile warning은 항상 보존합니다. 감사가 실패하면 Candidate가 `boss-cue-density`로 REVIEW됩니다.
- **Phase 527~530 · AUTO Target / Weakpoint Transition Latency Audit**: 120-frame sticky-target 시퀀스, 60-frame core-threat 전환, 60-frame weakpoint 우선순위 전환을 실제 `chooseSpellTarget()`/`autoWeakpointAimPoint()`로 재생합니다. 미세한 거리 차이로 생기는 불필요한 target switch는 0이며, 48점 material threshold·core threat·weakpoint 변화는 모두 0~1 frame 안에 반영됩니다. Candidate fail-closed evidence입니다.
- **Phase 531~534 · Quick-Buy Shop Dwell Audit**: 4영웅 × 4 archetype × 4 equipment state = 64상태에서 실제 shop guidance와 safe quick-purchase 규칙으로 기존 `추천 카드 구매 → 복귀` 2탭 경로와 `추천 바로 구매` 1탭 경로를 비교합니다. tap은 50% 감소하고 interaction-model dwell은 약 67% 감소하며 protected swap/unaffordable exposure는 0입니다. 별도 shop mode는 추가하지 않습니다.
- **Phase 535~538 · 2/4/8/12h Control + HUD Integration Audit**: 2/4/8/12시간 × normal/boss/mythic = 12 checkpoint에서 long-run HUD relief와 mobile input regression을 함께 검사합니다. HP/EXP/gauge critical bar와 danger telegraph는 100% 유지되고, Action reachable 9/9, foldable hinge clear, sustained-drag relief 약 61%를 동시에 보존합니다. Candidate가 이 통합 감사를 필수로 요구합니다.
- **Phase 539~542 · Deterministic Tracked-Source Archive Gate**: 최종 clean commit에서 `git archive --format=zip HEAD`를 임시 위치에 2회 생성해 SHA-256, ZIP entry count, archive comment, tracked-file 누락/추가를 비교합니다. 두 archive byte hash가 같고 comment가 전체 source revision과 일치하며 tracked file 누락/예상치 못한 파일/zip 오류가 0일 때만 PASS입니다. 이 gate는 `verify:manifest`의 마지막 단계로 들어가므로 최종 배포 ZIP 재현성이 깨지면 Manifest가 REVIEW로 닫힙니다.
- Phase 523~542에서도 전투 Action은 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9개** 그대로입니다. 신규 blocking modal·영구 통화·Snapshot schema·추가 입력 모드는 없고, release-time 감사와 최종 archive 재현성 gate만 추가합니다.

### Phase 542 release command

```bash
npm run verify:manifest -- --out release-manifest.json
```

이 명령 하나가 build 1회 → 전체 test → Raster → Release → Candidate → deterministic archive gate를 순서대로 실행하고 최종 Manifest를 생성합니다. Archive gate는 tracked source의 clean commit을 대상으로 하므로 최종 병합 뒤 실행합니다.


## Phase 543~562 — AUTO Ready / Opening Upgrade Guidance / Fast First Shop / Boss Prep / Opening Friction Gate

- **Phase 543~546 · Opening AUTO Ready**: 새 런은 기존 `AUTO` Action이 켜진 상태로 시작해 이동 직후 일반마법 난사가 바로 시작됩니다. 첫 설정 탭 1회를 없애지만 AUTO 버튼은 그대로 남아 즉시 끌 수 있고, 사용자가 일반마법 버튼을 누르고 있는 동안에는 기존 manual cast가 우선되어 AUTO와 중복 시전되지 않습니다. Action은 9개 그대로이며 AUTO 상태를 Snapshot에 추가하지 않습니다.
- **Phase 547~550 · First-10-Minute Upgrade Guidance**: 10분 이전 일반 레벨업 3택 중 딱 1개에만 `초반 추천`을 표시합니다. Lv.5/Lv.10 진화 직전 주문, 저체력 회복, 전체 마법 화력, 재사용시간 순으로 현재 선택지 안에서만 판단하며 실제 업그레이드 수치·확률·카드 3장 구성은 변경하지 않습니다. 10분 이후에는 추천 badge/hint가 완전히 사라집니다.
- **Phase 551~554 · Opening Shop Fast Path**: 3분 이전 상점에서 기존 safe quick-buy 추천이 있으면 `추천 바로 구매` **같은 버튼**을 상품 grid 아래 footer가 아니라 장착 현황 바로 아래에 배치합니다. 새 구매 방식이나 새 control을 만들지 않고 첫 상점에서 시선/포인터 이동만 약 56% 줄입니다. 안전 추천이 없거나 3분 이후 상점은 기존 layout을 그대로 사용합니다. 첫 scheduled shop token 획득 때는 기존 toast로 `상점권 획득 · 추천 구매 1탭`만 1회 알립니다.
- **Phase 555~558 · First Boss Prep Assist**: 첫 보스 전 12초 window에서 아직 상점권이 남아 있으면 기존 `상점` 버튼, 상점권이 없고 HP 72% 미만이면 기존 `물약` 버튼 하나만 `준비`로 강조합니다. 준비가 끝난 상태에서는 아무 cue도 추가하지 않고 3분 이후 boss cycle에는 적용하지 않습니다. 보스가 실제 등장한 뒤에는 기존 Boss Action Assist의 `대응` cue가 우선합니다.
- **Phase 559~562 · Opening Flow Friction Audit / Candidate Gate**: run start → early level-up → first shop → first boss 준비 흐름을 12개 이상 deterministic 상태로 감사합니다. 현재 AUTO setup tap -1, upgrade recommendation coverage 100%, boss prep coverage 100%, opening shop pointer travel -56%, composite opening friction -63%이며 Action 9/9, Snapshot mutation false입니다. 이 감사가 실패하면 Candidate가 `opening-flow-friction`으로 REVIEW됩니다.
- Phase 543~562에서도 전투 Action은 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9개** 그대로이며 신규 blocking modal·영구 통화·Snapshot schema·추가 입력 모드는 없습니다. 실제 편의 차이가 작은 새 메뉴 대신 기존 동선의 탭/시선 이동만 줄였습니다.

### Phase 562 release command

```bash
npm run verify:manifest -- --out release-manifest.json
```

이 명령 하나가 build 1회 → 전체 test → Raster → Release → Candidate → deterministic archive gate를 실행합니다.

## Phase 563~582 — Opening Balance / Recommendation Bias / Fast-Shop Success / Prep Density / 0~10 Health Gate

- **Phase 563~566 · Opening AUTO Balance Audit**: 새 런 AUTO ON이 편의 기능을 넘어 숨은 전투 버프가 되지 않는지 일반마법 4종 × 1/3/5/8분 = 16개 체크포인트로 감사합니다. 실제 `openingAutoCastIntent()`와 `spellTuning()`을 사용하며 damage/cooldown/survival multiplier는 모두 1.00, manual override coverage 100%, Action 9/9, Snapshot mutation false입니다.
- **Phase 567~570 · Opening Upgrade Guidance Bias Audit**: 저체력·Lv.5/Lv.10 진화·화력·쿨다운·일반 성장 상태 12개에서 실제 `guideOpeningUpgradeChoices()`를 재생합니다. 추천은 maxHP/4개 일반마법/spellPower/cooldown까지 7개 ID로 분산되고 최대 단일 ID 집중도는 16.7%, survival/evolution/offense/cadence category coverage 100%입니다. 카드 순서·개수·실제 선택지는 변경하지 않습니다.
- **Phase 571~574 · Opening Shop Fast-Path Success Audit**: 4영웅 × 4 archetype × 2 coin state = 32개 첫 상점 상태에서 실제 guidance + `safeQuickPurchase()` + fast-path promotion을 조합합니다. actionable coverage 100%, modeled one-tap success 100%, unsafe/unaffordable exposure 0이며 일반 카드 구매는 그대로 보존합니다.
- **Phase 575~578 · First-Boss Prep Cue Density Audit**: countdown/상점권/HP/물약 조합 36개에서 `openingBossPrepAssist()`를 검사합니다. 동시 cue 최대 1개, 12초 밖 false positive 0, 준비 완료 상태 silent coverage 100%이며 cue 대상은 기존 Shop/Potion Action 두 개뿐입니다.
- **Phase 579~582 · Opening 0~10 Health Candidate Gate**: 위 네 감사를 묶어 96개 deterministic opening sample을 검사합니다. modeled combat-stat inflation 0%, estimated pause reduction 74%, Action 9/9, Snapshot mutation false이며 하나라도 실패하면 Candidate가 `opening-ten-minute-flow`로 REVIEW됩니다.
- Phase 563~582는 **release-time read-only 감사 패스**입니다. Phase 543~562의 런타임 편의 동작 자체와 전투 Action 9개, Snapshot schema, 영구 통화, blocking modal 수는 변경하지 않습니다.

### Phase 582 release command

```bash
npm run verify:manifest -- --out release-manifest.json
```

이 명령 하나가 build → 전체 test → Raster → Release → Candidate → deterministic archive gate를 실행합니다.


## Phase 583~602 — Midgame Upgrade Bridge / Repeat Shop / Post-Boss Goal / Build Velocity / First-30 Flow Health

- **Phase 583~586 · 10~20m Midgame Upgrade Bridge**: 기존 일반 레벨업 3장의 순서·확률·효과를 바꾸지 않고 10~20분에만 현재 빌드 완성에 가장 직접적인 1장에 `빌드 연결` 배지와 짧은 힌트를 붙입니다. 우선순위는 가장 가까운 융합 구성 마법 → 최종 진화 → 1차 진화 → 전체 화력 → 쿨다운이며 20분부터 자동으로 사라집니다. 새 선택지나 blocking modal은 없습니다.
- **Phase 587~590 · Repeat-Shop Same-Item Fast Path**: 3~15분 상점에서 현재 장착한 같은 무기/방어구의 안전한 랭크업이 이미 quick recommendation이라면 기존 `추천 바로 구매` 버튼을 상품 grid 위에 계속 유지합니다. 다른 장비 교체와 물약은 repeat fast path 대상이 아니며 `safeQuickPurchase()`의 click-time 안전 검사는 그대로 사용합니다. 신규 버튼 0개, 반복 구매 포인터 이동 추정 -42%입니다.
- **Phase 591~594 · Post-Boss Next Goal**: 첫 보스 이후 30분까지 보스 보상을 고른 직후 기존 event toast 한 줄만 사용해 `다음 목표`를 표시합니다. 빈 장비 슬롯 → 첫 유물 → 가장 가까운 융합 구성 마법 순으로 기존 build recovery 구조를 재사용하며, 보스 보상 3장 구성·확률·성능은 변경하지 않습니다. transient 정보라 Snapshot 필드는 추가하지 않습니다.
- **Phase 595~598 · Midgame Build Velocity Audit**: 기존 build-completion model의 4영웅 × 4 archetype × Threat 0/3/5 = 48조합을 15/20/25분 144샘플로 다시 감사합니다. 15→20분 최소 진행 +0.129, 20분 최저 완성도 0.920, 모든 coherent build는 20~25분 안에 완성되고 Threat parity도 유지됩니다. read-only audit입니다.
- **Phase 599~602 · First-30-Minute Flow Health Candidate Gate**: 기존 0~10분 opening health와 중반 upgrade bridge / repeat shop / post-boss goal / build velocity를 280개 deterministic sample로 통합합니다. 현재 modeled combat-stat inflation 0%, estimated decision-pause reduction 59.5%, Action 9/9, Snapshot mutation false이며 실패하면 Candidate가 `first-thirty-flow-health`로 REVIEW됩니다.
- Phase 583~602에서도 전투 Action은 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9개** 그대로이며 영구 통화·Snapshot schema·추가 입력 모드·신규 blocking modal은 없습니다. 기존 방식보다 실제 탭/판단 시간이 줄어드는 경로만 기존 UI 안에서 재사용합니다.

### Phase 602 release command

```bash
npm run verify:manifest -- --out release-manifest.json
```

이 명령 하나가 build 1회 → 전체 test → Raster → Release → Candidate → deterministic archive gate를 실행합니다.


## Phase 603~622 — Second-Boss Goal / Late Shop Fast Path / Completed-Build HUD / Repeat Reward Guidance / 30~60 Flow Health

- **Phase 603~606 · Second-Boss Build Goal**: 30~60분이면서 두 번째 보스를 넘긴 런에서 보스 보상 직후 기존 event toast 한 줄만 사용해 `다음 목표`를 표시합니다. 기존 build recovery 순서를 그대로 재사용하고, 무기/방어구·유물·융합이 이미 충분히 완성된 경우에는 `완성 빌드 유지` 한 줄로 끝냅니다. 30분 전이나 60분 이후에는 적용하지 않으며 신규 Action/저장 필드는 없습니다.
- **Phase 607~610 · 30~60m Late Shop Fast Path**: 30~60분 상점에서 기존 safe quick-buy가 현재 장비의 같은-item 강화이거나 장비를 교체하지 않는 안전한 물약이면 기존 `추천 바로 구매` 버튼을 grid 위로 다시 올립니다. 다른 무기/방어구 교체는 fast path로 올리지 않고 click-time 가격/안전 검사는 기존 경로를 그대로 사용합니다. 신규 control 0개, modeled pointer travel -46%입니다.
- **Phase 611~614 · Completed-Build HUD Focus**: 30~60분에 무기/방어구 rank4+, 유물, 융합 2개가 모두 갖춰진 완성 빌드는 build label을 최대 2줄로 압축합니다. 세 조건만 충족하면 3줄, 그 미만은 기존 4줄을 유지합니다. HP/EXP/고유 게이지 bar와 danger telegraph는 전혀 줄이지 않습니다.
- **Phase 615~618 · Repeat Boss Reward Decision Reduction**: 30~60분 완성 빌드에서는 기존 보스 보상 3장의 순서·내용·확률을 그대로 두고, 유물 교체보다 현재 빌드를 유지하는 비-relic 성장 카드 1장만 `유지 추천`으로 표시합니다. 보상을 자동 선택하지 않으며 사용자가 유물 교체를 고를 수 있는 기존 선택권도 그대로 유지합니다.
- **Phase 619~622 · 30~60 Flow Health Candidate Gate**: 두 번째 보스 목표/late shop fast path/완성 HUD 압축/반복 보상 guidance를 80개 deterministic sample로 통합합니다. 현재 coverage 100%/100%/100%/100%, modeled combat-stat inflation 0%, estimated decision-pause reduction 48%, Action 9/9, Snapshot mutation false, critical HUD preserved입니다. 실패하면 Candidate가 `thirty-sixty-flow-health`로 REVIEW됩니다.
- Phase 603~622에서도 전투 Action은 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9개** 그대로이며 신규 blocking modal·영구 통화·Snapshot schema·추가 입력 모드는 없습니다.

### Phase 622 release command

```bash
npm run verify:manifest -- --out release-manifest.json
```

이 명령 하나가 build 1회 → 전체 test → Raster → Release → Candidate → deterministic archive gate를 실행합니다.


## Phase 623~642 — Late-Run Maintenance Silence / Shop Need / Deep HUD / Reward Guidance / 60~120 Flow Health

- **Phase 623~626 · Late-Run Maintenance Silence**: 60~120분 완성 빌드는 보스 보상 뒤 `완성 빌드 유지` 같은 반복 목표 toast를 더 만들지 않습니다. 장비/유물/융합에 실제 공백이 있을 때만 기존 build-recovery 경로에서 `정비 목표` 1개를 표시합니다. 새 Action이나 저장 필드는 없습니다.
- **Phase 627~630 · Shop Visit Need Reduction**: 무기/방어구가 모두 Rank 5이고 물약이 2개 이상인 60~120분 런에서는 기존 상점 Action을 삭제하거나 잠그지 않고 색을 낮추고 보조문구를 `선택`으로 바꿔 “지금은 안 가도 됨”을 즉시 전달합니다. 장비가 덜 완성됐거나 물약이 1개 이하이면 기존 상점 강조를 그대로 유지합니다.
- **Phase 631~634 · Deep-Run HUD Focus**: 60~120분 완성 빌드는 build label을 최대 1줄, 거의 완성은 2줄, 미완성은 기존 4줄로 유지합니다. HP/EXP/고유 게이지와 danger telegraph는 전혀 줄이지 않습니다.
- **Phase 635~638 · Deep-Run Boss Reward Guidance**: 60~120분 완성 빌드 보상 3장은 순서/내용/확률을 그대로 두고, 유물 교체보다 현재 빌드를 유지하는 비-relic 성장 카드 1장만 `유지 추천`으로 표시합니다. 자동 선택은 하지 않습니다.
- **Phase 639~642 · 60~120 Flow Health Candidate Gate**: maintenance silence / shop de-emphasis / 1-line HUD / reward guidance를 80개 deterministic sample로 통합합니다. 현재 coverage 100%/100%/100%/100%, modeled combat-stat inflation 0%, estimated decision-pause reduction 48%, Action 9/9, Snapshot mutation false, critical HUD preserved입니다. 실패하면 Candidate가 `sixty-one-twenty-flow-health`로 REVIEW됩니다.
- Phase 623~642에서도 전투 Action은 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9개** 그대로이며 신규 blocking modal·영구 통화·Snapshot schema·추가 입력 모드는 없습니다.

### Phase 642 release command

```bash
npm run verify:manifest -- --out release-manifest.json
```

이 명령 하나가 build 1회 → 전체 test → Raster → Release → Candidate → deterministic archive gate를 실행합니다.


## Phase 643~662 — Ultra-Long Shop / Reward Focus / 4h HUD / Critical Priority / 2~4h Flow Health

- **Phase 643~646 · Ultra-Long Shop Focus**: 2시간 이후 Rank 5 무기/방어구 + 물약 2개 이상인 완성 빌드는 상점 Action을 계속 클릭할 수 있지만 routine token 숫자와 강조를 낮춰 `선택` 상태로 표시합니다. 장비가 덜 완성됐거나 물약이 부족하면 기존 token count와 강조가 즉시 복귀합니다. 상점권 생성 주기·가격·구매 규칙·보유량은 변경하지 않습니다.
- **Phase 647~650 · Ultra-Long Reward Focus**: 2시간 이후 완성 빌드의 보스 보상 3장을 그대로 유지하면서 비-relic 성장 카드 1장만 `유지`로 표시하고 overlay 문구를 짧게 줄입니다. 순서·카드 수·확률은 유지되며 자동 선택은 없습니다.
- **Phase 651~654 · Four-Hour HUD Focus**: 2~4시간 완성 빌드는 routine build label 최대 1줄, 4시간 이후는 0줄로 줄입니다. EXP 숫자와 비활성 meter text도 숨기지만 HP/EXP/고유 meter bar와 danger telegraph는 항상 보존합니다. 미완성 빌드는 recovery를 위해 최소 2줄을 남깁니다.
- **Phase 655~658 · Ultra-Long Critical Priority**: 4시간 이후 routine AUTO 설명 text는 숨기되 target ring은 유지합니다. Boss weakpoint와 boss/danger cue는 계속 보존하고 critical hero/core 상황에는 projectile warning capacity를 유지합니다.
- **Phase 659~662 · 2~4h Flow Health Candidate Gate**: 80개 deterministic sample에서 shop quiet/reward compact/HUD minimal/critical priority coverage 100%, modeled combat-stat inflation 0%, economy mutation false, estimated decision-pause reduction 50%, Action 9/9, Snapshot mutation false를 확인합니다. 실패하면 Candidate가 `two-four-hour-flow-health`로 REVIEW됩니다.
- Phase 643~662에서도 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9 Action** 그대로이며 신규 blocking modal·영구 통화·Snapshot schema·reward auto-select는 없습니다.

### Phase 662 release command

```bash
npm run verify:manifest -- --out release-manifest.json
```

이 명령 하나가 build 1회 → 전체 test → Raster → Release → Candidate → deterministic archive gate를 실행합니다.

## Phase 663~682 — 4~8h Shop Silence / Reward Scan / Toast Quieting / Critical Priority / Flow Health

- **Phase 663~666 · Four-to-Eight-Hour Shop Silence**: 4시간 이후 Rank 5 무기/방어구 + 물약 2개 이상인 완성 빌드는 기존 상점 Action을 계속 클릭할 수 있지만 routine token 숫자와 `선택` 보조문구까지 숨겨 시선 압박을 더 낮춥니다. 장비가 덜 완성됐거나 물약이 부족하면 즉시 기존 token count가 복귀합니다. 상점권 생성/가격/보유량은 변경하지 않습니다.
- **Phase 667~670 · Four-to-Eight-Hour Reward Scan Focus**: 4~8시간 routine 완성 빌드 보상은 기존 3장/순서를 그대로 두고 비-relic 유지 성장 1장만 `유지`로 남겨 읽기량을 줄입니다. Final Form/Signature 관련 카드가 실제 포함되면 compact mode를 해제해 세부 설명을 그대로 보존하며 자동 선택은 없습니다.
- **Phase 671~674 · Routine Toast Quieting**: 4시간 이후 상점권/보급/황금 고블린/반복 목표 같은 routine toast는 표시를 생략합니다. MYTHIC, 보스 전장, Final Form, SIGNATURE, 수호핵 위험, TACTIC, 약점/융합 같은 전투·정체성 정보는 항상 통과합니다. combat/economy state는 변경하지 않는 presentation-only 정책입니다.
- **Phase 675~678 · 4~8h Priority Focus + zero-label fix**: 기존 `prioritizeLandscapeBuildLabels()`가 `maxLabels=0`을 내부 `||4` 때문에 다시 4줄로 되살리던 실제 HUD 버그를 수정했습니다. 4시간 이후 완성 빌드 routine label은 실제 0줄이 되며, Final Form/Signature가 활성화된 경우 정체성 1줄만 예외적으로 보존합니다. 미완성 빌드는 recovery 2줄, Mythic/critical 상황은 boss/danger/projectile 정보를 계속 유지합니다.
- **Phase 679~682 · 4~8h Flow Health Candidate Gate**: shop silence / reward scan / toast quieting / critical-priority를 80 deterministic sample로 통합합니다. 현재 coverage 100%/100%/100%/100%, modeled combat-stat inflation 0%, economy mutation false, estimated decision-pause reduction 49%, Action 9/9, Snapshot mutation false, Final Form identity preserved입니다. 실패하면 Candidate가 `four-eight-hour-flow-health`로 REVIEW됩니다.
- Phase 663~682에서도 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9 Action** 그대로이며 신규 blocking modal·영구 통화·Snapshot schema·reward auto-select는 없습니다.

### Phase 682 release command

```bash
npm run verify:manifest -- --out release-manifest.json
```

이 명령 하나가 build 1회 → 전체 test → Raster → Release → Candidate → deterministic archive gate를 실행합니다.


## Phase 683~702 — 8~12h Shop Dormancy / Reward Focus / Toast Silence / Deep HUD / Flow Health

- **Phase 683~686 · 8~12h Shop Dormancy**: 8시간 이후 Rank 5 무기/방어구 + 물약 2개 이상인 완성 빌드는 기존 상점 Action을 계속 클릭할 수 있지만 token count와 secondary text를 숨기고 시각 alpha를 낮춰 routine 상점 방문 압박을 더 줄입니다. 장비가 덜 완성됐거나 물약이 부족하면 즉시 기존 강조/숫자가 복귀하며 상점권 생성 주기·가격·구매 규칙은 변경하지 않습니다.
- **Phase 687~690 · 8~12h Reward Focus**: 완성 빌드의 보스 보상 3장/순서/선택권을 그대로 유지하면서 비-relic 유지 성장 1장만 `유지`로 남기고 overlay 설명을 더 짧게 압축합니다. Final Form / SIGNATURE 관련 성장이 실제 포함되면 compact mode를 해제해 세부 정보를 보존하며 자동 선택은 없습니다.
- **Phase 691~694 · Deepest Routine Toast Silence**: 8시간 이후 상점권·보급·황금 고블린·반복 목표·일반 보스 진입 같은 routine toast를 생략합니다. MYTHIC, Final Form, SIGNATURE, 수호핵/치명 위험, TACTIC, Safe Link, Last Law, OVERDRIVE, 융합 발동 같은 중요한 정체성·위험 정보는 유지합니다. 약점 자체는 toast가 아니라 기존 ring/telegraph로 계속 보존됩니다.
- **Phase 695~698 · 8~12h Deep HUD Focus**: 완성 빌드는 routine build label 0줄, 미완성 빌드는 recovery 2줄을 유지합니다. status text budget은 30~34자로 줄이고 routine AUTO 설명을 숨기되 target ring은 유지합니다. Mythic/critical 상황의 projectile cue capacity와 HP/EXP/고유 meter bar, danger telegraph는 보존합니다. 런타임 wiring 검토 중 압축 전에 Final Form/SIGNATURE를 직접 찾도록 수정해 OVERDRIVE가 앞서도 정체성 1줄이 사라지지 않게 했습니다.
- **Phase 699~702 · 8~12h Flow Health Candidate Gate**: shop dormancy / reward focus / toast silence / priority preservation을 80 deterministic sample로 통합합니다. 현재 coverage 100%/100%/100%/100%, modeled combat-stat inflation 0%, economy mutation false, estimated decision-pause reduction 52%, Action 9/9, Snapshot mutation false, reward auto-selection false, Mythic danger 및 Final Form identity preserved입니다. 실패하면 Candidate가 `eight-twelve-hour-flow-health`로 REVIEW됩니다.
- Phase 683~702에서도 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9 Action** 그대로이며 신규 blocking modal·영구 통화·Snapshot schema·reward auto-select는 없습니다.

### Phase 702 release command

```bash
npm run verify:manifest -- --out release-manifest.json
```

이 명령 하나가 build 1회 → 전체 test → Raster → Release → Candidate → deterministic archive gate를 실행합니다.

## Phase 703~722 — Play Journey / Lifecycle Resume / Multi-Touch / Accessibility / Packaged Runtime

- **Phase 703~706 · Release Play Journey Smoke**: 20/25/30분에 4영웅 × 4 archetype × Threat 0/3/5 = 144 progression sample을 재생합니다. 현재 20분 최저 build progress 92%, 모든 핵심 빌드는 25분 이내 완성, modeled blocking dead end 0, Action 9/9입니다.
- **Phase 707~710 · Lifecycle Resume Integrity**: 20/25/30분 checkpoint를 primary/backup/recovery-journal 경로로 검증합니다. `visibilitychange`뿐 아니라 `pagehide`/`beforeunload`에서도 즉시 checkpoint하며 app background 시 transient pointer/key 상태를 초기화합니다. 기존 RunSnapshot schema는 그대로입니다.
- **Phase 711~714 · Multi-Touch / Rotation / App Resume**: zero-size canvas rect에서도 pointer mapping이 finite하게 유지되고 movement pointer와 action pointer를 격리합니다. resume 전에 joystick/action/key held state를 전부 초기화하며 기존 9 Action·foldable hinge 안전을 유지합니다.
- **Phase 715~718 · Accessibility Release Lock**: 첫 실행에서 시스템 `prefers-reduced-motion`을 reduced flash/shake 기본값에 반영합니다. 저장된 설정은 우선하며 haptic off/sound mute가 독립 동작합니다. presentation control에 `aria-label`/`aria-pressed`를 추가했고 critical telegraph는 유지합니다.
- **Phase 719~722 · Packaged Runtime Smoke**: `verify:manifest`가 deterministic archive 뒤 실제 clean-HEAD ZIP을 임시 폴더에 풀고 그 ZIP 안의 `serve.mjs`를 직접 부팅해 9개 핵심 경로 HTTP 200과 ZIP source comment를 확인합니다. 실패 시 Manifest가 `package-runtime-smoke`로 REVIEW됩니다.
- Phase 703~722에서도 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9 Action** 그대로이며 신규 permanent currency·blocking modal·Snapshot schema 필드는 없습니다.

### Phase 722 release command

```bash
npm run verify:manifest -- --out release-manifest.json
```

이 명령 하나가 build 1회 → 전체 test → Raster → Release → Candidate → deterministic archive → **packaged runtime smoke**를 실행합니다.


## Phase 723~742 — Storage Failure / Lifecycle Idempotency / Low-End / Browser Compatibility / Release Freeze

- **Phase 723~726 · Storage Failure Injection**: `localStorage.getItem()` 실패, backup quota 실패, primary quota 실패, recovery-journal quota 실패, clear/remove 실패를 실제 `SnapshotStorage` fault로 주입합니다. backup 쓰기가 실패해도 최신 primary 쓰기를 별도로 시도하고, primary 쓰기가 실패하면 직전 유효 checkpoint를 그대로 유지합니다. 현재 5개 fault sample에서 primary-write recovery 100%, last-valid checkpoint coverage 100%, clear failure safe입니다.
- **Phase 727~730 · Lifecycle Idempotency**: `visibilitychange → pagehide → beforeunload`처럼 짧은 시간에 겹치는 lifecycle 이벤트를 250ms burst로 묶어 persistence write를 1회만 수행합니다. 입력 transient reset은 매 이벤트마다 계속 실행합니다. 현재 4 burst / 11 events에서 실제 write 4, duplicate write 0, transient reset coverage 100%, Snapshot schema mutation false입니다.
- **Phase 731~734 · Low-End Release Performance**: 24~42fps / adaptive pressure 0.80~0.95의 6개 sustained-stress profile을 재생합니다. 최소 presentation tier는 180 frame 이내 도달하고, 45-frame spike는 quality를 내리지 않으며 recovery는 240 frame hysteresis를 유지합니다. low-device cap은 enemy 220 / projectile 81 / effect 36, minimal VFX cap 64/28, telegraph 24 그대로입니다. combat logic multiplier는 1입니다.
- **Phase 735~738 · Mobile Browser Compatibility**: iPhone/Android/tablet/foldable/zero-size transition 6개 viewport profile을 검사합니다. finite pointer mapping 100%, zero-size rect safe, Action 9/9 reachable, foldable hinge clear이며 `viewport-fit=cover`, safe-area CSS, `touch-action:none`, `overscroll-behavior:none`, `pageshow/visibilitychange` lifecycle 경로를 release contract로 유지합니다.
- **Phase 739~742 · Release Freeze + Packaged Run Cycle**: 위 네 audit를 Candidate의 `release-freeze` fail-closed evidence로 묶습니다. deterministic archive + packaged HTTP 9-path boot 이후, 같은 clean-HEAD ZIP의 실제 `run-snapshot` / `endless` 모듈을 실행해 new run state → checkpoint save → resume restore를 검증합니다. elapsed drift 0, endless seed/state match가 아니면 Manifest가 `package-run-cycle`로 REVIEW됩니다.
- Phase 723~742에서도 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9 Action** 그대로이며 신규 Snapshot field·영구 통화·blocking modal은 없습니다.

### Phase 742 release command

```bash
npm run verify:manifest -- --out release-manifest.json
```

이 명령 하나가 build 1회 → 전체 test → Raster → Release → Candidate → deterministic archive → packaged HTTP runtime → packaged new-run/checkpoint/resume cycle까지 실행합니다.

## Phase 1663~1702 — Target Guidance Motion Alignment

- **Phase 1663~1670 · Motion Ownership**: 기존 global combat attention 아래에 target-guidance motion owner를 추가했습니다. `normal` 전투이고 Reduced Flash가 꺼져 있을 때만 motion을 허용하며, 우선순위는 **primary boss weakpoint → AUTO target → none**입니다.
- **Phase 1671~1678 · AUTO Target Alignment**: AUTO target ring의 독립 `sin(elapsed * 8)` pulse를 제거하고 policy amplitude를 사용합니다. 약점이 동시에 있거나 hero/core critical, critical/heavy damage, boss response, boss countdown이 활성화되면 AUTO ring은 정보는 유지한 채 steady가 됩니다.
- **Phase 1679~1686 · Weakpoint Alignment**: 모든 boss node가 각자 pulse하던 구조를 제거했습니다. primary weakpoint 1개만 normal attention에서 움직일 수 있고 나머지 weakpoint는 steady입니다. 기존 weakpoint 선택·피해·break·boss mechanic은 변경하지 않습니다.
- **Phase 1687~1694 · Accessibility / Transition Safety**: Reduced Flash에서는 target-guidance amplitude를 0으로 고정하고, target loss 후 stale motion owner가 남지 않도록 정책을 fail-safe로 유지합니다.
- **Phase 1695~1700 · Deterministic Audit**: 25 sample에서 animated owner ≤1, critical/Reduced Flash amplitude 0, duplicate motion 0, stale replay 0, indicator visibility 100%, Action 9/9, Snapshot mutation false를 잠급니다.
- **Phase 1701~1702 · Candidate Fail-Closed**: Release Freeze에 `targetGuidanceAttentionPassed/Samples`를 추가하고 Candidate consistency와 signature payload에 결박했습니다. 상위 PASS 위조나 sample-count 변조가 그대로 통과하지 않습니다.
- Phase 1663~1702에서도 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9 Action** 그대로이며 boss cadence·HP·damage·heal·potion·economy·audio·haptic·Snapshot schema는 변경하지 않습니다.

## Phase 1743~1782 — Hero Identity Asset Integration

- **Phase 1743~1750 · Hero Portrait Atlas**: 직접 생성한 4영웅 메달리온 초상화를 `assets/ui/hero-portraits.png` 512×512 단일 atlas(2×2, cell 256)로 포함했습니다. arkan/seria/kain/edric이 각각 고유 cell을 사용합니다.
- **Phase 1751~1758 · Hero Select Integration**: 기존 색상 orb 자리에 초상화를 추가하되 영웅명·칭호·passive·설명·stats와 기존 선택 callback을 그대로 유지합니다. desktop 84px / compact landscape 58px로 제한해 모바일 읽기 공간을 보존합니다.
- **Phase 1759~1766 · Fail-Safe / Motion Safety**: portrait 이미지를 CSS 첫 레이어, 기존 radial-gradient orb를 두 번째 레이어로 둬 asset failure 시 기존 UI가 자동 복귀합니다. 이미지 로딩은 선택 흐름을 block하지 않고 animation/flash/shake/audio/haptic을 추가하지 않습니다.
- **Phase 1767~1774 · Hero Portrait Asset Audit**: 25 deterministic samples에서 hero coverage 100%, unique cell 4/4, out-of-bounds 0, selectable hero 4/4, motion amplitude 0, fallback preserved true, Snapshot mutation false를 검증합니다.
- **Phase 1775~1782 · Candidate Fail-Closed**: Release Freeze에 `heroPortraitAssetsPassed/Samples`를 추가하고 Candidate consistency/signature에 결박했습니다. false evidence 위조나 sample-count 변조가 그대로 통과하지 않습니다.
- Phase 1743~1782에서도 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9 Action**과 hero/boss combat stats, economy, Snapshot schema는 그대로입니다.

## Phase 1783~1822 — Battlefield Enemy Identity Asset Integration

- **Phase 1783~1790 · Enemy Sprite Atlas**: `grunt/hound/brute/archer/bomber/shaman/shieldbearer/assassin/siegeGolem/nullifier/golden/elite` 12종을 작은 전장에서도 실루엣으로 구분할 수 있도록 `assets/enemies/enemy-sprites.png` 단일 4×3 atlas(512×384, cell 128)로 추가했습니다. 보스는 다음 archetype 전용 pass와 충돌하지 않도록 이번 atlas에서 제외했습니다.
- **Phase 1791~1798 · Battlefield Rendering**: 기존 enemy circle body 위에 sprite를 presentation-only layer로 올립니다. collision radius, target, AI, speed, HP/damage, attack cadence는 기존 값을 그대로 사용하며 HP bar·affix·guard·danger telegraph도 기존 순서로 유지합니다.
- **Phase 1799~1806 · Non-Blocking Fallback**: Game 시작 시 atlas를 async decode하고 성공하면 sprite를 표시합니다. `onerror` 또는 로딩 전에는 기존 colored circle body가 그대로 보이므로 이미지가 gameplay/startup을 block하지 않습니다. sprite animation/rotation/pulse는 추가하지 않았습니다.
- **Phase 1807~1814 · Enemy Sprite Asset Audit**: 25 deterministic samples에서 12/12 coverage, unique cell 12/12, out-of-bounds 0, motion amplitude 0, circle fallback preserved, boss excluded, Snapshot mutation false를 잠급니다.
- **Phase 1815~1822 · Candidate Fail-Closed**: Release Freeze에 `enemySpriteAssetsPassed/Samples`를 추가하고 Candidate consistency/signature에 결박했습니다. 하위 evidence false 위조 또는 sample-count 변경이 그대로 PASS하지 않습니다.
- Phase 1783~1822에서도 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9 Action**과 enemy/boss combat stats, spawn cadence, economy, audio/haptic, Snapshot schema는 그대로입니다.

## Phase 1823~1862 — Boss Archetype Identity Asset Integration

Six existing boss archetypes now use a dedicated static 3×2 sprite atlas (`assets/bosses/boss-sprites.png`) while retaining the original circle body as a load-failure fallback. This pass is presentation-only: boss combat tuning, cadence, weakpoints, targeting, 9 Actions, and snapshot schema remain unchanged. Release Freeze binds 25 deterministic boss sprite samples fail-closed.

## Phase 1863~1866 — Shop Item Identity Assets

- **Phase 1863 · Shop Item Atlas**: 상점의 4무기 + 4방어구 + 체력 물약을 `assets/ui/shop-items.png` 384×384 단일 3×3 atlas로 추가했습니다. 각 아이템은 고유 cell을 사용하며 전체 atlas는 약 95KB입니다.
- **Phase 1864 · Shop UI Integration**: 기존 이름·설명·가격·추천·랭크 문구를 그대로 유지한 채 아이콘만 앞에 추가했습니다. desktop 48px / compact landscape 38px로 제한하며 PNG가 실패하면 CSS gradient와 기존 텍스트가 그대로 남습니다. 구매/quick-buy/reroll handler는 변경하지 않습니다.
- **Phase 1865 · Asset Audit**: 25 deterministic sample에서 9/9 coverage, unique cell 9/9, out-of-bounds 0, motion amplitude 0, text fallback preserved, offer logic mutation false, Snapshot mutation false를 검증합니다.
- **Phase 1866 · Candidate Fail-Closed**: Release Freeze와 Candidate signature에 `shopItemAssetsPassed/Samples`를 결박했습니다. 하위 evidence false 또는 sample-count 변조가 그대로 PASS하지 않습니다.
- Phase 1863~1866에서도 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9 Action**과 상점 가격/경제/전투 수치/Snapshot schema는 그대로입니다.

## Phase 1867~1872 — Decision Identity Assets (Double Workload Pass)

- **Phase 1867 · Run Trait / Fate Path Atlas**: RUN TRAIT 8종과 FATE PATH 3종을 `assets/ui/decision-path-icons.png` 384×288 단일 4×3 atlas(cell 96)로 추가했습니다. 기존 `trait-mark` radial mark를 두 번째 background layer로 유지해 PNG 실패 시에도 텍스트와 기존 mark가 그대로 남습니다.
- **Phase 1868 · Level-Up / Boss Reward Growth Icons**: `maxHp/moveSpeed/spellPower/cooldown/pickupRadius/relic/fusion` 7종을 `assets/ui/growth-choice-icons.png` 384×192 4×2 atlas(cell 96)로 추가했습니다. 일반마법4 + 궁극기2 성장은 기존 `action-icons.png`를 재사용해 중복 art와 로딩 비용을 만들지 않습니다.
- **Phase 1869 · Decision UI Integration**: Trait/Fate 카드와 Level-Up/Boss Reward 카드에 static image identity를 연결했습니다. 추천 badge가 있는 카드도 icon을 잃지 않으며 title/description/hint/choice order/click callback은 그대로입니다. desktop 52px / compact landscape 40px로 제한합니다.
- **Phase 1870 · Combined Asset Audit**: 32 deterministic samples에서 path coverage 11/11, growth coverage 7/7, spell-action atlas reuse 6/6, motion amplitude 0, text fallback preserved, choice logic mutation false, Snapshot mutation false를 검증합니다.
- **Phase 1871 · Candidate Fail-Closed**: Release Freeze에 `decisionChoiceAssetsPassed/Samples`를 추가했습니다. 하위 evidence false + top-level PASS 위조는 Candidate REVIEW가 되고 sample count 변경은 Candidate signature를 변경합니다.
- **Phase 1872 · Release Package**: 두 신규 atlas를 포함한 전체 source package와 handoff를 생성합니다.
- Phase 1867~1872에서도 **일반마법4 + 궁극기2 + 물약 + 상점 + AUTO = 9 Action**, reward RNG/order, Fate modifier, Run Trait bonus, combat/economy/audio/haptic, RunSnapshot schema는 변경하지 않습니다.

## Phase 1873~1880 — Tactical Status Identity + Objective Attention Alignment

- **Phase 1873 · Tactical Status Atlas**: Field Event 5종 + Battlefield Objective 3종 + Run Mission 3종 + Threat Directive 4종, 총 15개 전술 상태를 `assets/ui/tactical-status-icons.png` 384×384 단일 4×4 atlas(cell 96)로 추가했습니다. 각 상태는 고유 cell을 사용하며 아이콘 자체 motion amplitude는 0입니다.
- **Phase 1874 · Tactical Stack Integration**: 기존 Tactical Stack의 제목·상세·accent·행 순서·행 수 제한을 그대로 유지한 채 30px static icon만 추가했습니다. atlas가 늦거나 실패하면 기존 text-only row가 그대로 렌더링되며 이미지 로딩은 game loop를 막지 않습니다.
- **Phase 1875 · Objective Attention Alignment**: 전장 목표 링의 독립 pulse를 global Combat Attention 아래로 편입했습니다. normal + Reduced Flash OFF에서만 최대 amplitude 0.05를 허용하고 hero/core critical, critical/heavy damage, boss response, boss countdown, Reduced Flash에서는 steady입니다.
- **Phase 1876 · World Objective Identity**: riftSeal/beaconDefense/cursedAltar가 Tactical Status atlas를 재사용해 ring 중심에 고유 symbol을 표시합니다. 기존 progress ring, ENTER/name text, collision/activation/reward/failure 로직은 그대로입니다.
- **Phase 1877~1878 · Safety Freeze**: Field Event modifier, Mission target/reward, Objective runtime, Threat Directive weights, combat/economy/audio/haptic, 9 Actions, RunSnapshot schema는 변경하지 않습니다.
- **Phase 1879 · 40-sample Audit**: icon coverage 15/15, unique cells 15/15, out-of-bounds 0, icon motion 0, Reduced Flash objective motion 0, higher-priority combat attention objective motion 0, text fallback preserved, gameplay mutation false, Snapshot mutation false, Action 9/9를 잠급니다.
- **Phase 1880 · Candidate Fail-Closed**: Release Freeze에 `tacticalStatusAssetsPassed/Samples`를 추가하고 Candidate consistency/signature에 결박했습니다. 현재 Release Candidate는 `RCQ-20762FAB`, evidence는 `tactical-status-assets safe (40)`입니다.

## Phase 1881~1886 — Lobby & Run Result Identity Integration

- **Phase 1881 · Lobby Hero Identity**: 기존 `hero-portraits.png`를 Mastery 4카드, 최근 기록, 이어하기에 재사용합니다. 영웅명/시간/Run Code 텍스트는 그대로 유지되며 portrait motion amplitude는 0입니다.
- **Phase 1882 · Meta Upgrade Identity**: 생명 각인/마력 각인/전투 자금/마력 자석이 기존 growth/shop atlas를 재사용합니다. 새 PNG를 만들지 않으며 shard cost/cap/purchase handler는 변경하지 않습니다.
- **Phase 1883~1884 · Result Scanability**: 처치/레벨/골드/보스/마력석/유물/숙련에 static visual anchor를 추가하고 완료 영웅 portrait를 결과 헤더에 재사용합니다. RUN CODE와 BUILD CAPSULE은 text-primary로 유지합니다.
- **Phase 1885 · 32-sample Audit**: hero 4/4, meta 4/4, result 7/7 coverage, motion 0, text fallback preserved, purchase/result logic mutation false, Snapshot mutation false, Action 9/9를 검증합니다.
- **Phase 1886 · Candidate Fail-Closed**: Release Freeze에 `lobbyResultIdentityPassed/Samples`를 결박했습니다. 하위 evidence false 위조는 Candidate REVIEW가 되고 sample count 변경은 signature를 변경합니다.
- 이번 패스는 **새 image atlas 0개**로 기존 자산 재사용률을 높였으며 combat/economy/mastery/run history/Snapshot schema는 변경하지 않습니다.

## Phase 1887~1894 — Secondary Combat Motion Arbitration (6-Function Execution)

- **Phase 1887 · Priority Threat Ring Alignment**: 기존에 구현만 있고 live render path에서 빠져 있던 priority threat ring을 다시 연결했습니다. normal 전투에서 secondary owner가 `priority-threat`일 때 첫 위협 1개만 움직이고 나머지 boss/bomber/shaman ring과 `폭발/주술` label은 steady로 유지합니다.
- **Phase 1888 · Freeze Status Alignment**: 빙결 적이 여러 마리여도 전부 따로 pulse하지 않습니다. freeze가 secondary owner일 때 영웅과 가장 가까운 빙결 적 1개만 움직이고 나머지는 steady입니다. slow timer/factor와 combat effect는 그대로입니다.
- **Phase 1889 · Supply Crate Identity + Motion**: 새 PNG 없이 기존 `tactical-status-icons.png`의 `supplyDrop` cell을 전장 보급 상자에 재사용합니다. atlas 미준비/실패 시 기존 gold-cross crate가 그대로 fallback이며 reward RNG와 무료 장비/물약 로직은 변경하지 않습니다.
- **Phase 1890 · Boss Arena Telegraph Alignment**: 보스 장판 telegraph는 geometry를 항상 보존하되 가장 빨리 활성화될 hazard 1개만 secondary owner일 때 움직입니다. critical/boss response/countdown/Reduced Flash에서는 steady high-visibility로 유지하며 timing/radius/collision/damage는 동결합니다.
- **Phase 1891 · Endless Field Node Focus**: 모든 field node의 동시 pulse를 제거하고 secondary owner일 때 가장 가까운 active node 1개만 움직입니다. heal/core recovery/gold/strain/expiry 규칙은 변경하지 않습니다.
- **Phase 1892 · Guardian Core Ambient Alignment**: 수호핵 외곽 ambient ring은 더 높은 secondary cue가 없을 때만 기존의 약한 pulse를 유지합니다. non-normal Combat Attention 또는 Reduced Flash에서는 steady입니다.
- **Phase 1893 · 48-Sample Audit**: six feature profiles × eight attention contexts = 48 deterministic samples에서 animated secondary owner ≤1, max amplitude 0.08, Reduced Flash/critical/boss response/countdown amplitude 0, supply icon reuse true, visibility preserved, Action 9/9, Snapshot mutation false를 잠급니다.
- **Phase 1894 · Candidate Fail-Closed**: Release Freeze에 `secondaryCombatMotionPassed/Samples`를 결박했습니다. 하위 evidence false 위조는 Candidate REVIEW가 되고 sample count 변경은 signature를 바꿉니다. 현재 evidence는 `secondary-combat-motion safe (48)`입니다.
- 이번 실행은 **6개 기능 단위**를 한 번에 처리했지만 새 이미지 파일은 0개이며, motion policy를 frame당 1회만 계산해 6개 렌더러가 공유합니다. 전투 수치·boss/enemy cadence·economy·audio/haptic·AUTO·9 Actions·RunSnapshot schema는 변경하지 않습니다.

## Phase 1921~1928 — Build Identity Asset Integration
A shared 20-cell relic/fusion atlas now gives boss rewards, the live build HUD, results, recent runs, and resume state a consistent visual identity while preserving all text fallbacks and gameplay logic. Release evidence: `build-identity-assets safe (40)`.

## Phase 2335~2342 — Mythic SAFE ZONE Effective Pressure Identity

- **Phase 2335 · Pressure Effect Atlas**: SAFE ZONE이 이미 바꾸고 있던 `특수주기/소환/돌진거리/보스피해` 4종을 192×192, 2×2 static atlas로 추가했습니다. 4/4 고유 cell이며 이미지 실패 시 signed text가 그대로 남습니다.
- **Phase 2336~2337 · Authoritative Projection**: 새 표시용 계산식을 만들지 않고 기존 `mythicSafeZonePressure()` 결과를 직접 읽어 signed percentage로 투영합니다. 절대 영향도가 큰 두 항목만 deterministic하게 선택합니다.
- **Phase 2338~2339 · Existing SAFE Seam Integration**: 기존 SAFE label 바로 아래에 최대 2개 compact chip만 추가합니다. 새 HUD row나 조작은 없고 hero/core critical, Last Law, boss special ≤1.2s에는 자동으로 숨겨 더 중요한 전투 cue를 가리지 않습니다.
- **Phase 2340~2341 · 96-Sample Audit**: 6 archetype × 4 phase × 3 weakpoint ratio의 authoritative projection 72개와 identity/invariant를 합쳐 정확히 96 sample을 검사합니다. Action 9/9, gameplay/Snapshot mutation false를 잠급니다.
- **Phase 2342 · Candidate Fail-Closed**: Release Freeze와 Candidate signature에 SAFE pressure projection evidence를 결박합니다. `mythic-safe-zone-pressure-projection-identity-assets safe (96)`가 release candidate 증거에 포함됩니다.
- 이번 패스도 SAFE ZONE timing/weakpoint relief/boss combat coefficient/Snapshot schema는 변경하지 않습니다.

## Phase 2343~2350 — Final Boss Effective Pressure Consolidation

- **Phase 2343~2344 · Final Applied Projection**: 네메시스·약점·Mythic Phase/Last Law·SAFE ZONE·플레이어 계열 버프가 모두 반영된 뒤 실제 보스 전투에 적용되는 `BossEncounterModifiers`를 하나의 최종 표시값으로 투영합니다. 별도 전투 공식을 복제하지 않으며 1% 미만 변화는 숨기고 영향도가 큰 2개만 보여줍니다.
- **Phase 2345 · Applied-State Getter**: `EnemyManager.getBossEncounterModifiers()`가 실제 사용 중인 배율의 defensive copy를 제공해 UI가 gameplay와 같은 값을 읽습니다. 반환 객체를 수정해도 전투 상태는 변하지 않습니다.
- **Phase 2346~2347 · Unified Recall**: 보스 상단 recall band에 최종 압력 2개만 표시하고, 기존 Nemesis/SAFE 숫자 helper는 통합 표시가 활성일 때 양보합니다. 상태 아이콘은 그대로 유지됩니다. 새 atlas를 만들지 않고 기존 SAFE pressure 4종 아이콘을 재사용해 로딩·관리 비용을 추가하지 않았습니다.
- **Phase 2348~2349 · 60-Sample Audit**: 24 single-channel + 12 pair salience + 12 defensive read + 12 invariant = 60 deterministic sample로 4채널 coverage, max 2, neutral suppression, atlas reuse, Actions 9/9, gameplay/Snapshot mutation false를 검증합니다.
- **Phase 2350 · Candidate Fail-Closed**: Release Freeze와 Candidate signature에 `boss-effective-pressure-projection-identity safe (60)` evidence를 결박합니다.
- 이번 패스도 `Game.endlessBossEncounterModifiers()` 본문, 보스 전투 수치/주기, SAFE/Nemesis 공식, economy, input, audio/haptic, **9 Actions**, RunSnapshot schema는 변경하지 않습니다.

## Phase 2351~2358 — Boss Pressure Semantic Readability

- **Phase 2351 · 위험/기회 의미 고정**: 최종 보스 압력 4채널을 단순 부호가 아니라 실제 전투 의미로 해석합니다. 특수주기 감소는 `위험`, 보스피해 증가(보스가 받는 피해 증가)는 `기회`처럼 역방향 채널도 HUD가 대신 판단합니다.
- **Phase 2352~2353 · 기존 숫자 계약 보존**: `특수주기 -32%` 같은 기존 label은 그대로 두고 별도 semantic label만 추가합니다. neutral/비정상 값은 중립으로 처리되고 기존 1% 미만 숨김도 유지됩니다.
- **Phase 2354~2355 · 통합 압력 칩 semantic badge**: 기존 상위 2개 칩에 `위험/기회` 텍스트를 직접 표시합니다. 색은 보조 수단이며 텍스트가 항상 남아 부호·색만 외울 필요가 없습니다. 기존 pressure atlas를 재사용해 신규 PNG는 0개입니다.
- **Phase 2356~2357 · 64-Sample Audit**: 위험 16 + 기회 16 + 중립/비정상 16 + invariant 16으로 채널 방향, 역부호 의미, 텍스트 우선, atlas 재사용, max-two, Actions 9/9, gameplay/Snapshot mutation false를 잠급니다.
- **Phase 2358 · Candidate Fail-Closed**: Release Freeze와 Candidate signature에 `boss-effective-pressure-semantics safe (64)`를 결박합니다.
- 이번 패스도 보스 전투 공식·SAFE/Nemesis 공식·경제·입력·오디오/햅틱·**9 Actions**·RunSnapshot schema는 변경하지 않습니다.

## Phase 2359~2366 — Boss Pressure Threat Retention

- 최종 보스 압력은 계속 최대 2개만 보여주지만, **보이는 위험이 하나라도 있으면 가장 강한 위험 1개를 반드시 남깁니다.** 큰 `기회` 2개 때문에 작은 `위험`이 사라지는 경우를 막습니다.
- 두 번째 칸은 남은 효과 중 변화량이 가장 큰 항목을 사용하며, 위험이 전혀 없으면 Phase2358의 기존 변화량 순서를 그대로 유지합니다.
- 기존 1% threshold, `위험/기회` 텍스트, pressure atlas, critical/Last Law suppression을 그대로 재사용합니다. 새 HUD/조작/PNG는 0개입니다.
- 64 deterministic samples와 Candidate fail-closed로 threat retention, max-two, compatibility, Actions 9/9, gameplay/Snapshot mutation false를 잠급니다.

## Phase 2367~2374 — Boss Pressure Multi-Threat Priority

- 보이는 위험이 **2개 이상이면 기존 2칩을 모두 위험에 사용**해 큰 기회 수치가 두 번째 위험을 밀어내지 못하게 합니다.
- 위험이 1개면 기존 `위험 1 + 가장 큰 나머지 1`, 위험이 없으면 기존 변화량 순서를 유지합니다.
- 기존 pressure atlas, `위험/기회` 텍스트, 1% threshold, critical/Last Law suppression을 그대로 재사용하며 새 HUD/조작/PNG는 0개입니다.
- 64 deterministic samples와 Candidate fail-closed로 dual-threat retention, strongest-threat ordering, compatibility, Actions 9/9, gameplay/Snapshot mutation false를 잠급니다.

## Phase 2375~2382 — Boss Pressure Hidden Threat Count

- 위험이 3~4개인데 기존 2칩 한도 때문에 일부가 숨을 때 같은 줄 끝에 **`+1 위험` / `+2 위험`**을 표시합니다.
- 기존 2칩, `위험/기회` 의미, 1% threshold, multi-threat 우선순위, critical/Last Law suppression은 그대로 유지합니다.
- 새 HUD row, 조작, 애니메이션, 오디오/햅틱, 이미지 atlas는 **0개**입니다. 기존 pressure atlas를 그대로 재사용합니다.
- 64 deterministic samples와 Candidate fail-closed로 hidden count/label, max-two, Actions 9/9, gameplay/Snapshot mutation false를 잠급니다.

## Phase 2383~2390 — Mythic Tactic Attack-Link Effect Projection

The primed Mythic Tactic boss icon now recalls the two largest real effects of the already-created one-shot attack link (projectiles, summons, dash distance, time-warp pressure, or next-special cadence). The projection reads the authoritative link directly, reuses the existing tactic atlas, adds no new global HUD row or controls, and is release-bound through a 64-sample deterministic audit.

## Phase 2399~2406 — Boss Signature & Hero Projectile VFX

전장 시각 품질 패스로 6보스 전용 signature VFX atlas와 4영웅 projectile/impact VFX atlas를 추가했습니다. 기존 전투 판정과 밸런스는 유지하며, 보스 등장·특수기 charge·phase 전환과 영웅 기본 투사체/피격 burst에 이미지 기반 VFX를 연결했습니다. 모든 신규 이미지 로딩은 비차단 방식이며 기존 Canvas fallback을 유지합니다.

## Phase 2407~2414 — Battlefield Combat VFX Expansion
- 12종 일반 적 hit/death 이미지 VFX 24셀 추가
- 6종 보스 projectile/hazard 이미지 VFX 12셀 추가
- 4영웅 chain/nova/field 시그니처 VFX 12셀 추가
- 기존 Canvas fallback과 전투 판정 유지, presentation-only integration
- 64-sample deterministic audit 및 Release/Candidate fail-closed binding

## Phase 2415~2422 — Battlefield Visual Evolution VFX
- 3개 맵 장애물에 정상/균열/파손 3단계 이미지 variation 적용
- 4 specialist 적에 전투 pose + 능력/projectile visual cue 8셀 적용
- 6보스 Phase 2/3 전용 overlay VFX 12셀 적용
- 4영웅 meteor/black-hole 전용 궁극기 signature VFX 8셀 적용
- 모든 신규 표현은 presentation-only, 이미지 실패 시 기존 Canvas fallback 유지
- 64-sample deterministic audit 및 Release/Candidate fail-closed binding

## Phase 2423~2430 — Battlefield Interaction Visual Assets
전장 상호작용 요소를 4×4 이미지 atlas로 통합했습니다. 수호핵 3단계, XP/금화, 보급상자, 목표 3종, Field Node 5종, 일반/엘리트 Spawn Portal을 실제 전장 렌더에 연결했고, 이미지 로드 실패 시 기존 Canvas 표현을 그대로 사용합니다. 전투/AI/경제/Snapshot 공식은 변경하지 않습니다.

## Phase 2431~2438 — Battlefield Environment Depth & Reaction VFX
- 3 maps × 3 stages atmosphere overlay atlas (embers/smoke/ash, snow/frost/crystals, arcane dust/crystal glow/resonance)
- 6 terrain reaction images for crystal blast/evolution collapse
- archer projectile + impact image cues
- reduced-motion static atmosphere, Canvas fallback preserved
- 64-sample deterministic release audit
