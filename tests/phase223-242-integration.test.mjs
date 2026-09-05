import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ACTION_BUTTONS } from '../dist/game/config.js';
import { defaultRasterBaselineReport } from '../dist/game/render-raster-baseline-report.js';
import { auditDefaultRasterBaselines } from '../dist/game/render-raster-baseline.js';
import { renderContract, auditRenderContract } from '../dist/game/render-contract.js';

const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const input=fs.readFileSync(new URL('../src/core/input.ts',import.meta.url),'utf8');
const snapshot=fs.readFileSync(new URL('../src/game/endless/snapshot.ts',import.meta.url),'utf8');

test('phase 223-242 keeps exactly nine combat actions and adds no transient snapshot fields',()=>{
  assert.equal(ACTION_BUTTONS.length,9);
  for(const token of ['finalFormEvadeFinisher','safeLaneForecast','mythicSafeZonePressure','foldableTouchScaleMap','rasterBaselineReport'])assert.equal(snapshot.includes(token),false,token);
});

test('game and input wire all phase 223-242 systems through existing seams',()=>{
  for(const token of ['finalFormEvadeFinisher','safeLaneForecast','mythicSafeZonePressure'])assert.ok(game.includes(token),token);
  assert.ok(input.includes('foldableTouchScaleMap'));
  assert.ok(game.includes('finisher.chainTargets'));
  assert.ok(game.includes('forecast.transitionMs'));
});

test('all five representative render contracts remain structurally valid',()=>{
  for(const [w,h] of [[1600,900],[2400,1080],[1200,900],[2208,1840],[3840,1080]]){
    const audit=auditRenderContract(renderContract(w,h));
    assert.equal(audit.ok,true,`${w}x${h}:${audit.issues.join(',')}`);
  }
});

test('committed raster baseline and approval report both pass the current tree',()=>{
  const legacy=auditDefaultRasterBaselines();
  const report=defaultRasterBaselineReport();
  assert.equal(legacy.ok,true,legacy.issues.join(','));
  assert.equal(report.ok,true,report.issues.join(','));
  assert.equal(report.entries.length,5);
});
