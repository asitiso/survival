import type { BossArchetype } from '../boss-patterns.js';

export const MYTHIC_TACTIC_IDENTITY_IDS=['ember','brood','iron','void','twin','time'] as const;
export type MythicTacticAssetId=typeof MYTHIC_TACTIC_IDENTITY_IDS[number];

export const MYTHIC_TACTIC_IDENTITY_ATLAS={
  src:'./assets/ui/mythic-tactic-icons.png',columns:3,rows:2,cellSize:96,width:288,height:192,
} as const;

const CELL_BY_ID:Readonly<Record<MythicTacticAssetId,readonly [column:number,row:number]>>={
  ember:[0,0],brood:[1,0],iron:[2,0],void:[0,1],twin:[1,1],time:[2,1],
};
const ID_BY_ARCHETYPE:Readonly<Record<BossArchetype,MythicTacticAssetId>>={
  inferno:'ember',summoner:'brood',juggernaut:'iron',abyssWitch:'void',twinMaw:'twin',timeEater:'time',
};

export interface MythicTacticIdentityIcon{
  id:MythicTacticAssetId;
  sx:number;sy:number;sw:number;sh:number;
  animated:false;
  motionAmplitude:0;
  rewardIdentitySupported:true;
  primedIdentitySupported:true;
  consumedIdentitySupported:true;
  textFallbackPreserved:true;
  loadFailureBlocksGameplay:false;
}

export function mythicTacticIdentityIdForArchetype(archetype:BossArchetype):MythicTacticAssetId{return ID_BY_ARCHETYPE[archetype];}

export function mythicTacticIdentityIcon(id:MythicTacticAssetId):MythicTacticIdentityIcon{
  const [column,row]=CELL_BY_ID[id];
  return{id,sx:column*96,sy:row*96,sw:96,sh:96,animated:false,motionAmplitude:0,rewardIdentitySupported:true,primedIdentitySupported:true,consumedIdentitySupported:true,textFallbackPreserved:true,loadFailureBlocksGameplay:false};
}

export interface MythicTacticIdentityAtlasAudit{
  itemCount:number;coverage:number;uniqueCellCount:number;outOfBounds:MythicTacticAssetId[];passed:boolean;
}

export function auditMythicTacticIdentityAtlas():MythicTacticIdentityAtlasAudit{
  const cells=new Set<string>();const outOfBounds:MythicTacticAssetId[]=[];
  for(const id of MYTHIC_TACTIC_IDENTITY_IDS){
    const [column,row]=CELL_BY_ID[id];cells.add(`${column}:${row}`);
    if(column<0||row<0||column>=3||row>=2)outOfBounds.push(id);
  }
  const coverage=MYTHIC_TACTIC_IDENTITY_IDS.length/6;
  return{itemCount:MYTHIC_TACTIC_IDENTITY_IDS.length,coverage,uniqueCellCount:cells.size,outOfBounds,passed:coverage===1&&cells.size===6&&outOfBounds.length===0};
}
