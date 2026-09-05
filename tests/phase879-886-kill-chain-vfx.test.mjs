import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const mod=await import('../dist/game/combat-feedback.js');

test('phase 879-882 kill chain tracker emits only meaningful 6 14 28 kill thresholds',()=>{
  assert.equal(typeof mod.KillChainVfxTracker,'function');
  const tracker=new mod.KillChainVfxTracker();
  const cues=[];
  for(let i=0;i<28;i++){ const cue=tracker.record(i*0.03); if(cue)cues.push(cue); }
  assert.deepEqual(cues.map((c)=>c.count),[6,14,28]);
  assert.deepEqual(cues.map((c)=>c.tier),[1,2,3]);
});

test('phase 883-884 kill chain window resets cleanly and visual density stays bounded',()=>{
  const tracker=new mod.KillChainVfxTracker();
  for(let i=0;i<5;i++) tracker.record(i*.05);
  assert.equal(tracker.record(2),null);
  const profile=mod.killChainVfxProfile(3);
  assert.ok(profile.rayCount<=12);
  assert.ok(profile.pulseAlpha<=0.24);
  assert.ok(profile.shake<=5.5);
});

test('phase 885-886 game connects kill chains to screen pulse camera pressure and a dedicated cue',()=>{
  const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  const deaths=source.slice(source.indexOf('private processEnemyDeaths'),source.indexOf('private updateLongRunRewardRate'));
  const block=deaths.length>100?deaths:source.slice(source.indexOf('private processEnemyDeaths'),source.indexOf('private applyEndlessEffects'));
  assert.match(source,/KillChainVfxTracker/);
  assert.match(block,/killChainVfx\.record/);
  assert.match(source,/drawKillChainCue/);
  assert.match(source,/addCameraPressure\('killChain'\)/);
});
