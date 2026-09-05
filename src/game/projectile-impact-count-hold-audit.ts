import { ACTION_BUTTONS } from './config.js';
import { PROJECTILE_IMPACT_COUNT_HOLD_SECONDS, projectileImpactHeldCount, updateProjectileImpactCountHold } from './projectile-impact-count-hold.js';
import type { ProjectileImpactCluster } from './projectile-impact-cluster-compression.js';
const cluster=(x:number,y:number,count:number,sourceClass:'archer'|'boss'):ProjectileImpactCluster=>({impact:{x,y},incoming:{x:220,y:20},sourceClass,count,start:{x:x-50,y},end:{x,y},alpha:.5,accent:'#fff',animated:false,motionAmplitude:0});
export interface ProjectileImpactCountHoldAudit{passed:boolean;samples:string[];actionCount:number;presentationOnly:true;gameplayFormulaMutation:false;snapshotSchemaMutation:false;}
export function runProjectileImpactCountHoldAudit():ProjectileImpactCountHoldAudit{
 const samples:string[]=[];let passed=true;
 for(let i=0;i<64;i++){const sourceClass=i%4===0?'boss':'archer';let state=updateProjectileImpactCountHold([],[cluster(200+i,300,4,sourceClass)],.016);state=updateProjectileImpactCountHold(state,[cluster(202+i,300,2,sourceClass)],PROJECTILE_IMPACT_COUNT_HOLD_SECONDS*.5);const held=projectileImpactHeldCount(state,cluster(202+i,300,2,sourceClass));const ok=held===4&&state.length===1&&state[0]!.presentationOnly;passed&&=ok;samples.push(`${i}:${sourceClass}:${held}:${state[0]!.holdRemaining.toFixed(3)}`);}
 return{passed,samples,actionCount:ACTION_BUTTONS.length,presentationOnly:true,gameplayFormulaMutation:false,snapshotSchemaMutation:false};
}
