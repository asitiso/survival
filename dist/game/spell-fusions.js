export const FUSION_IDS = [
    'solar-detonation',
    'storm-crucible',
    'frostfire-cataclysm',
    'thunder-singularity',
    'glacial-conduit',
    'cataclysmic-domain',
];
export const MAX_FUSIONS_PER_RUN = 2;
const DEFINITIONS = {
    'solar-detonation': { id: 'solar-detonation', components: ['fireBolt', 'flameField'], name: '태양 폭발', description: '화염탄이 장판을 점화해 대폭발을 일으킵니다.' },
    'storm-crucible': { id: 'storm-crucible', components: ['chainLightning', 'flameField'], name: '폭풍 도가니', description: '장판이 번개를 머금어 빠른 연쇄 피해를 줍니다.' },
    'frostfire-cataclysm': { id: 'frostfire-cataclysm', components: ['fireBolt', 'frostNova'], name: '빙염 대재앙', description: '화염과 냉기가 교차해 파쇄 폭발을 일으킵니다.' },
    'thunder-singularity': { id: 'thunder-singularity', components: ['chainLightning', 'frostNova'], name: '뇌전 특이점', description: '전류가 냉기 충격권을 따라 더 멀리 연쇄됩니다.' },
    'glacial-conduit': { id: 'glacial-conduit', components: ['fireBolt', 'chainLightning'], name: '빙뢰 도관', description: '투사체와 연쇄 전류가 서로를 증폭합니다.' },
    'cataclysmic-domain': { id: 'cataclysmic-domain', components: ['frostNova', 'flameField'], name: '종말 영역', description: '넓은 제어 장판이 주기적으로 충격파를 방출합니다.' },
};
const HERO_PREFIX = {
    arkan: ['태양왕', '홍련', '빙염왕', '폭뢰', '화뢰', '지옥'],
    seria: ['빙양', '설뢰', '백야', '빙뢰', '극빙', '영동'],
    kain: ['과충전', '천뢰', '초전도', '뇌신', '광속', '폭풍'],
    edric: ['성광', '심판', '성빙', '천벌', '신성', '영겁'],
};
export function fusionDefinition(id) { return DEFINITIONS[id]; }
export function fusionHeroName(id, heroId) {
    const index = FUSION_IDS.indexOf(id);
    return `${HERO_PREFIX[heroId][Math.max(0, index)]} · ${DEFINITIONS[id].name}`;
}
export function fusionEligible(id, levels) {
    const [a, b] = DEFINITIONS[id].components;
    return (levels[a] ?? 0) >= 10 && (levels[b] ?? 0) >= 10;
}
export function fusionCandidates(levels, equipped) {
    if (equipped.length >= MAX_FUSIONS_PER_RUN)
        return [];
    const owned = new Set(equipped);
    return FUSION_IDS.filter((id) => !owned.has(id) && fusionEligible(id, levels));
}
export function fusionAffectsSpell(id, spellId) {
    return DEFINITIONS[id].components.includes(spellId);
}
export function fusionModifiers(id, heroId) {
    const base = {
        damageMultiplier: 1.08,
        areaMultiplier: 1.06,
        cooldownMultiplier: 0.96,
        jumpBonus: 0,
        pierceBonus: 0,
        slowDurationMultiplier: 1,
        tickMultiplier: 1,
    };
    if (id === 'solar-detonation') {
        base.damageMultiplier = 1.18;
        base.areaMultiplier = 1.14;
    }
    if (id === 'storm-crucible') {
        base.cooldownMultiplier = 0.90;
        base.tickMultiplier = 1.18;
        base.jumpBonus = 1;
    }
    if (id === 'frostfire-cataclysm') {
        base.damageMultiplier = 1.15;
        base.areaMultiplier = 1.12;
        base.slowDurationMultiplier = 1.18;
    }
    if (id === 'thunder-singularity') {
        base.cooldownMultiplier = 0.91;
        base.jumpBonus = 2;
        base.areaMultiplier = 1.08;
    }
    if (id === 'glacial-conduit') {
        base.damageMultiplier = 1.12;
        base.pierceBonus = 1;
        base.jumpBonus = 1;
    }
    if (id === 'cataclysmic-domain') {
        base.areaMultiplier = 1.18;
        base.tickMultiplier = 1.20;
        base.slowDurationMultiplier = 1.15;
    }
    if (heroId === 'arkan') {
        base.damageMultiplier = Math.min(1.24, base.damageMultiplier * 1.04);
        base.areaMultiplier = Math.min(1.22, base.areaMultiplier * 1.03);
    }
    else if (heroId === 'seria') {
        base.areaMultiplier = Math.min(1.22, base.areaMultiplier * 1.04);
        base.slowDurationMultiplier *= 1.15;
    }
    else if (heroId === 'kain') {
        base.cooldownMultiplier = Math.max(0.86, base.cooldownMultiplier * 0.96);
        base.jumpBonus = Math.min(3, base.jumpBonus + 1);
    }
    else {
        base.pierceBonus = Math.min(2, base.pierceBonus + 1);
        base.areaMultiplier = Math.min(1.22, base.areaMultiplier * 1.02);
    }
    return base;
}
