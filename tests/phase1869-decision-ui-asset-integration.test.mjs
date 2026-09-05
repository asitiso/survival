import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const trait=fs.readFileSync(new URL('../src/ui/trait-select.ts', import.meta.url),'utf8');
const fate=fs.readFileSync(new URL('../src/ui/fate-select.ts', import.meta.url),'utf8');
const level=fs.readFileSync(new URL('../src/ui/levelup.ts', import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css', import.meta.url),'utf8');

test('trait and fate cards render decision-path image icons while retaining their mark fallback',()=>{
  assert.match(trait,/decisionPathIconStyle/);
  assert.match(fate,/decisionPathIconStyle/);
  assert.match(trait,/trait-mark decision-path-icon/);
  assert.match(fate,/trait-mark decision-path-icon/);
  assert.match(css,/\.decision-path-icon\s*\{/);
  assert.match(css,/radial-gradient\(circle,#fff 0 7%,var\(--accent\)/);
});

test('level-up and boss reward cards render growth icons without removing text or recommendation badges',()=>{
  assert.match(level,/growthChoiceIconStyle/);
  assert.match(level,/upgrade-icon growth-choice-icon/);
  assert.match(level,/choice\.badge/);
  assert.match(level,/<strong>\$\{choice\.title\}<\/strong>/);
  assert.match(css,/\.growth-choice-icon\s*\{/);
});

test('compact landscape sizing keeps decision copy readable',()=>{
  assert.match(css,/@media \(max-width:1000px\)[\s\S]*\.decision-path-icon[^}]*40px/s);
  assert.match(css,/@media \(max-width:1000px\)[\s\S]*\.growth-choice-icon[^}]*40px/s);
});
