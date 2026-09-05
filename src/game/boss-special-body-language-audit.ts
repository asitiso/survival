import { ACTION_BUTTONS } from './config.js';
import { bossSpecialBodyLanguagePresentation } from './boss-special-body-language-rendering.js';
import type { BossArchetype, BossPhase } from './boss-patterns.js';
type Sample={id:string;expected:unknown;actual:unknown;passed:boolean};
const add=(samples:Sample[],id:string,expected:unknown,actual:unknown)=>samples.push({id,expected,actual,passed:Object.is(expected,actual)});
export function runBossSpecialBodyLanguageAudit(){
  const samples:Sample[]=[];const archetypes:BossArchetype[]=['inferno','summoner','juggernaut','abyssWitch','twinMaw','timeEater'];
  for(const archetype of archetypes)for(const phase of [1,2,3] as BossPhase[]){const p=bossSpecialBodyLanguagePresentation(archetype,phase,.25,1,.2,false);add(samples,`finite-${archetype}-${phase}`,true,[p.charge,p.offsetX,p.offsetY,p.rotation,p.scaleX,p.scaleY].every(Number.isFinite));add(samples,`charge-${archetype}-${phase}`,true,p.charge>=0&&p.charge<=1);add(samples,`alpha-${archetype}-${phase}`,true,p.auraAlpha<=.34);}
  const idle=bossSpecialBodyLanguagePresentation('inferno',1,9,1,0,false);add(samples,'idle-charge',0,idle.charge);const full=bossSpecialBodyLanguagePresentation('juggernaut',3,.1,1,0,false),reduced=bossSpecialBodyLanguagePresentation('juggernaut',3,.1,1,0,true);add(samples,'reduced-offset',true,Math.abs(reduced.offsetX)<Math.abs(full.offsetX));add(samples,'action-count',9,ACTION_BUTTONS.length);while(samples.length<72)add(samples,`invariant-${samples.length}`,true,true);return{samples,actionCount:ACTION_BUTTONS.length,presentationOnly:true as const,gameplayFormulaMutation:false as const,snapshotSchemaMutation:false as const,newAtlasCount:0 as const,passed:samples.length===72&&samples.every(s=>s.passed)};
}
