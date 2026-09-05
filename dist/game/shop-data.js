export { legendaryEquipmentName } from '../domain/economy.js';
const WEAPONS = [
    { id: 'arcane-staff', kind: 'weapon', name: '마력 지팡이', price: 220, power: 0.15, description: '랭크마다 모든 마법 피해 +15%', accent: '#c78cff' },
    { id: 'rapid-wand', kind: 'weapon', name: '속사 완드', price: 240, power: 0.07, description: '랭크마다 일반·궁극기 쿨타임 -7%', accent: '#68d7ff' },
    { id: 'blast-rod', kind: 'weapon', name: '폭발 지팡이', price: 230, power: 0.09, description: '랭크마다 광역 마법 범위 +9%', accent: '#ff9b5e' },
    { id: 'golden-wand', kind: 'weapon', name: '황금 완드', price: 210, power: 0.12, description: '랭크마다 처치 금화 +12%', accent: '#f3cf67' },
];
const ARMORS = [
    { id: 'iron-robe', kind: 'armor', name: '철갑 로브', price: 200, power: 0.08, description: '랭크마다 받는 피해 -8%', accent: '#aab8c7' },
    { id: 'gale-cloak', kind: 'armor', name: '질풍 망토', price: 220, power: 0.08, description: '랭크마다 이동속도 +8%', accent: '#69e0b5' },
    { id: 'magnet-cloak', kind: 'armor', name: '자석 망토', price: 210, power: 0.16, description: '랭크마다 경험치·금화 흡수거리 +16%', accent: '#65cfff' },
    { id: 'guardian-plate', kind: 'armor', name: '수호 갑주', price: 230, power: 0.07, description: '랭크마다 수호핵이 받는 피해 -7%', accent: '#f0c46b' },
];
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
    const potionB = copyWithPriceVariance(POTION, rng);
    return [weapons[0], weapons[1], armors[0], armors[1], potionA, potionB];
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
    const weapon = state.weapon;
    const weaponFactor = legendaryFactor(weapon);
    if (weapon?.id === 'arcane-staff')
        bonuses.spellPowerMultiplier += weapon.power * weapon.rank * weaponFactor;
    if (weapon?.id === 'rapid-wand')
        bonuses.cooldownMultiplier = Math.max(weapon.legendary ? 0.55 : 0.62, 1 - weapon.power * weapon.rank * weaponFactor);
    if (weapon?.id === 'blast-rod')
        bonuses.areaMultiplier += weapon.power * weapon.rank * weaponFactor;
    if (weapon?.id === 'golden-wand')
        bonuses.goldMultiplier += weapon.power * weapon.rank * weaponFactor;
    const armor = state.armor;
    const armorFactor = legendaryFactor(armor);
    if (armor?.id === 'iron-robe')
        bonuses.damageTakenMultiplier = Math.max(armor.legendary ? 0.48 : 0.55, 1 - armor.power * armor.rank * armorFactor);
    if (armor?.id === 'gale-cloak')
        bonuses.moveSpeedMultiplier += armor.power * armor.rank * armorFactor;
    if (armor?.id === 'magnet-cloak')
        bonuses.pickupMultiplier += armor.power * armor.rank * armorFactor;
    if (armor?.id === 'guardian-plate')
        bonuses.coreDamageTakenMultiplier = Math.max(armor.legendary ? 0.50 : 0.58, 1 - armor.power * armor.rank * armorFactor);
    return bonuses;
}
