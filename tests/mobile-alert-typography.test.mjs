import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const style = html.match(/<style data-mobile-landscape-modal>([\s\S]*?)<\/style>/)?.[1] ?? '';

test('short mobile alerts keep decision copy legible while compacting their chrome', () => {
  assert.match(style, /\.modal-panel:not\(\.shop-panel\) \.modal-subtitle\s*\{[\s\S]*font-size:\s*12px;/);
  assert.match(style, /\.levelup-panel \.upgrade-card strong,[\s\S]*\.trait-panel \.trait-card strong\s*\{[\s\S]*font-size:\s*15px;/);
  assert.match(style, /\.levelup-panel \.upgrade-card > strong \+ span,[\s\S]*font-size:\s*12px;/);
});

test('short mobile shop keeps body and status copy above the shared alert text floors', () => {
  assert.match(style, /\.shop-overlay \.shop-desc\s*\{[\s\S]*font-size:\s*12px;/);
  assert.match(style, /\.shop-overlay \.shop-card strong\s*\{[\s\S]*font-size:\s*15px;/);
  assert.match(style, /\.shop-overlay \.shop-purchase-delta\s*\{[\s\S]*font-size:\s*11px;/);
  assert.match(style, /\.shop-overlay \.shop-kind\s*\{[\s\S]*font-size:\s*11px;/);
});
