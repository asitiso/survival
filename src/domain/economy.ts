import { equipmentPriceMultiplier } from './equipment-progression.js';
import { canStoreInventoryItem, MAX_EQUIPMENT_STACK_COUNT } from './equipment-inventory.js';
import type { EquippedItem, EquipmentState, PurchaseResult, ShopOffer } from './types.js';

export const MAX_EQUIPMENT_RANK = 10000;

export function equipmentGrade(rank: number): string {
  return rank > 5 ? `전설 +${rank - 5}` : ['일반', '고급', '희귀', '영웅', '전설'][Math.max(0, rank - 1)] ?? '일반';
}

export function shopOfferPrice(state: EquipmentState, offer: ShopOffer): number {
  if (offer.basePrice === undefined || offer.kind === 'potion') return offer.price;
  const multiplier = equipmentPriceMultiplier(0);
  return Math.round(offer.basePrice * multiplier / 10) * 10;
}

export const SHOP_FIRST_TOKEN_AT = 45;
export const SHOP_TOKEN_INTERVAL = 75;

const LEGENDARY_NAMES: Record<string, string> = {
  'sage-amulet': '현자의 영혼',
  'storm-ring': '천둥군주의 인장',
  'bastion-talisman': '불굴의 성표',
  'fortune-charm': '행운의 왕관',
  'arcane-staff': '대마도사의 심장',
  'rapid-wand': '크로노스 셉터',
  'blast-rod': '성운 파괴봉',
  'golden-wand': '미다스의 손',
  'iron-robe': '불멸의 로브',
  'gale-cloak': '폭풍군주의 망토',
  'magnet-cloak': '심연의 자석망토',
  'guardian-plate': '영원의 성벽',
};

export function legendaryEquipmentName(id: string): string | null {
  return LEGENDARY_NAMES[id] ?? null;
}

function cloneItem(item: EquippedItem | null): EquippedItem | null {
  return item ? { ...item, legendary: item.legendary === true } : null;
}

function cloneState(state: EquipmentState): EquipmentState {
  return {
    coins: state.coins,
    weapon: cloneItem(state.weapon),
    armor: cloneItem(state.armor),
    ...(state.accessory !== undefined ? { accessory: cloneItem(state.accessory) } : {}),
    healingPotions: state.healingPotions,
    inventory: state.inventory.map(item => ({ ...item })),
    discoveredRecipes: [...state.discoveredRecipes],
  };
}

export function rerollCost(rerollsThisVisit: number): number {
  const index = Math.max(0, Math.floor(rerollsThisVisit));
  return 50 * Math.pow(2, Math.min(index, 6));
}

export function purchaseOffer(state: EquipmentState, offer: ShopOffer, elapsedSeconds = Infinity): PurchaseResult {
  const price = shopOfferPrice(state, offer);
  if (state.coins < price) {
    return { ok: false, state, message: '금화 부족' };
  }

  const next = cloneState(state);
  next.coins -= price;

  if (offer.kind === 'potion') {
    next.healingPotions += 1;
    return { ok: true, state: next, message: '체력 물약 획득' };
  }

  const purchased = {
    id: offer.id,
    kind: offer.kind,
    name: offer.name,
    rank: 1,
    power: offer.power,
    legendary: false,
  };
  if (next[offer.kind] === null || next[offer.kind] === undefined) {
    next[offer.kind] = purchased;
    return { ok: true, state: next, message: `${offer.name} 즉시 장착` };
  }
  if (!canStoreInventoryItem(state, purchased)) {
    const sameStack = state.inventory.some(item => item.id === purchased.id && item.rank === purchased.rank);
    return {
      ok: false,
      state,
      message: sameStack
        ? `같은 장비는 한 스택에 ${MAX_EQUIPMENT_STACK_COUNT}개까지 보관할 수 있습니다.`
        : '보관함이 가득 찼습니다 · 장비 판매 또는 조합 필요',
    };
  }
  next.inventory = next.inventory ?? [];
  const existing = next.inventory.find(item => item.id === purchased.id && item.rank === purchased.rank);
  if (existing) existing.count += 1;
  else next.inventory.push({ ...purchased, count: 1 });
  return { ok: true, state: next, message: `${offer.name} 보관함 저장` };
}
