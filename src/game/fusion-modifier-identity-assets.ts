export const FUSION_MODIFIER_IDENTITY_IDS=['damage','area','cooldown','chain','pierce','slow-duration','tick-power'] as const;
export type FusionModifierIdentityId=typeof FUSION_MODIFIER_IDENTITY_IDS[number];

const CELL:Readonly<Record<FusionModifierIdentityId,readonly[number,number]>>={
  damage:[0,0],area:[1,0],cooldown:[2,0],chain:[3,0],pierce:[0,1],'slow-duration':[1,1],'tick-power':[2,1],
};
const META:Readonly<Record<FusionModifierIdentityId,{label:string;accent:string}>>={
  damage:{label:'피해',accent:'#ff765f'},area:{label:'범위',accent:'#d49aff'},cooldown:{label:'쿨타임',accent:'#72d9ff'},chain:{label:'연쇄',accent:'#ffe06a'},pierce:{label:'관통',accent:'#ffb46d'},'slow-duration':{label:'둔화 지속',accent:'#8ee9ff'},'tick-power':{label:'틱 위력',accent:'#ff8fc4'},
};
export interface FusionModifierIdentityIcon{id:FusionModifierIdentityId;label:string;accent:string;sx:number;sy:number;sw:96;sh:96;animated:false;motionAmplitude:0;textFallbackPreserved:true;loadFailureBlocksGameplay:false;}
export const FUSION_MODIFIER_IDENTITY_ATLAS={src:'./assets/ui/fusion-modifier-icons.png',columns:4,rows:2,cellSize:96,width:384,height:192} as const;
const pct=(index:number,count:number)=>count<=1?0:(index/(count-1))*100;
export function fusionModifierIdentityIcon(id:FusionModifierIdentityId):FusionModifierIdentityIcon{const[column,row]=CELL[id],meta=META[id];return{id,label:meta.label,accent:meta.accent,sx:column*96,sy:row*96,sw:96,sh:96,animated:false,motionAmplitude:0,textFallbackPreserved:true,loadFailureBlocksGameplay:false};}
export function fusionModifierIdentityStyle(id:FusionModifierIdentityId):string{const[column,row]=CELL[id];return`--secondary-icon-image:url('${FUSION_MODIFIER_IDENTITY_ATLAS.src}');--secondary-icon-bg-size:400% 200%;--secondary-icon-bg-position:${pct(column,4)}% ${pct(row,2)}%`;}
export function auditFusionModifierIdentityAtlas(){const icons=FUSION_MODIFIER_IDENTITY_IDS.map(fusionModifierIdentityIcon),outOfBounds=icons.filter(icon=>icon.sx<0||icon.sy<0||icon.sx+icon.sw>FUSION_MODIFIER_IDENTITY_ATLAS.width||icon.sy+icon.sh>FUSION_MODIFIER_IDENTITY_ATLAS.height).map(icon=>icon.id),uniqueCellCount=new Set(icons.map(icon=>`${icon.sx}:${icon.sy}`)).size,coverage=icons.length/7;return{coverage,uniqueCellCount,outOfBounds,passed:coverage===1&&uniqueCellCount===7&&outOfBounds.length===0};}
