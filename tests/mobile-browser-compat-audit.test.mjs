import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { auditMobileBrowserCompatibility } from '../dist/game/mobile-browser-compat-audit.js';

test('phase 735 mobile browser audit covers current iPhone Android tablet and foldable landscape viewport classes',()=>{const a=auditMobileBrowserCompatibility();assert.ok(a.profileCount>=5);assert.equal(a.finitePointerCoverage,1);assert.ok(a.aspectClasses.includes('standard'));assert.ok(a.aspectClasses.includes('foldable'));});
test('phase 736 every mobile browser profile keeps nine reachable actions and the foldable hinge clear',()=>{const a=auditMobileBrowserCompatibility();assert.equal(a.actionCount,9);assert.equal(a.reachableActionCount,9);assert.equal(a.hingeClear,true);});
test('phase 737 browser shell uses viewport-fit cover safe-area padding touch-action and overscroll protection',()=>{const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');assert.match(html,/viewport-fit=cover/);assert.match(css,/safe-area-inset/);assert.match(css,/touch-action:none/);assert.match(css,/overscroll-behavior:none/);});
test('phase 738 compatibility audit keeps lifecycle return paths and finite zero-size mapping release-safe',()=>{const a=auditMobileBrowserCompatibility();const main=fs.readFileSync(new URL('../src/main.ts',import.meta.url),'utf8');assert.equal(a.zeroRectSafe,true);assert.equal(a.lifecycleCoverage,1);assert.match(main,/pageshow/);assert.match(main,/visibilitychange/);assert.equal(a.passed,true);});
