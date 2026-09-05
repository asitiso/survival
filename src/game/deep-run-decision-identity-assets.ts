import type { HeroAscensionId } from './endless/hero-ascension.js';
import type { ContractFamily } from './endless/contracts.js';
import type { LongRunOathKind } from './endless/long-run-oaths.js';

export const DEEP_RUN_DECISION_ATLAS={
  src:'./assets/ui/deep-run-decision-icons.png',columns:7,rows:5,cellSize:96,width:672,height:480,
} as const;

export const DEEP_RUN_ASCENSION_IDS:readonly HeroAscensionId[]=[
  'wildfire-doctrine','ash-step','solar-collapse','cinder-heart','eruption-chain','phoenix-cycle',
  'absolute-zero','frozen-time','crystal-echo','glacier-step','whiteout','winter-covenant',
  'storm-circuit','thunder-step','overcharge','sky-breaker','static-shell','tempest-loop',
  'holy-bastion','vow-of-light','judgment-bell','pilgrim-step','radiant-wall','last-oath',
] as const;
export const DEEP_RUN_CONTRACT_IDS:readonly ContractFamily[]=['slayer','warden','arcane','hunter','survivor'] as const;
export const DEEP_RUN_OATH_IDS:readonly LongRunOathKind[]=['slayer','elite_hunt','boss_hunt','arcane_flow','core_guard','endure'] as const;

export type DeepRunDecisionIdentity =
  | {kind:'ascension';id:HeroAscensionId}
  | {kind:'contract';id:ContractFamily}
  | {kind:'oath';id:LongRunOathKind};

export interface DeepRunDecisionIdentityIcon{
  key:string;kind:DeepRunDecisionIdentity['kind'];id:string;atlasSrc:string;backgroundSize:string;backgroundPosition:string;
  sx:number;sy:number;sw:number;sh:number;animated:false;motionAmplitude:0;textFallbackPreserved:true;loadFailureBlocksGameplay:false;
}

const KEY_ORDER:readonly string[]=[
  ...DEEP_RUN_ASCENSION_IDS.map(id=>`ascension:${id}`),
  ...DEEP_RUN_CONTRACT_IDS.map(id=>`contract:${id}`),
  ...DEEP_RUN_OATH_IDS.map(id=>`oath:${id}`),
] as const;
const CELL=new Map<string,readonly[number,number]>(KEY_ORDER.map((key,index)=>[key,[index%DEEP_RUN_DECISION_ATLAS.columns,Math.floor(index/DEEP_RUN_DECISION_ATLAS.columns)] as const]));
const pct=(value:number,total:number)=>total<=1?0:(value/(total-1))*100;
const keyOf=(identity:DeepRunDecisionIdentity)=>`${identity.kind}:${identity.id}`;

export function deepRunDecisionIdentityIcon(identity:DeepRunDecisionIdentity):DeepRunDecisionIdentityIcon{
  const key=keyOf(identity);const cell=CELL.get(key);if(!cell)throw new Error(`Unknown deep-run decision identity: ${key}`);
  const[column,row]=cell;const size=DEEP_RUN_DECISION_ATLAS.cellSize;
  return{key,kind:identity.kind,id:identity.id,atlasSrc:DEEP_RUN_DECISION_ATLAS.src,backgroundSize:'700% 500%',backgroundPosition:`${pct(column,7)}% ${pct(row,5)}%`,sx:column*size,sy:row*size,sw:size,sh:size,animated:false,motionAmplitude:0,textFallbackPreserved:true,loadFailureBlocksGameplay:false};
}

export function deepRunDecisionIdentityStyle(identity:DeepRunDecisionIdentity):string{
  const icon=deepRunDecisionIdentityIcon(identity);
  return `--growth-icon-image:url('${icon.atlasSrc}');--growth-icon-bg-size:${icon.backgroundSize};--growth-icon-bg-position:${icon.backgroundPosition}`;
}

export function isDeepRunAscensionId(value:unknown):value is HeroAscensionId{return typeof value==='string'&&DEEP_RUN_ASCENSION_IDS.includes(value as HeroAscensionId);}
export function isDeepRunContractId(value:unknown):value is ContractFamily{return typeof value==='string'&&DEEP_RUN_CONTRACT_IDS.includes(value as ContractFamily);}
export function isDeepRunOathId(value:unknown):value is LongRunOathKind{return typeof value==='string'&&DEEP_RUN_OATH_IDS.includes(value as LongRunOathKind);}

export function auditDeepRunDecisionIdentityAtlas(){
  const cells=new Set<string>();const outOfBounds:string[]=[];
  for(const key of KEY_ORDER){
    const [column,row]=CELL.get(key)!;const sx=column*96,sy=row*96;cells.add(`${sx}:${sy}`);
    if(column<0||row<0||column>=DEEP_RUN_DECISION_ATLAS.columns||row>=DEEP_RUN_DECISION_ATLAS.rows||sx+96>DEEP_RUN_DECISION_ATLAS.width||sy+96>DEEP_RUN_DECISION_ATLAS.height)outOfBounds.push(key);
  }
  return{itemCount:KEY_ORDER.length,coverage:KEY_ORDER.length===35?1:KEY_ORDER.length/35,uniqueCellCount:cells.size,outOfBounds,assetSrc:DEEP_RUN_DECISION_ATLAS.src,passed:KEY_ORDER.length===35&&cells.size===35&&outOfBounds.length===0};
}
