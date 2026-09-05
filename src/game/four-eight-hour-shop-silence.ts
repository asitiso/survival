import type { EquipmentState } from '../domain/types.js';
export interface FourEightHourShopSilencePolicy{
  active:boolean;
  suppressRoutinePressure:boolean;
  showTokenCount:boolean;
  secondaryLabel:string;
  keepClickable:true;
  estimatedVisitReduction:number;
  economyMutation:false;
  newControlCount:0;
}
export function fourEightHourShopSilence(elapsedSeconds:number,state:EquipmentState):FourEightHourShopSilencePolicy{
  const elapsed=Number.isFinite(elapsedSeconds)?Math.max(0,elapsedSeconds):0;
  if(elapsed<14400)return{active:false,suppressRoutinePressure:false,showTokenCount:true,secondaryLabel:'',keepClickable:true,estimatedVisitReduction:0,economyMutation:false,newControlCount:0};
  const complete=(state.weapon?.rank??0)>=5&&(state.armor?.rank??0)>=5;
  const stocked=state.healingPotions>=2;
  if(!complete||!stocked)return{active:true,suppressRoutinePressure:false,showTokenCount:true,secondaryLabel:'',keepClickable:true,estimatedVisitReduction:0,economyMutation:false,newControlCount:0};
  return{active:true,suppressRoutinePressure:true,showTokenCount:false,secondaryLabel:'',keepClickable:true,estimatedVisitReduction:.66,economyMutation:false,newControlCount:0};
}
