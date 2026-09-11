import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(resolve(here, '../index.html'), 'utf8');
const style = html.match(/<style data-mobile-landscape-modal>([\s\S]*?)<\/style>/)?.[1] ?? '';

test('mobile landscape modal remains reachable on short screens', () => {
  assert.match(style, /@media\s*\(orientation:\s*landscape\)\s*and\s*\(max-height:\s*600px\)\s*and\s*\(max-width:\s*1024px\)/);
  assert.match(style, /\.modal-overlay\s*\{[\s\S]*place-items:\s*start center;/);
  assert.match(style, /overflow-y:\s*auto;/);
  assert.match(style, /touch-action:\s*pan-y;/);
});

test('mobile landscape dialogs use adaptive compact scale tiers', () => {
  assert.match(style, /--mobile-modal-scale:\s*0\.8;/);
  assert.match(style, /\.modal-panel\s*\{[\s\S]*zoom:\s*var\(--mobile-modal-scale\);/);
  assert.match(style, /@media\s*\(orientation:\s*landscape\)\s*and\s*\(max-height:\s*500px\)\s*and\s*\(max-width:\s*1024px\)[\s\S]*--mobile-modal-scale:\s*0\.74;/);
});
