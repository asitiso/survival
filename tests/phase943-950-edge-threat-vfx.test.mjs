import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { edgeThreatVfxProfile, edgeThreatIndicator } from '../dist/game/visual-rhythm.js';

test('phase 943-945 edge threat intensity rises without exceeding flash-safe alpha',()=>{
  const watch=edgeThreatVfxProfile('watch','hero'), danger=edgeThreatVfxProfile('danger','hero'), critical=edgeThreatVfxProfile('critical','hero');
  assert.ok(watch.alpha<danger.alpha&&danger.alpha<critical.alpha);
  assert.ok(critical.alpha<=0.24);
  assert.ok(critical.segmentCount<=3);
});

test('phase 946-948 edge threat indicator resolves nearest screen edge deterministically',()=>{
  assert.equal(edgeThreatIndicator({x:30,y:450},1600,900).edge,'left');
  assert.equal(edgeThreatIndicator({x:1570,y:450},1600,900).edge,'right');
  assert.equal(edgeThreatIndicator({x:800,y:35},1600,900).edge,'top');
  assert.equal(edgeThreatIndicator({x:800,y:865},1600,900).edge,'bottom');
});

test('phase 949-950 game renders edge threat after world transform and before HUD',()=>{
  const src=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.match(src,/drawEdgeThreatVfx\(ctx\)/);
  assert.ok(src.indexOf('ctx.restore();\n    this.drawDangerVignette(ctx);')<src.indexOf('this.drawEdgeThreatVfx(ctx);') || src.indexOf('this.drawDangerVignette(ctx);')<src.indexOf('this.drawEdgeThreatVfx(ctx);'));
  assert.ok(src.indexOf('this.drawEdgeThreatVfx(ctx);')<src.indexOf('this.drawHud(ctx);'));
});
