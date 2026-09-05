export const DECISION_PATH_ICON_IDS = [
  'destruction','rapidCasting','goldSense','guardianOath',
  'infernalPact','glacialFocus','stormPursuit','bastionVow',
  'frenzy','golden','guardian',
] as const;

export type DecisionPathIconId = typeof DECISION_PATH_ICON_IDS[number];

export const DECISION_PATH_ICON_ATLAS = {
  src: './assets/ui/decision-path-icons.png',
  columns: 4,
  rows: 3,
  cellSize: 96,
  width: 384,
  height: 288,
} as const;

const CELL_BY_ID: Readonly<Record<DecisionPathIconId, readonly [column:number,row:number]>> = {
  destruction:[0,0], rapidCasting:[1,0], goldSense:[2,0], guardianOath:[3,0],
  infernalPact:[0,1], glacialFocus:[1,1], stormPursuit:[2,1], bastionVow:[3,1],
  frenzy:[0,2], golden:[1,2], guardian:[2,2],
};

export interface DecisionPathIconSprite { sx:number; sy:number; sw:number; sh:number; }

export function decisionPathIconSprite(id:string):DecisionPathIconSprite|null {
  if(!isId(id)) return null;
  const [column,row]=CELL_BY_ID[id];
  return {sx:column*DECISION_PATH_ICON_ATLAS.cellSize,sy:row*DECISION_PATH_ICON_ATLAS.cellSize,sw:DECISION_PATH_ICON_ATLAS.cellSize,sh:DECISION_PATH_ICON_ATLAS.cellSize};
}

export interface DecisionPathIconPresentation {
  visible:boolean;
  animated:false;
  motionAmplitude:0;
  size:number;
  compactSize:number;
  atlasSrc:string;
  backgroundSize:string;
  backgroundPosition:string;
}

function isId(id:string): id is DecisionPathIconId {
  return Object.prototype.hasOwnProperty.call(CELL_BY_ID,id);
}

function position(column:number,row:number):string {
  const x=DECISION_PATH_ICON_ATLAS.columns<=1?0:(column/(DECISION_PATH_ICON_ATLAS.columns-1))*100;
  const y=DECISION_PATH_ICON_ATLAS.rows<=1?0:(row/(DECISION_PATH_ICON_ATLAS.rows-1))*100;
  return `${x}% ${y}%`;
}

export function decisionPathIconPresentation(id:string):DecisionPathIconPresentation {
  if(!isId(id)) return {visible:false,animated:false,motionAmplitude:0,size:52,compactSize:40,atlasSrc:DECISION_PATH_ICON_ATLAS.src,backgroundSize:'400% 300%',backgroundPosition:'50% 50%'};
  const [column,row]=CELL_BY_ID[id];
  return {visible:true,animated:false,motionAmplitude:0,size:52,compactSize:40,atlasSrc:DECISION_PATH_ICON_ATLAS.src,backgroundSize:'400% 300%',backgroundPosition:position(column,row)};
}

export function decisionPathIconStyle(id:string):string {
  const p=decisionPathIconPresentation(id);
  if(!p.visible) return '';
  return `--decision-path-image:url('${p.atlasSrc}');--decision-path-bg-size:${p.backgroundSize};--decision-path-bg-position:${p.backgroundPosition}`;
}

export interface DecisionPathIconAtlasAudit { itemCount:number; coverage:number; uniqueCellCount:number; missing:string[]; outOfBounds:string[]; }
export function auditDecisionPathIconAtlas(ids:readonly string[]):DecisionPathIconAtlasAudit {
  const missing:string[]=[]; const outOfBounds:string[]=[]; const cells=new Set<string>();
  for(const id of ids){
    if(!isId(id)){missing.push(id);continue;}
    const [column,row]=CELL_BY_ID[id]; cells.add(`${column}:${row}`);
    if(column<0||row<0||column>=DECISION_PATH_ICON_ATLAS.columns||row>=DECISION_PATH_ICON_ATLAS.rows) outOfBounds.push(id);
  }
  return {itemCount:ids.length,coverage:ids.length===0?1:(ids.length-missing.length)/ids.length,uniqueCellCount:cells.size,missing,outOfBounds};
}
