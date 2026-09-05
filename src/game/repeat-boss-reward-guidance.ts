import type { BossRewardChoice } from './upgrades.js';
export interface RepeatRewardContext{elapsedSeconds:number;activeRelic:string|null;activeFusionCount:number;}
export type GuidedRepeatReward<T extends BossRewardChoice=BossRewardChoice>=T&{badge?:string;hint?:string;best?:boolean};
export function reduceRepeatBossRewardDecision<T extends BossRewardChoice>(choices:readonly GuidedRepeatReward<T>[],context:RepeatRewardContext):GuidedRepeatReward<T>[] {
 const elapsed=Number.isFinite(context.elapsedSeconds)?Math.max(0,context.elapsedSeconds):0;
 if(elapsed<1800||elapsed>3600||!context.activeRelic||context.activeFusionCount<2)return choices.map(choice=>({...choice}));
 const growthIndex=choices.findIndex(choice=>choice.kind!=='relic');
 if(growthIndex<0)return choices.map(choice=>({...choice}));
 return choices.map((choice,index)=>index===growthIndex?{...choice,best:true,badge:'유지 추천',hint:'완성 빌드 유지 · 교체 판단 최소화'}:{...choice,best:false});
}
