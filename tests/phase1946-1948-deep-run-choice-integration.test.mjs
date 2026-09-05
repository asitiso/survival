import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { contractChoiceCards } from '../dist/game/endless/host.js';
import { deepRunDecisionIdentityStyle } from '../dist/game/deep-run-decision-identity-assets.js';

test('phase 1946 level-up cards accept an optional deep-run identity style while preserving growth fallback', () => {
  const source=fs.readFileSync(new URL('../src/ui/levelup.ts', import.meta.url),'utf8');
  assert.match(source,/identityIconStyle\?: string/);
  assert.match(source,/choice\.identityIconStyle\s*\?\?/);
  assert.match(source,/growthChoiceIconStyle/);
});

test('phase 1946 hero ascension choices map their option id to the shared deep-run atlas', () => {
  const source=fs.readFileSync(new URL('../src/game/game.ts', import.meta.url),'utf8');
  assert.match(source,/deepRunDecisionIdentityStyle\(\{kind:'ascension',id:option\.optionId\}\)/);
  assert.match(source,/identityIconStyle/);
});

test('phase 1948 contract cards use the shared family identity without changing option ids', () => {
  const options=[
    {optionId:'o:slayer',family:'slayer',title:'Slayer',description:'x',target:10,durationMs:1000},
    {optionId:'o:warden',family:'warden',title:'Warden',description:'x',target:10,durationMs:1000},
    {optionId:'o:arcane',family:'arcane',title:'Arcane',description:'x',target:10,durationMs:1000},
  ];
  const cards=contractChoiceCards(options);
  assert.deepEqual(cards.map(c=>c.optionId),options.map(o=>o.optionId));
  for(const card of cards){
    assert.equal(card.identityIconStyle,deepRunDecisionIdentityStyle({kind:'contract',id:card.family}));
    assert.match(card.identityIconStyle,/deep-run-decision-icons\.png/);
  }
});
