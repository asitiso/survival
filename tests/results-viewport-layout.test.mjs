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
