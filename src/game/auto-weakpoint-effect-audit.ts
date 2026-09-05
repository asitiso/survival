import { spellTuning, type SpellId } from './spells.js';

export interface AutoWeakpointEffectSample{spellId:SpellId;offset:number;centerContact:number;autoContact:number;gain:number;}
export interface AutoWeakpointEffectAudit{passed:boolean;samples:AutoWeakpointEffectSample[];averageContactGain:number;minAutoContact:number;directSpellGain:number;areaSpellGain:number;estimatedBreakTimeReduction:number;issues:string[];}
const SPELLS:readonly SpellId[]=['fireBolt','chainLightning','flameField','meteorStorm','blackHole'];
const OFFSETS=[52,76,104,132,156,180] as const;
function round4(v:number):number{return Math.round(v*10000)/10000;}
function effectiveRadius(id:SpellId):number{const t=spellTuning(id,10);if(id==='chainLightning')return 0;if(id==='fireBolt')return t.radius;return t.radius;}
function contact(offset:number,spellRadius:number,nodeRadius=24):number{
  if(offset<=spellRadius+nodeRadius)return 1;
  return Math.max(0,1-(offset-spellRadius-nodeRadius)/72);
}
export function auditAutoWeakpointEffect():AutoWeakpointEffectAudit{
  const samples:AutoWeakpointEffectSample[]=[];
  for(const spellId of SPELLS)for(const offset of OFFSETS){
    const centerContact=contact(offset,effectiveRadius(spellId));
    const autoContact=1;
    samples.push({spellId,offset,centerContact:round4(centerContact),autoContact,gain:round4(autoContact-centerContact)});
  }
  const average=(items:readonly AutoWeakpointEffectSample[])=>items.reduce((sum,s)=>sum+s.gain,0)/Math.max(1,items.length);
  const direct=samples.filter((s)=>s.spellId==='fireBolt'||s.spellId==='chainLightning');
  const area=samples.filter((s)=>!direct.includes(s));
  const averageContactGain=round4(average(samples));
  const directSpellGain=round4(average(direct));
  const areaSpellGain=round4(average(area));
  const minAutoContact=Math.min(...samples.map((s)=>s.autoContact));
  const estimatedBreakTimeReduction=round4(averageContactGain/(1+averageContactGain));
  const issues:string[]=[];
  if(samples.length<24)issues.push('insufficient-samples');
  if(averageContactGain<.18)issues.push('weakpoint-gain-too-small');
  if(minAutoContact<.92)issues.push('auto-contact-floor');
  if(directSpellGain<=areaSpellGain)issues.push('direct-spell-benefit-missing');
  return{passed:issues.length===0,samples,averageContactGain,minAutoContact,directSpellGain,areaSpellGain,estimatedBreakTimeReduction,issues};
}
