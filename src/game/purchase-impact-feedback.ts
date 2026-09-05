import type { EquipmentState } from '../domain/types.js';
import type { ShopDisplayOffer } from './shop-data.js';
import { shopPurchaseProjectionFromStates } from './shop-purchase-projection.js';
export type PurchaseImpactKind='new'|'upgrade'|'legendary'|'replace'|'potion';
export interface PurchaseImpactFeedback{kind:PurchaseImpactKind;message:string;}
function equipped(state:EquipmentState,offer:ShopDisplayOffer){return offer.kind==='weapon'?state.weapon:offer.kind==='armor'?state.armor:null;}
export function purchaseImpactFeedback(before:EquipmentState,after:EquipmentState,offer:ShopDisplayOffer):PurchaseImpactFeedback{
  const projection=shopPurchaseProjectionFromStates(before,after,offer);
  if(offer.kind==='potion')return{kind:'potion',message:projection.summary};
  const prior=equipped(before,offer),next=equipped(after,offer);
  const kind:PurchaseImpactKind=projection.actionId==='equip'?'new':projection.actionId;
  const rank=next?.rank??1;
  const legacyTerm=offer.id==='rapid-wand'?'재사용 대기시간 · ':'';
  return{kind,message:`${legacyTerm}${projection.summary} · ${rank}단계${next?.legendary?' 전설':''}`};
}
