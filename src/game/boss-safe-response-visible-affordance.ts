import { BOSS_ASSIST_CUE_MEMORY_SECONDS, BOSS_RESPONSE_ACK_SECONDS } from './boss-action-assist.js';
export interface BossSafeResponseVisibleAffordanceInput{
  bossId:number;currentCycle:number;bossSpecialTimer:number;
  actionAssistPresent:boolean;actionAssistBossId:number|null;actionAssistAge:number;
  responseAckPresent:boolean;responseAckBossId:number|null;responseAckCycle:number|null;responseAckAge:number;responseAckAssetReady:boolean;
}
export interface BossSafeResponseVisibleAffordance{actionAssistVisible:boolean;responseAckVisible:boolean;anyVisible:boolean;presentationOnly:true;}
export function bossSafeResponseVisibleAffordance(input:BossSafeResponseVisibleAffordanceInput):BossSafeResponseVisibleAffordance{
  const assistAge=Number.isFinite(input.actionAssistAge)?Math.max(0,input.actionAssistAge):Infinity;
  const ackAge=Number.isFinite(input.responseAckAge)?Math.max(0,input.responseAckAge):Infinity;
  const actionAssistVisible=input.actionAssistPresent&&input.actionAssistBossId===input.bossId&&assistAge<=BOSS_ASSIST_CUE_MEMORY_SECONDS&&Number.isFinite(input.bossSpecialTimer)&&input.bossSpecialTimer>=0&&input.bossSpecialTimer<=1.05;
  const responseAckVisible=input.responseAckPresent&&input.responseAckAssetReady&&input.responseAckBossId===input.bossId&&input.responseAckCycle===input.currentCycle&&ackAge<=BOSS_RESPONSE_ACK_SECONDS;
  return{actionAssistVisible,responseAckVisible,anyVisible:actionAssistVisible||responseAckVisible,presentationOnly:true};
}
