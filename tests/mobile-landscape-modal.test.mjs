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

test('mobile landscape shop uses the full phone width and a single scroll region', () => {
  assert.match(style, /\.shop-overlay\s*\{[\s\S]*position:\s*fixed;[\s\S]*inset:\s*max\(0px, env\(safe-area-inset-top\)\)\s+max\(0px, env\(safe-area-inset-right\)\)\s+max\(0px, env\(safe-area-inset-bottom\)\)\s+max\(0px, env\(safe-area-inset-left\)\);[\s\S]*place-items:\s*stretch center;[\s\S]*overflow:\s*hidden;/);
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

test('very short phone landscape shop prioritizes item choices over card chrome', () => {
  assert.match(style, /@media\s*\(orientation:\s*landscape\)\s*and\s*\(max-height:\s*430px\)\s*and\s*\(max-width:\s*1024px\)/);
  assert.match(style, /\.shop-overlay \.shop-card\s*\{[\s\S]*min-height:\s*88px;/);
  assert.match(style, /\.shop-overlay \.shop-item-icon\s*\{[\s\S]*width:\s*30px;[\s\S]*height:\s*30px;/);
  assert.match(style, /\.shop-overlay \.shop-desc\s*\{[\s\S]*-webkit-line-clamp:\s*1;/);
});

test('short landscape keeps ordinary dialogs readable while compacting only their spacing', () => {
  assert.match(style, /\.modal-panel:not\(\.shop-panel\)\s*\{[\s\S]*padding:\s*14px 18px 16px;[\s\S]*border-radius:\s*20px;/);
  assert.match(style, /\.modal-panel:not\(\.shop-panel\) \.modal-subtitle\s*\{[\s\S]*margin-bottom:\s*8px;/);
  assert.doesNotMatch(style, /\.modal-panel:not\(\.shop-panel\)[^{]*\{[^}]*transform:\s*scale/);
});

test('short landscape decision dialogs reserve most height for internally scrollable choices', () => {
  assert.match(style, /\.lobby-overlay,[\s\S]*\.levelup-overlay,[\s\S]*\.trait-select-overlay,[\s\S]*\.fate-select-overlay\s*\{[\s\S]*position:\s*fixed;[\s\S]*inset:\s*max\(0px, env\(safe-area-inset-top\)\)/);
  assert.match(style, /\.levelup-panel,[\s\S]*\.trait-panel\s*\{[\s\S]*height:\s*calc\(100dvh - 24px\);[\s\S]*overflow:\s*hidden;/);
  assert.match(style, /\.levelup-panel \.upgrade-cards,[\s\S]*\.trait-panel \.trait-grid\s*\{[\s\S]*flex:\s*1 1 70%;[\s\S]*overflow-y:\s*auto;/);
  assert.match(style, /\.levelup-panel \.upgrade-card,[\s\S]*\.trait-panel \.trait-card\s*\{[\s\S]*min-height:\s*132px;/);
  assert.match(style, /\.levelup-panel \.upgrade-card > strong \+ span,[\s\S]*\.trait-panel \.trait-card > span:not\(\.trait-mark\):not\(\.fate-tradeoff-identities\)\s*\{[\s\S]*font-size:\s*12px;[\s\S]*line-height:\s*1\.3;/);
});

test('arcane sanctum uses a compact shard chip and shorter upgrade cards in short landscape', () => {
  assert.match(style, /\.lobby-overlay \.shard-wallet\s*\{[\s\S]*display:\s*inline-flex;[\s\S]*min-width:\s*0;[\s\S]*padding:\s*5px 10px;/);
  assert.match(style, /\.lobby-overlay \.lobby-grid\s*\{[\s\S]*margin-top:\s*6px;/);
  assert.match(style, /\.lobby-overlay \.lobby-upgrade-card\s*\{[\s\S]*min-height:\s*132px;[\s\S]*padding:\s*9px 11px;[\s\S]*display:\s*grid;[\s\S]*grid-template-columns:\s*34px minmax\(0,1fr\) auto;/);
  assert.match(style, /\.lobby-overlay \.lobby-upgrade-price\s*\{[\s\S]*grid-column:\s*3;[\s\S]*grid-row:\s*1 \/ span 3;/);
});

test('ultra-short landscape further compresses headers without shrinking touch targets', () => {
  assert.match(style, /@media\s*\(orientation:\s*landscape\)\s*and\s*\(max-height:\s*430px\)\s*and\s*\(max-width:\s*1024px\)[\s\S]*\.levelup-panel,[\s\S]*\.trait-panel\s*\{[\s\S]*height:\s*calc\(100dvh - 16px\);/);
  assert.match(style, /\.levelup-panel \.upgrade-card,[\s\S]*\.trait-panel \.trait-card,[\s\S]*\.lobby-overlay \.lobby-upgrade-card\s*\{[\s\S]*min-height:\s*116px;/);
});
