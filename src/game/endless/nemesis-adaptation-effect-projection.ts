import type { BossAdaptation } from './nemesis.js';
import type { NemesisAdaptationEffectIdentityId } from './nemesis-adaptation-effect-identity-assets.js';

export interface NemesisAdaptationEffectProjection {
  kind:BossAdaptation['kind']; rank:number; effectId:NemesisAdaptationEffectIdentityId; before:number; after:number;
  pressurePercent:number; label:string; affinity?:string;
}
export interface NemesisAdaptationEffectsProjection {
  adaptations:BossAdaptation[]; effects:NemesisAdaptationEffectProjection[]; primaryEffects:NemesisAdaptationEffectProjection[];
  maxAdaptations:3; maxPrimaryEffects:2;
}

const round3=(value:number):number=>Math.round((value+Number.EPSILON)*1000)/1000;
const round1=(value:number):number=>Math.round((value+Number.EPSILON)*10)/10;
const pct=(value:number):string=>Number.isInteger(value)?`${value}`:`${value.toFixed(1)}`;

export function projectNemesisAdaptationEffect(adaptation:BossAdaptation):NemesisAdaptationEffectProjection {
  const rank=Math.max(1,Math.min(3,Math.round(adaptation.rank)));
  if(adaptation.kind==='spell_guard'){
    const after=round3(Math.max(.72,1-rank*.035)),pressurePercent=round1((1-after)*100);
    return {kind:adaptation.kind,rank,effectId:'damage-resistance',before:1,after,pressurePercent,label:`보스피해 -${pct(pressurePercent)}%`};
  }
  if(adaptation.kind==='mirror_affinity'){
    const after=.94,pressurePercent=6,affinity=adaptation.affinity;
    return {kind:adaptation.kind,rank,effectId:'mirror-affinity',before:1,after,pressurePercent,label:`${affinity?affinity.toUpperCase()+' ':''}저항 +6%`,...(affinity?{affinity}:{})};
  }
  if(adaptation.kind==='blink_hunt'){
    const after=round3(Math.min(1.45,1+rank*.05)),pressurePercent=round1((after-1)*100);
    return {kind:adaptation.kind,rank,effectId:'dash-distance',before:1,after,pressurePercent,label:`대시 +${pct(pressurePercent)}%`};
  }
  if(adaptation.kind==='core_siege'){
    const after=round3(Math.min(1.5,1+rank*.05)),pressurePercent=round1((after-1)*100);
    return {kind:adaptation.kind,rank,effectId:'summon-pressure',before:1,after,pressurePercent,label:`소환 +${pct(pressurePercent)}%`};
  }
  const after=round3(Math.max(.7,1-rank*.04)),pressurePercent=round1((1-after)*100);
  return {kind:adaptation.kind,rank,effectId:'special-cadence',before:1,after,pressurePercent,label:`특수주기 -${pct(pressurePercent)}%`};
}

export function projectNemesisAdaptationEffects(adaptations:readonly BossAdaptation[]):NemesisAdaptationEffectsProjection {
  const selected=adaptations.slice(0,3).map(v=>({...v}));
  const effects=selected.map(projectNemesisAdaptationEffect);
  const primaryEffects=effects.map((effect,index)=>({effect,index})).sort((a,b)=>b.effect.pressurePercent-a.effect.pressurePercent||a.index-b.index).slice(0,2).map(v=>v.effect);
  return {adaptations:selected,effects,primaryEffects,maxAdaptations:3,maxPrimaryEffects:2};
}

export function nemesisAdaptationEffectHint(projection:NemesisAdaptationEffectsProjection,limit=2):string {
  return projection.primaryEffects.slice(0,Math.max(0,Math.min(2,limit))).map(effect=>effect.label).join(' · ');
}

export function nemesisAdaptationLearningToastLabel(count:number,projection:NemesisAdaptationEffectsProjection):string {
  const hint=nemesisAdaptationEffectHint(projection,1);
  return `네메시스 학습 · ${Math.max(0,Math.round(count))}개 대응 패턴${hint?` · ${hint}`:''}`;
}
