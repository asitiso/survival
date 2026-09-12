import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const main = readFileSync(resolve(here, '../src/main.ts'), 'utf8');

test('presentation settings are wrapped in one accessible collapsible panel', () => {
  assert.match(main, /querySelector<HTMLDivElement>\('\.presentation-controls'\)/);
  assert.match(main, /presentation-settings-panel/);
  assert.match(main, /presentation-settings-body/);
  assert.match(main, /aria-expanded/);
  assert.match(main, /aria-controls/);
  assert.match(main, /settingsBody\.hidden\s*=\s*!expanded/);
});

test('phone landscape defaults the whole settings panel closed while larger layouts stay expanded', () => {
  assert.match(main, /orientation:\s*landscape/);
  assert.match(main, /max-height:\s*520px/);
  assert.match(main, /max-width:\s*1024px/);
  assert.match(main, /let expanded\s*=\s*!isPhoneLandscapeSettings\(\)/);
});

test('settings toggle remains comfortably tappable and does not recreate setting controls', () => {
  assert.match(main, /settingsToggle\.style\.minHeight\s*=\s*'44px'/);
  assert.match(main, /settingsBody\.append\(presentationControls\)/);
  assert.doesNotMatch(main, /presentationSettings\.quality\s*=/);
});

test('settings wrapper keeps the original parent before moving the controls', () => {
  assert.match(main, /const settingsParent\s*=\s*presentationControls\.parentElement/);
  assert.match(main, /settingsParent\.append\(settingsPanel\)/);
  assert.doesNotMatch(main, /presentationControls\.parentElement\?\.append\(settingsPanel\)/);
});
