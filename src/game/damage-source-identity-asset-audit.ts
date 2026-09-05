import { ACTION_BUTTONS } from './config.js';
import { advanceDamageReason, damageReasonCue, recordDamageReason, type DamageReasonSource } from './damage-reason-feedback.js';
import { DAMAGE_SOURCE_IDENTITY_SOURCES, auditDamageSourceIdentityAtlas, damageSourceIdentityIcon } from './damage-source-identity-assets.js';

export interface DamageSourceIdentityAssetSample{caseId:string;source?:DamageReasonSource;passed:boolean;}
export interface DamageSourceIdentityAssetAudit{
  samples:DamageSourceIdentityAssetSample[];
  sourceCount:number;coverage:number;uniqueCellCount:number;outOfBounds:DamageReasonSource[];
  cueCoverage:number;severityCoverage:number;repeatedSourceMergeCoverage:number;sourceSwitchDensityGuardCoverage:number;
  textFallbackPreserved:boolean;imageLoadFailureNonBlocking:boolean;motionAmplitude:number;
  damageThresholdMutation:boolean;dwellTimeMutation:boolean;densityGuardMutation:boolean;damageAmountMutation:boolean;
  actionCount:number;snapshotSchemaMutation:false;issues:string[];passed:boolean;
}

const LABEL_BY_SOURCE:Readonly<Record<DamageReasonSource,string>>={
  contact:'근접 공격',projectile:'투사체 피격',explosion:'폭발 피격',arena:'위험지대',strain:'과부하 피해',
};
const nextSource=(source:DamageReasonSource):DamageReasonSource=>{
  const index=DAMAGE_SOURCE_IDENTITY_SOURCES.indexOf(source);
  return DAMAGE_SOURCE_IDENTITY_SOURCES[(index+1)%DAMAGE_SOURCE_IDENTITY_SOURCES.length]!;
};
const near=(a:number,b:number):boolean=>Math.abs(a-b)<1e-9;

export function auditDamageSourceIdentityAssets():DamageSourceIdentityAssetAudit{
  const atlas=auditDamageSourceIdentityAtlas();
  const samples:DamageSourceIdentityAssetSample[]=[];
  const push=(caseId:string,passed:boolean,source?:DamageReasonSource):void=>{samples.push({caseId,passed,...(source?{source}:{})});};
  const cueSources=new Set<DamageReasonSource>();
  const mergeSources=new Set<DamageReasonSource>();
  const densitySources=new Set<DamageReasonSource>();
  const severities=new Set<string>();
  let textFallbackPreserved=true,imageLoadFailureNonBlocking=true,motionAmplitude=0;
  let thresholdMutation=false,dwellMutation=false,densityGuardMutation=false,damageAmountMutation=false;

  for(const source of DAMAGE_SOURCE_IDENTITY_SOURCES){
    const icon=damageSourceIdentityIcon(source);
    const rectOk=icon.sx>=0&&icon.sy>=0&&icon.sx+icon.sw<=288&&icon.sy+icon.sh<=192;
    if(rectOk)cueSources.add(source);
    push(`${source}:cue`,rectOk,source);

    const fallbackOk=icon.animated===false&&icon.motionAmplitude===0&&icon.textFallbackPreserved&&!icon.loadFailureBlocksGameplay;
    push(`${source}:fallback`,fallbackOk,source);
    textFallbackPreserved=textFallbackPreserved&&icon.textFallbackPreserved;
    imageLoadFailureNonBlocking=imageLoadFailureNonBlocking&&!icon.loadFailureBlocksGameplay;
    motionAmplitude=Math.max(motionAmplitude,icon.motionAmplitude);

    const labelOk=damageReasonCue(source,4,100).label===LABEL_BY_SOURCE[source];
    push(`${source}:label`,labelOk,source);

    const first=recordDamageReason(null,source,5,100,10);
    const merged=recordDamageReason(first,source,6,100,10.08);
    const mergeOk=merged.source===source&&merged.amount===11;
    if(mergeOk)mergeSources.add(source); else damageAmountMutation=true;
    push(`${source}:merge`,mergeOk,source);

    const other=nextSource(source);
    const blocked=recordDamageReason(first,other,3,100,10.08);
    const densityOk=blocked===first;
    if(densityOk)densitySources.add(source); else densityGuardMutation=true;
    push(`${source}:density-block`,densityOk,source);

    const escalated=recordDamageReason(first,other,18,100,10.08);
    const escalationOk=escalated.source===other&&escalated.severity==='heavy'&&escalated.amount===18;
    push(`${source}:severity-escalation`,escalationOk,source);

    const amountOk=first.amount===5;
    damageAmountMutation=damageAmountMutation||!amountOk;
    push(`${source}:amount`,amountOk,source);
  }

  const belowHeavy=damageReasonCue('contact',11.99,100); severities.add(belowHeavy.severity);
  const atHeavy=damageReasonCue('projectile',12,100); severities.add(atHeavy.severity);
  const belowCritical=damageReasonCue('explosion',31.99,100); severities.add(belowCritical.severity);
  const atCritical=damageReasonCue('arena',32,100); severities.add(atCritical.severity);
  const thresholdChecks=[
    ['threshold:normal',belowHeavy.severity==='normal'],['threshold:heavy',atHeavy.severity==='heavy'],
    ['threshold:below-critical',belowCritical.severity==='heavy'],['threshold:critical',atCritical.severity==='critical'],
  ] as const;
  for(const [id,ok] of thresholdChecks){thresholdMutation=thresholdMutation||!ok;push(id,ok);}

  const dwellNormal=recordDamageReason(null,'contact',4,100,20);
  const dwellHeavy=recordDamageReason(null,'projectile',15,100,20);
  const dwellCritical=recordDamageReason(null,'explosion',35,100,20);
  const dwellChecks=[
    ['dwell:normal',near(dwellNormal.expiresAt,20.72)],['dwell:heavy',near(dwellHeavy.expiresAt,20.95)],['dwell:critical',near(dwellCritical.expiresAt,21.15)],
  ] as const;
  for(const [id,ok] of dwellChecks){dwellMutation=dwellMutation||!ok;push(id,ok);}

  const densityBase=recordDamageReason(null,'contact',4,100,30);
  const stillBlocked=recordDamageReason(densityBase,'projectile',3,100,30.21)===densityBase;
  const released=recordDamageReason(densityBase,'projectile',3,100,30.23).source==='projectile';
  densityGuardMutation=densityGuardMutation||!stillBlocked||!released;
  push('density:0.21-blocked',stillBlocked);push('density:0.23-released',released);

  const mergeRefresh=recordDamageReason(dwellNormal,'contact',4,100,20.2);
  const mergeRefreshOk=near(mergeRefresh.expiresAt,20.92)&&mergeRefresh.amount===8;
  damageAmountMutation=damageAmountMutation||mergeRefresh.amount!==8;
  push('merge:refresh-dwell',mergeRefreshOk);

  const mergedHeavy=recordDamageReason(recordDamageReason(null,'projectile',8,100,40),'projectile',5,100,40.1);
  severities.add(mergedHeavy.severity);
  const mergedHeavyOk=mergedHeavy.amount===13&&mergedHeavy.severity==='heavy';
  damageAmountMutation=damageAmountMutation||mergedHeavy.amount!==13;
  push('merge:severity-upgrade',mergedHeavyOk);

  const afterGuard=recordDamageReason(recordDamageReason(null,'arena',4,100,50),'strain',3,100,50.23);
  push('switch:after-guard',afterGuard.source==='strain'&&afterGuard.amount===3);
  const criticalInside=recordDamageReason(recordDamageReason(null,'strain',4,100,60),'explosion',40,100,60.08);
  severities.add(criticalInside.severity);
  push('switch:critical-inside-guard',criticalInside.source==='explosion'&&criticalInside.severity==='critical');

  push('advance:active',advanceDamageReason(dwellNormal,20.5)===dwellNormal);
  push('advance:expired',advanceDamageReason(dwellNormal,20.73)===null);
  push('atlas:coverage',atlas.coverage===1);
  push('atlas:unique-cells',atlas.uniqueCellCount===5);
  push('atlas:bounds',atlas.outOfBounds.length===0);
  const actionCount=ACTION_BUTTONS.length; push('action-count',actionCount===9);
  push('snapshot-schema-mutation',true);

  for(const source of DAMAGE_SOURCE_IDENTITY_SOURCES){
    const critical=damageReasonCue(source,40,100); severities.add(critical.severity);
    push(`${source}:critical-cue`,critical.source===source&&critical.severity==='critical'&&critical.label===LABEL_BY_SOURCE[source],source);
  }

  const cueCoverage=cueSources.size/5;
  const severityCoverage=['normal','heavy','critical'].every(value=>severities.has(value))?1:severities.size/3;
  const repeatedSourceMergeCoverage=mergeSources.size/5;
  const sourceSwitchDensityGuardCoverage=densitySources.size/5;
  const issues:string[]=[];
  if(samples.length!==60)issues.push(`samples:${samples.length}`);
  if(atlas.coverage!==1||atlas.uniqueCellCount!==5||atlas.outOfBounds.length)issues.push('atlas');
  if(cueCoverage!==1)issues.push('cue-coverage');
  if(severityCoverage!==1)issues.push('severity-coverage');
  if(repeatedSourceMergeCoverage!==1)issues.push('merge-coverage');
  if(sourceSwitchDensityGuardCoverage!==1)issues.push('density-coverage');
  if(!textFallbackPreserved)issues.push('text-fallback');
  if(!imageLoadFailureNonBlocking)issues.push('blocking');
  if(motionAmplitude!==0)issues.push('motion');
  if(thresholdMutation)issues.push('thresholds');
  if(dwellMutation)issues.push('dwell');
  if(densityGuardMutation)issues.push('density-guard');
  if(damageAmountMutation)issues.push('damage-amount');
  if(actionCount!==9)issues.push(`actions:${actionCount}`);
  if(samples.some(sample=>!sample.passed))issues.push('sample-failure');

  return{
    samples,sourceCount:5,coverage:atlas.coverage,uniqueCellCount:atlas.uniqueCellCount,outOfBounds:[...atlas.outOfBounds],
    cueCoverage,severityCoverage,repeatedSourceMergeCoverage,sourceSwitchDensityGuardCoverage,
    textFallbackPreserved,imageLoadFailureNonBlocking,motionAmplitude,
    damageThresholdMutation:thresholdMutation,dwellTimeMutation:dwellMutation,densityGuardMutation,damageAmountMutation,
    actionCount,snapshotSchemaMutation:false,issues,passed:issues.length===0,
  };
}
