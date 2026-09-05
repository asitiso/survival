import type { Vec2 } from '../core/math.js';
import type { ProjectileImpactCluster } from './projectile-impact-cluster-compression.js';
import type { ProjectileImpactLabelPlacement } from './projectile-impact-label-placement-arbitration.js';
import type { ProjectileImpactSourceClass } from './projectile-impact-source-continuity.js';

export const PROJECTILE_IMPACT_LABEL_ANCHOR_HOLD_SECONDS=.16;
export const PROJECTILE_IMPACT_LABEL_ANCHOR_MEMORY_SECONDS=.3;
export const PROJECTILE_IMPACT_LABEL_ANCHOR_MATCH_RADIUS=72;
export const PROJECTILE_IMPACT_LABEL_ANCHOR_DIRECTION_COSINE_MIN=.78;
export interface ProjectileImpactLabelAnchorHoldEntry{
  sourceClass:ProjectileImpactSourceClass;
  impact:Vec2;
  incoming:Vec2;
  labelPos:Vec2;
  holdRemaining:number;
  memoryRemaining:number;
  identityId:number|null;
  presentationOnly:true;
}
const distance=(a:Vec2,b:Vec2)=>Math.hypot(a.x-b.x,a.y-b.y);
export function projectileImpactLabelAnchorDirectionCompatible(a:Vec2,b:Vec2):boolean{const am=Math.hypot(a.x,a.y),bm=Math.hypot(b.x,b.y);if(am<1e-6||bm<1e-6)return false;return (a.x*b.x+a.y*b.y)/(am*bm)>=PROJECTILE_IMPACT_LABEL_ANCHOR_DIRECTION_COSINE_MIN;}
export function retireProjectileImpactLabelAnchorIdentities(previous:readonly ProjectileImpactLabelAnchorHoldEntry[],retiredIdentityIds:readonly number[]):ProjectileImpactLabelAnchorHoldEntry[]{
  if(retiredIdentityIds.length===0)return previous.map((entry)=>({...entry,impact:{...entry.impact},incoming:{...entry.incoming},labelPos:{...entry.labelPos}}));
  const retired=new Set(retiredIdentityIds);return previous.filter((entry)=>entry.identityId===null||!retired.has(entry.identityId)).map((entry)=>({...entry,impact:{...entry.impact},incoming:{...entry.incoming},labelPos:{...entry.labelPos}}));
}
export function updateProjectileImpactLabelAnchorHold(previous:readonly ProjectileImpactLabelAnchorHoldEntry[],clusters:readonly ProjectileImpactCluster[],placements:readonly ProjectileImpactLabelPlacement[],dt:number,identityKeys?:readonly (number|null)[]):ProjectileImpactLabelAnchorHoldEntry[]{
  const delta=Math.max(0,Number.isFinite(dt)?dt:0);
  const next=previous.map((entry)=>({...entry,impact:{...entry.impact},incoming:{...entry.incoming},labelPos:{...entry.labelPos},holdRemaining:Math.max(0,entry.holdRemaining-delta),memoryRemaining:entry.memoryRemaining-delta})).filter((entry)=>entry.memoryRemaining>0);
  const used=new Set<number>();
  for(let index=0;index<clusters.length;index++){
    const cluster=clusters[index]!,placement=placements[index],identityId=identityKeys?.[index]??null;if(!placement?.visible||cluster.count<=1)continue;
    let best=-1,bestDistance=Infinity;
    for(let i=0;i<next.length;i++){
      if(used.has(i))continue;const entry=next[i]!;if(identityId!==null){if(entry.identityId!==identityId)continue;}else if(entry.identityId!==null)continue;if(entry.sourceClass!==cluster.sourceClass||!projectileImpactLabelAnchorDirectionCompatible(entry.incoming,cluster.incoming))continue;const d=distance(entry.impact,cluster.impact);if(d<=PROJECTILE_IMPACT_LABEL_ANCHOR_MATCH_RADIUS&&d<bestDistance){best=i;bestDistance=d;}
    }
    if(best<0){next.push({sourceClass:cluster.sourceClass,impact:{...cluster.impact},incoming:{...cluster.incoming},labelPos:{...placement.pos},holdRemaining:PROJECTILE_IMPACT_LABEL_ANCHOR_HOLD_SECONDS,memoryRemaining:PROJECTILE_IMPACT_LABEL_ANCHOR_MEMORY_SECONDS,identityId,presentationOnly:true});used.add(next.length-1);continue;}
    used.add(best);const entry=next[best]!;entry.impact={x:entry.impact.x*.7+cluster.impact.x*.3,y:entry.impact.y*.7+cluster.impact.y*.3};entry.incoming={...cluster.incoming};entry.memoryRemaining=PROJECTILE_IMPACT_LABEL_ANCHOR_MEMORY_SECONDS;
    if(entry.holdRemaining<=0){entry.labelPos={...placement.pos};entry.holdRemaining=PROJECTILE_IMPACT_LABEL_ANCHOR_HOLD_SECONDS;}
  }
  return next;
}
export function projectileImpactAnchoredPlacements(memory:readonly ProjectileImpactLabelAnchorHoldEntry[],clusters:readonly ProjectileImpactCluster[],fallback:readonly ProjectileImpactLabelPlacement[],identityKeys?:readonly (number|null)[]):ProjectileImpactLabelPlacement[]{
  return fallback.map((placement,index)=>{
    const cluster=clusters[index],identityId=identityKeys?.[index]??null;if(!cluster||!placement.visible||cluster.count<=1)return{...placement,pos:{...placement.pos}};
    let best:ProjectileImpactLabelAnchorHoldEntry|undefined,bestDistance=Infinity;
    for(const entry of memory){if(identityId!==null){if(entry.identityId!==identityId)continue;}else if(entry.identityId!==null)continue;if(entry.sourceClass!==cluster.sourceClass||!projectileImpactLabelAnchorDirectionCompatible(entry.incoming,cluster.incoming))continue;const d=distance(entry.impact,cluster.impact);if(d<=PROJECTILE_IMPACT_LABEL_ANCHOR_MATCH_RADIUS&&d<bestDistance){best=entry;bestDistance=d;}}
    return best?{...placement,pos:{...best.labelPos}}:{...placement,pos:{...placement.pos}};
  });
}
