import type { ArcaneComboFamily, ArcaneComboTier } from './arcane-combos.js';

export const ARCANE_COMBO_IDENTITY_IDS = ['inferno-chain','frozen-control','storm-velocity','guardian-fortress'] as const satisfies readonly Exclude<ArcaneComboFamily,'none'>[];
export type ArcaneComboIdentityId = typeof ARCANE_COMBO_IDENTITY_IDS[number];

export const ARCANE_COMBO_IDENTITY_ATLAS = {
  src:'./assets/ui/arcane-combo-icons.png', columns:2, rows:2, cellSize:96, width:192, height:192,
} as const;

const CELL: Readonly<Record<ArcaneComboIdentityId, readonly [number,number]>> = {
  'inferno-chain':[0,0], 'frozen-control':[1,0], 'storm-velocity':[0,1], 'guardian-fortress':[1,1],
};
const META: Readonly<Record<ArcaneComboIdentityId,{label:string;accent:string}>> = {
  'inferno-chain':{label:'잿불 연쇄',accent:'#ff7659'},
  'frozen-control':{label:'절대영도 지배',accent:'#82e8ff'},
  'storm-velocity':{label:'초전도 폭풍',accent:'#b59cff'},
  'guardian-fortress':{label:'불멸의 성채',accent:'#ffd66f'},
};

export interface ArcaneComboIdentityIcon {
  id:ArcaneComboIdentityId; label:string; accent:string;
  sx:number; sy:number; sw:number; sh:number;
  hudIdentitySupported:true; tierToastIdentitySupported:true; tierBadgeSupported:true;
  animated:false; motionAmplitude:0; textFallbackPreserved:true; loadFailureBlocksGameplay:false;
}
export function arcaneComboIdentityIcon(id:ArcaneComboIdentityId):ArcaneComboIdentityIcon {
  const [c,r]=CELL[id],m=META[id],s=ARCANE_COMBO_IDENTITY_ATLAS.cellSize;
  return {id,label:m.label,accent:m.accent,sx:c*s,sy:r*s,sw:s,sh:s,hudIdentitySupported:true,tierToastIdentitySupported:true,tierBadgeSupported:true,animated:false,motionAmplitude:0,textFallbackPreserved:true,loadFailureBlocksGameplay:false};
}
export function arcaneComboTierBadge(tier:ArcaneComboTier):''|'I'|'II'|'III' { return tier===1?'I':tier===2?'II':tier===3?'III':''; }
export function auditArcaneComboIdentityAtlas(){
  const outOfBounds:string[]=[];const cells=new Set<string>();
  for(const id of ARCANE_COMBO_IDENTITY_IDS){const [c,r]=CELL[id];cells.add(`${c}:${r}`);if(c<0||r<0||c>=2||r>=2)outOfBounds.push(id);}
  return {itemCount:ARCANE_COMBO_IDENTITY_IDS.length,coverage:1,uniqueCellCount:cells.size,outOfBounds,assetSrc:ARCANE_COMBO_IDENTITY_ATLAS.src,passed:cells.size===4&&outOfBounds.length===0};
}
