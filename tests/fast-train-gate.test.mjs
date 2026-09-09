import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const selectorUrl = new URL('../scripts/fast-gate-select.mjs', import.meta.url);
const workflowUrl = new URL('../.github/workflows/fast-gate.yml', import.meta.url);

async function loadSelector() {
  assert.equal(
    fs.existsSync(selectorUrl),
    true,
    'Fast Train selector must exist before the optimized gate can run',
  );
  return import(selectorUrl.href);
}

const records = (...entries) => entries.map(([path, content]) => ({ path, content }));

test('changed test files are always selected', async () => {
  const { selectFastGateTests } = await loadSelector();
  const selected = selectFastGateTests(
    ['tests/phase4881-depth.test.mjs', 'src/game/example-rendering.ts'],
    records(
      ['tests/phase4881-depth.test.mjs', "import '../dist/game/example-rendering.js';"],
      ['tests/unrelated.test.mjs', "import '../dist/game/other.js';"],
    ),
  );

  assert.deepEqual(selected, ['tests/phase4881-depth.test.mjs']);
});

test('dedicated source modules automatically pull directly coupled regression tests', async () => {
  const { selectFastGateTests } = await loadSelector();
  const selected = selectFastGateTests(
    ['src/game/enemy-actor-depth-ordering.ts'],
    records(
      ['tests/actor-depth.test.mjs', "import '../dist/game/enemy-actor-depth-ordering.js';"],
      ['tests/source-contract.test.mjs', "new URL('../src/game/enemy-actor-depth-ordering.ts', import.meta.url);"],
      ['tests/unrelated.test.mjs', "import '../dist/game/terrain.js';"],
    ),
  );

  assert.deepEqual(selected, ['tests/actor-depth.test.mjs', 'tests/source-contract.test.mjs']);
});

test('hot monolith changes do not fan out into hundreds of static-reference tests', async () => {
  const { selectFastGateTests } = await loadSelector();
  const selected = selectFastGateTests(
    ['src/game/game.ts', 'tests/focused-game-change.test.mjs'],
    records(
      ['tests/focused-game-change.test.mjs', "const game = '../src/game/game.ts';"],
      ['tests/legacy-a.test.mjs', "new URL('../src/game/game.ts', import.meta.url);"],
      ['tests/legacy-b.test.mjs', "new URL('../src/game/game.ts', import.meta.url);"],
    ),
  );

  assert.deepEqual(selected, ['tests/focused-game-change.test.mjs']);
});

test('selection is unique and deterministic', async () => {
  const { selectFastGateTests } = await loadSelector();
  const selected = selectFastGateTests(
    ['tests/z.test.mjs', 'src/game/foo-rendering.ts', 'tests/a.test.mjs'],
    records(
      ['tests/z.test.mjs', "import '../dist/game/foo-rendering.js';"],
      ['tests/a.test.mjs', "import '../dist/game/foo-rendering.js';"],
      ['tests/m.test.mjs', "import '../dist/game/foo-rendering.js';"],
    ),
  );

  assert.deepEqual(selected, ['tests/a.test.mjs', 'tests/m.test.mjs', 'tests/z.test.mjs']);
});

test('Fast Gate uses one generic selector instead of a hard-coded elite-affix regression pass', () => {
  const workflow = fs.readFileSync(workflowUrl, 'utf8');
  assert.match(workflow, /node scripts\/fast-gate-select\.mjs/);
  assert.doesNotMatch(workflow, /Related elite-affix regression/);
  assert.doesNotMatch(workflow, /\*swift\*\.test\.mjs/);
  assert.doesNotMatch(workflow, /\*frenzied\*\.test\.mjs/);
});
