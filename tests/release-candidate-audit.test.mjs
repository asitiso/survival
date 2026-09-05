import test from 'node:test';
import assert from 'node:assert/strict';
import { collectReleaseCandidateEvidence, releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 319 release candidate audit composes opening boss thermal reward and long-run evidence',()=>{
  const audit=releaseCandidateAudit();
  assert.equal(audit.ok,true);
  assert.equal(audit.status,'PASS');
  assert.match(audit.signature,/^RCQ-[0-9A-F]{8}$/);
  assert.equal(audit.evidence.opening.passed,true);
  assert.equal(audit.evidence.bosses.passed,true);
  assert.equal(audit.evidence.thermal.passed,true);
  assert.equal(audit.evidence.rewards.passed,true);
  assert.equal(audit.evidence.eightHour.passed,true);
  assert.equal(audit.evidence.twelveHour.passed,true);
  assert.ok(audit.evidence.balance.every((entry)=>entry.passed));
});

test('phase 320 candidate audit is deterministic and fails closed when any child evidence fails',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const a=releaseCandidateAudit(evidence);
  const b=releaseCandidateAudit(structuredClone(evidence));
  assert.equal(a.signature,b.signature);
  const broken=structuredClone(evidence);
  broken.thermal.passed=false;
  const failed=releaseCandidateAudit(broken);
  assert.equal(failed.ok,false);
  assert.equal(failed.status,'REVIEW');
  assert.ok(failed.issues.includes('thermal-budget'));
});

test('phase 339 candidate audit includes precise opening six-boss thermal-recovery and twelve-hour economy evidence',()=>{
  const audit=releaseCandidateAudit();
  assert.equal(audit.evidence.openingTimetable.passed,true);
  assert.equal(audit.evidence.firstSixBosses.passed,true);
  assert.equal(audit.evidence.thermalRecovery.passed,true);
  assert.equal(audit.evidence.economy.passed,true);
  assert.equal(audit.evidence.firstSixBosses.checkpoints.length,6);
  assert.equal(audit.evidence.economy.checkpoints.length,21);
});

test('phase 340 device performance evidence is checked against explicit low mid high ceilings',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const expected={low:[220,90,50],mid:[320,140,70],high:[420,200,95]};
  for(const entry of evidence.balance){
    const [enemy,projectile,effect]=expected[entry.deviceClass];
    assert.equal(entry.enemyCeiling,enemy);
    assert.equal(entry.projectileCeiling,projectile);
    assert.equal(entry.effectCeiling,effect);
    assert.ok(entry.maxEnemyBudget<=entry.enemyCeiling);
    assert.ok(entry.maxProjectileBudget<=entry.projectileCeiling);
    assert.ok(entry.maxEffectBudget<=entry.effectCeiling);
  }
});

test('phase 341 candidate audit fails closed on new tuning audits or explicit budget overrun',()=>{
  for(const mutate of [
    (e)=>{e.openingTimetable.passed=false;},
    (e)=>{e.firstSixBosses.passed=false;},
    (e)=>{e.thermalRecovery.passed=false;},
    (e)=>{e.economy.passed=false;},
    (e)=>{e.balance[0].maxEffectBudget=e.balance[0].effectCeiling+1;},
  ]){
    const evidence=collectReleaseCandidateEvidence();
    mutate(evidence);
    const audit=releaseCandidateAudit(evidence);
    assert.equal(audit.ok,false);
    assert.equal(audit.status,'REVIEW');
  }
});

test('phase 359 candidate evidence includes hero threat boss TTK damage distribution and thermal worst-case locks',()=>{
  const audit=releaseCandidateAudit();
  assert.equal(audit.evidence.heroThreatBalance.passed,true);
  assert.equal(audit.evidence.heroThreatBalance.checkpoints.length,72);
  assert.equal(audit.evidence.heroBossTtk.passed,true);
  assert.equal(audit.evidence.heroBossTtk.checkpoints.length,24);
  assert.equal(audit.evidence.damageDistribution.passed,true);
  assert.equal(audit.evidence.damageDistribution.samples.length,12);
  assert.equal(audit.evidence.thermalWorstCase.passed,true);
  assert.equal(audit.evidence.thermalWorstCase.checkpoints.length,9);
});

test('phase 360 candidate fails closed when any release balance lock fails',()=>{
  const mutations=[
    ['hero-threat-balance',(e)=>{e.heroThreatBalance.passed=false;}],
    ['hero-boss-ttk',(e)=>{e.heroBossTtk.passed=false;}],
    ['damage-distribution',(e)=>{e.damageDistribution.passed=false;}],
    ['thermal-worst-case',(e)=>{e.thermalWorstCase.passed=false;}],
  ];
  for(const [issue,mutate] of mutations){
    const evidence=collectReleaseCandidateEvidence();
    mutate(evidence);
    const audit=releaseCandidateAudit(evidence);
    assert.equal(audit.ok,false);
    assert.ok(audit.issues.includes(issue));
  }
});

test('phase 361 candidate markdown and summary expose compact release balance spread evidence',async()=>{
  const { releaseCandidateBudgetSummary }=await import('../dist/game/release-candidate-audit.js');
  const audit=releaseCandidateAudit();
  const summary=releaseCandidateBudgetSummary(audit);
  assert.match(audit.markdown,/Hero x Threat balance \| PASS/);
  assert.match(audit.markdown,/Hero boss TTK \| PASS/);
  assert.match(audit.markdown,/Damage distribution \| PASS/);
  assert.match(audit.markdown,/Thermal worst case \| PASS/);
  assert.match(summary,/hero role/);
  assert.match(summary,/boss TTK/);
  assert.match(summary,/damage H\/C/);
});

test('phase 379 candidate evidence includes combination reward failure-margin and build-speed locks',()=>{
  const audit=releaseCandidateAudit();
  assert.equal(audit.evidence.heroBuildCombinations.passed,true);
  assert.equal(audit.evidence.heroBuildCombinations.checkpoints.length,240);
  assert.equal(audit.evidence.bossRewardFairness.passed,true);
  assert.equal(audit.evidence.bossRewardFairness.samples.length,72);
  assert.equal(audit.evidence.longHorizonFailureMargin.passed,true);
  assert.equal(audit.evidence.longHorizonFailureMargin.samples.length,36);
  assert.equal(audit.evidence.buildCompletionSpeed.passed,true);
  assert.equal(audit.evidence.buildCompletionSpeed.combinations.length,48);
});

test('phase 380 candidate fails closed when any combination release lock fails',()=>{
  const mutations=[
    ['hero-build-combinations',(e)=>{e.heroBuildCombinations.passed=false;}],
    ['boss-reward-fairness',(e)=>{e.bossRewardFairness.passed=false;}],
    ['long-horizon-failure-margin',(e)=>{e.longHorizonFailureMargin.passed=false;}],
    ['build-completion-speed',(e)=>{e.buildCompletionSpeed.passed=false;}],
  ];
  for(const [issue,mutate] of mutations){
    const evidence=collectReleaseCandidateEvidence();
    mutate(evidence);
    const audit=releaseCandidateAudit(evidence);
    assert.equal(audit.ok,false);
    assert.ok(audit.issues.includes(issue));
  }
});

test('phase 381 candidate markdown and compact summary expose matrix fairness reserve and completion evidence',async()=>{
  const { releaseCandidateBudgetSummary }=await import('../dist/game/release-candidate-audit.js');
  const audit=releaseCandidateAudit();
  const summary=releaseCandidateBudgetSummary(audit);
  assert.match(audit.markdown,/Hero build matrix \| PASS/);
  assert.match(audit.markdown,/Boss reward fairness \| PASS/);
  assert.match(audit.markdown,/Long-horizon reserve \| PASS/);
  assert.match(audit.markdown,/Build completion \| PASS/);
  assert.match(summary,/matrix/);
  assert.match(summary,/reward fair/);
  assert.match(summary,/reserve/);
  assert.match(summary,/build 20-25m/);
});

test('phase 399 candidate evidence includes completed-build boss-matchup purchasing-power and diversity locks',()=>{
  const audit=releaseCandidateAudit();
  assert.equal(audit.evidence.completedBuildMeta.passed,true);
  assert.equal(audit.evidence.bossBuildMatchups.passed,true);
  assert.equal(audit.evidence.progressionPurchasingPower.passed,true);
  assert.equal(audit.evidence.buildChoiceDiversity.passed,true);
});

test('phase 400 candidate fails closed when any completed-build meta lock fails',()=>{
  const base=releaseCandidateAudit().evidence;
  const cases=[
    ['completed-build-meta',(e)=>{e.completedBuildMeta.passed=false;}],
    ['boss-build-matchups',(e)=>{e.bossBuildMatchups.passed=false;}],
    ['progression-purchasing-power',(e)=>{e.progressionPurchasingPower.passed=false;}],
    ['build-choice-diversity',(e)=>{e.buildChoiceDiversity.passed=false;}],
  ];
  for(const [issue,breakIt] of cases){
    const evidence=structuredClone(base); breakIt(evidence);
    const audit=releaseCandidateAudit(evidence);
    assert.equal(audit.ok,false);
    assert.ok(audit.issues.includes(issue));
  }
});

test('phase 401 candidate compact summary exposes completed-build meta bias evidence',async()=>{
  const { releaseCandidateBudgetSummary }=await import('../dist/game/release-candidate-audit.js');
  const audit=releaseCandidateAudit();
  const summary=releaseCandidateBudgetSummary(audit);
  assert.match(summary,/complete meta/);
  assert.match(summary,/boss gap/);
  assert.match(summary,/buy power/);
  assert.match(summary,/diversity/);
});

test('phase 419 candidate evidence includes pivot gauntlet meta-drift and hero long-run locks',()=>{
  const audit=releaseCandidateAudit();
  assert.equal(audit.evidence.buildPivotRecovery.passed,true);
  assert.equal(audit.evidence.buildPivotRecovery.samples.length,144);
  assert.equal(audit.evidence.bossGauntletVersatility.passed,true);
  assert.equal(audit.evidence.bossGauntletVersatility.samples.length,5760);
  assert.equal(audit.evidence.longRunMetaDrift.passed,true);
  assert.equal(audit.evidence.longRunMetaDrift.samples.length,48);
  assert.equal(audit.evidence.heroLongRunEfficiency.passed,true);
  assert.equal(audit.evidence.heroLongRunEfficiency.samples.length,48);
});

test('phase 420 candidate fails closed when any long-run meta-health lock fails',()=>{
  const base=releaseCandidateAudit().evidence;
  const cases=[
    ['build-pivot-recovery',(e)=>{e.buildPivotRecovery.passed=false;}],
    ['boss-gauntlet-versatility',(e)=>{e.bossGauntletVersatility.passed=false;}],
    ['long-run-meta-drift',(e)=>{e.longRunMetaDrift.passed=false;}],
    ['hero-long-run-efficiency',(e)=>{e.heroLongRunEfficiency.passed=false;}],
  ];
  for(const [issue,breakIt] of cases){
    const evidence=structuredClone(base); breakIt(evidence);
    const audit=releaseCandidateAudit(evidence);
    assert.equal(audit.ok,false);
    assert.ok(audit.issues.includes(issue));
  }
});

test('phase 421 candidate compact summary exposes long-run meta-health evidence',async()=>{
  const { releaseCandidateBudgetSummary }=await import('../dist/game/release-candidate-audit.js');
  const audit=releaseCandidateAudit();
  const summary=releaseCandidateBudgetSummary(audit);
  assert.match(summary,/pivot/);
  assert.match(summary,/gauntlet/);
  assert.match(summary,/meta drift/);
  assert.match(summary,/long hero/);
});
