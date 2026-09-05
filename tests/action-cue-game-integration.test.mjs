import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

test('phase 1463 Game routes assist and ready pulse through single-focus arbitration',()=>{
  assert.match(source,/actionCuePresentation/);
  assert.match(source,/assistActive\s*:/);
  assert.match(source,/readyPulseRequested\s*:/);
  assert.match(source,/readyPulseActive\s*:/);
});

test('phase 1471 queued state controls assist label visibility through arbitration',()=>{
  assert.match(source,/queued\s*:\s*queuedCast/);
  assert.match(source,/showAssistLabel/);
});

test('phase 1479 reduced flash is passed into cue arbitration',()=>{
  assert.match(source,/reducedFlash\s*:\s*this\.presentationSettings\.reducedFlash/);
});

test('phase 1487 assist consumption clears stale ready pulse state',()=>{
  assert.match(source,/clearReadyPulse/);
  assert.match(source,/ultimatePulseUntil\[button\.id\]\s*=\s*0/);
});
