export const GENERIC_UPGRADE_GAIN_STATUS_IDS=['full','diminished','capped'] as const;
export type GenericUpgradeGainStatusId=typeof GENERIC_UPGRADE_GAIN_STATUS_IDS[number];
const CELL:Readonly<Record<GenericUpgradeGainStatusId,number>>={full:0,diminished:1,capped:2};
const META:Readonly<Record<GenericUpgradeGainStatusId,{label:string;accent:string}>>={
  full:{label:'정상 효율',accent:'#70e3ad'},diminished:{label:'감소 효율',accent:'#f2c96c'},capped:{label:'상한 도달',accent:'#ff8c78'},
};
export interface GenericUpgradeGainStatusIdentityIcon{id:GenericUpgradeGainStatusId;label:string;accent:string;sx:number;sy:0;sw:96;sh:96;animated:false;motionAmplitude:0;textFallbackPreserved:true;loadFailureBlocksGameplay:false;}
export const GENERIC_UPGRADE_GAIN_STATUS_ATLAS={src:'./assets/ui/generic-upgrade-gain-status-icons.png',columns:3,rows:1,cellSize:96,width:288,height:96} as const;
export function genericUpgradeGainStatusIdentityIcon(id:GenericUpgradeGainStatusId):GenericUpgradeGainStatusIdentityIcon{const meta=META[id];return{id,label:meta.label,accent:meta.accent,sx:CELL[id]*96,sy:0,sw:96,sh:96,animated:false,motionAmplitude:0,textFallbackPreserved:true,loadFailureBlocksGameplay:false};}
export function genericUpgradeGainStatusIdentityStyle(id:GenericUpgradeGainStatusId):string{return`--secondary-icon-image:url('${GENERIC_UPGRADE_GAIN_STATUS_ATLAS.src}');--secondary-icon-bg-size:300% 100%;--secondary-icon-bg-position:${CELL[id]*50}% 0%`;}
export function auditGenericUpgradeGainStatusIdentityAtlas(){const icons=GENERIC_UPGRADE_GAIN_STATUS_IDS.map(genericUpgradeGainStatusIdentityIcon),outOfBounds=icons.filter(icon=>icon.sx<0||icon.sx+icon.sw>GENERIC_UPGRADE_GAIN_STATUS_ATLAS.width||icon.sy+icon.sh>GENERIC_UPGRADE_GAIN_STATUS_ATLAS.height).map(icon=>icon.id),uniqueCellCount=new Set(icons.map(icon=>`${icon.sx}:${icon.sy}`)).size,coverage=icons.length/3;return{coverage,uniqueCellCount,outOfBounds,passed:coverage===1&&uniqueCellCount===3&&outOfBounds.length===0};}
