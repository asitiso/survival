export interface EightTwelveHourToastFocusPolicy {
  show:boolean;
  critical:boolean;
  estimatedRoutineReduction:number;
  combatMutation:false;
  economyMutation:false;
}

const PRESERVE=['mythic','최종','signature','수호핵 위험','치명 위험','tactic','safe link','last law','overdrive','융합 발동'];
const ROUTINE=['상점권 획득','보급 획득','무료 보급','황금 고블린','보급 상자','전장 목표 완료','미션 성공','연대기','보스 성장','보스 전장전','보스 진입'];

export function eightTwelveHourToastFocus(elapsedSeconds:number,message:string):EightTwelveHourToastFocusPolicy {
  const elapsed=Number.isFinite(elapsedSeconds)?Math.max(0,elapsedSeconds):0;
  const normalized=(message??'').trim().toLowerCase();
  const critical=PRESERVE.some(token=>normalized.includes(token));
  if(elapsed<8*3600||critical)return{show:true,critical,estimatedRoutineReduction:0,combatMutation:false,economyMutation:false};
  const routine=ROUTINE.some(token=>normalized.includes(token));
  return{show:!routine,critical:false,estimatedRoutineReduction:routine?.74:0,combatMutation:false,economyMutation:false};
}
