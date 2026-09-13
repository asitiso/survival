# Supabase Kakao Run History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Kakao login and authenticated cloud storage for completed run records while preserving offline local play.

**Architecture:** A small auth client owns Supabase session state and a separate run-history repository owns validated record writes and reads. Game and UI integration receive an optional cloud service, so missing public configuration or a failed request never blocks local gameplay or the result screen.

**Tech Stack:** TypeScript, browser DOM UI, `@supabase/supabase-js`, Supabase Auth Kakao OAuth, Postgres, Row Level Security.

**Spec:** `docs/superpowers/specs/2026-09-12-supabase-kakao-run-history-design.md`

## Global Constraints

- Use only the Supabase URL and browser publishable/anon key in client configuration; never expose a service role key or Kakao Client Secret.
- Preserve the current local run-history behavior for guests and when cloud configuration is absent.
- Enable RLS and constrain every `public` table policy with `(select auth.uid()) = user_id` or `(select auth.uid()) = id`.
- Store only finished-run summary fields and use an idempotent `(user_id, run_key)` key.
- Do not add progress syncing, rankings, social systems, or a new in-game action.

---

### Task 1: Add Supabase package, runtime configuration, and safe client creation

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/cloud/supabase-client.ts`
- Create: `tests/supabase-client.test.mjs`

**Interfaces:**
- Produces `supabaseClient(): SupabaseClient | null`.
- Produces `supabaseConfigured(): boolean`.
- Reads `globalThis.__ARCANE_SUPABASE_URL__` and `globalThis.__ARCANE_SUPABASE_PUBLISHABLE_KEY__`; neither is a secret.

- [ ] **Step 1: Add a failing configuration test**

```js
import { supabaseClient, supabaseConfigured } from '../dist/cloud/supabase-client.js';

test('cloud client remains unavailable without public runtime configuration', () => {
  assert.equal(supabaseConfigured(), false);
  assert.equal(supabaseClient(), null);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run build; node --test tests/supabase-client.test.mjs`

Expected: FAIL because `src/cloud/supabase-client.ts` does not exist.

- [ ] **Step 3: Install the pinned Supabase browser dependency**

Run: `npm install @supabase/supabase-js@2.98.0 --save-exact`

Expected: `package.json` and `package-lock.json` contain the exact package version.

- [ ] **Step 4: Implement a cached, public-key-only client**

```ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type RuntimeConfig = typeof globalThis & {
  __ARCANE_SUPABASE_URL__?: unknown;
  __ARCANE_SUPABASE_PUBLISHABLE_KEY__?: unknown;
};

let cached: SupabaseClient | null | undefined;

export function supabaseConfigured(): boolean {
  const config = globalThis as RuntimeConfig;
  return typeof config.__ARCANE_SUPABASE_URL__ === 'string'
    && typeof config.__ARCANE_SUPABASE_PUBLISHABLE_KEY__ === 'string'
    && config.__ARCANE_SUPABASE_URL__.startsWith('https://')
    && config.__ARCANE_SUPABASE_PUBLISHABLE_KEY__.length > 20;
}

export function supabaseClient(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  if (!supabaseConfigured()) return cached = null;
  const config = globalThis as RuntimeConfig;
  return cached = createClient(config.__ARCANE_SUPABASE_URL__ as string, config.__ARCANE_SUPABASE_PUBLISHABLE_KEY__ as string);
}
```

- [ ] **Step 5: Run the focused test**

Run: `npm run build; node --test tests/supabase-client.test.mjs`

Expected: PASS.

- [ ] **Step 6: Commit the isolated configuration boundary**

```bash
git add package.json package-lock.json src/cloud/supabase-client.ts tests/supabase-client.test.mjs
git commit -m "feat: add optional supabase client"
```

### Task 2: Add Kakao session controller

**Files:**
- Create: `src/cloud/game-auth.ts`
- Create: `tests/game-auth.test.mjs`

**Interfaces:**
- Consumes `supabaseClient(): SupabaseClient | null`.
- Produces `GameAuth` with `initialize(): Promise<AuthState>`, `signInWithKakao(redirectTo: string): Promise<void>`, `signOut(): Promise<void>`, and `subscribe(listener: (state: AuthState) => void): () => void`.
- `AuthState` is `{ status: 'unconfigured' | 'guest' | 'authenticated'; userId: string | null }`.

- [ ] **Step 1: Write failing tests for guest fallback and Kakao provider selection**

```js
test('unconfigured auth stays a guest without an OAuth request', async () => {
  const auth = new GameAuth(() => null);
  assert.deepEqual(await auth.initialize(), { status: 'unconfigured', userId: null });
});

test('Kakao login uses Supabase OAuth provider kakao and caller redirect', async () => {
  const calls = [];
  const auth = new GameAuth(() => ({ auth: { signInWithOAuth: async (options) => { calls.push(options); return { error: null }; } } }));
  await auth.signInWithKakao('https://game.example.com');
  assert.deepEqual(calls[0], { provider: 'kakao', options: { redirectTo: 'https://game.example.com' } });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run build; node --test tests/game-auth.test.mjs`

Expected: FAIL because `GameAuth` does not exist.

- [ ] **Step 3: Implement `GameAuth` with session restoration and safe error propagation**

```ts
export class GameAuth {
  private state: AuthState = { status: 'guest', userId: null };
  private readonly listeners = new Set<(state: AuthState) => void>();
  constructor(private readonly client = supabaseClient) {}
  async initialize(): Promise<AuthState> {
    const supabase = this.client();
    if (!supabase) return this.setState({ status: 'unconfigured', userId: null });
    const { data: { session } } = await supabase.auth.getSession();
    supabase.auth.onAuthStateChange((_event, next) => this.setState(next?.user ? { status: 'authenticated', userId: next.user.id } : { status: 'guest', userId: null }));
    return this.setState(session?.user ? { status: 'authenticated', userId: session.user.id } : { status: 'guest', userId: null });
  }
  async signInWithKakao(redirectTo: string): Promise<void> {
    const supabase = this.client(); if (!supabase) return;
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'kakao', options: { redirectTo } }); if (error) throw error;
  }
  async signOut(): Promise<void> { const supabase = this.client(); if (supabase) { const { error } = await supabase.auth.signOut(); if (error) throw error; } this.setState({ status: 'guest', userId: null }); }
  subscribe(listener: (state: AuthState) => void): () => void { this.listeners.add(listener); listener(this.state); return () => this.listeners.delete(listener); }
  private setState(state: AuthState): AuthState { this.state = state; this.listeners.forEach((listener) => listener(state)); return state; }
}
```

- [ ] **Step 4: Run focused auth tests**

Run: `npm run build; node --test tests/game-auth.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit auth behavior**

```bash
git add src/cloud/game-auth.ts tests/game-auth.test.mjs
git commit -m "feat: add kakao auth controller"
```

### Task 3: Add schema migration and RLS policies

**Files:**
- Create: the timestamped SQL migration created by `supabase migration new create_profiles_and_run_records`
- Create: `tests/supabase-schema-contract.test.mjs`

**Interfaces:**
- Produces `public.profiles` and `public.run_records` as defined in the spec.
- `run_records` accepts only a caller-owned `user_id`; duplicate `(user_id, run_key)` inserts are rejected by the database.

- [ ] **Step 1: Create the migration with the Supabase CLI**

Run: `supabase migration new create_profiles_and_run_records`

Expected: one timestamped SQL file under `supabase/migrations/`.

- [ ] **Step 2: Write a failing static schema contract test**

```js
test('cloud history schema enables RLS and contains owner-scoped policies', () => {
  const sql = readFileSync(migrationPath, 'utf8');
  assert.match(sql, /alter table public\.profiles enable row level security/i);
  assert.match(sql, /alter table public\.run_records enable row level security/i);
  assert.match(sql, /unique \(user_id, run_key\)/i);
  assert.match(sql, /\(select auth\.uid\(\)\) = user_id/i);
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `node --test tests/supabase-schema-contract.test.mjs`

Expected: FAIL because the generated migration lacks the schema and policies.

- [ ] **Step 4: Add ownership-only SQL**

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.run_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  run_key uuid not null,
  hero_id text not null check (hero_id in ('arkan','seria','kain','edric')),
  survived_seconds integer not null check (survived_seconds >= 0 and survived_seconds <= 604800),
  level integer not null check (level >= 1 and level <= 999),
  kills integer not null check (kills >= 0),
  gold_earned integer not null check (gold_earned >= 0),
  bosses_killed integer not null check (bosses_killed >= 0),
  ended_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, run_key)
);

alter table public.profiles enable row level security;
alter table public.run_records enable row level security;
create policy "profiles select own" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles insert own" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "profiles update own" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "run records select own" on public.run_records for select to authenticated using ((select auth.uid()) = user_id);
create policy "run records insert own" on public.run_records for insert to authenticated with check ((select auth.uid()) = user_id);
```

- [ ] **Step 5: Run the schema contract test and Supabase security advisor**

Run: `node --test tests/supabase-schema-contract.test.mjs && supabase db advisors`

Expected: PASS and no RLS security finding for the new tables.

- [ ] **Step 6: Commit the migration**

```bash
git add supabase/migrations tests/supabase-schema-contract.test.mjs
git commit -m "feat: add protected cloud run history schema"
```

### Task 4: Add cloud run-history repository and bridge local game results

**Files:**
- Create: `src/cloud/run-history-repository.ts`
- Modify: `src/domain/run-history.ts`
- Modify: `src/game/game.ts`
- Create: `tests/run-history-repository.test.mjs`
- Modify: `tests/run-history.test.mjs`

**Interfaces:**
- Produces `CloudRunRecord` with `runKey`, `heroId`, `seconds`, `level`, `kills`, `goldEarned`, and `bossesKilled`.
- Produces `RunHistoryRepository.save(record: CloudRunRecord, userId: string): Promise<'saved' | 'skipped'>`.
- Consumes the existing `RunHistoryEntry` result data and preserves `appendRunHistory` for local history.

- [ ] **Step 1: Write a failing idempotency test**

```js
test('repository upserts one caller-owned finished run and never writes while signed out', async () => {
  const calls = [];
  const repository = new RunHistoryRepository(() => fakeClient(calls));
  assert.equal(await repository.save(record, null), 'skipped');
  assert.equal(await repository.save(record, 'user-a'), 'saved');
  assert.equal(calls[0].table, 'run_records');
  assert.equal(calls[0].payload.user_id, 'user-a');
  assert.equal(calls[0].options.onConflict, 'user_id,run_key');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run build; node --test tests/run-history-repository.test.mjs`

Expected: FAIL because `RunHistoryRepository` does not exist.

- [ ] **Step 3: Implement validated, non-blocking record conversion and repository writes**

```ts
export class RunHistoryRepository {
  constructor(private readonly client = supabaseClient) {}
  async save(record: CloudRunRecord, userId: string | null): Promise<'saved' | 'skipped'> {
    if (!userId || !this.client()) return 'skipped';
    const { error } = await this.client()!.from('run_records').upsert({
      user_id: userId, run_key: record.runKey, hero_id: record.heroId,
      survived_seconds: record.seconds, level: record.level, kills: record.kills,
      gold_earned: record.goldEarned, bosses_killed: record.bossesKilled,
    }, { onConflict: 'user_id,run_key', ignoreDuplicates: true });
    if (error) throw error;
    return 'saved';
  }
}
```

- [ ] **Step 4: Call cloud saving only after the existing local result append succeeds**

```ts
const localHistory = appendRunHistory(this.storage, entry);
void this.cloudHistory.save(toCloudRunRecord(entry, this.hero.level, this.goldEarned), this.authState.userId)
  .catch(() => this.cloudHistoryStatus = 'retryable-error');
```

- [ ] **Step 5: Run focused history tests**

Run: `npm run build; node --test tests/run-history.test.mjs tests/run-history-repository.test.mjs`

Expected: PASS; local history behavior remains unchanged.

- [ ] **Step 6: Commit cloud result persistence**

```bash
git add src/cloud/run-history-repository.ts src/domain/run-history.ts src/game/game.ts tests/run-history-repository.test.mjs tests/run-history.test.mjs
git commit -m "feat: save authenticated run history"
```

### Task 5: Add lobby auth and cloud-history presentation

**Files:**
- Modify: `src/ui/lobby.ts`
- Modify: `src/game/game.ts`
- Modify: `src/styles.css`
- Create: `tests/lobby-auth-history.test.mjs`

**Interfaces:**
- Consumes `AuthState` and a maximum of five cloud `RunHistoryEntry` values.
- Adds optional `onSignInWithKakao` and `onSignOut` handlers to `LobbyHandlers`.
- Produces accessible buttons labeled `카카오로 시작하기` and `로그아웃`.

- [ ] **Step 1: Write failing lobby rendering tests**

```js
test('guest lobby exposes Kakao sign-in without hiding local play', () => {
  const markup = renderLobby({ auth: { status: 'guest', userId: null } });
  assert.match(markup, /카카오로 시작하기/);
  assert.match(markup, /게임 시작/);
});

test('authenticated lobby exposes logout and owned cloud records', () => {
  const markup = renderLobby({ auth: { status: 'authenticated', userId: 'user-a' }, cloudHistory: [entry] });
  assert.match(markup, /로그아웃/);
  assert.match(markup, /클라우드 기록/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run build; node --test tests/lobby-auth-history.test.mjs`

Expected: FAIL because lobby auth rendering is absent.

- [ ] **Step 3: Add an optional, non-blocking account block to the lobby**

```ts
if (auth.status === 'authenticated') {
  accountButton.textContent = '로그아웃';
  accountButton.addEventListener('click', () => void handlers.onSignOut?.());
} else {
  accountButton.textContent = '카카오로 시작하기';
  accountButton.addEventListener('click', () => void handlers.onSignInWithKakao?.());
}
```

- [ ] **Step 4: Render cloud history separately from the existing local recent-runs section**

```ts
const title = document.createElement('div');
title.textContent = '클라우드 기록 · 최근 5회';
cloudHistory.forEach((entry) => list.append(renderRunHistoryEntry(entry)));
```

- [ ] **Step 5: Run focused UI and coupling tests**

Run: `npm run build; node --test tests/lobby-auth-history.test.mjs tests/run-history-repository.test.mjs tests/run-history.test.mjs`

Expected: PASS.

- [ ] **Step 6: Commit lobby integration**

```bash
git add src/ui/lobby.ts src/game/game.ts src/styles.css tests/lobby-auth-history.test.mjs
git commit -m "feat: show kakao account and cloud history"
```

### Task 6: Configure, deploy, and verify against the connected Supabase project

**Files:**
- Modify: deployment runtime configuration source used by the chosen host
- Modify: `README.md` only if deployment configuration is already documented there

**Interfaces:**
- Requires the user-provided Supabase project URL, browser publishable key, production game URL, and Kakao Developers app credentials configured in dashboards.

- [ ] **Step 1: Configure Kakao and Supabase dashboards**

Set Kakao Login to ON, enable OpenID Connect, register `https://<project-ref>.supabase.co/auth/v1/callback`, and set the Kakao REST API key plus Client Secret only in Supabase Auth’s Kakao provider configuration. Add the production game URL and local development URL to Supabase Auth redirect allowlist.

- [ ] **Step 2: Apply the migration to the connected project**

Run: `supabase db push`

Expected: `profiles` and `run_records` exist with RLS enabled.

- [ ] **Step 3: Verify policies with two test users**

Run the following with authenticated user sessions through the app:

```text
User A inserts one run record; User A can list it.
User B cannot list User A’s record.
User B cannot insert a record whose user_id is User A.
User A repeats the same run_key; the table still has one row for that key.
```

- [ ] **Step 4: Verify browser flows**

```text
Guest opens game → local history works.
Guest selects Kakao login → returns authenticated.
Authenticated user finishes a run → local and cloud records display.
Disconnect network before finishing → result screen still opens and local record remains.
Logout → cloud calls stop and local play remains available.
```

- [ ] **Step 5: Run repository regression and commit configuration documentation**

Run: `npm test`

Expected: PASS.

```bash
git add README.md
git commit -m "docs: document supabase kakao setup"
```
