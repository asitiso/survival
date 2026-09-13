# Supabase 카카오 로그인과 플레이 기록 설계

## 목표

카카오 로그인으로 사용자별 플레이 기록을 안전하게 저장하고, 다른 기기에서도 최근 기록과 최고 기록을 조회할 수 있게 한다. 로그인하지 않은 사용자는 기존 로컬 플레이와 로컬 저장을 그대로 이용한다.

## 범위

- Supabase Auth의 Kakao OAuth 로그인·로그아웃·세션 복구
- 완료된 런의 클라우드 기록 저장
- 사용자별 최근 기록과 최고 기록 조회
- Row Level Security로 본인 데이터만 접근
- 인증 설정이 없는 개발·오프라인 환경의 안전한 로컬 폴백

이번 범위에서는 진행 중 런 저장, 장비·메타 진행 동기화, 친구·랭킹, 관리자 도구를 추가하지 않는다.

## 사용자 흐름

1. 로비에서 사용자는 `카카오로 시작하기`를 선택할 수 있다.
2. 브라우저는 Supabase Auth를 거쳐 카카오 동의 화면으로 이동한다.
3. 인증이 끝나면 승인된 게임 도메인으로 돌아와 세션을 복구한다.
4. 런이 끝날 때 로그인 상태이면 결과가 사용자 소유의 기록으로 한 번 저장된다.
5. 사용자는 로비에서 최근 기록과 영웅별 최고 생존 시간을 본다.
6. 로그아웃하거나 인증 설정이 없으면 게임은 기존 로컬 동작을 유지한다.

## 클라이언트 구조

- `SupabaseGameAuth`: 세션 읽기, Kakao OAuth 시작, 로그아웃, 인증 상태 구독을 담당한다.
- `RunHistoryRepository`: 인증된 사용자의 런 결과를 저장·조회한다. 입력을 게임 결과의 허용된 필드로 축소한다.
- `CloudSyncController`: 인증 설정과 세션이 모두 있을 때만 저장소를 사용하며, 네트워크 오류는 게임 종료 흐름을 막지 않고 사용자에게 재시도 가능한 상태만 표시한다.
- 설정값은 `SUPABASE_URL`과 브라우저 공개 키만 사용한다. 서비스 역할 키와 카카오 Client Secret은 브라우저 코드·저장소·번들에 포함하지 않는다.

## 데이터 모델

### public.profiles

- `id uuid primary key references auth.users(id) on delete cascade`
- `display_name text null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

프로필은 인증 사용자 본인만 읽고 수정한다. 이름은 카카오 메타데이터를 권한 판단에 사용하지 않으며, 비어 있어도 로그인과 기록 저장은 정상 동작한다.

### public.run_records

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `run_key uuid not null`
- `hero_id text not null`
- `survived_seconds integer not null`
- `level integer not null`
- `kills integer not null`
- `gold_earned integer not null`
- `bosses_killed integer not null`
- `ended_at timestamptz not null default now()`
- `created_at timestamptz not null default now()`
- `unique (user_id, run_key)`

`run_key`는 런 종료 시 클라이언트가 생성하는 UUID다. 네트워크 재시도에도 한 런이 중복 저장되지 않게 한다. 점수·보상·장비 상태는 이번 버전에서 저장하지 않는다.

## 권한과 보안

- 두 `public` 테이블 모두 RLS를 활성화한다.
- `profiles`의 SELECT·INSERT·UPDATE는 `(select auth.uid()) = id` 조건으로 자기 행만 허용한다. UPDATE는 동일 조건을 `WITH CHECK`에도 둔다.
- `run_records`의 SELECT·INSERT은 `(select auth.uid()) = user_id` 조건으로 자기 행만 허용한다.
- 기록은 수정·삭제 정책을 만들지 않는다. 완료된 런은 불변 데이터로 다룬다.
- 모든 입력은 타입·범위 검증 후 저장한다. 사용자 메타데이터는 표시용일 뿐 권한 판단에 쓰지 않는다.
- Data API에 노출되는 테이블에는 RLS 정책을 먼저 적용한다.

## OAuth 설정

- Supabase Dashboard에서 Kakao provider를 활성화하고 카카오 REST API 키와 Client Secret을 서버 측 설정에만 입력한다.
- Kakao Developers에 Supabase callback URL `https://<project-ref>.supabase.co/auth/v1/callback`을 등록한다.
- Supabase의 Site URL과 Redirect URL allowlist에는 실제 배포 도메인과 로컬 개발 주소만 등록한다.
- 카카오 앱에서는 Kakao Login을 활성화하고 필요한 최소 동의 항목만 사용한다. 이메일·프로필은 기록 저장에 필요하지 않으므로 기본 범위에서 요청하지 않는다.

## 검증 계획

1. 인증이 없는 환경에서도 게임 시작·종료·로컬 저장이 유지된다.
2. Kakao OAuth 버튼이 올바른 redirect URL로 인증을 시작한다.
3. 세션 복구와 로그아웃이 UI 상태를 갱신한다.
4. 인증 사용자는 자신의 완료 런을 한 번만 저장한다.
5. 다른 사용자 레코드의 조회·삽입·수정·삭제가 RLS로 거부된다.
6. 같은 `run_key` 저장 재시도는 중복 행을 만들지 않는다.
7. 네트워크 저장 실패가 결과 화면을 막지 않는다.

## 구현 순서

1. Supabase 프로젝트·카카오 앱 설정을 연결하고 SQL을 적용한다.
2. Auth와 기록 저장소를 테스트 우선으로 추가한다.
3. 로비 로그인 상태와 결과 기록 저장을 연결한다.
4. 최근 기록·최고 기록 표시를 추가한다.
5. OAuth·RLS·오프라인 폴백·전체 회귀를 검증한다.
