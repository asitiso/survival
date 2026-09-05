const ARCHETYPE_WEIGHT = {
    burst: { 'arcane-staff': 44, 'blast-rod': 30, 'rapid-wand': 12, 'golden-wand': 4, 'iron-robe': 8, 'gale-cloak': 5, 'magnet-cloak': 4, 'guardian-plate': 6, 'healing-potion': 6 },
    cycle: { 'rapid-wand': 46, 'arcane-staff': 24, 'blast-rod': 12, 'golden-wand': 4, 'iron-robe': 7, 'gale-cloak': 10, 'magnet-cloak': 4, 'guardian-plate': 6, 'healing-potion': 6 },
    domain: { 'blast-rod': 46, 'rapid-wand': 24, 'arcane-staff': 20, 'golden-wand': 4, 'iron-robe': 7, 'gale-cloak': 7, 'magnet-cloak': 14, 'guardian-plate': 8, 'healing-potion': 6 },
    fortress: { 'guardian-plate': 48, 'iron-robe': 34, 'rapid-wand': 16, 'arcane-staff': 12, 'blast-rod': 10, 'golden-wand': 4, 'gale-cloak': 8, 'magnet-cloak': 5, 'healing-potion': 8 },
};
const HERO_WEIGHT = {
    arkan: { 'arcane-staff': 18, 'blast-rod': 12 },
    seria: { 'blast-rod': 14, 'rapid-wand': 9, 'magnet-cloak': 6 },
    kain: { 'rapid-wand': 16, 'gale-cloak': 10 },
    edric: { 'guardian-plate': 20, 'iron-robe': 10 },
};
function currentItem(state, offer) { return offer.kind === 'weapon' ? state.weapon : offer.kind === 'armor' ? state.armor : null; }
function reasonFor(offer, context, currentSame) {
    if (currentSame)
        return '현재 장비 강화 · 바로 누적';
    if (offer.id === 'guardian-plate')
        return context.heroId === 'edric' ? '에드릭 수호핵 특화' : '수호핵 생존 강화';
    if (offer.id === 'iron-robe')
        return '장기 생존 안정화';
    if (offer.id === 'rapid-wand')
        return '연사 주기 단축';
    if (offer.id === 'blast-rod')
        return '광역 범위 강화';
    if (offer.id === 'arcane-staff')
        return '전체 마법 화력 강화';
    if (offer.id === 'gale-cloak')
        return '회피 이동 여유 증가';
    if (offer.id === 'magnet-cloak')
        return '성장 자원 회수 개선';
    if (offer.id === 'golden-wand')
        return '장기 금화 수급 강화';
    return context.state.healingPotions <= 1 ? '물약 부족 보충' : '비상 회복 보충';
}
export function shopGuidanceForOffers(offers, context) {
    const scored = offers.map((offer, index) => {
        const current = currentItem(context.state, offer);
        if (current?.id === offer.id && current.rank >= 5)
            return { offerId: offer.id, label: '완성', reason: '이미 전설 완성', score: -100, best: false, index, affordable: true };
        let score = ARCHETYPE_WEIGHT[context.archetype][offer.id] ?? 0;
        score += HERO_WEIGHT[context.heroId][offer.id] ?? 0;
        const currentSame = current?.id === offer.id;
        if (currentSame)
            score += 22 + (current?.rank === 4 ? 10 : 0);
        if (offer.kind === 'potion' && context.state.healingPotions <= 1)
            score += 12;
        const affordable = offer.price <= context.state.coins;
        if (!affordable)
            score -= 6;
        return { offerId: offer.id, label: score >= 58 ? '강력 추천' : score >= 34 ? '추천' : '', reason: reasonFor(offer, context, currentSame), score, best: false, index, affordable };
    });
    const winners = scored.filter(x => x.affordable && x.score > -100).sort((a, b) => b.score - a.score || a.index - b.index).slice(0, 2);
    const winnerIndexes = new Set(winners.map(x => x.index));
    return scored.map(({ index, affordable, ...entry }) => { const best = winnerIndexes.has(index); return { ...entry, label: best && !entry.label ? '적합' : entry.label, best }; });
}
function protectedReplacement(offer, state) {
    if (offer.kind === 'potion')
        return false;
    const current = offer.kind === 'weapon' ? state.weapon : state.armor;
    return Boolean(current && current.id !== offer.id && (current.legendary || current.rank >= 3));
}
export function safeQuickPurchase(offer, offers, state) {
    const exact = offers.some((candidate) => candidate === offer || (candidate.id === offer.id && candidate.kind === offer.kind && candidate.price === offer.price));
    if (!exact || offer.price > state.coins || protectedReplacement(offer, state))
        return false;
    const current = offer.kind === 'weapon' ? state.weapon : offer.kind === 'armor' ? state.armor : null;
    return !(current?.id === offer.id && current.rank >= 5);
}
export function quickShopRecommendation(offers, guidance, state) {
    const ranked = guidance.map((entry, index) => ({ entry, index })).filter(({ entry, index }) => entry.best && offers[index]?.id === entry.offerId && (!state || safeQuickPurchase(offers[index], offers, state))).sort((a, b) => b.entry.score - a.entry.score || a.index - b.index);
    return ranked.length > 0 ? offers[ranked[0].index] ?? null : null;
}
