import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const HOT_MONOLITHS = new Set([
  'src/game/game.ts',
  'src/game/enemies.ts',
]);

const normalized = (value) => value.replaceAll('\\', '/');

function sourceNeedles(sourcePath) {
  const path = normalized(sourcePath);
  if (!path.startsWith('src/') || HOT_MONOLITHS.has(path)) return [];

  const relative = path.slice('src/'.length);
  const jsRelative = relative.replace(/\.ts$/, '.js');
  return [
    path,
    relative,
    jsRelative,
    `dist/${jsRelative}`,
  ];
}

export function selectFastGateTests(changedPaths, testRecords) {
  const changed = [...new Set(changedPaths.map(normalized).filter(Boolean))];
  const selected = new Set(
    changed.filter((path) => /^tests\/.*\.test\.mjs$/.test(path)),
  );

  const needles = changed.flatMap(sourceNeedles);
  if (needles.length > 0) {
    for (const record of testRecords) {
      const testPath = normalized(record.path);
      if (!/^tests\/.*\.test\.mjs$/.test(testPath)) continue;
      if (needles.some((needle) => record.content.includes(needle))) selected.add(testPath);
    }
  }

  return [...selected].sort();
}

function changedPathsSince(base) {
  const output = execFileSync('git', ['diff', '--name-only', `${base}...HEAD`], {
    encoding: 'utf8',
  });
  return output.split(/\r?\n/).filter(Boolean);
}

function testRecordsFromDisk() {
  return fs.readdirSync('tests', { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.test.mjs'))
    .map((entry) => {
      const path = `tests/${entry.name}`;
      return { path, content: fs.readFileSync(path, 'utf8') };
    });
}

const invokedAsScript = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedAsScript) {
  const base = process.argv[2];
  if (!base) {
    console.error('usage: node scripts/fast-gate-select.mjs <base-ref>');
    process.exitCode = 2;
  } else {
    const selected = selectFastGateTests(changedPathsSince(base), testRecordsFromDisk());
    process.stdout.write(selected.join('\n'));
    if (selected.length > 0) process.stdout.write('\n');
  }
}
