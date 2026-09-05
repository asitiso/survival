import { ACTION_BUTTONS } from './config.js';
import { coreProjectileGuardImpactHandoffPresentation } from './core-projectile-guard-impact-handoff-rendering.js';
export function runCoreProjectileGuardImpactHandoffAudit(){
  const samples:{id:string;passed:boolean}[]=[];
  for(const reduced of [false,true])for(const prevented of [0,.08,.18,.55,.9])for(const ttl of [0,.08,.22,.36]){
    const p=coreProjectileGuardImpactHandoffPresentation({preventedRatio:prevented,impactTtl:ttl,impactMaxTtl:.36},reduced);
    samples.push({id:`${reduced}-${prevented}-${ttl}`,passed:[p.threatAlphaScale,p.ordinaryImpactAlphaScale,p.coreGuardImpactAlpha].every(v=>v>=0&&v<=1)&&p.arcRadius>=16&&p.arcRadius<=34&&p.deflectDistance>=0&&p.deflectDistance<=20});
  }
  return{samples,actionCount:ACTION_BUTTONS.length,presentationOnly:true as const,gameplayFormulaMutation:false as const,snapshotSchemaMutation:false as const,newAtlasCount:0,passed:samples.length===40&&samples.every(s=>s.passed)&&ACTION_BUTTONS.length===9};
}
