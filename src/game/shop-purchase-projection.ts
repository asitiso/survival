import type { EquipmentState } from '../domain/types.js';
import { purchaseOffer } from '../domain/economy.js';
import { equipmentBonuses, type EquipmentBonuses, type ShopDisplayOffer } from './shop-data.js';
import type { ShopPurchaseActionId } from './shop-purchase-action-identity-assets.js';

export type ShopPurchaseDeltaId=keyof EquipmentBonuses;
export interface ShopPurchaseDelta{id:ShopPurchaseDeltaId;label:string;before:number;after:number;benefit:number;}
export interface ShopPurchaseProjection{actionId:ShopPurchaseActionId;actionLabel:string;summary:string;deltas:ShopPurchaseDelta[];affordable:boolean;}

const ACTION_LABEL:Readonly<Record<ShopPurchaseActionId,string>>={equip:'신규',upgrade:'강화',legendary:'전설',replace:'교체',potion:'물약'};
const LOWER_IS_BETTER=new Set<ShopPurchaseDeltaId>(['cooldownMultiplier','damageTakenMultiplier','coreDamageTakenMultiplier']);
const DELTA_LABEL:Readonly<Record<ShopPurchaseDeltaId,string>>={
  spellPowerMultiplier:'마법 화력',cooldownMultiplier:'쿨타임',moveSpeedMultiplier:'이동 속도',damageTakenMultiplier:'받는 피해',areaMultiplier:'광역 범위',goldMultiplier:'금화 수급',pickupMultiplier:'자원 회수',coreDamageTakenMultiplier:'수호핵 피해',
};
const DELTA_ORDER:readonly ShopPurchaseDeltaId[]=['spellPowerMultiplier','cooldownMultiplier','areaMultiplier','damageTakenMultiplier','coreDamageTakenMultiplier','moveSpeedMultiplier','goldMultiplier','pickupMultiplier'];
const format=(value:number)=>`${value.toFixed(2)}×`;
function currentItem(state:EquipmentState,offer:ShopDisplayOffer){return offer.kind==='weapon'?state.weapon:offer.kind==='armor'?state.armor:null;}
function actionFor(before:EquipmentState,after:EquipmentState,offer:ShopDisplayOffer):ShopPurchaseActionId{
  if(offer.kind==='potion')return'potion';
  const prior=currentItem(before,offer),next=currentItem(after,offer);
  if(!prior)return'equip';
  if(prior.id!==offer.id)return'replace';
  if(next?.legendary&&!prior.legendary)return'legendary';
  return'upgrade';
}
function deltasFor(before:EquipmentState,after:EquipmentState):ShopPurchaseDelta[]{
  const a=equipmentBonuses(before),b=equipmentBonuses(after);
  return DELTA_ORDER.map(id=>{const from=a[id],to=b[id],lower=LOWER_IS_BETTER.has(id),benefit=(lower?from-to:to-from)/Math.max(.0001,Math.abs(from));return{id,label:DELTA_LABEL[id],before:from,after:to,benefit};}).filter(delta=>Math.abs(delta.after-delta.before)>1e-9).sort((x,y)=>Math.abs(y.benefit)-Math.abs(x.benefit)||DELTA_ORDER.indexOf(x.id)-DELTA_ORDER.indexOf(y.id)).slice(0,2);
}
export function shopPurchaseProjectionFromStates(before:EquipmentState,after:EquipmentState,offer:ShopDisplayOffer):ShopPurchaseProjection{
  const affordable=before.coins>=offer.price;
  if(offer.kind==='potion'){return{actionId:'potion',actionLabel:ACTION_LABEL.potion,summary:`물약 ${before.healingPotions}→${after.healingPotions}개 · 최대 HP ${Math.round(offer.power*100)}% 회복 1회 추가`,deltas:[],affordable};}
  const actionId=actionFor(before,after,offer),deltas=deltasFor(before,after);
  const summary=deltas.length>0?deltas.map(delta=>`${delta.label} ${format(delta.before)}→${format(delta.after)}`).join(' · '):'전설 완성';
  return{actionId,actionLabel:ACTION_LABEL[actionId],summary,deltas,affordable};
}
export function projectShopPurchase(state:EquipmentState,offer:ShopDisplayOffer):ShopPurchaseProjection{
  const current=currentItem(state,offer);
  if(offer.kind!=='potion'&&current?.id===offer.id&&current.rank>=5)return{actionId:'legendary',actionLabel:ACTION_LABEL.legendary,summary:'전설 완성',deltas:[],affordable:state.coins>=offer.price};
  const simulated={...state,coins:Math.max(state.coins,offer.price)};
  const result=purchaseOffer(simulated,offer);
  if(!result.ok)return{actionId:offer.kind==='potion'?'potion':current?'upgrade':'equip',actionLabel:offer.kind==='potion'?ACTION_LABEL.potion:current?ACTION_LABEL.upgrade:ACTION_LABEL.equip,summary:result.message,deltas:[],affordable:state.coins>=offer.price};
  return shopPurchaseProjectionFromStates(state,{...result.state,coins:state.coins-offer.price},offer);
}
