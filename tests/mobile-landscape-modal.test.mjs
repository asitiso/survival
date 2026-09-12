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

test('mobile landscape dialogs keep readable scale instead of shrinking the whole panel', () => {
  assert.doesNotMatch(style, /zoom\s*:/);
  assert.doesNotMatch(style, /--mobile-modal-scale\s*:/);
});

test('mobile landscape shop uses horizontal space and a single scroll region', () => {
  assert.match(style, /\.shop-overlay\s*\{[\s\S]*place-items:\s*stretch center;[\s\S]*overflow:\s*hidden;/);
  assert.match(style, /\.shop-overlay \.shop-panel\s*\{[\s\S]*height:\s*calc\(100dvh - 12px\);[\s\S]*max-height:\s*none;/);
  assert.match(style, /\.shop-overlay \.shop-content\s*\{[\s\S]*overflow-y:\s*auto;/);
  assert.match(style, /\.shop-overlay \.shop-inventory-grid\s*\{[\s\S]*grid-template-columns:\s*repeat\(6,minmax\(0,1fr\)\);/);
});

test('mobile landscape purchase cards are compact horizontal cards with usable touch targets', () => {
  assert.match(style, /\.shop-overlay \.shop-card\s*\{[\s\S]*min-height:\s*100px;[\s\S]*display:\s*grid;[\s\S]*grid-template-columns:\s*minmax\(0,1fr\) auto;/);
  assert.match(style, /\.shop-overlay \.shop-price\s*\{[\s\S]*grid-column:\s*2;/);
  assert.match(style, /\.shop-overlay \.shop-desc\s*\{[\s\S]*-webkit-line-clamp:\s*2;/);
  assert.match(style, /\.shop-overlay \.shop-footer button\s*\{[\s\S]*min-height:\s*44px;/);
  assert.match(style, /@media\s*\(orientation:\s*landscape\)\s*and\s*\(max-height:\s*500px\)\s*and\s*\(max-width:\s*1024px\)[\s\S]*\.shop-overlay \.shop-card\s*\{[\s\S]*min-height:\s*96px;/);
});
