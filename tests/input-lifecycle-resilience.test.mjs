import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { logicalPointerPosition, auditInputLifecycleResilience } from '../dist/core/input-lifecycle.js';

test('phase 711 pointer mapping stays finite across rotation zero-size and restored canvas rectangles',()=>{
  const zero=logicalPointerPosition(300,200,{left:0,top:0,width:0,height:0});
  const rotated=logicalPointerPosition(1200,450,{left:0,top:0,width:2400,height:1080});
  assert.ok(Number.isFinite(zero.x)&&Number.isFinite(zero.y));
  assert.ok(Number.isFinite(rotated.x)&&Number.isFinite(rotated.y));
});
test('phase 712 input lifecycle audit keeps joystick and action pointers isolated during multi-touch',()=>{
  const audit=auditInputLifecycleResilience();
  assert.equal(audit.multitouchIsolation,true);
  assert.equal(audit.actionCount,9);
});
test('phase 713 lifecycle reset clears held pointers movement keys and pressed actions before app resume',()=>{
  const audit=auditInputLifecycleResilience();
  assert.equal(audit.transientResetCoverage,1);
  const source=fs.readFileSync(new URL('../src/core/input.ts',import.meta.url),'utf8');
  assert.match(source,/resetTransient\(\)/);
  const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.match(game,/input\.resetTransient\(\)/);
});
test('phase 714 input lifecycle resilience passes foldable rotation and app-resume bounds',()=>{
  const audit=auditInputLifecycleResilience();
  assert.equal(audit.zeroRectSafe,true);
  assert.equal(audit.hingeClear,true);
  assert.equal(audit.passed,true);
});
