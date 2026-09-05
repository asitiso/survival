import { quickShopRecommendation, safeQuickPurchase, shopGuidanceForOffers } from './shop-guidance.js';
const HEROES = ['arkan', 'seria', 'kain', 'edric'];
const ARCHETYPES = ['burst', 'cycle', 'domain', 'fortress'];
const OFFERS = [
    { id: 'arcane-staff', kind: 'weapon', name: '마력 지팡이', price: 220, power: .15, description: '', accent: '#fff' }, { id: 'rapid-wand', kind: 'weapon', name: '속사 완드', price: 240, power: .07, description: '', accent: '#fff' },
    { id: 'iron-robe', kind: 'armor', name: '철갑 로브', price: 200, power: .08, description: '', accent: '#fff' }, { id: 'guardian-plate', kind: 'armor', name: '수호 갑주', price: 230, power: .07, description: '', accent: '#fff' },
    { id: 'healing-potion', kind: 'potion', name: '체력 물약', price: 70, power: .35, description: '', accent: '#fff' }, { id: 'healing-potion', kind: 'potion', name: '체력 물약', price: 80, power: .35, description: '', accent: '#fff' }
];
function item(id, kind, rank, legendary = false) { const offer = OFFERS.find((o) => o.id === id); return { id, kind, name: offer.name, rank, power: offer.power, legendary }; }
function protectedSwap(offer, state) { if (offer.kind === 'potion')
    return false; const current = offer.kind === 'weapon' ? state.weapon : state.armor; return Boolean(current && current.id !== offer.id && (current.rank >= 3 || current.legendary)); }
export function auditQuickBuyRegret() {
    const samples = [];
    let protectedReplacementCount = 0, unaffordableCount = 0, highRegretCount = 0;
    const states = [
        ['empty', () => ({ coins: 1000, weapon: null, armor: null, healingPotions: 1 })],
        ['upgrade', (arch) => ({ coins: 1000, weapon: item(arch === 'cycle' ? 'rapid-wand' : 'arcane-staff', 'weapon', 2), armor: null, healingPotions: 1 })],
        ['protected', () => ({ coins: 1000, weapon: item('rapid-wand', 'weapon', 3), armor: item('iron-robe', 'armor', 3), healingPotions: 2 })],
        ['legendary', () => ({ coins: 1000, weapon: item('rapid-wand', 'weapon', 5, true), armor: item('iron-robe', 'armor', 5, true), healingPotions: 2 })],
    ];
    for (const heroId of HEROES)
        for (const archetype of ARCHETYPES)
            for (const [stateKind, makeState] of states) {
                const state = makeState(archetype);
                const guidance = shopGuidanceForOffers(OFFERS, { heroId, archetype, state });
                const offer = quickShopRecommendation(OFFERS, guidance, state);
                const protectedReplacement = offer ? protectedSwap(offer, state) : false;
                const affordable = offer ? offer.price <= state.coins : true;
                if (protectedReplacement)
                    protectedReplacementCount++;
                if (!affordable)
                    unaffordableCount++;
                if (protectedReplacement || !affordable)
                    highRegretCount++;
                samples.push({ heroId, archetype, stateKind, offerId: offer?.id ?? null, protectedReplacement, affordable });
            }
    let safeEligible = 0, safeAllowed = 0, risky = 0, riskyBlocked = 0;
    for (const offer of OFFERS.filter((o) => o.kind !== 'potion')) {
        const kind = offer.kind;
        const same = { coins: 1000, weapon: kind === 'weapon' ? item(offer.id, 'weapon', 2) : null, armor: kind === 'armor' ? item(offer.id, 'armor', 2) : null, healingPotions: 1 };
        safeEligible++;
        if (safeQuickPurchase(offer, OFFERS, same))
            safeAllowed++;
        const alternative = kind === 'weapon' ? (offer.id === 'arcane-staff' ? 'rapid-wand' : 'arcane-staff') : (offer.id === 'iron-robe' ? 'guardian-plate' : 'iron-robe');
        const protectedState = { coins: 1000, weapon: kind === 'weapon' ? item(alternative, 'weapon', 3) : null, armor: kind === 'armor' ? item(alternative, 'armor', 3) : null, healingPotions: 1 };
        risky++;
        if (!safeQuickPurchase(offer, OFFERS, protectedState))
            riskyBlocked++;
    }
    const safeUpgradeCoverage = safeAllowed / Math.max(1, safeEligible), riskySwapBlockedRate = riskyBlocked / Math.max(1, risky);
    const issues = [];
    if (protectedReplacementCount)
        issues.push('protected-replacement');
    if (unaffordableCount)
        issues.push('unaffordable');
    if (safeUpgradeCoverage < .99)
        issues.push('safe-upgrade-blocked');
    if (riskySwapBlockedRate < .99)
        issues.push('risky-swap-unblocked');
    return { passed: issues.length === 0, heroCount: HEROES.length, archetypeCount: ARCHETYPES.length, samples, protectedReplacementCount, unaffordableCount, safeUpgradeCoverage, riskySwapBlockedRate, highRegretCount, issues };
}
