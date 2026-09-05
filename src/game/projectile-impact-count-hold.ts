import type { Vec2 } from '../core/math.js';
import type { ProjectileImpactCluster } from './projectile-impact-cluster-compression.js';
import type { ProjectileImpactSourceClass } from './projectile-impact-source-continuity.js';
import { PROJECTILE_IMPACT_LABEL_ANCHOR_DIRECTION_COSINE_MIN, projectileImpactLabelAnchorDirectionCompatible } from './projectile-impact-label-anchor-hold.js';

export const PROJECTILE_IMPACT_COUNT_HOLD_SECONDS=.18;
export const PROJECTILE_IMPACT_COUNT_MEMORY_SECONDS=.34;
export const PROJECTILE_IMPACT_COUNT_MATCH_RADIUS=72;
export const PROJECTILE_IMPACT_COUNT_DIRECTION_COSINE_MIN=PROJECTILE_IMPACT_LABEL_ANCHOR_DIRECTION_COSINE_MIN;
export interface ProjectileImpactCountHoldEntry{
  sourceClass:ProjectileImpactSourceClass;
  pos:Vec2;
  incoming:Vec2;
  heldCount:number;
  holdRemaining:number;
  memoryRemaining:number;
  identityId:number|null;
  presentationOnly:true;
}
const distance=(a:Vec2,b:Vec2)=>Math.hypot(a.x-b.x,a.y-b.y);
export function projectileImpactCountDirectionCompatible(a:Vec2,b:Vec2):boolean{return projectileImpactLabelAnchorDirectionCompatible(a,b);}
export function retireProjectileImpactCountHoldIdentities(previous:readonly ProjectileImpactCountHoldEntry[],retiredIdentityIds:readonly number[]):ProjectileImpactCountHoldEntry[]{
  if(retiredIdentityIds.length===0)return previous.map((entry)=>({...entry,pos:{...entry.pos},incoming:{...entry.incoming}}));
  const retired=new Set(retiredIdentityIds);return previous.filter((entry)=>entry.identityId===null||!retired.has(entry.identityId)).map((entry)=>({...entry,pos:{...entry.pos},incoming:{...entry.incoming}}));
}
export function updateProjectileImpactCountHold(previous:readonly ProjectileImpactCountHoldEntry[],clusters:readonly ProjectileImpactCluster[],dt:number,identityKeys?:readonly (number|null)[]):ProjectileImpactCountHoldEntry[]{
  const delta=Math.max(0,Number.isFinite(dt)?dt:0);
  const next=previous.map((entry)=>({...entry,pos:{...entry.pos},incoming:{...entry.incoming},holdRemaining:Math.max(0,entry.holdRemaining-delta),memoryRemaining:entry.memoryRemaining-delta})).filter((entry)=>entry.memoryRemaining>0);
  const used=new Set<number>();
  for(let clusterIndex=0;clusterIndex<clusters.length;clusterIndex++){
    const cluster=clusters[clusterIndex]!,identityId=identityKeys?.[clusterIndex]??null;
    let best=-1,bestDistance=Infinity;
    for(let i=0;i<next.length;i++){
      if(used.has(i))continue;const entry=next[i]!;if(identityId!==null){if(entry.identityId!==identityId)continue;}else if(entry.identityId!==null)continue;if(entry.sourceClass!==cluster.sourceClass||!projectileImpactCountDirectionCompatible(entry.incoming,cluster.incoming))continue;const d=distance(entry.pos,cluster.impact);if(d<=PROJECTILE_IMPACT_COUNT_MATCH_RADIUS&&d<bestDistance){best=i;bestDistance=d;}
    }
    if(best<0){next.push({sourceClass:cluster.sourceClass,pos:{...cluster.impact},incoming:{...cluster.incoming},heldCount:Math.max(1,cluster.count),holdRemaining:PROJECTILE_IMPACT_COUNT_HOLD_SECONDS,memoryRemaining:PROJECTILE_IMPACT_COUNT_MEMORY_SECONDS,identityId,presentationOnly:true});used.add(next.length-1);continue;}
    used.add(best);const entry=next[best]!;entry.pos={x:entry.pos.x*.7+cluster.impact.x*.3,y:entry.pos.y*.7+cluster.impact.y*.3};entry.incoming={...cluster.incoming};entry.memoryRemaining=PROJECTILE_IMPACT_COUNT_MEMORY_SECONDS;
    if(cluster.count>entry.heldCount){entry.heldCount=cluster.count;entry.holdRemaining=PROJECTILE_IMPACT_COUNT_HOLD_SECONDS;}
    else if(cluster.count<entry.heldCount&&entry.holdRemaining<=0){entry.heldCount=Math.max(1,cluster.count);entry.holdRemaining=PROJECTILE_IMPACT_COUNT_HOLD_SECONDS;}
  }
  return next;
}
export function projectileImpactHeldCount(memory:readonly ProjectileImpactCountHoldEntry[],cluster:ProjectileImpactCluster,identityId:number|null=null):number{
  let best:ProjectileImpactCountHoldEntry|undefined,bestDistance=Infinity;
  for(const entry of memory){if(identityId!==null){if(entry.identityId!==identityId)continue;}else if(entry.identityId!==null)continue;if(entry.sourceClass!==cluster.sourceClass||!projectileImpactCountDirectionCompatible(entry.incoming,cluster.incoming))continue;const d=distance(entry.pos,cluster.impact);if(d<=PROJECTILE_IMPACT_COUNT_MATCH_RADIUS&&d<bestDistance){best=entry;bestDistance=d;}}
  return best?Math.max(cluster.count,best.heldCount):cluster.count;
}
