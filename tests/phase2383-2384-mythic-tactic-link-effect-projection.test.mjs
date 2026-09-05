import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const projectionUrl=new URL('../dist/game/endless/mythic-tactic-attack-link-projection.js',import.meta.url);
const linkUrl=new URL('../dist/game/endless/mythic-tactic-attack-link.js',import.meta.url);

test('phase 2383 tactic-link projection reads the active authoritative link and exposes five effective channels',async()=>{
  assert.equal(fs.existsSync(projectionUrl),true,'projection module must exist');
  const {projectMythicTacticAttackLink}=await import(projectionUrl.href);
  const {createMythicTacticAttackLink}=await import(linkUrl.href);
  const link=createMythicTacticAttackLink('timeEater',1000,5000);
  const p=projectMythicTacticAttackLink(link,2000,'timeEater');
  assert.ok(p);assert.equal(p.effects.length,5);
  assert.deepEqual(p.effects.map(e=>e.id),['projectile-count','summon-count','dash-distance','time-warp-pressure','next-cadence']);
  assert.deepEqual(p.effects.map(e=>e.multiplier),[link.projectileCountMultiplier,link.summonCountMultiplier,link.dashDistanceMultiplier,link.timeWarpPressureMultiplier,link.nextCadenceMultiplier]);
});

test('phase 2384 projection selects the two largest real effects with deterministic tie ordering',async()=>{
  const {projectMythicTacticAttackLink}=await import(projectionUrl.href);
  const {createMythicTacticAttackLink}=await import(linkUrl.href);
  const inferno=projectMythicTacticAttackLink(createMythicTacticAttackLink('inferno',1000,5000),2000,'inferno');
  assert.ok(inferno);assert.deepEqual(inferno.primaryEffects.map(e=>e.id),['projectile-count','summon-count']);
  assert.deepEqual(inferno.primaryEffects.map(e=>e.label),['탄막 -24%','소환 -8%']);
  const time=projectMythicTacticAttackLink(createMythicTacticAttackLink('timeEater',1000,5000),2000,'timeEater');
  assert.ok(time);assert.deepEqual(time.primaryEffects.map(e=>e.id),['time-warp-pressure','next-cadence']);
  assert.deepEqual(time.primaryEffects.map(e=>e.label),['시간압박 -28%','다음주기 +22%']);
});

test('phase 2384 projection fails closed for expired consumed or mismatched links',async()=>{
  const {projectMythicTacticAttackLink}=await import(projectionUrl.href);
  const {createMythicTacticAttackLink,consumeMythicTacticAttackLink}=await import(linkUrl.href);
  const link=createMythicTacticAttackLink('summoner',1000,4000);
  assert.equal(projectMythicTacticAttackLink(link,5001,'summoner'),null);
  assert.equal(projectMythicTacticAttackLink(consumeMythicTacticAttackLink(link),1200,'summoner'),null);
  assert.equal(projectMythicTacticAttackLink(link,1200,'inferno'),null);
});
