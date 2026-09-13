# Personal History and Leaderboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let players view cloud run history and compare their best T0–T5 survival result against a safe public leaderboard.

**Architecture:** Keep `run_records` and `leaderboard_entries` private, then maintain one best summary per `(threat_level, user_id)` with an insert trigger. A hardened RPC returns UUID-free public rank rows; the cloud repository queries that RPC and the lobby opens compact on-demand views.

**Tech Stack:** TypeScript, DOM overlays, Supabase Postgres/RLS/triggers, `@supabase/supabase-js`, Node test runner.

**Spec:** `docs/superpowers/specs/2026-09-13-personal-history-leaderboard-design.md`

## Global Constraints

- Rank T0–T5 independently by survival seconds, kills, level, then earlier completion.
- Public RPC output is limited to display name, hero, survival seconds, kills, level, threat level, and rank.
- Private run records and leaderboard storage tables have no public client read/write policy.
- Never place a service-role key in browser source.
- A cloud failure must not block a local game flow.
- Full server battle verification is outside this feature.

---

### Task 1: Secure ranking schema and best-record trigger

**Files:**
- Create: CLI-generated migration under `supabase/migrations/`
- Modify: `tests/supabase-schema-contract.test.mjs`

**Interfaces:**
- Produces `leaderboard_entries(threat_level, user_id, display_name, hero_id, survived_seconds, level, kills, ended_at)`.
- Produces `refresh_leaderboard_entry()` as an `AFTER INSERT` trigger on `run_records` and `public.get_leaderboard(smallint, integer)`.

- [ ] **Step 1: Write a failing schema contract test**

Add assertions for `create table public.leaderboard_entries`, enabled RLS, an `AFTER INSERT` trigger on `run_records`, `security definer`, fixed `search_path`, and revoked default PUBLIC function execution.

- [ ] **Step 2: Run the contract test**

Run `npm run build; node --test tests/supabase-schema-contract.test.mjs`.

Expected: FAIL because the leaderboard migration is absent.

- [ ] **Step 3: Generate and write the migration**

Run `npx supabase migration new add_leaderboard`.

Add `threat_level smallint not null check (threat_level between 0 and 5)` to `run_records`. Create `leaderboard_entries` with `(threat_level, user_id)` as its primary key. Enable RLS without any public table policy.

Create `public.get_leaderboard(p_threat_level smallint, p_limit integer)` as a `SECURITY DEFINER` function with `set search_path = ''`, schema-qualified identifiers, bounded limit `least(greatest(p_limit, 1), 20)`, and no `user_id` return column. Revoke EXECUTE from PUBLIC and grant EXECUTE only to `anon` and `authenticated`.

Implement the trigger function so an incoming run replaces the row only when it is better by `survived_seconds DESC`, `kills DESC`, `level DESC`, `ended_at ASC`. Generate a missing display name as `마도사 #` plus the first four UUID characters.

- [ ] **Step 4: Verify schema contract**

Run `npm run build; node --test tests/supabase-schema-contract.test.mjs`.

Expected: PASS.

- [ ] **Step 5: Apply and check remote security**

Apply the migration in the Supabase SQL editor. Query `pg_policies`, `information_schema.role_table_grants`, and `information_schema.routine_privileges`. Verify no client table grants exist, only the approved RPC roles have EXECUTE, and RPC output has no UUID column. With an authenticated test session, add a shorter and a longer T0 result for one user; only the longer row may remain.

- [ ] **Step 6: Commit**

Run `git add supabase/migrations tests/supabase-schema-contract.test.mjs` then `git commit -m "feat: add public leaderboard schema"`.

### Task 2: Cloud queries and comparison model

**Files:**
- Modify: `src/cloud/run-history.ts`
- Create: `src/domain/leaderboard.ts`
- Create: `tests/leaderboard.test.mjs`
- Modify: `tests/cloud-run-history.test.mjs`

**Interfaces:**
- Produces `CloudRunHistory.loadMine(limit: number)` and `CloudRunHistory.loadLeaderboard(threatLevel: number, limit: number)`.
- Produces `rankLeaderboard(rows)` and `leaderboardComparison(rows, userId)`.
- Extends `CloudRunRecord` with `threatLevel: 0 | 1 | 2 | 3 | 4 | 5` and sends it as `threat_level` on every run upsert.

- [ ] **Step 1: Write failing pure comparison tests**

Add a two-row fixture with equal survival seconds where the higher kill count sorts first. Add a comparison fixture that expects `rank`, `leaderGapSeconds`, and `nextRankGapSeconds`. Add repository mock assertions for `run_records` owner reads and the `get_leaderboard` RPC with a T level and limit of 20.

- [ ] **Step 2: Run focused tests**

Run `npm run build; node --test tests/leaderboard.test.mjs tests/cloud-run-history.test.mjs`.

Expected: FAIL because these exports are absent.

- [ ] **Step 3: Implement minimal typed mapping**

Define `LeaderboardEntry` with display name, hero, survived seconds, kills, level, threat level, completion time, and rank. Extend `CloudRunRecord` with a bounded `threatLevel` and map it to `threat_level` on save. Bound all numeric values. Make personal history return at most 20 rows. Make the leaderboard RPC return at most 20 UUID-free rows for one valid T level. Fetch the signed-in player's private best record separately for comparison.

- [ ] **Step 4: Verify focused tests**

Run `npm run build; node --test tests/leaderboard.test.mjs tests/cloud-run-history.test.mjs tests/game-auth.test.mjs`.

Expected: PASS.

- [ ] **Step 5: Commit**

Run `git add src/cloud/run-history.ts src/domain/leaderboard.ts tests/leaderboard.test.mjs tests/cloud-run-history.test.mjs` then `git commit -m "feat: query personal history and leaderboard"`.

### Task 3: Lobby personal-history and ranking views

**Files:**
- Modify: `src/ui/lobby.ts`
- Modify: `src/game/game.ts`
- Create: `tests/lobby-leaderboard.test.mjs`

**Interfaces:**
- Produces `LobbyHandlers.onOpenHistory()` and `LobbyHandlers.onOpenLeaderboard(level)`.
- Consumes cloud rows, comparison state, and the existing `AuthState`.

- [ ] **Step 1: Write a failing UI contract test**

Read `src/ui/lobby.ts` and require the Korean labels `내 기록`, `탑 순위`, `불러오는 중`, `기록 없음`, and `연결하지 못함`, plus the `leaderGapSeconds` comparison field.

- [ ] **Step 2: Run the contract test**

Run `npm run build; node --test tests/lobby-leaderboard.test.mjs`.

Expected: FAIL because the dedicated views are absent.

- [ ] **Step 3: Implement compact views**

Add two account-area buttons. `내 기록` opens up to 20 private cloud records; guests see the existing five local records and a Google login action. `탑 순위` opens a selected-T board with T0–T5 buttons and 20 public rows.

Show the signed-in player as a pinned row when outside the visible 20. Render `선두까지 N분 M초` and, when applicable, `다음 순위까지 N초`. Loading, empty, and connection-error states must remain visible without disabling `전투 준비`.

- [ ] **Step 4: Wire on-demand loading in Game**

Request cloud data only when one of the two actions opens. Pass the current user ID and private best record to comparison. Add the current `runThreatLevel` to the cloud run save. Refresh an open account panel after sign-in/sign-out. Convert repository rejection into the lobby error state instead of throwing in an event handler.

- [ ] **Step 5: Verify focused regressions**

Run `npm run build; node --test tests/lobby-leaderboard.test.mjs tests/leaderboard.test.mjs tests/game-auth.test.mjs tests/cloud-run-history.test.mjs`.

Expected: PASS.

- [ ] **Step 6: Commit**

Run `git add src/ui/lobby.ts src/game/game.ts tests/lobby-leaderboard.test.mjs` then `git commit -m "feat: show run history and leaderboard in lobby"`.

### Task 4: End-to-end verification and release hygiene

**Files:**
- Modify: `docs/superpowers/specs/2026-09-13-personal-history-leaderboard-design.md` only when live verification proves a design correction is required.

- [ ] **Step 1: Run full automated regression**

Run `npm test`.

Expected: exit code 0 and no failed tests.

- [ ] **Step 2: Test the deployed Google flow**

On the registered production game domain, sign in, finish a short T0 run, and confirm it appears in `내 기록`. Open `탑 순위` and confirm the T0 record and comparison text appear.

- [ ] **Step 3: Verify best-record replacement**

Submit a shorter second T0 result for the same account and verify the public row remains unchanged. Submit a longer result and verify it replaces the row.

- [ ] **Step 4: Final repository hygiene**

Run `git diff --check` and `git status --short`. Restore generated `dist/` changes only. Keep the unrelated untracked Kakao design drafts out of all commits.
