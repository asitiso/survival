import { ACTION_BUTTONS } from './config.js';
import { updateProjectileImpactIdentityCoherence } from './projectile-impact-identity-coherence.js';
import type { ProjectileImpactCluster } from './projectile-impact-cluster-compression.js';
const cluster=(x:number,count:number):ProjectileImpactCluster=>({impact:{x,y:300},incoming:{x:180,y:0},count,sourceClass:'archer',start:{x:x-30,y:300},end:{x,y:300},alpha:.5,accent:'#fff',animated:false,motionAmplitude:0});
export interface ProjectileImpactSplitMergeLineageCoherenceAudit{passed:boolean;samples:string[];actionCount:number;presentationOnly:true;gameplayFormulaMutation:false;snapshotSchemaMutation:false;}
export function runProjectileImpactSplitMergeLineageCoherenceAudit():ProjectileImpactSplitMergeLineageCoherenceAudit{
  const samples:string[]=[];let passed=true;
  for(let i=0;i<64;i++){
    const offset=i%9;let r=updateProjectileImpactIdentityCoherence([],[cluster(400+offset,6)],.016);const old=r.keys[0]!;
    r=updateProjectileImpactIdentityCoherence(r.memory,[cluster(420+offset,2),cluster(380+offset,5)],.016);const split=r.keys[1]===old&&r.keys[0]!==old;
    const splitMemory=[...r.memory];const splitIds=[...r.keys];r=updateProjectileImpactIdentityCoherence(splitMemory,[cluster(400+offset,7)],.016);const expected=Math.min(...splitIds),merge=r.keys[0]===expected&&r.retiredIdentityIds.length===1;
    const ok=split&&merge&&r.presentationOnly&&r.gameplayMutation===false;passed&&=ok;samples.push(`${i}:${split?1:0}:${merge?1:0}`);
  }
  return{passed,samples,actionCount:ACTION_BUTTONS.length,presentationOnly:true,gameplayFormulaMutation:false,snapshotSchemaMutation:false};
}
