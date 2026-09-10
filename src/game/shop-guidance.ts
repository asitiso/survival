import { equipmentSetForItem, equipmentSetStates } from './equipment-sets.js';
import { MAX_EQUIPMENT_RANK } from '../domain/economy.js';
import type { EquipmentState } from '../domain/types.js';
import type { HeroId } from './hero-profiles.js';
import type { ShopDisplayOffer } from './shop-data.js';
import type { BuildArchetype } from './endless/build-overdrive.js';
import { canStoreInventoryItem, equipInventoryStack, inventoryStackKey } from '../domain/equipment-inventory.js';
import { strengthenEquipment, strengthenRequirement, combineEquipment } from '../domain/equipment-forge.js';
import { equipmentRecipes } from './equipment-recipes.js';
import { equipmentReadiness, type EquipmentReadinessResult } from './equipment-survival-readiness.js';

export interface ShopGuidanceContext { heroId:HeroId; archetype:BuildArchetype; state:EquipmentState; elapsedSeconds?:number; heroMaxHp?:number; }
export interface ShopOfferGuidance { offerId:string; label:string; reason:string; score:number; best:boolean; action?:'purchase'|'forge'|'equip'|'cleanup'; }

const ARCHETYPE_WEIGHT:Record<BuildArchetype,Readonly<Record<string,number>>>={
  burst:{'arcane-staff':44,'blast-rod':30,'rapid-wand':12,'golden-wand':4,'iron-robe':8,'gale-cloak':5,'magnet-cloak':4,'guardian-plate':6,'healing-potion':6},
  cycle:{'rapid-wand':46,'arcane-staff':24,'blast-rod':12,'golden-wand':4,'iron-robe':7,'gale-cloak':10,'magnet-cloak':4,'guardian-plate':6,'healing-potion':6},
  domain:{'blast-rod':46,'rapid-wand':24,'arcane-staff':20,'golden-wand':4,'iron-robe':7,'gale-cloak':7,'magnet-cloak':14,'guardian-plate':8,'healing-potion':6},
  fortress:{'guardian-plate':48,'iron-robe':34,'rapid-wand':16,'arcane-staff':12,'blast-rod':10,'golden-wand':4,'gale-cloak':8,'magnet-cloak':5,'healing-potion':8},
};
const HERO_WEIGHT:Record<HeroId,Readonly<Record<string,number>>>={
  arkan:{'arcane-staff':18,'blast-rod':12},
  seria:{'blast-rod':14,'rapid-wand':9,'magnet-cloak':6},
  kain:{'rapid-wand':16,'gale-cloak':10},
  edric:{'guardian-plate':20,'iron-robe':10},
};
function currentItem(state:EquipmentState,offer:ShopDisplayOffer){return offer.kind==='potion'?null:state[offer.kind];}
function reasonFor(offer:ShopDisplayOffer,context:ShopGuidanceContext,currentSame:boolean):string{
  if(currentSame)return '현재 장비 강화 · 바로 누적';
  if(offer.kind==='accessory')return `${equipmentSetForItem(offer.id)?.name ?? '장신구'} · ${offer.description}`;
  if(offer.id==='guardian-plate')return context.heroId==='edric'?'에드릭 수호핵 특화':'수호핵 생존 강화';
  if(offer.id==='iron-robe')return '장기 생존 안정화';
  if(offer.id==='rapid-wand')return '연사 주기 단축';
  if(offer.id==='blast-rod')return '광역 범위 강화';
  if(offer.id==='arcane-staff')return '전체 마법 화력 강화';
  if(offer.id==='gale-cloak')return '회피 이동 여유 증가';
  if(offer.id==='magnet-cloak')return '성장 자원 회수 개선';
  if(offer.id==='golden-wand')return '장기 금화 수급 강화';
  return context.state.healingPotions<=1?'물약 부족 보충':'비상 회복 보충';
}
export function shopGuidanceForOffers(offers:readonly ShopDisplayOffer[],context:ShopGuidanceContext):ShopOfferGuidance[]{
  if (context.elapsedSeconds !== undefined && context.heroMaxHp !== undefined) return survivalGuidance(offers, context);
  const scored=offers.map((offer,index)=>{
    const current=currentItem(context.state,offer);
    if(current?.id===offer.id&&current.rank>=MAX_EQUIPMENT_RANK)return{offerId:offer.id,label:'완성',reason:'이미 전설 완성',score:-100,best:false,index,affordable:true};
    let score=ARCHETYPE_WEIGHT[context.archetype][offer.id]??0;
    const set = equipmentSetForItem(offer.id);
    const matching = set ? equipmentSetStates(context.state).find(s => s.id === set.id) : null;
    if(offer.kind==='accessory' && !current)score+=45;
    if(matching && matching.count>0 && current?.id!==offer.id)score+=25;
    score+=HERO_WEIGHT[context.heroId][offer.id]??0;
    const currentSame=current?.id===offer.id;
    if(currentSame)score+=22+(current?.rank===4?10:0);
    if(offer.kind==='potion'&&context.state.healingPotions<=1)score+=12;
    const affordable=offer.price<=context.state.coins
      && (offer.kind==='potion' || !current || canStoreInventoryItem(context.state,{id:offer.id,rank:1}));
    if(!affordable)score-=6;
    return{offerId:offer.id,label:score>=58?'강력 추천':score>=34?'추천':'',reason:reasonFor(offer,context,currentSame),score,best:false,index,affordable};
  });
  const winners=scored.filter(x=>x.affordable&&x.score>-100).sort((a,b)=>b.score-a.score||a.index-b.index).slice(0,2);
  const winnerIndexes=new Set(winners.map(x=>x.index));
  return scored.map(({index,affordable,...entry})=>{const best=winnerIndexes.has(index);return{...entry,label:best&&!entry.label?'적합':entry.label,best};});
}

function protectedReplacement(offer:ShopDisplayOffer,state:EquipmentState):boolean{
  if(offer.kind==='potion')return false;
  const current=state[offer.kind];
  const activeSet = current ? equipmentSetStates(state).find(set => (set.items as readonly string[]).includes(current.id) && set.twoActive) : null;
  if(current && current.id!==offer.id && activeSet)return true;
  return Boolean(current&&current.id!==offer.id&&(current.legendary||current.rank>=3));
}
export function safeQuickPurchase(offer:ShopDisplayOffer,offers:readonly ShopDisplayOffer[],state:EquipmentState):boolean{
  if (offer.locked || equipmentRecipes().some(recipe => recipe.result.id === offer.id)) return false;
  const exact=offers.some((candidate)=>candidate===offer||(candidate.id===offer.id&&candidate.kind===offer.kind&&candidate.price===offer.price));
  if(!exact||offer.price>state.coins||protectedReplacement(offer,state))return false;
  const current=offer.kind==='potion'?null:state[offer.kind];
  if (current?.id===offer.id&&current.rank>=MAX_EQUIPMENT_RANK) return false;
  if (current && offer.kind!=='potion' && !canStoreInventoryItem(state, { id: offer.id, rank: 1 })) return false;
  return true;
}
export function quickShopRecommendation(offers:readonly ShopDisplayOffer[],guidance:readonly ShopOfferGuidance[],state?:EquipmentState):ShopDisplayOffer|null{
  if (guidance.some(entry => entry.best && entry.action && entry.action !== 'purchase')) return null;
  const ranked=guidance.map((entry,index)=>({entry,index})).filter(({entry,index})=>entry.best&&offers[index]?.id===entry.offerId&&(!state||safeQuickPurchase(offers[index]!,offers,state))).sort((a,b)=>b.entry.score-a.entry.score||a.index-b.index);
  return ranked.length>0?offers[ranked[0]!.index]??null:null;
}

function survivalGuidance(offers: readonly ShopDisplayOffer[], context: ShopGuidanceContext): ShopOfferGuidance[] {
  const { state } = context;
  const read = (candidate: EquipmentState) => equipmentReadiness({ state: candidate, elapsedSeconds: context.elapsedSeconds!, heroMaxHp: context.heroMaxHp! });
  const before = read(state), metric = before.weakestMetric;
  const gain = (after: EquipmentReadinessResult) => metric === 'hero'
    ? (after.heroSurvivalHits - before.heroSurvivalHits) / before.recommended.heroSurvivalHits
    : metric === 'firepower' ? (after.firepowerIndex - before.firepowerIndex) / before.recommended.firepowerIndex
    : (before.coreDamageMultiplier - after.coreDamageMultiplier) / before.recommended.coreDamageMultiplier;
  const reason = (after: EquipmentReadinessResult, action: string) => metric === 'hero'
    ? `영웅 생존 부족 · ${action} 시 약 ${(after.heroSurvivalHits - before.heroSurvivalHits).toFixed(1)}타 증가`
    : metric === 'firepower' ? `화력 부족 · ${action} 시 지수 ${(after.firepowerIndex - before.firepowerIndex).toFixed(2)} 증가`
    : `수호핵 방어 부족 · ${action} 시 피해 배율 ${(before.coreDamageMultiplier - after.coreDamageMultiplier).toFixed(2)} 감소`;
  const entries: ShopOfferGuidance[] = offers.map(offer => {
    if (offer.kind === 'potion') return { offerId: offer.id, label: '', reason: '비상 회복 보충', score: 0, best: false, action: 'purchase' };
    const current = state[offer.kind];
    // This is an explicitly labelled equip preview. Buying into an occupied slot stores rank 1.
    const after = read({ ...state, [offer.kind]: { ...offer, rank: 1, legendary: false } });
    const improvement = gain(after);
    const blocked = !!current && !canStoreInventoryItem(state, { id: offer.id, rank: 1 });
    let entry: ShopOfferGuidance = {
      offerId: offer.id, label: '', reason: improvement > 0 ? reason(after, `${offer.name} 장착`) : '보관용 재료 · 현재 장착 효과 유지',
      score: improvement > 0 ? 100 + improvement * 100 : -1, best: false, action: 'purchase',
    };
    if (blocked && improvement > 0) entry = { ...entry, label: '보관함 정리 필요', reason: `장비 판매 또는 조합 후 ${offer.name} 구매 가능`, action: 'cleanup', score: 1000 + improvement };
    if (offer.locked || offer.price > state.coins) entry.score = -100;
    if (current?.id === offer.id) {
      const strengthened = strengthenEquipment(state, { place: 'equipped', kind: offer.kind }, context.elapsedSeconds!);
      if (strengthened.ok && gain(read(strengthened.state)) > 0) {
        const upgraded = read(strengthened.state);
        entry = { ...entry, action: 'forge', label: '대장간 추천', reason: reason(upgraded, `${offer.name} 강화`), score: 2000 + gain(upgraded) };
      } else if (!blocked && context.elapsedSeconds! >= strengthenRequirement(current.rank).unlockAtSeconds) {
        // A missing duplicate is useful, but never claim it strengthens on purchase.
        const upgraded = read({ ...state, [offer.kind]: { ...current, rank: current.rank + 1, legendary: current.rank + 1 >= 5 } });
        if (gain(upgraded) > 0) entry = { ...entry, reason: `강화 재료 구매 · ${reason(upgraded, '대장간 강화')}`, score: offer.price <= state.coins ? 50 + gain(upgraded) : -100 };
      }
    }
    return entry;
  });
  const addInventoryAction = (offerId: string, candidate: EquipmentState, action: 'forge' | 'equip', name: string) => {
    const after = read(candidate);
    if (gain(after) <= 0) return;
    const index = offers.findIndex(offer => offer.kind !== 'potion' && offer.id === offerId);
    if (index < 0) return;
    const score = 2000 + gain(after);
    if (score <= entries[index]!.score) return;
    entries[index] = { offerId: offers[index]!.id, action, label: action === 'forge' ? '대장간 추천' : '보관 장비 추천', reason: reason(after, name), score, best: false };
  };
  for (const stack of state.inventory ?? []) {
    const equipped = equipInventoryStack(state, inventoryStackKey(stack.id, stack.rank));
    if (equipped.ok) addInventoryAction(stack.id, equipped.state, 'equip', `${stack.name} 장착`);
  }
  for (const recipe of equipmentRecipes()) {
    const crafted = combineEquipment(state, recipe.id);
    if (!crafted.ok) continue;
    const equipped = crafted.state[recipe.result.kind]?.id === recipe.result.id ? crafted
      : equipInventoryStack(crafted.state, inventoryStackKey(recipe.result.id, recipe.result.rank));
    if (equipped.ok) addInventoryAction(recipe.ingredientIds[0], equipped.state, 'forge', `${recipe.hidden && !state.discoveredRecipes.includes(recipe.id) ? '???' : recipe.result.name} 조합·장착`);
  }
  const winner = entries.reduce((best, entry, index) => entry.score > (entries[best]?.score ?? -Infinity) ? index : best, -1);
  if (winner >= 0 && entries[winner]!.score >= 0 && (entries[winner]!.action !== 'purchase' || offers[winner]!.price <= state.coins)) {
    entries[winner]!.best = true;
    if (!entries[winner]!.label) entries[winner]!.label = '추천';
  }
  return entries;
}
