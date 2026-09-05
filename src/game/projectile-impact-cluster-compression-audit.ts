import { projectileImpactClusters } from './projectile-impact-cluster-compression.js';
export interface ProjectileImpactClusterCompressionAudit{samples:string[];actionCount:9;presentationOnly:true;gameplayFormulaMutation:false;snapshotSchemaMutation:false;passed:boolean;}
export function runProjectileImpactClusterCompressionAudit():ProjectileImpactClusterCompressionAudit{
 const samples:string[]=[];let passed=true;
 for(let i=0;i<64;i++){const quality=(['high','medium','low'] as const)[i%3]!;const sourceClass=i%4===0?'boss':'archer';const r=projectileImpactClusters({quality,reducedFlash:Boolean(i%2),impacts:[{impact:{x:100+i,y:150},incoming:{x:10,y:1},sourceClass},{impact:{x:122+i,y:157},incoming:{x:9,y:1},sourceClass}]});const ok=r.length===1&&r[0]!.count===2&&r[0]!.animated===false;passed&&=ok;samples.push(`${i}:${quality}:${sourceClass}:${r.length}:${r[0]?.count??0}`);}
 return{samples,actionCount:9,presentationOnly:true,gameplayFormulaMutation:false,snapshotSchemaMutation:false,passed};
}
