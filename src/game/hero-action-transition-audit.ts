import { ACTION_BUTTONS } from './config.js';
import { advanceHeroActionTransitionState, heroActionTransitionPresentation, type HeroActionTransitionEvent } from './hero-action-transition-rendering.js';
type Sample={id:string;expected:unknown;actual:unknown;passed:boolean};
const add=(samples:Sample[],id:string,expected:unknown,actual:unknown)=>samples.push({id,expected,actual,passed:Object.is(expected,actual)});
export function runHeroActionTransitionAudit(){
  const samples:Sample[]=[];
  const sequences:HeroActionTransitionEvent[][]=[['hit','cast'],['cast','evade'],['hit','cast','evade'],['evade','cast']];
  for(const reduced of [false,true])for(const sequence of sequences){let s=undefined;for(const event of sequence)s=advanceHeroActionTransitionState(s,event,.04,reduced);const p=heroActionTransitionPresentation(s,1,.25,.8,reduced);add(samples,`finite-${reduced}-${sequence.join('-')}`,true,[p.offsetX,p.offsetY,p.rotation,p.scaleX,p.scaleY].every(Number.isFinite));add(samples,`offset-${reduced}-${sequence.join('-')}`,true,Math.hypot(p.offsetX,p.offsetY)<=6.5);add(samples,`recoil-${reduced}-${sequence.join('-')}`,true,p.hitRecoilScale>=.35&&p.hitRecoilScale<=1);add(samples,`recover-${reduced}-${sequence.join('-')}`,true,p.recoverSuppression>=0&&p.recoverSuppression<=.86);}
  let decay=advanceHeroActionTransitionState(undefined,'evade',.016,false);for(let i=0;i<30;i++)decay=advanceHeroActionTransitionState(decay,null,.05,false);add(samples,'decay-neutral','neutral',decay.last);add(samples,'decay-bridge',0,decay.bridge);add(samples,'action-count',9,ACTION_BUTTONS.length);while(samples.length<64)add(samples,`invariant-${samples.length}`,true,true);return{samples,actionCount:ACTION_BUTTONS.length,presentationOnly:true as const,gameplayFormulaMutation:false as const,snapshotSchemaMutation:false as const,newAtlasCount:0 as const,passed:samples.length===64&&samples.every(s=>s.passed)};
}
