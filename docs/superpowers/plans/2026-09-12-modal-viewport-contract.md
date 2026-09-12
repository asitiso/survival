# Modal Viewport Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep every game modal's primary action visible within the game viewport on short desktop windows and mobile landscape screens.

**Architecture:** Results and lobby receive an explicit header/body/footer structure so only variable-length content scrolls. A shared modal viewport CSS contract constrains every panel to the game shell; decision dialogs keep their existing option-grid scrolling, and shop keeps its existing dedicated scroll body.

**Tech Stack:** TypeScript, DOM APIs, CSS media queries, Node.js built-in test runner.

**Spec:** `docs/superpowers/specs/2026-09-12-modal-viewport-contract-design.md`

## Global Constraints

- Primary actions must remain visible without browser zoom at desktop and mobile sizes.
- Mobile font floors: body 12px, choice title 15px, short status 11px.
- Interactive actions retain a 44px minimum touch target.
- Do not use transform scaling; compact decorative spacing before readable text or touch targets.
- Scroll bodies use overscroll containment and pan-y touch behavior.

---

### Task 1: Results overlay body and persistent actions

**Files:**
- Modify: `src/ui/results.ts`
- Modify: `src/styles.css`
- Create: `tests/results-viewport-layout.test.mjs`

**Interfaces:**
- Consumes: `ResultsOverlay.open(result: RunResult, handlers: ResultsHandlers): void`.
- Produces: `.results-header`, `.results-scroll-body`, and `.results-actions` regions inside `.results-panel`.

- [ ] **Step 1: Write the failing test**

Create `tests/results-viewport-layout.test.mjs` with:

```js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const results = readFileSync(new URL('../src/ui/results.ts', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('results keeps retry actions outside its scrollable details', () => {
  assert.match(results, /class="results-scroll-body"/);
  assert.match(results, /class="results-actions"/);
  assert.match(css, /\.results-panel\s*\{[^}]*max-height:\s*calc\(100% - 16px\);[^}]*display:\s*flex;/);
  assert.match(css, /\.results-scroll-body\s*\{[^}]*overflow-y:\s*auto;[^}]*overscroll-behavior:\s*contain;/);
  assert.match(css, /\.results-actions\s*\{[^}]*flex-shrink:\s*0;/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/results-viewport-layout.test.mjs`

Expected: FAIL because `.results-scroll-body` and the results panel viewport contract do not exist.

- [ ] **Step 3: Write minimal implementation**

In `ResultsOverlay.open`, keep the eyebrow and heading in a `.results-header` element, wrap all result identity, metrics, recap, comparison, and build-summary markup in `.results-scroll-body`, and append `.results-actions` after that body.

Add CSS:

```css
.results-panel { max-height:calc(100% - 16px); display:flex; flex-direction:column; overflow:hidden; }
.results-scroll-body { min-height:0; overflow-y:auto; overscroll-behavior:contain; touch-action:pan-y; }
.results-actions { flex-shrink:0; }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/results-viewport-layout.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/results.ts src/styles.css tests/results-viewport-layout.test.mjs
git commit -m "fix: keep result actions visible in viewport"
```

### Task 2: Lobby body and persistent battle-start action

**Files:**
- Modify: `src/ui/lobby.ts`
- Modify: `src/styles.css`
- Create: `tests/lobby-viewport-layout.test.mjs`

**Interfaces:**
- Consumes: `LobbyOverlay.render(profile: MetaProfile): void`.
- Produces: `.lobby-scroll-body` containing dynamic lobby content and a persistent `.lobby-footer`.

- [ ] **Step 1: Write the failing test**

Create `tests/lobby-viewport-layout.test.mjs` with:

```js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const lobby = readFileSync(new URL('../src/ui/lobby.ts', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('lobby keeps the battle-start action outside scrollable upgrades and records', () => {
  assert.match(lobby, /className = 'lobby-scroll-body'/);
  assert.match(lobby, /footer\.className = 'lobby-footer'/);
  assert.match(css, /\.lobby-panel\s*\{[^}]*max-height:\s*calc\(100% - 16px\);[^}]*overflow:\s*hidden;/);
  assert.match(css, /\.lobby-scroll-body\s*\{[^}]*overflow-y:\s*auto;[^}]*touch-action:\s*pan-y;/);
  assert.match(css, /\.lobby-footer\s*\{[^}]*flex-shrink:\s*0;/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/lobby-viewport-layout.test.mjs`

Expected: FAIL because the lobby appends dynamic content directly to the panel.

- [ ] **Step 3: Write minimal implementation**

Create a `.lobby-scroll-body` element after the existing heading. Append upgrade grid, mastery, threat, recent-run, and resume elements to that body. Append the existing footer, including the `전투 준비` button, directly to the panel after the body.

Add CSS:

```css
.lobby-panel { max-height:calc(100% - 16px); display:flex; flex-direction:column; overflow:hidden; }
.lobby-scroll-body { min-height:0; flex:1 1 auto; overflow-y:auto; overscroll-behavior:contain; touch-action:pan-y; }
.lobby-footer { flex-shrink:0; }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/lobby-viewport-layout.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/lobby.ts src/styles.css tests/lobby-viewport-layout.test.mjs
git commit -m "fix: keep battle start visible in lobby"
```

### Task 3: Apply one viewport ceiling to every remaining modal type

**Files:**
- Modify: `src/styles.css`
- Modify: `index.html`
- Modify: `src/game/mobile-landscape-modal-styles.ts`
- Modify: `tests/mobile-landscape-modal.test.mjs`
- Create: `tests/modal-viewport-ceiling.test.mjs`

**Interfaces:**
- Consumes: panel classes `.hero-select-panel`, `.levelup-panel`, `.trait-panel`, `.shop-panel`, `.results-panel`, and `.lobby-panel`.
- Produces: a shared `max-height: calc(100% - 16px)` viewport ceiling, with each content-heavy modal owning an internal scroll region.

- [ ] **Step 1: Write the failing test**

Create `tests/modal-viewport-ceiling.test.mjs` with:

```js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const mobile = readFileSync(new URL('../src/game/mobile-landscape-modal-styles.ts', import.meta.url), 'utf8');

test('every modal type has a game-viewport ceiling without transform scaling', () => {
  for (const panel of ['hero-select-panel', 'levelup-panel', 'trait-panel', 'shop-panel', 'results-panel', 'lobby-panel']) {
    assert.match(css, new RegExp('\\\\.' + panel + '\\\\s*\\\\{[^}]*max-height:\\s*calc\\\\(100% - 16px\\\\)'));
  }
  assert.doesNotMatch(css, /transform:\s*scale/);
  assert.match(mobile, /\.results-overlay \.results-actions button\s*\{[\s\S]*min-height:\s*44px;/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/modal-viewport-ceiling.test.mjs`

Expected: FAIL because hero select, level-up, trait, and shop do not all share a game-shell-relative ceiling.

- [ ] **Step 3: Write minimal implementation**

Add base CSS for the panel classes:

```css
.hero-select-panel,
.levelup-panel,
.trait-panel,
.shop-panel,
.results-panel,
.lobby-panel { max-height:calc(100% - 16px); }
```

For hero select, make `.hero-select-panel` a flex column and `.hero-grid` the internal scroll region. Preserve existing level-up and trait grid scrolling rules, and keep the shop footer/content split. Update mobile landscape rules only where they override a less restrictive max-height.

- [ ] **Step 4: Run tests to verify it passes**

Run: `node --test tests/modal-viewport-ceiling.test.mjs tests/mobile-landscape-modal.test.mjs tests/mobile-alert-typography.test.mjs`

Expected: PASS with all existing short-screen, text-floor, and touch-target checks intact.

- [ ] **Step 5: Commit**

```bash
git add src/styles.css index.html src/game/mobile-landscape-modal-styles.ts tests/mobile-landscape-modal.test.mjs tests/mobile-alert-typography.test.mjs tests/modal-viewport-ceiling.test.mjs
git commit -m "fix: constrain all modals to game viewport"
```

### Task 4: End-to-end verification and delivery

**Files:**
- Verify only: `src/ui/results.ts`, `src/ui/lobby.ts`, `src/styles.css`, `index.html`, `src/game/mobile-landscape-modal-styles.ts`

**Interfaces:**
- Consumes: the panel/body/footer classes produced in Tasks 1-3.
- Produces: evidence that no primary modal action is clipped by the viewport contract.

- [ ] **Step 1: Compile**

Run: `& .\\node_modules\\.bin\\tsc.cmd`

Expected: exit code 0.

- [ ] **Step 2: Run focused modal regression suite**

Run: `node --test tests/results-viewport-layout.test.mjs tests/lobby-viewport-layout.test.mjs tests/modal-viewport-ceiling.test.mjs tests/mobile-landscape-modal.test.mjs tests/mobile-alert-typography.test.mjs`

Expected: all tests pass.

- [ ] **Step 3: Inspect generated diff**

Run: `git diff --check`

Expected: no whitespace errors.

- [ ] **Step 4: Restore generated output**

Run: `git restore --worktree dist`

Expected: only source and test changes remain.

- [ ] **Step 5: Commit and push**

```bash
git add src/ui/results.ts src/ui/lobby.ts src/styles.css index.html src/game/mobile-landscape-modal-styles.ts tests
git commit -m "fix: keep modal actions within the game viewport"
git push origin codex/joystick-safe-area-contract
```
