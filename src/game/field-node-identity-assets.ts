import type { FieldNodeKind } from './endless/world-evolution.js';

export const FIELD_NODE_IDENTITY_KINDS: readonly FieldNodeKind[] = [
  'mana_well','sanctuary_zone','barricade','safe_corridor','volatile_zone',
];

export const FIELD_NODE_IDENTITY_ATLAS = {
  src:'./assets/ui/field-node-icons.png', columns:3, rows:2, cellSize:96, width:288, height:192,
} as const;

const CELL_BY_KIND:Readonly<Record<FieldNodeKind,readonly [column:number,row:number]>>={
  mana_well:[0,0], sanctuary_zone:[1,0], barricade:[2,0], safe_corridor:[0,1], volatile_zone:[1,1],
};

const PRESENTATION_BY_KIND:Readonly<Record<FieldNodeKind,{label:string;color:string}>>={
  mana_well:{label:'MANA',color:'#9b7cff'},
  sanctuary_zone:{label:'SAFE',color:'#7ce8b7'},
  barricade:{label:'WALL',color:'#d0b277'},
  safe_corridor:{label:'PATH',color:'#75d8ff'},
  volatile_zone:{label:'RISK',color:'#ff6c83'},
};

export interface FieldNodeIdentityIcon{
  kind:FieldNodeKind;
  sx:number;sy:number;sw:number;sh:number;
  animated:false;
  motionAmplitude:0;
  textFallbackPreserved:true;
  loadFailureBlocksGameplay:false;
}

export function fieldNodeIdentityIcon(kind:FieldNodeKind):FieldNodeIdentityIcon{
  const [column,row]=CELL_BY_KIND[kind];
  return{kind,sx:column*96,sy:row*96,sw:96,sh:96,animated:false,motionAmplitude:0,textFallbackPreserved:true,loadFailureBlocksGameplay:false};
}

export function fieldNodeIdentityPresentation(kind:FieldNodeKind):{label:string;color:string}{
  return{...PRESENTATION_BY_KIND[kind]};
}

export interface FieldNodeIdentityAtlasAudit{
  itemCount:number;coverage:number;uniqueCellCount:number;outOfBounds:FieldNodeKind[];passed:boolean;
}

export function auditFieldNodeIdentityAtlas():FieldNodeIdentityAtlasAudit{
  const cells=new Set<string>(); const outOfBounds:FieldNodeKind[]=[];
  for(const kind of FIELD_NODE_IDENTITY_KINDS){
    const [column,row]=CELL_BY_KIND[kind]; cells.add(`${column}:${row}`);
    if(column<0||row<0||column>=3||row>=2)outOfBounds.push(kind);
  }
  const coverage=FIELD_NODE_IDENTITY_KINDS.length/5;
  return{itemCount:FIELD_NODE_IDENTITY_KINDS.length,coverage,uniqueCellCount:cells.size,outOfBounds,passed:coverage===1&&cells.size===5&&outOfBounds.length===0};
}
