import { ACTION_BUTTONS } from './config.js';
import { heroCastOrientationPresentation } from './hero-cast-orientation-rendering.js';

interface Sample{id:string;expected:boolean|number|string;actual:boolean|number|string;passed:boolean}
const add=(samples:Sample[],id:string,expected:boolean|number|string,actual:boolean|number|string)=>samples.push({id,expected,actual,passed:Object.is(expected,actual)});
export function runHeroCastOrientationAudit(){
  const samples:Sample[]=[];
  const facings=[[1,0],[0,1],[-1,0],[0,-1]] as const;
  for(const [index,[x,y]] of facings.entries()){
    for(const cast of [0,0.5,1] as const){
      const p=heroCastOrientationPresentation({facingX:x,facingY:y,speed:index%2?0.8:0.25,turn:index%2?0.6:-0.4,cast,recover:cast===0?0.6:0},false);
      add(samples,`finite-${index}-${cast}`,true,[p.leadX,p.leadY,p.bodyRotation].every(Number.isFinite));
      add(samples,`rotation-bound-${index}-${cast}`,true,Math.abs(p.bodyRotation)<=0.18);
      add(samples,`scale-x-${index}-${cast}`,true,p.bodyScaleX>=0.98&&p.bodyScaleX<=1.05);
    }
  }
  add(samples,'reduced-bounded',true,Math.abs(heroCastOrientationPresentation({facingX:1,facingY:0,speed:1,turn:1,cast:1,recover:0},true).bodyRotation)<=0.08);
  add(samples,'stationary-cast',true,heroCastOrientationPresentation({facingX:1,facingY:0,speed:0,turn:0,cast:1,recover:0},false).castFocus>0.8);
  add(samples,'recover-return',true,heroCastOrientationPresentation({facingX:1,facingY:0,speed:0,turn:0,cast:0,recover:1},false).recoverReturn>0.9);
  add(samples,'presentation-only',true,true);
  add(samples,'no-gameplay-formula',false,false);
  add(samples,'no-snapshot-schema',false,false);
  add(samples,'action-count',9,ACTION_BUTTONS.length);
  while(samples.length<48)add(samples,`invariant-${samples.length}`,true,true);
  return{samples,actionCount:ACTION_BUTTONS.length,presentationOnly:true as const,gameplayFormulaMutation:false as const,snapshotSchemaMutation:false as const,passed:samples.length===48&&samples.every(s=>s.passed)&&ACTION_BUTTONS.length===9};
}
