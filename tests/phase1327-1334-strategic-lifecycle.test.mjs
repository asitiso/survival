import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
function method(start,end){ const a=source.indexOf(start); const b=source.indexOf(end,a+start.length); return a>=0&&b>a?source.slice(a,b):''; }

test('phase 1327 manual pause clears strategic action arms when pause becomes active',()=>{
  const block=method('toggleManualPause(): boolean','get manuallyPaused');
  assert.match(block,/if \(paused\)[\s\S]*input\.clearStrategicActionArms\(\)/);
});

test('phase 1330 entering a decision session clears strategic action arms before pausing',()=>{
  const block=method('private continueDecisionSession','private finishDecisionPick');
  assert.match(block,/if \(!this\.decisionSessionActive\)[\s\S]*input\.clearStrategicActionArms\(\)/);
});

test('phase 1333 opening shop clears any independently armed strategic pointer',()=>{
  const block=method('private openShop(): void','private refreshShopOverlay');
  assert.match(block,/input\.clearStrategicActionArms\(\)/);
});

test('phase 1334 resetRun clears strategic action arms so a new run cannot inherit an old release',()=>{
  const block=method('private resetRun(','private update(dt: number)');
  assert.match(block,/input\.clearStrategicActionArms\(\)/);
});
