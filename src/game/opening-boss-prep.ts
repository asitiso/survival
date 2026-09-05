import type { ActionId } from './config.js';
export interface OpeningBossPrepInput{elapsedSeconds:number;bossCountdown:number;shopTokens:number;hpRatio:number;potions:number;}
export interface OpeningBossPrepCue{actionId:Extract<ActionId,'shop'|'potion'>;label:'준비';accent:string;}
export function openingBossPrepAssist(input:OpeningBossPrepInput):OpeningBossPrepCue|null{
  if(input.elapsedSeconds>180||input.bossCountdown<=0||input.bossCountdown>12)return null;
  if(input.shopTokens>0)return{actionId:'shop',label:'준비',accent:'#ffd36a'};
  if(input.hpRatio<.72&&input.potions>0)return{actionId:'potion',label:'준비',accent:'#79f0ad'};
  return null;
}
