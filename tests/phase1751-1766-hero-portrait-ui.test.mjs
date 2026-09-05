import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('hero select renders portrait atlas coordinates while preserving the orb fallback', () => {
  const source = fs.readFileSync(new URL('../src/ui/hero-select.ts', import.meta.url), 'utf8');
  const css = fs.readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
  assert.match(source, /heroPortraitPresentation/);
  assert.match(source, /hero-orb hero-portrait/);
  assert.match(source, /--hero-portrait-x/);
  assert.match(source, /--hero-portrait-y/);
  assert.match(css, /\.hero-portrait\s*\{/);
  assert.match(css, /hero-portraits\.png/);
  assert.match(css, /background-size:\s*200% 200%/);
  assert.match(css, /radial-gradient\(circle at 35% 30%/);
});

test('mobile hero portrait sizing remains bounded so hero copy keeps its existing card space', () => {
  const css = fs.readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
  assert.match(css, /\.hero-portrait\s*\{[^}]*width:84px;[^}]*height:84px;/s);
  assert.match(css, /@media \(max-width:1000px\)[\s\S]*\.hero-portrait\{width:58px;height:58px\}/);
});
