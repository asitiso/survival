import type { ContractFamily } from './endless/contracts.js';

export const RUN_CONTRACT_BOON_EFFECT_IDENTITY_IDS=['xp-mastery','core-potion','fusion-cooldown','gold-boss','guard-potion'] as const;
export type RunContractBoonEffectIdentityId=typeof RUN_CONTRACT_BOON_EFFECT_IDENTITY_IDS[number];
const CELL:Readonly<Record<RunContractBoonEffectIdentityId,number>>={'xp-mastery':0,'core-potion':1,'fusion-cooldown':2,'gold-boss':3,'guard-potion':4};
const FAMILY:Readonly<Record<ContractFamily,RunContractBoonEffectIdentityId>>={slayer:'xp-mastery',warden:'core-potion',arcane:'fusion-cooldown',hunter:'gold-boss',survivor:'guard-potion'};
const META:Readonly<Record<RunContractBoonEffectIdentityId,{label:string;accent:string}>>={
  'xp-mastery':{label:'XP + MASTERY',accent:'#ff9a78'},'core-potion':{label:'CORE + POTION',accent:'#7edcff'},'fusion-cooldown':{label:'FUSION + CD',accent:'#c6a4ff'},'gold-boss':{label:'GOLD + BOSS',accent:'#ffd66e'},'guard-potion':{label:'GUARD + POTION',accent:'#7fe0a2'},
};
export interface RunContractBoonEffectIdentityIcon{id:RunContractBoonEffectIdentityId;label:string;accent:string;sx:number;sy:0;sw:96;sh:96;animated:false;motionAmplitude:0;textFallbackPreserved:true;loadFailureBlocksGameplay:false;}
export const RUN_CONTRACT_BOON_EFFECT_IDENTITY_ATLAS={src:'./assets/ui/run-contract-boon-effect-icons.png',columns:5,rows:1,cellSize:96,width:480,height:96} as const;
export function runContractBoonEffectIdentityForFamily(family:ContractFamily):RunContractBoonEffectIdentityId{return FAMILY[family];}
export function runContractBoonEffectIdentityIcon(id:RunContractBoonEffectIdentityId):RunContractBoonEffectIdentityIcon{const meta=META[id];return{id,label:meta.label,accent:meta.accent,sx:CELL[id]*96,sy:0,sw:96,sh:96,animated:false,motionAmplitude:0,textFallbackPreserved:true,loadFailureBlocksGameplay:false};}
export function runContractBoonEffectIdentityStyle(family:ContractFamily):string{const icon=runContractBoonEffectIdentityIcon(runContractBoonEffectIdentityForFamily(family));return`--secondary-icon-image:url('${RUN_CONTRACT_BOON_EFFECT_IDENTITY_ATLAS.src}');--secondary-icon-bg-size:500% 100%;--secondary-icon-bg-position:${(icon.sx/384)*100}% 0%`;}
export function auditRunContractBoonEffectIdentityAtlas(){const icons=RUN_CONTRACT_BOON_EFFECT_IDENTITY_IDS.map(runContractBoonEffectIdentityIcon);const outOfBounds=icons.filter(icon=>icon.sx<0||icon.sx+icon.sw>RUN_CONTRACT_BOON_EFFECT_IDENTITY_ATLAS.width||icon.sy+icon.sh>RUN_CONTRACT_BOON_EFFECT_IDENTITY_ATLAS.height).map(icon=>icon.id);const uniqueCellCount=new Set(icons.map(icon=>`${icon.sx}:${icon.sy}`)).size;const coverage=icons.length/5;return{coverage,uniqueCellCount,outOfBounds,passed:coverage===1&&uniqueCellCount===5&&outOfBounds.length===0};}
