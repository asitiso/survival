import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const gameSource=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

test('phase 1876 battlefield objectives reuse tactical atlas and attention policy',()=>{
  assert.match(gameSource,/objectiveMarkerMotionPolicy/);
  assert.match(gameSource,/tacticalStatusIconPresentation\(active\.id\)/);
  assert.match(gameSource,/markerMotion\.motionAmplitude/);
  assert.match(gameSource,/this\.presentationSettings\.reducedFlash/);
});

test('objective progress ring and label remain present as fallback information',()=>{
  assert.match(gameSource,/Math\.PI \* 2 \* clamp\(ratio, 0, 1\)/);
  assert.match(gameSource,/active\.id === 'cursedAltar' && !active\.activated \? 'ENTER' : def\.name/);
});
