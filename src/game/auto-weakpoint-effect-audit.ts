import { AUTO_WEAKPOINT_AIM_BLEND } from './auto-combat-brain.js';
import { autoWeakpointAimPoint } from './auto-weakpoint-aim.js';
import { spellTuning, type SpellId } from './spells.js';

export interface AutoWeakpointEffectSample{spellId:SpellId;offset:number;centerContact:number;autoContact:number;gain:number;}
export interface AutoWeakpointEffectAudit{passed:boolean;samples:AutoWeakpointEffectSample[];averageContactGain:number;minAutoContact:number;directSpellGain:number;areaSpellGain:number;estimatedBreakTimeReduction:number;issues:string[];}
const SPELLS:readonly SpellId[]=['fireBolt','chainLightning','flameField','meteorStorm','blackHole'];
const OFFSETS=[52,76,104,132,156,180] as const;
function round4(v:number):number{return Math.round(v*10000)/10000;}
function effectiveRadius(id:SpellId):number{const t=spellTuning(id,10);if(id==='chainLightning')return 0;return t.radius;}
function contact(offset:number,spellRadius:number,nodeRadius=24):number{if(offset<=spellRadius+nodeRadius)return 1;return Math.max(0,1-(offset-spellRadius-nodeRadius)/72);}
export function auditAutoWeakpointEffect():AutoWeakpointEffectAudit{
  const samples:AutoWeakpointEffectSample[]=[];
  for(const spellId of SPELLS)for(const offset of OFFSETS){
    const centerContact=contact(offset,effectiveRadius(spellId));
    const boss={id:10,type:'boss' as const,pos:{x:0,y:0}},node={id:1,pos:{x:offset,y:0},hp:50,maxHp:100,alive:true,radius:24};
    const aim=autoWeakpointAimPoint({autoAim:true,target:boss,heroPos:{x:0,y:0},activeBossId:10,nodes:[node],preferredNodeId:1});
    const residual=aim?Math.abs(node.pos.x-aim.x):offset;
    const autoContact=contact(residual,effectiveRadius(spellId));
    samples.push({spellId,offset,centerContact:round4(centerContact),autoContact:round4(autoContact),gain:round4(autoContact-centerContact)});
  }
  const average=(items:readonly AutoWeakpointEffectSample[])=>items.reduce((sum,s)=>sum+s.gain,0)/Math.max(1,items.length);
  const direct=samples.filter((s)=>s.spellId==='fireBolt'||s.spellId==='chainLightning'),area=samples.filter((s)=>!direct.includes(s));
  const averageContactGain=round4(average(samples)),directSpellGain=round4(average(direct)),areaSpellGain=round4(average(area)),minAutoContact=Math.min(...samples.map((s)=>s.autoContact)),estimatedBreakTimeReduction=round4(averageContactGain/(1+averageContactGain)*.58),issues:string[]=[];
  if(samples.length<24)issues.push('insufficient-samples');
  if(averageContactGain<.18||averageContactGain>.34)issues.push('weakpoint-gain-human-band');
  if(minAutoContact<.78||minAutoContact>=1)issues.push('auto-contact-human-floor');
  if(directSpellGain<=areaSpellGain)issues.push('direct-spell-benefit-missing');
  if(estimatedBreakTimeReduction<.08||estimatedBreakTimeReduction>.16)issues.push('break-time-benefit-human-band');
  if(AUTO_WEAKPOINT_AIM_BLEND<.75||AUTO_WEAKPOINT_AIM_BLEND>.84)issues.push('aim-blend-outside-human-band');
  return{passed:issues.length===0,samples,averageContactGain,minAutoContact,directSpellGain,areaSpellGain,estimatedBreakTimeReduction,issues};
}
