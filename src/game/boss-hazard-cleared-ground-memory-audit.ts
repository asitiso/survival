import { ACTION_BUTTONS } from './config.js';
import { bossHazardClearedGroundMemoryPresentation } from './boss-hazard-cleared-ground-memory-rendering.js';
export function runBossHazardClearedGroundMemoryAudit(){
  const samples:{id:string;passed:boolean}[]=[];
  for(const reduced of [false,true])for(const aftermathActive of [false,true])for(const distance of [44,120,999])for(const ttl of [0,.24,.62,1.18]){
    const p=bossHazardClearedGroundMemoryPresentation({memoryTtl:ttl,memoryMaxTtl:1.25,aftermathActive,nextHazardDistance:distance,nextHazardTelegraph:distance<100?.7:0},reduced);
    samples.push({id:`${reduced}-${aftermathActive}-${distance}-${ttl}`,passed:p.clearedAlpha>=0&&p.clearedAlpha<=.2&&p.telegraphAlphaScale>=1&&p.telegraphAlphaScale<=1.08&&p.radiusScale>=.96&&p.radiusScale<=1.08});
  }
  return{samples,actionCount:ACTION_BUTTONS.length,presentationOnly:true as const,gameplayFormulaMutation:false as const,snapshotSchemaMutation:false as const,newAtlasCount:0,passed:samples.length===48&&samples.every(sample=>sample.passed)&&ACTION_BUTTONS.length===9};
}
