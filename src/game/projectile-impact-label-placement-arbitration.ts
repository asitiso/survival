import type { Vec2 } from '../core/math.js';
import type { ProjectileImpactSourceClass } from './projectile-impact-source-continuity.js';

export const PROJECTILE_IMPACT_LABEL_STAMP_CLEARANCE=24;
export const PROJECTILE_IMPACT_LABEL_LABEL_CLEARANCE=34;
export const PROJECTILE_IMPACT_LABEL_SCREEN_INSET=16;
export interface ProjectileImpactLabelCluster{impact:Vec2;count:number;sourceClass:ProjectileImpactSourceClass;}
export interface ProjectileImpactLabelPlacement{clusterIndex:number;sourceClass:ProjectileImpactSourceClass;pos:Vec2;visible:boolean;animated:false;motionAmplitude:0;}

const OFFSETS:readonly Vec2[]=[{x:0,y:-38},{x:38,y:-10},{x:-38,y:-10},{x:0,y:36},{x:40,y:24},{x:-40,y:24}];
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
const distance=(a:Vec2,b:Vec2)=>Math.hypot(a.x-b.x,a.y-b.y);

export function projectileImpactLabelPlacements(input:{clusters:readonly ProjectileImpactLabelCluster[];stamps:readonly Vec2[];width:number;height:number;}):ProjectileImpactLabelPlacement[]{
  const placed:Vec2[]=[];const output:ProjectileImpactLabelPlacement[]=[];
  for(let index=0;index<input.clusters.length;index++){
    const cluster=input.clusters[index]!;
    if(cluster.count<=1){output.push({clusterIndex:index,sourceClass:cluster.sourceClass,pos:{...cluster.impact},visible:false,animated:false,motionAmplitude:0});continue;}
    let best:Vec2|null=null,bestScore=-Infinity;
    const offsets=cluster.sourceClass==='boss'?OFFSETS:[OFFSETS[0]!,OFFSETS[2]!,OFFSETS[1]!,OFFSETS[3]!,OFFSETS[5]!,OFFSETS[4]!];
    for(const offset of offsets){
      const candidate={x:clamp(cluster.impact.x+offset.x,PROJECTILE_IMPACT_LABEL_SCREEN_INSET,input.width-PROJECTILE_IMPACT_LABEL_SCREEN_INSET),y:clamp(cluster.impact.y+offset.y,PROJECTILE_IMPACT_LABEL_SCREEN_INSET,input.height-PROJECTILE_IMPACT_LABEL_SCREEN_INSET)};
      const stampMin=input.stamps.length?Math.min(...input.stamps.map((stamp)=>distance(candidate,stamp))):Infinity;
      const labelMin=placed.length?Math.min(...placed.map((label)=>distance(candidate,label))):Infinity;
      if(stampMin<PROJECTILE_IMPACT_LABEL_STAMP_CLEARANCE||labelMin<PROJECTILE_IMPACT_LABEL_LABEL_CLEARANCE)continue;
      const score=Math.min(stampMin,80)+Math.min(labelMin,80)-distance(candidate,cluster.impact)*.08;
      if(score>bestScore){best=candidate;bestScore=score;}
    }
    if(best){placed.push(best);output.push({clusterIndex:index,sourceClass:cluster.sourceClass,pos:best,visible:true,animated:false,motionAmplitude:0});}
    else output.push({clusterIndex:index,sourceClass:cluster.sourceClass,pos:{...cluster.impact},visible:false,animated:false,motionAmplitude:0});
  }
  return output;
}
