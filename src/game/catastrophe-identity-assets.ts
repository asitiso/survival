import type { CatastropheId } from '../domain/catastrophe.js';

export const CATASTROPHE_IDENTITY_IDS: readonly CatastropheId[] = [
  'goldenNight','frenzy','arcaneSurge','redMoon','guardianGrace',
];

export const CATASTROPHE_IDENTITY_ATLAS = {
  src:'./assets/ui/catastrophe-icons.png', columns:3, rows:2, cellSize:96, width:288, height:192,
} as const;

const CELL_BY_ID:Readonly<Record<CatastropheId,readonly [column:number,row:number]>>={
  goldenNight:[0,0], frenzy:[1,0], arcaneSurge:[2,0], redMoon:[0,1], guardianGrace:[1,1],
};

export interface CatastropheIdentityIcon{
  id:CatastropheId;
  sx:number;sy:number;sw:number;sh:number;
  animated:false;
  motionAmplitude:0;
  textFallbackPreserved:true;
  loadFailureBlocksGameplay:false;
}

export function catastropheIdentityIcon(id:CatastropheId):CatastropheIdentityIcon{
  const [column,row]=CELL_BY_ID[id];
  return{id,sx:column*96,sy:row*96,sw:96,sh:96,animated:false,motionAmplitude:0,textFallbackPreserved:true,loadFailureBlocksGameplay:false};
}

export interface CatastropheIdentityAtlasAudit{
  itemCount:number;coverage:number;uniqueCellCount:number;outOfBounds:CatastropheId[];passed:boolean;
}

export function auditCatastropheIdentityAtlas():CatastropheIdentityAtlasAudit{
  const cells=new Set<string>(); const outOfBounds:CatastropheId[]=[];
  for(const id of CATASTROPHE_IDENTITY_IDS){
    const [column,row]=CELL_BY_ID[id]; cells.add(`${column}:${row}`);
    if(column<0||row<0||column>=3||row>=2)outOfBounds.push(id);
  }
  const coverage=CATASTROPHE_IDENTITY_IDS.length/5;
  return{itemCount:CATASTROPHE_IDENTITY_IDS.length,coverage,uniqueCellCount:cells.size,outOfBounds,passed:coverage===1&&cells.size===5&&outOfBounds.length===0};
}
