import { ACTION_BUTTONS } from '../config.js';
import type { BossAdaptation, NemesisAdaptationKind } from './nemesis.js';
import { NEMESIS_ADAPTATION_EFFECT_IDENTITY_IDS, auditNemesisAdaptationEffectIdentityAtlas, nemesisAdaptationEffectIdentityIcon } from './nemesis-adaptation-effect-identity-assets.js';
import { projectNemesisAdaptationEffect, projectNemesisAdaptationEffects } from './nemesis-adaptation-effect-projection.js';

const KINDS:readonly NemesisAdaptationKind[]=['spell_guard','blink_hunt','core_siege','enrage_clock','mirror_affinity'];
const expected=(kind:NemesisAdaptationKind,rank:number):number=>kind==='spell_guard'?Math.max(.72,1-rank*.035):kind==='blink_hunt'?Math.min(1.45,1+rank*.05):kind==='core_siege'?Math.min(1.5,1+rank*.05):kind==='enrage_clock'?Math.max(.7,1-rank*.04):.94;
const close=(a:number,b:number):boolean=>Math.abs(a-b)<1e-9;

export function auditNemesisAdaptationEffectProjectionIdentityAssets(){
  const samples:{id:string;passed:boolean}[]=[],issues:string[]=[],atlas=auditNemesisAdaptationEffectIdentityAtlas();
  const kindCoverage=new Set<NemesisAdaptationKind>(),rankCoverage=new Set<number>(),identityCoverage=new Set<string>();
  for(const kind of KINDS)for(const rank of [1,2,3]){
    const adaptation:BossAdaptation={kind,rank,...(kind==='mirror_affinity'?{affinity:'frost'}:{})};const p=projectNemesisAdaptationEffect(adaptation);
    kindCoverage.add(kind);rankCoverage.add(rank);identityCoverage.add(p.effectId);
    samples.push({id:`${kind}:r${rank}:value`,passed:close(p.after,Math.round((expected(kind,rank)+Number.EPSILON)*1000)/1000)});
    samples.push({id:`${kind}:r${rank}:label`,passed:p.label.length>0&&p.pressurePercent>0});
  }
  for(const id of NEMESIS_ADAPTATION_EFFECT_IDENTITY_IDS){const icon=nemesisAdaptationEffectIdentityIcon(id);samples.push({id:`identity:${id}:static`,passed:icon.animated===false&&icon.motionAmplitude===0});samples.push({id:`identity:${id}:safe`,passed:icon.textFallbackPreserved&&!icon.loadFailureBlocksGameplay&&icon.maxVisibleHelperIcons===2});}
  const triple=projectNemesisAdaptationEffects([{kind:'spell_guard',rank:3},{kind:'core_siege',rank:3},{kind:'enrage_clock',rank:3}]);
  const mirror=projectNemesisAdaptationEffect({kind:'mirror_affinity',rank:3,affinity:'frost'});
  const invariants=[
    atlas.passed,
    triple.adaptations.length===3,
    triple.effects.length===3,
    triple.primaryEffects.length===2,
    triple.primaryEffects[0]?.effectId==='summon-pressure',
    triple.primaryEffects[1]?.effectId==='special-cadence',
    mirror.affinity==='frost',
    mirror.effectId==='mirror-affinity',
    mirror.pressurePercent===6,
    projectNemesisAdaptationEffect({kind:'spell_guard',rank:3}).pressurePercent===10.5,
    projectNemesisAdaptationEffect({kind:'blink_hunt',rank:2}).pressurePercent===10,
    projectNemesisAdaptationEffect({kind:'core_siege',rank:3}).pressurePercent===15,
    projectNemesisAdaptationEffect({kind:'enrage_clock',rank:3}).pressurePercent===12,
    NEMESIS_ADAPTATION_EFFECT_IDENTITY_IDS.length===5,
    kindCoverage.size===5,
    rankCoverage.size===3,
    identityCoverage.size===5,
    ACTION_BUTTONS.length===9,
    triple.maxPrimaryEffects===2,
    triple.maxAdaptations===3,
  ];
  invariants.forEach((passed,index)=>samples.push({id:`invariant:${index}`,passed}));
  for(const sample of samples)if(!sample.passed)issues.push(sample.id);
  const adaptationCoverageComplete=kindCoverage.size===5,rankCoverageComplete=rankCoverage.size===3,identityCoverageComplete=identityCoverage.size===5,mirrorAffinityPreserved=mirror.affinity==='frost';
  if(!adaptationCoverageComplete)issues.push('adaptation-coverage');if(!rankCoverageComplete)issues.push('rank-coverage');if(!identityCoverageComplete)issues.push('identity-coverage');if(!mirrorAffinityPreserved)issues.push('mirror-affinity');if(samples.length!==60)issues.push(`sample-count:${samples.length}`);
  return {passed:issues.length===0,samples,adaptationKindCount:5,rankCount:3,identityCount:5,adaptationCoverageComplete,rankCoverageComplete,identityCoverageComplete,mirrorAffinityPreserved,maxPrimaryEffects:2,maxAdaptations:3,actionCount:ACTION_BUTTONS.length,snapshotSchemaMutation:false,gameplayMutation:false,issues};
}
