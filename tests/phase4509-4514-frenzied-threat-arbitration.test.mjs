import test from 'node:test';
import assert from 'node:assert/strict';

const identity=await import('../dist/game/elite-affix-identity-assets.js');
const feedbackModule=await import('../dist/game/combat-feedback.js');
const {EnemyManager,enemyStats}=await import('../dist/game/enemies.js');

function enemy(type,id,overrides={}){const s=enemyStats(type,1);return {...s,id,type,pos:{x:500+id*4,y:400},maxHp:type==='elite'?100:s.hp,hp:type==='elite'?40:s.hp,target:'hero',attackTimer:99,slowFactor:1,slowTimer:0,alive:true,hitFlash:0,damageTakenMultiplier:1,regenPerSecondRatio:0,lowHpDamageMultiplier:type==='elite'?1.55:1,commandAuraMultiplier:1,manaShield:0,maxManaShield:0,...overrides};}

test('phase 4509 dense frenzied threshold accents yield unless the enemy is priority',()=>{
  assert.equal(typeof identity.frenziedThresholdDensityPresentation,'function');
  const state={phase:'active',active:true,transitionTtl:0};
  const routine=identity.frenziedThresholdDensityPresentation(state,{activeCount:9,indexFromPriority:8,priorityTarget:false,battlefieldStress:1});
  const priority=identity.frenziedThresholdDensityPresentation(state,{activeCount:9,indexFromPriority:0,priorityTarget:true,battlefieldStress:1});
  assert.ok(routine.alphaScale<0.5);
  assert.ok(priority.alphaScale>routine.alphaScale);
  assert.equal(priority.visible,true);
});

test('phase 4510 frenzied boosted attack routine cues yield to result break critical and healing return ownership',()=>{
  const base=feedbackModule.frenziedAttackPresentation({targetChannel:'hero',clusterIndex:0});
  const dense=feedbackModule.frenziedAttackPresentation({targetChannel:'hero',clusterIndex:7,battlefieldStress:1});
  const suppressed=feedbackModule.frenziedAttackPresentation({targetChannel:'hero',clusterIndex:0,resolvedResultNearby:true,defenseBreakNearby:true,criticalNearby:true,healingReturnNearby:true});
  const priority=feedbackModule.frenziedAttackPresentation({targetChannel:'core',clusterIndex:8,battlefieldStress:1,priorityTarget:true});
  assert.equal(typeof base.visible,'boolean');
  assert.equal(dense.visible,false);
  assert.ok(suppressed.alpha<base.alpha);
  assert.equal(priority.visible,true);
  assert.ok(priority.alpha>dense.alpha);
});

test('phase 4511 bounded frenzied attack queue preserves core pressure before routine hero cues',()=>{
  const feedback=new feedbackModule.CombatFeedbackSystem();
  for(let i=0;i<24;i++)feedback.addFrenziedAttackResponse({x:100+i*8,y:100},{x:500,y:100},i,'hero','elite');
  feedback.addFrenziedAttackResponse({x:490,y:220},{x:520,y:220},999,'core','elite');
  assert.ok(feedback.frenziedAttackCount<=16);
  assert.equal(feedback.frenziedAttackCues.some((cue)=>cue.enemyId===999&&cue.targetChannel==='core'),true);
});

test('phase 4512 shaman healing across 42 percent releases active frenzy lifecycle in the same update',()=>{
  const manager=new EnemyManager();
  const shaman=enemy('shaman',1,{pos:{x:600,y:400},attackTimer:0,target:'hero'});
  const frenzy=enemy('elite',2,{pos:{x:610,y:400},hp:40,eliteAffixes:['frenzied'],frenziedPresentation:{phase:'active',active:true,transitionTtl:0}});
  manager.enemies=[shaman,frenzy];
  manager.update(0.016,{hero:{pos:{x:620,y:400},radius:18},core:{pos:{x:1400,y:400},radius:28},elapsed:10,onHeroDamage:()=>{},onCoreDamage:()=>{},enemySpeedMultiplier:1});
  assert.ok(frenzy.hp>42);
  assert.equal(frenzy.frenziedPresentation?.phase,'released');
});

test('phase 4513 Reduced Motion and Reduced Flash compress dense frenzy cues without hiding priority ownership',()=>{
  const visual=feedbackModule.frenziedAttackPresentation({targetChannel:'core',priorityTarget:true,clusterIndex:6,battlefieldStress:1,reducedMotion:true,reducedFlash:true});
  const threshold=identity.frenziedThresholdDensityPresentation({phase:'active',active:true,transitionTtl:0},{activeCount:8,indexFromPriority:0,priorityTarget:true,battlefieldStress:1,reducedMotion:true,reducedFlash:true});
  assert.equal(visual.pulse,0);
  assert.equal(visual.visible,true);
  assert.equal(threshold.pulseScale,0);
  assert.equal(threshold.visible,true);
});

test('phase 4514 hero x threat x manual-auto frenzied arbitration matrix stays finite',()=>{
  for(const hero of ['arkan','seria','kain','edric'])for(let threat=0;threat<=5;threat++)for(const mode of ['manual','auto']){
    const stress=threat/5;
    const p=feedbackModule.frenziedAttackPresentation({targetChannel:hero==='edric'?'core':'hero',priorityTarget:mode==='manual',clusterIndex:threat,battlefieldStress:stress,reducedMotion:mode==='manual'&&threat===0,reducedFlash:hero==='seria'&&threat===5});
    for(const value of [p.alpha,p.length,p.lineWidth,p.pulse,p.chevronSize])assert.equal(Number.isFinite(value),true);
    assert.equal(typeof p.visible,'boolean');
  }
});
