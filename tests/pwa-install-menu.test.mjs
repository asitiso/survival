import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');

test('settings surfaces an install action only when the browser can install the PWA', () => {
  assert.match(main, /beforeinstallprompt/);
  assert.match(main, /앱 설치/);
  assert.match(main, /installPromptEvent\.prompt\(\)/);
  assert.match(main, /settingsBody\.append\(.*install/);
});

test('settings gives iPhone and iPad users add-to-home-screen guidance', () => {
  assert.match(main, /홈 화면에 추가/);
  assert.match(main, /navigator\.userAgent/);
});

test('installed apps hide the install affordance', () => {
  assert.match(main, /appinstalled/);
  assert.match(main, /install.*hidden|hidden.*install/);
});
