import type { EquipmentState } from '../domain/types.js';
import type { LegendaryProc, LegendaryRuntimeModifiers } from './legendary-effects.js';
import { SHOP_ITEM_ATLAS, shopItemIconSprite, type ShopItemAssetId, type ShopItemIconSprite } from './shop-item-assets.js';

export const LEGENDARY_AWAKENING_ITEM_IDS = ['arcane-staff','rapid-wand','blast-rod','golden-wand','iron-robe','gale-cloak','magnet-cloak','guardian-plate'] as const satisfies readonly ShopItemAssetId[];
export type LegendaryAwakeningItemId=typeof LEGENDARY_AWAKENING_ITEM_IDS[number];
export { SHOP_ITEM_ATLAS as LEGENDARY_AWAKENING_ATLAS };

export interface LegendaryAwakeningIdentity{itemId:LegendaryAwakeningItemId;icon:ShopItemIconSprite;animated:false;motionAmplitude:0;textFallbackPreserved:true;loadFailureBlocksGameplay:false;}
function legendaryEquipped(equipment:EquipmentState,id:LegendaryAwakeningItemId):boolean{return (equipment.weapon?.id===id&&equipment.weapon.legendary)||(equipment.armor?.id===id&&equipment.armor.legendary)||false;}
function identity(itemId:LegendaryAwakeningItemId):LegendaryAwakeningIdentity|null{const icon=shopItemIconSprite(itemId);return icon?{itemId,icon,animated:false,motionAmplitude:0,textFallbackPreserved:true,loadFailureBlocksGameplay:false}:null;}

export function activeLegendaryAwakeningRecall(equipment:EquipmentState,mods:LegendaryRuntimeModifiers):LegendaryAwakeningIdentity[]{
  const ids:LegendaryAwakeningItemId[]=[];
  const galeActive=legendaryEquipped(equipment,'gale-cloak')&&mods.moveSpeedMultiplier>1.000001;
  if(legendaryEquipped(equipment,'arcane-staff')&&mods.spellPowerMultiplier>1.000001)ids.push('arcane-staff');
  const chronoBaseline=galeActive?.88:1;
  if(legendaryEquipped(equipment,'rapid-wand')&&mods.cooldownMultiplier<chronoBaseline-1e-6)ids.push('rapid-wand');
  if(legendaryEquipped(equipment,'iron-robe')&&mods.heroDamageTakenMultiplier<.999999)ids.push('iron-robe');
  if(galeActive)ids.push('gale-cloak');
  if(legendaryEquipped(equipment,'guardian-plate')&&mods.coreDamageTakenMultiplier<.999999)ids.push('guardian-plate');
  return ids.map(identity).filter((v):v is LegendaryAwakeningIdentity=>Boolean(v)).slice(0,2);
}

export function legendaryProcIdentity(proc:LegendaryProc,equipment:EquipmentState):LegendaryAwakeningIdentity|null{
  const id:LegendaryAwakeningItemId|null=proc.type==='nova'?'blast-rod':proc.type==='bonusGold'?'golden-wand':proc.type==='magnet'?'magnet-cloak':proc.type==='coreHeal'?'guardian-plate':null;
  return id&&legendaryEquipped(equipment,id)?identity(id):null;
}

export function auditLegendaryAwakeningReuse(){
  const missing:string[]=[];const cells=new Set<string>();
  for(const id of LEGENDARY_AWAKENING_ITEM_IDS){const icon=shopItemIconSprite(id);if(!icon)missing.push(id);else cells.add(`${icon.sx}:${icon.sy}`);}
  return{itemCount:LEGENDARY_AWAKENING_ITEM_IDS.length,coverage:(LEGENDARY_AWAKENING_ITEM_IDS.length-missing.length)/LEGENDARY_AWAKENING_ITEM_IDS.length,uniqueCellCount:cells.size,missing,passed:missing.length===0};
}
