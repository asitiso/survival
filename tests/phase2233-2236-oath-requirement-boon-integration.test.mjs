import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const oath=fs.readFileSync(new URL('../src/game/endless/long-run-oaths.ts',import.meta.url),'utf8');
const snapshot=fs.readFileSync(new URL('../src/game/endless/snapshot.ts',import.meta.url),'utf8');
const profileUrl=new URL('../dist/game/oath-requirement-boon-identity.js',import.meta.url);

test('phase 2233 maps each oath requirement to its actual existing boon outcome',async()=>{
  assert.equal(fs.existsSync(profileUrl),true,'oath requirement/boon profile module must exist');
  const m=await import(profileUrl.href);
  assert.deepEqual(m.oathRequirementBoonIdentity('slayer'),{requirementId:'slayer',boonId:'power'});
  assert.deepEqual(m.oathRequirementBoonIdentity('elite_hunt'),{requirementId:'elite_hunt',boonId:'prosperity'});
  assert.deepEqual(m.oathRequirementBoonIdentity('boss_hunt'),{requirementId:'boss_hunt',boonId:'boss'});
  assert.deepEqual(m.oathRequirementBoonIdentity('arcane_flow'),{requirementId:'arcane_flow',boonId:'power'});
  assert.deepEqual(m.oathRequirementBoonIdentity('core_guard'),{requirementId:'core_guard',boonId:'guard'});
  assert.deepEqual(m.oathRequirementBoonIdentity('endure'),{requirementId:'endure',boonId:'guard'});
});

test('phase 2234 oath start toast keeps the oath identity and previews requirement plus boon helpers',()=>{
  assert.match(game,/eventToastOathHelper/);
  assert.match(game,/effect\.type === 'oath_started'[\s\S]*oathRequirementBoonIdentity/);
  assert.match(game,/drawLongRunOathHelperToastIcons/);
});

test('phase 2235 active oath row adds requirement plus boon preview in the existing row only',()=>{
  assert.match(game,/drawLongRunOathRequirementBoonRecall/);
  assert.match(game,/label\.startsWith\('서약'\)[\s\S]*drawDeepRunDecisionIdentityHud[\s\S]*drawLongRunOathRequirementBoonRecall/);
  assert.match(game,/hideLongRunOathHelperIdentity/);
  assert.match(game,/bossSpecialTimer\s*<=\s*1\.2/);
  const recallBody=game.match(/private drawLongRunOathRequirementBoonRecall[\s\S]*?\n  }/)?.[0]??'';
  assert.match(recallBody,/requirementId\),x=377/,'requirement helper must stay inside the existing 440px row');
  assert.match(recallBody,/boonId\),x=401/,'boon helper must stay inside the existing 440px row');
  assert.doesNotMatch(recallBody,/x=449|x=473/,'oath helpers must not spill outside the existing row');
});

test('phase 2236 success toast uses the actual active boon while failure and expiry never claim a boon',()=>{
  assert.match(game,/effect\.type === 'oath_completed'[\s\S]*this\.endlessState\.oaths\.boon\?\.kind/);
  assert.match(game,/effect\.type === 'oath_failed'[\s\S]*eventToastOathHelper\s*=\s*null/);
  assert.match(game,/effect\.type === 'oath_expired'[\s\S]*eventToastOathHelper\s*=\s*null/);
});

test('phase 2233-2236 keeps long-run oath gameplay and snapshot schema frozen',()=>{
  assert.match(oath,/LONG_RUN_OATH_MILESTONES\s*=\s*\[120,150,180,240,300,360\]/);
  assert.match(oath,/active\.coreDamage\s*>\s*active\.baselineCoreHp\s*\*\s*\.12/);
  assert.match(oath,/expiresAtMs:now \+ 90_000/);
  assert.match(oath,/prosperity'\) out\.goldMultiplier=1\.16/);
  assert.match(oath,/power'\) out\.spellPowerMultiplier=1\.09/);
  assert.match(oath,/guard'\) out\.coreDamageTakenMultiplier=\.88/);
  assert.match(oath,/boss'\) out\.bossDamageMultiplier=1\.1/);
  assert.doesNotMatch(snapshot,/oathRequirementIdentity|oathBoonOutcomeIdentity|eventToastOathHelper/);
});
