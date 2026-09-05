import { MAP_LAYOUTS, type MapId, type MapLayout } from './map-layouts.js';
import { evolveMapLayout, type MapEvolutionStage } from './map-evolution.js';
import type { BattlefieldMechanicIdentityId, BattlefieldStageIdentityId } from './battlefield-mechanic-identity-assets.js';

export interface BattlefieldMechanicMetrics{wallCount:number;slowCount:number;slowArea:number;slowStrength:number;crystalCount:number;crystalChargeEase:number;crystalBlastRadius:number;crystalDamage:number;}
export interface BattlefieldMechanicProjection{mapId:MapId;stage:MapEvolutionStage;stageIdentity:BattlefieldStageIdentityId;dominantMechanic:BattlefieldMechanicIdentityId;metrics:BattlefieldMechanicMetrics;scores:Record<BattlefieldMechanicIdentityId,number>;}
export interface BattlefieldEvolutionChange{id:BattlefieldMechanicIdentityId;score:number;label:string;}
export interface BattlefieldEvolutionImpactProjection{mapId:MapId;stage:1|2;previousStage:0|1;changes:readonly BattlefieldEvolutionChange[];before:BattlefieldMechanicProjection;after:BattlefieldMechanicProjection;}

function baseLayout(mapId:MapId):MapLayout{const layout=MAP_LAYOUTS.find(v=>v.id===mapId);if(!layout)throw new Error(`Unknown battlefield map: ${mapId}`);return layout;}
function avg(values:readonly number[]):number{return values.length===0?0:values.reduce((a,b)=>a+b,0)/values.length;}
function stageIdentity(stage:MapEvolutionStage):BattlefieldStageIdentityId{return stage===0?'stage0':stage===1?'stage1':'stage2';}
function metrics(layout:MapLayout):BattlefieldMechanicMetrics{
  return{
    wallCount:layout.walls.length,
    slowCount:layout.pools.length,
    slowArea:layout.pools.reduce((sum,p)=>sum+p.radius*p.radius,0),
    slowStrength:avg(layout.pools.map(p=>1-p.slowFactor)),
    crystalCount:layout.crystals.length,
    crystalChargeEase:avg(layout.crystals.map(c=>1/Math.max(1,c.threshold))),
    crystalBlastRadius:avg(layout.crystals.map(c=>c.blastRadius)),
    crystalDamage:avg(layout.crystals.map(c=>c.blastDamage)),
  };
}
function mechanicScores(m:BattlefieldMechanicMetrics):Record<BattlefieldMechanicIdentityId,number>{return{
  wall:m.wallCount,
  slow:m.slowCount*1.5+m.slowStrength*4,
  crystal:m.crystalCount*1.3+m.crystalDamage/200,
};}

export function projectBattlefieldMechanics(mapId:MapId,stage:MapEvolutionStage):BattlefieldMechanicProjection{
  const layout=evolveMapLayout(baseLayout(mapId),stage),m=metrics(layout),scores=mechanicScores(m),dominantMechanic=(Object.entries(scores) as [BattlefieldMechanicIdentityId,number][]).sort((a,b)=>b[1]-a[1])[0]![0];
  return{mapId,stage,stageIdentity:stageIdentity(stage),dominantMechanic,metrics:m,scores};
}
function changedJson(a:unknown,b:unknown):boolean{return JSON.stringify(a)!==JSON.stringify(b);}
export function projectBattlefieldEvolutionImpact(mapId:MapId,stage:1|2):BattlefieldEvolutionImpactProjection{
  const previousStage=(stage-1) as 0|1,before=projectBattlefieldMechanics(mapId,previousStage),after=projectBattlefieldMechanics(mapId,stage),base=baseLayout(mapId),beforeLayout=evolveMapLayout(base,previousStage),afterLayout=evolveMapLayout(base,stage),changes:BattlefieldEvolutionChange[]=[];
  const wallDelta=after.metrics.wallCount-before.metrics.wallCount,wallChanged=changedJson(beforeLayout.walls,afterLayout.walls);if(wallChanged){changes.push({id:'wall',score:Math.abs(wallDelta)*3+1,label:wallDelta>0?`벽+${wallDelta}`:wallDelta<0?`벽${wallDelta}`:'통로변경'});}
  const slowCountDelta=after.metrics.slowCount-before.metrics.slowCount,slowAreaRatio=before.metrics.slowArea>0?after.metrics.slowArea/before.metrics.slowArea:after.metrics.slowArea>0?2:1,slowStrengthDelta=after.metrics.slowStrength-before.metrics.slowStrength,slowChanged=changedJson(beforeLayout.pools,afterLayout.pools);if(slowChanged){let label=slowCountDelta!==0?`둔화${slowCountDelta>0?'+':''}${slowCountDelta}`:slowStrengthDelta>0.01&&slowAreaRatio>1.05?'둔화강화·확장':slowAreaRatio>1.05?'둔화확장':slowStrengthDelta>0.01?'둔화강화':'둔화변경';changes.push({id:'slow',score:Math.abs(slowCountDelta)*3+Math.abs(slowAreaRatio-1)*4+Math.abs(slowStrengthDelta)*12,label});}
  const crystalCountDelta=after.metrics.crystalCount-before.metrics.crystalCount,chargeDelta=after.metrics.crystalChargeEase-before.metrics.crystalChargeEase,radiusDelta=after.metrics.crystalBlastRadius-before.metrics.crystalBlastRadius,crystalChanged=changedJson(beforeLayout.crystals,afterLayout.crystals);if(crystalChanged){let label=crystalCountDelta!==0?`수정${crystalCountDelta>0?'+':''}${crystalCountDelta}`:chargeDelta>0.005&&radiusDelta>2?'수정강화':chargeDelta>0.005?'수정충전↑':radiusDelta>2?'수정폭발↑':'수정변경';changes.push({id:'crystal',score:Math.abs(crystalCountDelta)*3+Math.abs(chargeDelta)*20+Math.abs(radiusDelta)/20,label});}
  changes.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));return{mapId,stage,previousStage,changes:changes.slice(0,2),before,after};
}
export function battlefieldEvolutionImpactHint(projection:BattlefieldEvolutionImpactProjection):string{return projection.changes.map(v=>v.label).join(' · ');}
