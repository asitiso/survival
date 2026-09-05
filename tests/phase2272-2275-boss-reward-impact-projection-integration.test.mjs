import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const projectionUrl=new URL('../dist/game/boss-reward-impact-projection.js',import.meta.url);
const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const levelup=fs.readFileSync(new URL('../src/ui/levelup.ts',import.meta.url),'utf8');
const styles=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const snapshot=fs.readFileSync(new URL('../src/game/endless/snapshot.ts',import.meta.url),'utf8');
const context={heroId:'arkan',activeRelic:null,activeFusions:[],spellLevels:{fireBolt:10,chainLightning:10,frostNova:10,flameField:10,meteorStorm:4,blackHole:1}};
const choice=(id,title='x')=>({kind:'upgrade',id,title,description:'x',accent:'#fff'});

test('phase 2272 projects authoritative immediate value for core boss growth choices',async()=>{
  assert.equal(fs.existsSync(projectionUrl),true,'boss reward impact projection module must exist');
  const m=await import(projectionUrl.href);
  assert.deepEqual(m.projectBossRewardImpact(choice('spellPower'),context),{roleId:'offense',roleLabel:'화력',summary:'전체 마법 피해 +12%'});
  assert.deepEqual(m.projectBossRewardImpact(choice('cooldown'),context),{roleId:'growth',roleLabel:'성장',summary:'전체 마법 쿨타임 -6%'});
  assert.deepEqual(m.projectBossRewardImpact(choice('maxHp'),context),{roleId:'survival',roleLabel:'생존',summary:'최대 HP +42 · 즉시 회복 +42'});
  const meteor=m.projectBossRewardImpact(choice('meteorStorm'),context);assert.equal(meteor.roleId,'offense');assert.match(meteor.summary,/궁극기 Lv\.4→5 · 1차 진화 실효/);
});

test('phase 2273 relic impact uses current replacement state and can expose economy without parsing copy',async()=>{
  const m=await import(projectionUrl.href);
  const relic={kind:'relic',id:'relic:summoner-sigil',relicId:'summoner-sigil',title:'유물',description:'ignored',accent:'#fff'};
  const p=m.projectBossRewardImpact(relic,context);assert.equal(p.roleId,'economy');assert.equal(p.roleLabel,'경제');assert.equal(p.summary,'흡수거리 +20% · 쿨타임 -10%');
  const replacing=m.projectBossRewardImpact({...relic,id:'relic:abyss-eye',relicId:'abyss-eye'},{...context,activeRelic:'guardian-heart'});assert.equal(replacing.roleId,'offense');assert.match(replacing.summary,/마법 피해 \+24%/);
});

test('phase 2273 fusion impact reuses the frozen fusion composer and is always a build pivot',async()=>{
  const m=await import(projectionUrl.href);
  const fusion={kind:'fusion',id:'fusion:solar-detonation',fusionId:'solar-detonation',title:'융합',description:'ignored',accent:'#fff'};
  const p=m.projectBossRewardImpact(fusion,context);assert.equal(p.roleId,'pivot');assert.equal(p.roleLabel,'빌드전환');assert.match(p.summary,/^2마법 결합 · 실효 · /);
});

test('phase 2274 boss reward cards add one role icon outside secondary identity caps and retain existing detail helpers',()=>{
  assert.match(game,/openNextBossReward[\s\S]*projectBossRewardImpact/);assert.match(game,/bossRewardImpactRoleIdentityStyle\(impact\.roleId\)/);assert.match(game,/impactRoleStyle/);assert.match(game,/impactRoleLabel/);
  assert.match(levelup,/impactRoleStyle\?:\s*string/);assert.match(levelup,/upgrade-impact-role/);assert.match(levelup,/upgrade-role-badge-row/);assert.match(levelup,/secondaryIdentityStyles\.slice\(0,3\)/);assert.match(game,/secondaryIdentityLimit:5/);
  assert.match(styles,/\.upgrade-role-badge-row\{/);assert.match(styles,/\.upgrade-impact-role\{/);assert.doesNotMatch(styles,/\.upgrade-impact-role\{[^}]*height:\s*(?:2[5-9]|[3-9]\d)px/);
});

test('phase 2275 boss reward impact remains presentation-only and preserves reward generation and snapshots',()=>{
  const upgrades=fs.readFileSync(new URL('../src/game/upgrades.ts',import.meta.url),'utf8');
  assert.match(upgrades,/return \[upgrades\[0\]!, relicChoice, fusionChoice\];/);assert.match(upgrades,/return \[upgrades\[0\]!, upgrades\[1\]!, relicChoice\];/);assert.match(upgrades,/spellPower'.*\+12%/s);assert.match(upgrades,/cooldown'.*-6%/s);assert.match(upgrades,/maxHp'.*\+42/s);
  assert.doesNotMatch(snapshot,/bossRewardImpact|impactRoleStyle|impactRoleLabel/);
});
