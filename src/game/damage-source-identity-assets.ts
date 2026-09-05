import type { DamageReasonSource } from './damage-reason-feedback.js';

export const DAMAGE_SOURCE_IDENTITY_SOURCES: readonly DamageReasonSource[] = [
  'contact','projectile','explosion','arena','strain',
];

export const DAMAGE_SOURCE_IDENTITY_ATLAS = {
  src:'./assets/ui/damage-source-icons.png', columns:3, rows:2, cellSize:96, width:288, height:192,
} as const;

const CELL_BY_SOURCE:Readonly<Record<DamageReasonSource,readonly [column:number,row:number]>>={
  contact:[0,0], projectile:[1,0], explosion:[2,0], arena:[0,1], strain:[1,1],
};

export interface DamageSourceIdentityIcon{
  source:DamageReasonSource;
  sx:number;sy:number;sw:number;sh:number;
  animated:false;
  motionAmplitude:0;
  textFallbackPreserved:true;
  loadFailureBlocksGameplay:false;
}

export function damageSourceIdentityIcon(source:DamageReasonSource):DamageSourceIdentityIcon{
  const [column,row]=CELL_BY_SOURCE[source];
  return{source,sx:column*96,sy:row*96,sw:96,sh:96,animated:false,motionAmplitude:0,textFallbackPreserved:true,loadFailureBlocksGameplay:false};
}

export interface DamageSourceIdentityAtlasAudit{
  itemCount:number;coverage:number;uniqueCellCount:number;outOfBounds:DamageReasonSource[];passed:boolean;
}

export function auditDamageSourceIdentityAtlas():DamageSourceIdentityAtlasAudit{
  const cells=new Set<string>(); const outOfBounds:DamageReasonSource[]=[];
  for(const source of DAMAGE_SOURCE_IDENTITY_SOURCES){
    const [column,row]=CELL_BY_SOURCE[source]; cells.add(`${column}:${row}`);
    if(column<0||row<0||column>=3||row>=2)outOfBounds.push(source);
  }
  const coverage=DAMAGE_SOURCE_IDENTITY_SOURCES.length/5;
  return{itemCount:DAMAGE_SOURCE_IDENTITY_SOURCES.length,coverage,uniqueCellCount:cells.size,outOfBounds,passed:coverage===1&&cells.size===5&&outOfBounds.length===0};
}
