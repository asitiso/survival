import type { EquippedItem, EquipmentState, PurchaseResult, ShopOffer } from './types.js';

const MAX_RANK = 5;

export const SHOP_FIRST_TOKEN_AT = 45;
export const SHOP_TOKEN_INTERVAL = 75;

const LEGENDARY_NAMES: Record<string, string> = {
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
    healingPotions: state.healingPotions,
  };
}

export function rerollCost(rerollsThisVisit: number): number {
  const index = Math.max(0, Math.floor(rerollsThisVisit));
  return 50 * Math.pow(2, Math.min(index, 6));
}

export function purchaseOffer(state: EquipmentState, offer: ShopOffer): PurchaseResult {
  const current = offer.kind === 'potion' ? null : state[offer.kind];
  if (current?.id === offer.id && current.rank >= MAX_RANK) {
    return { ok: false, state, message: current.legendary ? '이미 전설 완성' : '최대 단계' };
  }
  if (state.coins < offer.price) {
    return { ok: false, state, message: '금화 부족' };
  }

  const next = cloneState(state);
  next.coins -= offer.price;

  if (offer.kind === 'potion') {
    next.healingPotions += 1;
    return { ok: true, state: next, message: '체력 물약 획득' };
  }

  const equipped = next[offer.kind];
  if (equipped?.id === offer.id) {
    equipped.rank = Math.min(MAX_RANK, equipped.rank + 1);
    equipped.power = offer.power;
    if (equipped.rank === MAX_RANK) {
      equipped.legendary = true;
      equipped.name = legendaryEquipmentName(offer.id) ?? offer.name;
      return { ok: true, state: next, message: `전설 진화 · ${equipped.name}` };
    }
    equipped.legendary = false;
    equipped.name = offer.name;
    return { ok: true, state: next, message: `${offer.name} ${equipped.rank}단계` };
  }

  next[offer.kind] = {
    id: offer.id,
    kind: offer.kind,
    name: offer.name,
    rank: 1,
    power: offer.power,
    legendary: false,
  };
  return { ok: true, state: next, message: `${offer.name} 장착` };
}
