import { equipmentPurchaseUnlock } from '../domain/equipment-progression.js';
import { applyEquipmentSets, equipmentSetForItem } from './equipment-sets.js';
import { shopOfferPrice } from '../domain/economy.js';
export { legendaryEquipmentName } from '../domain/economy.js';
const CRAFTED_ATLAS = {
    source: 'shop-items-enhanced', position: '50% 50%', textFallback: true,
};
const base = (id, kind, name, price, power, description, accent, effects) => ({
    id, kind, name, price, basePrice: price, power, description, accent, crafted: false,
    effectChannels: effects.map((effect) => effect.stat), effects,
    atlas: { source: 'shop-items-enhanced', position: '50% 50%', textFallback: true },
});
const crafted = (id, kind, name, price, power, description, accent, effects) => ({
    id, kind, name, price, basePrice: price, power, description, accent, crafted: true,
    effectChannels: effects.map((effect) => effect.stat), effects, atlas: CRAFTED_ATLAS,
});
const BASE_EQUIPMENT = [
    base('arcane-staff', 'weapon', '마력 지팡이', 220, .20, '랭크마다 모든 마법 피해 +20%', '#c78cff', [{ stat: 'spellPowerMultiplier', perRank: .20 }]),
    base('rapid-wand', 'weapon', '속사 완드', 240, .09, '랭크마다 일반·궁극기 쿨타임 -9%', '#68d7ff', [{ stat: 'cooldownMultiplier', perRank: .09, floor: .60, legendaryFloor: .45 }]),
    base('blast-rod', 'weapon', '폭발 지팡이', 230, .12, '랭크마다 광역 마법 범위 +12%', '#ff9b5e', [{ stat: 'areaMultiplier', perRank: .12 }]),
    base('golden-wand', 'weapon', '황금 완드', 210, .18, '랭크마다 처치 금화 +18%', '#f3cf67', [{ stat: 'goldMultiplier', perRank: .18 }]),
    base('iron-robe', 'armor', '철갑 로브', 200, .10, '랭크마다 받는 피해 -10%', '#aab8c7', [{ stat: 'damageTakenMultiplier', perRank: .10, floor: .50, legendaryFloor: .38 }]),
    base('gale-cloak', 'armor', '질풍 망토', 220, .10, '랭크마다 이동속도 +10%', '#69e0b5', [{ stat: 'moveSpeedMultiplier', perRank: .10 }]),
    base('magnet-cloak', 'armor', '자석 망토', 210, .22, '랭크마다 경험치·금화 흡수거리 +22%', '#65cfff', [{ stat: 'pickupMultiplier', perRank: .22 }]),
    base('guardian-plate', 'armor', '수호 갑주', 230, .09, '랭크마다 수호핵이 받는 피해 -9%', '#f0c46b', [{ stat: 'coreDamageTakenMultiplier', perRank: .09, floor: .55, legendaryFloor: .40 }]),
    base('sage-amulet', 'accessory', '현자의 부적', 180, .08, '랭크마다 모든 마법 피해 +8%', '#c78cff', [{ stat: 'spellPowerMultiplier', perRank: .08 }]),
    base('storm-ring', 'accessory', '폭풍 반지', 200, .04, '랭크마다 일반·궁극기 쿨타임 -4%', '#68d7ff', [{ stat: 'cooldownMultiplier', perRank: .04, floor: .80, legendaryFloor: .72 }]),
    base('bastion-talisman', 'accessory', '성채의 성표', 190, .05, '랭크마다 받는 피해 -5%', '#f0c46b', [{ stat: 'damageTakenMultiplier', perRank: .05, floor: .75, legendaryFloor: .66 }]),
    base('fortune-charm', 'accessory', '행운의 펜던트', 170, .10, '랭크마다 금화 획득 +10%', '#69e0b5', [{ stat: 'goldMultiplier', perRank: .10 }]),
];
const CRAFTED_EQUIPMENT = [
    crafted('arcane-accelerator', 'weapon', '비전 가속봉', 700, .24, '마법 피해와 재사용시간을 함께 강화합니다.', '#9f8cff', [{ stat: 'spellPowerMultiplier', perRank: .18 }, { stat: 'cooldownMultiplier', perRank: .06, floor: .70 }]),
    crafted('alchemical-blast-staff', 'weapon', '연금 폭발봉', 650, .17, '광역 범위와 금화 획득을 함께 강화합니다.', '#ff9b5e', [{ stat: 'areaMultiplier', perRank: .11 }, { stat: 'goldMultiplier', perRank: .14 }]),
    crafted('wind-iron-armor', 'armor', '바람 철갑', 750, .13, '영웅 피해 감소와 이동속도를 함께 강화합니다.', '#69e0b5', [{ stat: 'damageTakenMultiplier', perRank: .08, floor: .60 }, { stat: 'moveSpeedMultiplier', perRank: .08 }]),
    crafted('gravity-guardian-armor', 'armor', '중력 수호갑', 800, .16, '수집 범위와 수호핵 피해 감소를 함께 강화합니다.', '#65cfff', [{ stat: 'pickupMultiplier', perRank: .16 }, { stat: 'coreDamageTakenMultiplier', perRank: .07, floor: .65 }]),
    crafted('thunder-wisdom-seal', 'accessory', '현뢰의 인장', 600, .14, '마법 피해와 재사용시간을 함께 강화합니다.', '#68d7ff', [{ stat: 'spellPowerMultiplier', perRank: .11 }, { stat: 'cooldownMultiplier', perRank: .05, floor: .75 }]),
    crafted('golden-bastion-talisman', 'accessory', '황금 성채 부적', 650, .14, '영웅 피해 감소와 금화 획득을 함께 강화합니다.', '#f0c46b', [{ stat: 'damageTakenMultiplier', perRank: .065, floor: .70 }, { stat: 'goldMultiplier', perRank: .13 }]),
    crafted('celestial-fusion-staff', 'weapon', '천체 융합봉', 2800, .31, '마법 피해·광역 범위·재사용시간을 강화합니다.', '#b4a0ff', [{ stat: 'spellPowerMultiplier', perRank: .18 }, { stat: 'areaMultiplier', perRank: .13 }, { stat: 'cooldownMultiplier', perRank: .08, floor: .55 }]),
    crafted('world-tree-armor', 'armor', '세계수 성갑', 3200, .24, '영웅·수호핵 피해 감소와 이동속도를 강화합니다.', '#71e7a2', [{ stat: 'damageTakenMultiplier', perRank: .07, floor: .50 }, { stat: 'coreDamageTakenMultiplier', perRank: .065, floor: .50 }, { stat: 'moveSpeedMultiplier', perRank: .07 }]),
    crafted('fate-core', 'accessory', '운명의 핵', 2500, .22, '마법 피해·재사용시간·금화·피해 감소를 강화합니다.', '#f3cf67', [{ stat: 'spellPowerMultiplier', perRank: .12 }, { stat: 'cooldownMultiplier', perRank: .055, floor: .60 }, { stat: 'goldMultiplier', perRank: .11 }, { stat: 'damageTakenMultiplier', perRank: .055, floor: .60 }]),
];
const ALL_EQUIPMENT = [...BASE_EQUIPMENT, ...CRAFTED_EQUIPMENT];
const WEAPONS = BASE_EQUIPMENT.filter((offer) => offer.kind === 'weapon');
const ARMORS = BASE_EQUIPMENT.filter((offer) => offer.kind === 'armor');
const ACCESSORIES = BASE_EQUIPMENT.filter((offer) => offer.kind === 'accessory');
export function equipmentCatalog() { return BASE_EQUIPMENT; }
export function equipmentDefinition(id) {
    return ALL_EQUIPMENT.find((definition) => definition.id === id)
        ?? (id === 'healing-potion' ? POTION : null);
}
const POTION = {
    id: 'healing-potion', kind: 'potion', name: '체력 물약', price: 70, power: 0.35,
    description: '퀵슬롯 +1 · 사용 시 최대 HP 35% 회복', accent: '#6ae19d',
};
function copyWithPriceVariance(offer, rng) {
    const variance = 0.92 + rng() * 0.16;
    return { ...offer, price: Math.max(40, Math.round(offer.price * variance / 10) * 10) };
}
function pickTwo(pool, rng) {
    const start = Math.min(pool.length - 1, Math.floor(rng() * pool.length));
    const secondOffset = 1 + Math.floor(rng() * Math.max(1, pool.length - 1));
    const second = (start + secondOffset) % pool.length;
    return [copyWithPriceVariance(pool[start], rng), copyWithPriceVariance(pool[second], rng)];
}
export function generateShopOffers(rng = Math.random) {
    const weapons = pickTwo(WEAPONS, rng);
    const armors = pickTwo(ARMORS, rng);
    const potionA = copyWithPriceVariance(POTION, rng);
    const accessory = copyWithPriceVariance(ACCESSORIES[Math.min(3, Math.floor(rng() * 4))], rng);
    return [weapons[0], weapons[1], armors[0], armors[1], accessory, potionA];
}
export function priceShopOffers(offers, state, elapsedSeconds = Infinity) {
    return offers.map(offer => {
        const priced = { ...offer, basePrice: offer.basePrice ?? offer.price };
        const unlockAtSeconds = equipmentPurchaseUnlock(state, priced);
        return { ...priced, price: shopOfferPrice(state, priced), unlockAtSeconds, locked: elapsedSeconds < unlockAtSeconds };
    });
}
export function ensureEquippedOffers(offers, state, accessoryChoice) {
    const result = [...offers];
    for (const kind of ['weapon', 'armor', 'accessory']) {
        if (kind === 'accessory' && accessoryChoice) {
            const choice = ACCESSORIES.find(offer => offer.id === accessoryChoice);
            const index = result.findIndex(offer => offer.kind === 'accessory');
            if (choice && index >= 0) {
                result[index] = { ...choice };
                continue;
            }
        }
        const item = state[kind];
        if (!item || result.some(offer => offer.id === item.id))
            continue;
        const template = equipmentCatalog().find(offer => offer.id === item.id);
        const index = result.findIndex(offer => offer.kind === kind);
        if (template && index >= 0)
            result[index] = { ...template };
    }
    // Match the equipped weapon's set without forcing costly random rerolls.
    const targetSet = state.weapon ? equipmentSetForItem(state.weapon.id) : null;
    for (const kind of ['armor', 'accessory']) {
        if (kind === 'accessory' && accessoryChoice && ACCESSORIES.some(offer => offer.id === accessoryChoice))
            continue;
        const target = targetSet ? equipmentCatalog().find(offer => offer.kind === kind && targetSet.items.includes(offer.id)) : null;
        if (!target || result.some(offer => offer.id === target.id))
            continue;
        const index = result.findIndex(offer => offer.kind === kind && offer.id !== state[kind]?.id);
        if (index >= 0)
            result[index] = { ...target };
    }
    return result;
}
export function refreshEquipmentPowers(state) {
    const refresh = (item) => {
        const template = item ? equipmentDefinition(item.id) : null;
        return item && template ? { ...item, power: Math.max(item.power, template.power) } : item;
    };
    return { ...state, weapon: refresh(state.weapon), armor: refresh(state.armor), accessory: refresh(state.accessory ?? null) };
}
function legendaryFactor(item) {
    return item?.legendary ? 1.35 : 1;
}
export function equipmentBonuses(state) {
    const bonuses = {
        spellPowerMultiplier: 1,
        cooldownMultiplier: 1,
        moveSpeedMultiplier: 1,
        damageTakenMultiplier: 1,
        areaMultiplier: 1,
        goldMultiplier: 1,
        pickupMultiplier: 1,
        coreDamageTakenMultiplier: 1,
    };
    for (const item of [state.weapon, state.armor, state.accessory]) {
        if (!item)
            continue;
        const definition = equipmentDefinition(item.id);
        if (!definition)
            continue;
        const progress = item.rank > 5 ? 1 - Math.pow(.92, item.rank - 5) : 0;
        for (const effect of definition.effects) {
            const power = effect.perRank * Math.min(5, item.rank) * legendaryFactor(item);
            const value = effect.floor !== undefined
                ? Math.max(item.legendary ? effect.legendaryFloor ?? effect.floor : effect.floor, 1 - power) * (1 - .4 * progress)
                : 1 + power + progress * (item.kind === 'accessory' ? .5 : 1);
            bonuses[effect.stat] *= value;
        }
    }
    return applyEquipmentSets(bonuses, state);
}
