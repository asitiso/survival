import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const config=fs.readFileSync(new URL('../src/game/config.ts',import.meta.url),'utf8');
const block=(start,end)=>{const a=game.indexOf(start);const b=game.indexOf(end,a+start.length);return a>=0?game.slice(a,b>=0?b:undefined):'';};

test('phase 1159-1162 queued readiness feedback is derived from the existing cast buffer inside drawControls',()=>{
  const draw=block('private drawControls','private handleFieldEventStart');
  assert.match(draw,/queuedCast/);
  assert.match(draw,/castIntentBuffer\.isQueued/);
  assert.match(draw,/COMBAT_CAST_ACTIONS\.includes/);
});

test('phase 1163 queued feedback replaces only the existing secondary action label',()=>{
  const draw=block('private drawControls','private handleFieldEventStart');
  assert.match(draw,/queuedCast\s*\?\s*'QUEUED'/);
  assert.equal((game.match(/'QUEUED'/g)??[]).length,1);
});

test('phase 1164-1166 feedback adds no new action button or persisted field',()=>{
  const actionEntries=(config.match(/id:\s*'(?:spell[1-4]|ultimate[1-2]|potion|shop|auto)'/g)??[]).length;
  assert.equal(actionEntries,9);
  const snapshot=fs.readFileSync(new URL('../src/domain/run-snapshot.ts',import.meta.url),'utf8');
  assert.doesNotMatch(snapshot,/queuedCast|castIntentBuffer|castIntent/i);
});
