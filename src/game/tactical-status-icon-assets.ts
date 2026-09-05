export const TACTICAL_STATUS_ICON_IDS = [
  'goldenGoblin','supplyDrop','manaStorm','goldenNight','eliteRush',
  'riftSeal','beaconDefense','cursedAltar',
  'massacre','eliteHunt','goldRush',
  'swarmFront','ironMarch','artilleryLine','hexConvoy',
] as const;

export type TacticalStatusIconId = typeof TACTICAL_STATUS_ICON_IDS[number];

export const TACTICAL_STATUS_ICON_ATLAS = {
  src: './assets/ui/tactical-status-icons.png',
  columns: 4,
  rows: 4,
  cellSize: 96,
  width: 384,
  height: 384,
} as const;

const CELL_BY_ID: Readonly<Record<TacticalStatusIconId, readonly [column:number,row:number]>> = {
  goldenGoblin:[0,0], supplyDrop:[1,0], manaStorm:[2,0], goldenNight:[3,0],
  eliteRush:[0,1], riftSeal:[1,1], beaconDefense:[2,1], cursedAltar:[3,1],
  massacre:[0,2], eliteHunt:[1,2], goldRush:[2,2], swarmFront:[3,2],
  ironMarch:[0,3], artilleryLine:[1,3], hexConvoy:[2,3],
};

export interface TacticalStatusIconSprite { sx:number; sy:number; sw:number; sh:number; }
export interface TacticalStatusIconPresentation {
  visible:boolean;
  animated:false;
  motionAmplitude:0;
  size:number;
  compactSize:number;
  sprite:TacticalStatusIconSprite;
}

function isId(id:string): id is TacticalStatusIconId {
  return Object.prototype.hasOwnProperty.call(CELL_BY_ID,id);
}

export function tacticalStatusIconSprite(id:string):TacticalStatusIconSprite {
  if(!isId(id)) return {sx:0,sy:0,sw:0,sh:0};
  const [column,row]=CELL_BY_ID[id];
  const size=TACTICAL_STATUS_ICON_ATLAS.cellSize;
  return {sx:column*size,sy:row*size,sw:size,sh:size};
}

export function tacticalStatusIconPresentation(id:string):TacticalStatusIconPresentation {
  const visible=isId(id);
  return {
    visible,
    animated:false,
    motionAmplitude:0,
    size:30,
    compactSize:24,
    sprite:visible?tacticalStatusIconSprite(id):{sx:0,sy:0,sw:0,sh:0},
  };
}

export interface TacticalStatusIconAtlasAudit {
  itemCount:number;
  coverage:number;
  uniqueCellCount:number;
  missing:string[];
  outOfBounds:string[];
}

export function auditTacticalStatusIconAtlas(ids:readonly string[]):TacticalStatusIconAtlasAudit {
  const missing:string[]=[];
  const outOfBounds:string[]=[];
  const cells=new Set<string>();
  for(const id of ids){
    if(!isId(id)){missing.push(id);continue;}
    const [column,row]=CELL_BY_ID[id];
    cells.add(`${column}:${row}`);
    if(column<0||row<0||column>=TACTICAL_STATUS_ICON_ATLAS.columns||row>=TACTICAL_STATUS_ICON_ATLAS.rows) outOfBounds.push(id);
  }
  return {
    itemCount:ids.length,
    coverage:ids.length===0?1:(ids.length-missing.length)/ids.length,
    uniqueCellCount:cells.size,
    missing,
    outOfBounds,
  };
}
