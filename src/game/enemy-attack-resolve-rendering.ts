import type { EnemyAttackMotionType } from './enemy-attack-motion-rendering.js';

export interface EnemyAttackResolveState{resolve:number;settle:number}
export interface EnemyAttackResolvePresentation{
  type:EnemyAttackMotionType;
  resolve:number;
  settle:number;
  settleWeight:number;
  maxOffset:number;
  offsetX:number;
  offsetY:number;
  rotation:number;
  scaleX:number;
  scaleY:number;
}
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
const DECAY:Readonly<Record<EnemyAttackMotionType,number>>={grunt:3.8,hound:4.7,brute:2.7,archer:4.2,bomber:4.4,shaman:3.4,shieldbearer:2.35,assassin:5.8,siegeGolem:1.9,nullifier:3.1,golden:5.2,elite:2.15,boss:1.55};
const WEIGHT:Readonly<Record<EnemyAttackMotionType,number>>={grunt:.8,hound:.65,brute:1.3,archer:.72,bomber:.82,shaman:.92,shieldbearer:1.2,assassin:.58,siegeGolem:1.65,nullifier:1,golden:.55,elite:1.5,boss:1.9};
export function advanceEnemyAttackResolveState(previous:EnemyAttackResolveState|undefined,type:EnemyAttackMotionType,didAttack:boolean,dt:number):EnemyAttackResolveState{
  const prev=previous??{resolve:0,settle:0};
  const safeDt=clamp(Number.isFinite(dt)?dt:0,0,.1);
  if(didAttack)return{resolve:1,settle:Math.max(prev.settle,.18)};
  const decay=DECAY[type];
  const nextResolve=Math.max(0,prev.resolve-safeDt*decay);
  const settleTarget=prev.resolve>0.45&&nextResolve<=0.45?Math.max(prev.settle,.9):prev.settle;
  const settle=Math.max(0,settleTarget-safeDt*(decay*.65));
  return{resolve:nextResolve,settle};
}
export function enemyAttackResolvePresentation(type:EnemyAttackMotionType,state:EnemyAttackResolveState,facingX:number,facingY:number,reducedMotion=false):EnemyAttackResolvePresentation{
  const len=Math.hypot(facingX,facingY)||1,fx=facingX/len,fy=facingY/len;
  const resolve=clamp(state.resolve,0,1),settle=clamp(state.settle,0,1),weight=WEIGHT[type];
  const maxOffset=clamp(7/weight,type==='boss'?2.4:2.8,type==='boss'?3.6:type==='siegeGolem'?4:type==='elite'?5:8);
  const motionScale=reducedMotion?.4:1;
  const rebound=(-resolve*.42+settle*.3)*maxOffset*motionScale;
  return{type,resolve,settle,settleWeight:weight,maxOffset,offsetX:fx*rebound,offsetY:fy*rebound+settle*0.8*motionScale,rotation:(fy-fx*.15)*(settle-resolve*.35)*.035*motionScale/Math.max(.7,weight),scaleX:1+settle*.025*motionScale-resolve*.012*motionScale,scaleY:1-settle*.018*motionScale+resolve*.01*motionScale};
}
