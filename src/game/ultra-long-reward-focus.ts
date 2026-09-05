import type { BossRewardChoice } from './upgrades.js';
export interface UltraLongRewardContext{elapsedSeconds:number;activeRelic:string|null;activeFusionCount:number;}
export type UltraLongRewardChoice<T extends BossRewardChoice=BossRewardChoice>=T&{badge?:string;hint?:string;best?:boolean};
export interface UltraLongRewardFocus<T extends BossRewardChoice=BossRewardChoice>{choices:UltraLongRewardChoice<T>[];compact:boolean;subtitle:string;autoSelect:false;estimatedDecisionReduction:number;}
export function compactUltraLongBossRewards<T extends BossRewardChoice>(choices:readonly UltraLongRewardChoice<T>[],context:UltraLongRewardContext):UltraLongRewardFocus<T>{
  const elapsed=Number.isFinite(context.elapsedSeconds)?Math.max(0,context.elapsedSeconds):0;
  const complete=Boolean(context.activeRelic)&&context.activeFusionCount>=2;
  if(elapsed<7200||!complete)return{choices:choices.map(choice=>({...choice})),compact:false,subtitle:'유물 1개 또는 보스 성장 2개 중 선택',autoSelect:false,estimatedDecisionReduction:0};
  const growthIndex=choices.findIndex(choice=>choice.kind!=='relic');
  const focused=choices.map((choice,index)=>growthIndex>=0&&index===growthIndex?{...choice,best:true,badge:'유지',hint:'완성 빌드 · 유지 성장만 확인'}:{...choice,best:growthIndex<0?Boolean(choice.best):false});
  return{choices:focused,compact:true,subtitle:'완성 빌드 · 유지 성장 1개만 확인',autoSelect:false,estimatedDecisionReduction:.46};
}
