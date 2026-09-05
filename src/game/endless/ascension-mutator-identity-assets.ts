import type { AscensionMutator } from './ascension.js';

export const ASCENSION_MUTATOR_IDENTITY_IDS=['accelerated_projectiles','reinforced_elites','volatile_death','scarce_shop'] as const satisfies readonly AscensionMutator[];
export type AscensionMutatorIdentityId=typeof ASCENSION_MUTATOR_IDENTITY_IDS[number];

export const ASCENSION_MUTATOR_IDENTITY_ATLAS={
  src:'./assets/ui/ascension-mutator-icons.png',columns:2,rows:2,cellSize:96,width:192,height:192,
} as const;

const CELL_BY_ID:Readonly<Record<AscensionMutatorIdentityId,readonly [column:number,row:number]>>={
  accelerated_projectiles:[0,0],reinforced_elites:[1,0],volatile_death:[0,1],scarce_shop:[1,1],
};

export interface AscensionMutatorIdentityIcon{
  id:AscensionMutatorIdentityId;
  sx:number;sy:number;sw:number;sh:number;
  animated:false;
  motionAmplitude:0;
  toastIdentitySupported:true;
  activeRecallIdentitySupported:true;
  maxVisibleRecallIcons:3;
  textFallbackPreserved:true;
  loadFailureBlocksGameplay:false;
}

export function ascensionMutatorIdentityIcon(id:AscensionMutatorIdentityId):AscensionMutatorIdentityIcon{
  const [column,row]=CELL_BY_ID[id];
  return{id,sx:column*96,sy:row*96,sw:96,sh:96,animated:false,motionAmplitude:0,toastIdentitySupported:true,activeRecallIdentitySupported:true,maxVisibleRecallIcons:3,textFallbackPreserved:true,loadFailureBlocksGameplay:false};
}

export interface AscensionMutatorIdentityAtlasAudit{
  itemCount:number;coverage:number;uniqueCellCount:number;outOfBounds:AscensionMutatorIdentityId[];passed:boolean;
}

export function auditAscensionMutatorIdentityAtlas():AscensionMutatorIdentityAtlasAudit{
  const cells=new Set<string>();const outOfBounds:AscensionMutatorIdentityId[]=[];
  for(const id of ASCENSION_MUTATOR_IDENTITY_IDS){
    const [column,row]=CELL_BY_ID[id];cells.add(`${column}:${row}`);
    if(column<0||row<0||column>=2||row>=2)outOfBounds.push(id);
  }
  const coverage=ASCENSION_MUTATOR_IDENTITY_IDS.length/4;
  return{itemCount:ASCENSION_MUTATOR_IDENTITY_IDS.length,coverage,uniqueCellCount:cells.size,outOfBounds,passed:coverage===1&&cells.size===4&&outOfBounds.length===0};
}
