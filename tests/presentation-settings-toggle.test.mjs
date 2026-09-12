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

test('phone landscape settings use the side gutter and keep every setting button touchable', () => {
  assert.match(main, /const phoneLandscape\s*=\s*isPhoneLandscapeSettings\(\)/);
  assert.match(main, /settingsPanel\.style\.position\s*=\s*phoneLandscape\s*\?\s*'fixed'\s*:\s*'absolute'/);
  assert.match(main, /settingsPanel\.style\.flexDirection\s*=\s*phoneLandscape\s*\?\s*'column'\s*:\s*'row-reverse'/);
  assert.match(main, /presentationControls\.style\.display\s*=\s*phoneLandscape\s*\?\s*'grid'\s*:\s*'flex'/);
  assert.match(main, /presentationControls\.style\.gridTemplateColumns\s*=\s*phoneLandscape\s*\?\s*'repeat\(3,minmax\(0,1fr\)\)'\s*:\s*''/);
  assert.match(main, /settingsBody\.style\.maxHeight\s*=\s*phoneLandscape\s*\?\s*'calc\(100dvh - 128px\)'\s*:\s*''/);
  assert.match(main, /presentationControls\.querySelectorAll<HTMLButtonElement>\('button'\)/);
  assert.match(main, /button\.style\.minHeight\s*=\s*phoneLandscape\s*\?\s*'44px'\s*:\s*''/);
  assert.match(main, /button\.style\.fontSize\s*=\s*phoneLandscape\s*\?\s*'11px'\s*:\s*''/);
});
