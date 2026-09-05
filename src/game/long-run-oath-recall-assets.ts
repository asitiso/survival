import { DEEP_RUN_DECISION_ATLAS, DEEP_RUN_OATH_IDS, deepRunDecisionIdentityIcon } from './deep-run-decision-identity-assets.js';
import type { LongRunOathKind } from './endless/long-run-oaths.js';

export const LONG_RUN_OATH_RECALL_IDS = DEEP_RUN_OATH_IDS;
export type LongRunOathRecallId = LongRunOathKind;

const TITLES:Readonly<Record<LongRunOathRecallId,string>>={
  slayer:'소탕 서약',
  elite_hunt:'정예 사냥 서약',
  boss_hunt:'군주 사냥 서약',
  arcane_flow:'영창 서약',
  core_guard:'수호 서약',
  endure:'불굴 서약',
};

export interface LongRunOathRecallIconPresentation {
  id:LongRunOathRecallId;
  atlasSrc:string;
  sx:number; sy:number; sw:number; sh:number;
  startToastIdentitySupported:true;
  activeRecallIdentitySupported:true;
  outcomeToastIdentitySupported:true;
  maxVisibleRecallIcons:1;
  animated:false;
  motionAmplitude:0;
  textFallbackPreserved:true;
  loadFailureBlocksGameplay:false;
}

export function longRunOathTitle(id:LongRunOathRecallId):string{return TITLES[id];}

export function longRunOathKindFromTitle(title:string):LongRunOathRecallId|null{
  for(const id of LONG_RUN_OATH_RECALL_IDS)if(TITLES[id]===title)return id;
  return null;
}

export function longRunOathRecallIcon(id:LongRunOathRecallId):LongRunOathRecallIconPresentation{
  const icon=deepRunDecisionIdentityIcon({kind:'oath',id});
  return {
    id,atlasSrc:DEEP_RUN_DECISION_ATLAS.src,
    sx:icon.sx,sy:icon.sy,sw:icon.sw,sh:icon.sh,
    startToastIdentitySupported:true,activeRecallIdentitySupported:true,outcomeToastIdentitySupported:true,maxVisibleRecallIcons:1,
    animated:false,motionAmplitude:0,textFallbackPreserved:true,loadFailureBlocksGameplay:false,
  };
}

export interface LongRunOathRecallAtlasAudit{itemCount:number;coverage:number;uniqueCellCount:number;outOfBounds:LongRunOathRecallId[];passed:boolean;}
export function auditLongRunOathRecallAtlas():LongRunOathRecallAtlasAudit{
  const cells=new Set<string>();const outOfBounds:LongRunOathRecallId[]=[];
  for(const id of LONG_RUN_OATH_RECALL_IDS){
    const icon=longRunOathRecallIcon(id);cells.add(`${icon.sx}:${icon.sy}`);
    if(icon.sx<0||icon.sy<0||icon.sx+icon.sw>DEEP_RUN_DECISION_ATLAS.width||icon.sy+icon.sh>DEEP_RUN_DECISION_ATLAS.height)outOfBounds.push(id);
  }
  const itemCount=LONG_RUN_OATH_RECALL_IDS.length,coverage=itemCount/6,uniqueCellCount=cells.size;
  return {itemCount,coverage,uniqueCellCount,outOfBounds,passed:itemCount===6&&coverage===1&&uniqueCellCount===6&&outOfBounds.length===0};
}
