import type { ContractFamily } from './endless/contracts.js';

export const RUN_CONTRACT_REQUIREMENT_IDENTITY_IDS=['slayer-kills','warden-core-guard','arcane-casts','hunter-elite','survivor-no-hit'] as const;
export type RunContractRequirementIdentityId=typeof RUN_CONTRACT_REQUIREMENT_IDENTITY_IDS[number];
const CELL:Readonly<Record<RunContractRequirementIdentityId,number>>={'slayer-kills':0,'warden-core-guard':1,'arcane-casts':2,'hunter-elite':3,'survivor-no-hit':4};
const FAMILY:Readonly<Record<ContractFamily,RunContractRequirementIdentityId>>={slayer:'slayer-kills',warden:'warden-core-guard',arcane:'arcane-casts',hunter:'hunter-elite',survivor:'survivor-no-hit'};
const META:Readonly<Record<RunContractRequirementIdentityId,{label:string;accent:string}>>={
  'slayer-kills':{label:'DEFEAT',accent:'#ff7f6d'},'warden-core-guard':{label:'GUARD CORE',accent:'#7edcff'},'arcane-casts':{label:'CAST',accent:'#b996ff'},'hunter-elite':{label:'HUNT ELITE',accent:'#ffd66e'},'survivor-no-hit':{label:'NO HIT',accent:'#7fe0a2'},
};
export interface RunContractRequirementIdentityIcon{id:RunContractRequirementIdentityId;label:string;accent:string;sx:number;sy:0;sw:96;sh:96;animated:false;motionAmplitude:0;textFallbackPreserved:true;loadFailureBlocksGameplay:false;}
export const RUN_CONTRACT_REQUIREMENT_IDENTITY_ATLAS={src:'./assets/ui/run-contract-requirement-icons.png',columns:5,rows:1,cellSize:96,width:480,height:96} as const;
export function runContractRequirementIdentityForFamily(family:ContractFamily):RunContractRequirementIdentityId{return FAMILY[family];}
export function runContractRequirementIdentityIcon(id:RunContractRequirementIdentityId):RunContractRequirementIdentityIcon{const meta=META[id];return{id,label:meta.label,accent:meta.accent,sx:CELL[id]*96,sy:0,sw:96,sh:96,animated:false,motionAmplitude:0,textFallbackPreserved:true,loadFailureBlocksGameplay:false};}
export function runContractRequirementIdentityStyle(family:ContractFamily):string{const icon=runContractRequirementIdentityIcon(runContractRequirementIdentityForFamily(family));return`--secondary-icon-image:url('${RUN_CONTRACT_REQUIREMENT_IDENTITY_ATLAS.src}');--secondary-icon-bg-size:500% 100%;--secondary-icon-bg-position:${(icon.sx/384)*100}% 0%`;}
export function auditRunContractRequirementIdentityAtlas(){const icons=RUN_CONTRACT_REQUIREMENT_IDENTITY_IDS.map(runContractRequirementIdentityIcon);const outOfBounds=icons.filter(icon=>icon.sx<0||icon.sx+icon.sw>RUN_CONTRACT_REQUIREMENT_IDENTITY_ATLAS.width||icon.sy+icon.sh>RUN_CONTRACT_REQUIREMENT_IDENTITY_ATLAS.height).map(icon=>icon.id);const uniqueCellCount=new Set(icons.map(icon=>`${icon.sx}:${icon.sy}`)).size;const coverage=icons.length/5;return{coverage,uniqueCellCount,outOfBounds,passed:coverage===1&&uniqueCellCount===5&&outOfBounds.length===0};}
