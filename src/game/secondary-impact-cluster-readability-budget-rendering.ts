import type { Vec2 } from '../core/math.js';
import type { PresentationQuality } from './presentation-budget.js';
import { projectileImpactClusterLimit } from './projectile-impact-cluster-compression.js';
export interface SecondaryImpactBudgetInput{pos:Vec2;ttl:number;maxTtl:number;stableClusterKey?:string|undefined;heldCount?:number|undefined;}
export interface SecondaryImpactBudgetPresentation{visible:boolean;alphaScale:number;sizeScale:number;clusterCount:number;clusterIndex:number;presentationOnly:true;}
const clusterRadius=58;
function lifeOf(entry:SecondaryImpactBudgetInput):number{return entry.maxTtl>0?Math.max(0,Math.min(1,entry.ttl/entry.maxTtl)):0;}
export function secondaryImpactClusterReadabilityBudgetPresentation(impacts:readonly SecondaryImpactBudgetInput[],quality:PresentationQuality,reducedFlash=false):SecondaryImpactBudgetPresentation[]{
  const groups:Array<{indices:number[];sumX:number;sumY:number;maxLife:number;stableKey?:string}> = [];
  for(let index=0;index<impacts.length;index++){
    const impact=impacts[index]!;let best=-1,bestDistance=Infinity;
    for(let gIndex=0;gIndex<groups.length;gIndex++){
      const group=groups[gIndex]!;if(impact.stableClusterKey&&group.stableKey){if(impact.stableClusterKey===group.stableKey){best=gIndex;bestDistance=0;}continue;}
      const center={x:group.sumX/group.indices.length,y:group.sumY/group.indices.length},distance=Math.hypot(impact.pos.x-center.x,impact.pos.y-center.y);
      if(distance<=clusterRadius&&distance<bestDistance){best=gIndex;bestDistance=distance;}
    }
    if(best>=0){const group=groups[best]!;group.indices.push(index);group.sumX+=impact.pos.x;group.sumY+=impact.pos.y;group.maxLife=Math.max(group.maxLife,lifeOf(impact));}
    else groups.push({indices:[index],sumX:impact.pos.x,sumY:impact.pos.y,maxLife:lifeOf(impact),...(impact.stableClusterKey?{stableKey:impact.stableClusterKey}:{})});
  }
  const clusterLimit=projectileImpactClusterLimit(quality),perClusterLimit=quality==='high'?3:quality==='medium'?2:1;
  const selected=new Set(groups.map((group,index)=>({index,count:group.indices.length,life:group.maxLife})).sort((a,b)=>b.count-a.count||b.life-a.life||a.index-b.index).slice(0,clusterLimit).map(entry=>entry.index));
  const output:SecondaryImpactBudgetPresentation[]=impacts.map(()=>({visible:false,alphaScale:0,sizeScale:0,clusterCount:0,clusterIndex:-1,presentationOnly:true as const}));
  groups.forEach((group,groupIndex)=>{
    const ordered=[...group.indices].sort((a,b)=>lifeOf(impacts[b]!)-lifeOf(impacts[a]!)||a-b),count=group.indices.length,heldCount=Math.max(count,...group.indices.map(i=>Math.max(0,Math.floor(impacts[i]!.heldCount??0)))),effectiveCount=Math.max(count,heldCount),selectedGroup=selected.has(groupIndex);
    const densityAlpha=effectiveCount<=1?1:Math.max(.42,1/Math.sqrt(effectiveCount)),densitySize=effectiveCount<=1?1:Math.max(.72,1-(effectiveCount-1)*.055),flashScale=reducedFlash&&effectiveCount>1?.82:1;
    ordered.forEach((impactIndex,rank)=>{const visible=selectedGroup&&rank<perClusterLimit;output[impactIndex]={visible,alphaScale:visible?densityAlpha*flashScale:0,sizeScale:visible?densitySize:0,clusterCount:effectiveCount,clusterIndex:groupIndex,presentationOnly:true};});
  });
  return output;
}
