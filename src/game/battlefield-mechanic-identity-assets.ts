export type BattlefieldMechanicIdentityId='wall'|'slow'|'crystal';
export type BattlefieldStageIdentityId='stage0'|'stage1'|'stage2';
export type BattlefieldMechanicAtlasIdentityId=BattlefieldMechanicIdentityId|BattlefieldStageIdentityId;

export const BATTLEFIELD_MECHANIC_IDS:readonly BattlefieldMechanicIdentityId[]=['wall','slow','crystal'] as const;
export const BATTLEFIELD_STAGE_IDS:readonly BattlefieldStageIdentityId[]=['stage0','stage1','stage2'] as const;
export const BATTLEFIELD_MECHANIC_ATLAS={src:'./assets/ui/battlefield-mechanic-icons.png',columns:3,rows:2,cellSize:96,width:288,height:192} as const;

const CELL_INDEX:Record<BattlefieldMechanicAtlasIdentityId,number>={wall:0,slow:1,crystal:2,stage0:3,stage1:4,stage2:5};

export interface BattlefieldMechanicIdentityIcon{
  id:BattlefieldMechanicAtlasIdentityId;atlasSrc:string;sx:number;sy:number;sw:number;sh:number;animated:false;motionAmplitude:0;textFallbackPreserved:true;loadFailureBlocksGameplay:false;
}

export function battlefieldMechanicIdentityIcon(id:BattlefieldMechanicAtlasIdentityId):BattlefieldMechanicIdentityIcon{
  const index=CELL_INDEX[id],cell=BATTLEFIELD_MECHANIC_ATLAS.cellSize;
  return{id,atlasSrc:BATTLEFIELD_MECHANIC_ATLAS.src,sx:(index%BATTLEFIELD_MECHANIC_ATLAS.columns)*cell,sy:Math.floor(index/BATTLEFIELD_MECHANIC_ATLAS.columns)*cell,sw:cell,sh:cell,animated:false,motionAmplitude:0,textFallbackPreserved:true,loadFailureBlocksGameplay:false};
}

export function auditBattlefieldMechanicIdentityAtlas(){
  const ids:readonly BattlefieldMechanicAtlasIdentityId[]=[...BATTLEFIELD_MECHANIC_IDS,...BATTLEFIELD_STAGE_IDS],cells=new Set<string>(),outOfBounds:string[]=[];
  for(const id of ids){const icon=battlefieldMechanicIdentityIcon(id);cells.add(`${icon.sx}:${icon.sy}`);if(icon.sx<0||icon.sy<0||icon.sx+icon.sw>BATTLEFIELD_MECHANIC_ATLAS.width||icon.sy+icon.sh>BATTLEFIELD_MECHANIC_ATLAS.height)outOfBounds.push(id);}
  return{itemCount:ids.length,coverage:ids.length/6,uniqueCellCount:cells.size,outOfBounds,passed:ids.length===6&&cells.size===6&&outOfBounds.length===0};
}
