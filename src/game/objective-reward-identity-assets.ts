import type { ObjectiveReward } from './objective-runtime.js';

export const OBJECTIVE_REWARD_IDENTITY_IDS=['gold','shopToken','potion','temporaryPower'] as const satisfies readonly ObjectiveReward['kind'][];
export type ObjectiveRewardIdentityId=typeof OBJECTIVE_REWARD_IDENTITY_IDS[number];
const CELL:Readonly<Record<ObjectiveRewardIdentityId,number>>={gold:0,shopToken:1,potion:2,temporaryPower:3};
const META:Readonly<Record<ObjectiveRewardIdentityId,{label:string;accent:string}>>={
  gold:{label:'GOLD',accent:'#ffd66c'},
  shopToken:{label:'SHOP TOKEN',accent:'#8fe9ff'},
  potion:{label:'POTION',accent:'#ff7893'},
  temporaryPower:{label:'POWER',accent:'#d49cff'},
};
export interface ObjectiveRewardIdentityIcon{id:ObjectiveRewardIdentityId;label:string;accent:string;sx:number;sy:0;sw:96;sh:96;maxPreviewIcons:2;animated:false;motionAmplitude:0;textFallbackPreserved:true;loadFailureBlocksGameplay:false;}
export const OBJECTIVE_REWARD_IDENTITY_ATLAS={src:'./assets/ui/objective-reward-icons.png',columns:4,rows:1,cellSize:96,width:384,height:96} as const;
export function objectiveRewardIdentityIcon(id:ObjectiveRewardIdentityId):ObjectiveRewardIdentityIcon{const meta=META[id];return{id,label:meta.label,accent:meta.accent,sx:CELL[id]*96,sy:0,sw:96,sh:96,maxPreviewIcons:2,animated:false,motionAmplitude:0,textFallbackPreserved:true,loadFailureBlocksGameplay:false};}
export function objectiveRewardPreviewAmount(reward:ObjectiveReward,rewardMultiplier:number):number{if(reward.kind==='temporaryPower')return reward.amount;const multiplier=Number.isFinite(rewardMultiplier)?Math.max(0,rewardMultiplier):1;return Math.max(1,Math.round(reward.amount*multiplier));}
export function auditObjectiveRewardIdentityAtlas(){const icons=OBJECTIVE_REWARD_IDENTITY_IDS.map(objectiveRewardIdentityIcon);const outOfBounds=icons.filter(icon=>icon.sx<0||icon.sx+icon.sw>OBJECTIVE_REWARD_IDENTITY_ATLAS.width||icon.sy+icon.sh>OBJECTIVE_REWARD_IDENTITY_ATLAS.height).map(icon=>icon.id);const uniqueCellCount=new Set(icons.map(icon=>`${icon.sx}:${icon.sy}`)).size;const coverage=icons.length/4;return{coverage,uniqueCellCount,outOfBounds,passed:coverage===1&&uniqueCellCount===4&&outOfBounds.length===0};}
