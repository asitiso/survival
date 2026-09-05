import type { MythicLastLawId } from './mythic-last-law-identity.js';

export type MythicLastLawAssetId=Exclude<MythicLastLawId,'none'>;

export const MYTHIC_LAST_LAW_IDENTITY_IDS:readonly MythicLastLawAssetId[]=[
  'solar-rupture','brood-crown','iron-verdict','null-eclipse','twin-cataclysm','broken-hour',
];

export const MYTHIC_LAST_LAW_IDENTITY_ATLAS={
  src:'./assets/ui/mythic-last-law-icons.png',columns:3,rows:2,cellSize:96,width:288,height:192,
} as const;

const CELL_BY_ID:Readonly<Record<MythicLastLawAssetId,readonly [column:number,row:number]>>={
  'solar-rupture':[0,0], 'brood-crown':[1,0], 'iron-verdict':[2,0],
  'null-eclipse':[0,1], 'twin-cataclysm':[1,1], 'broken-hour':[2,1],
};

export interface MythicLastLawIdentityIcon{
  id:MythicLastLawAssetId;
  sx:number;sy:number;sw:number;sh:number;
  animated:false;
  motionAmplitude:0;
  toastIdentitySupported:true;
  safeLaneIdentitySupported:true;
  textFallbackPreserved:true;
  loadFailureBlocksGameplay:false;
}

export function mythicLastLawIdentityIcon(id:MythicLastLawAssetId):MythicLastLawIdentityIcon{
  const [column,row]=CELL_BY_ID[id];
  return{id,sx:column*96,sy:row*96,sw:96,sh:96,animated:false,motionAmplitude:0,toastIdentitySupported:true,safeLaneIdentitySupported:true,textFallbackPreserved:true,loadFailureBlocksGameplay:false};
}

export interface MythicLastLawIdentityAtlasAudit{
  itemCount:number;coverage:number;uniqueCellCount:number;outOfBounds:MythicLastLawAssetId[];passed:boolean;
}

export function auditMythicLastLawIdentityAtlas():MythicLastLawIdentityAtlasAudit{
  const cells=new Set<string>();const outOfBounds:MythicLastLawAssetId[]=[];
  for(const id of MYTHIC_LAST_LAW_IDENTITY_IDS){
    const [column,row]=CELL_BY_ID[id];cells.add(`${column}:${row}`);
    if(column<0||row<0||column>=3||row>=2)outOfBounds.push(id);
  }
  const coverage=MYTHIC_LAST_LAW_IDENTITY_IDS.length/6;
  return{itemCount:MYTHIC_LAST_LAW_IDENTITY_IDS.length,coverage,uniqueCellCount:cells.size,outOfBounds,passed:coverage===1&&cells.size===6&&outOfBounds.length===0};
}
