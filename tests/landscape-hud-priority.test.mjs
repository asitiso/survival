import test from 'node:test';
import assert from 'node:assert/strict';
import { prioritizeLandscapeBuildLabels } from '../dist/game/landscape-hud.js';

const labels=['유물 · 왕관','최종형 · 천둥 폭군','REPLAY 72% · 연쇄 Lv.10','SIGNATURE · 폭풍의 눈','서약 · 보스 사냥','OVERDRIVE · 순환'];

test('phase 139 boss combat keeps critical active-state labels ahead of passive history',()=>{
  const out=prioritizeLandscapeBuildLabels(labels,{bossActive:true,mythicActive:false,longRunTier:0,maxLabels:4});
  assert.ok(out.length<=3);
  assert.ok(out.some((x)=>x.startsWith('SIGNATURE')));
  assert.ok(out.some((x)=>x.startsWith('OVERDRIVE')));
  assert.ok(!out.includes('유물 · 왕관'));
});

test('normal play keeps replay guidance and up to four readable labels',()=>{
  const out=prioritizeLandscapeBuildLabels(labels,{bossActive:false,mythicActive:false,longRunTier:0,maxLabels:4});
  assert.ok(out.length<=4);
  assert.ok(out.some((x)=>x.startsWith('REPLAY')));
  assert.ok(out.some((x)=>x.startsWith('최종형')));
});

test('mythic and deep long-run contexts cap noncritical HUD density',()=>{
  const out=prioritizeLandscapeBuildLabels(labels,{bossActive:true,mythicActive:true,longRunTier:3,maxLabels:4});
  assert.ok(out.length<=2);
  assert.ok(out.every((x)=>!x.startsWith('유물')));
});
