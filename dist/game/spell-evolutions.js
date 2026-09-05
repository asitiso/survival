const BASE = {
    damageMultiplier: 1,
    areaMultiplier: 1,
    projectileBonus: 0,
    jumpBonus: 0,
    tickMultiplier: 1,
    cooldownMultiplier: 1,
    durationMultiplier: 1,
    pierceBonus: 0,
    splashRadiusBonus: 0,
    splashDamageBonus: 0,
    knockbackMultiplier: 1,
    pullMultiplier: 1,
    slowFactorMultiplier: 1,
    slowDurationMultiplier: 1,
    delayMultiplier: 1,
};
const AWAKENED_NAMES = {
    arkan: {
        fireBolt: '폭렬 화염탄', chainLightning: '홍련 연쇄', frostNova: '화산 충격', flameField: '용암 범람', meteorStorm: '유성우', blackHole: '업화 와류',
    },
    seria: {
        fireBolt: '빙결 창우', chainLightning: '동결 연쇄', frostNova: '빙하 파동', flameField: '극설 지대', meteorStorm: '빙정 폭격', blackHole: '극저온 와류',
    },
    kain: {
        fireBolt: '과충전 뇌전탄', chainLightning: '폭주 연쇄', frostNova: '전자 충격권', flameField: '고압 폭풍장', meteorStorm: '낙뢰 폭격', blackHole: '전류 폭풍안',
    },
    edric: {
        fireBolt: '관통 성광창', chainLightning: '연쇄 심판', frostNova: '수호 대충격', flameField: '대성역', meteorStorm: '천상 포격', blackHole: '시간 봉쇄장',
    },
};
const FINAL_NAMES = {
    arkan: {
        fireBolt: '지옥성 폭렬탄', chainLightning: '멸화 대연쇄', frostNova: '종말 화산폭발', flameField: '지옥 용암해', meteorStorm: '천붕 메테오', blackHole: '아비규환',
    },
    seria: {
        fireBolt: '영구빙창 만화', chainLightning: '빙점 대연쇄', frostNova: '절대동결 파동', flameField: '영원의 설원', meteorStorm: '빙하 종말우', blackHole: '절대영도',
    },
    kain: {
        fireBolt: '뇌신 천뢰탄', chainLightning: '무한 전류망', frostNova: '초전자 붕괴', flameField: '태풍 발전장', meteorStorm: '천뢰만격', blackHole: '폭풍의 눈',
    },
    edric: {
        fireBolt: '신벌 성광창진', chainLightning: '최후의 심판망', frostNova: '왕성 수호충격', flameField: '불멸 대성역', meteorStorm: '천상 대심판', blackHole: '영겁의 시간감옥',
    },
};
export function spellEvolutionTier(level) {
    const value = Math.max(1, Math.floor(level));
    if (value >= 10)
        return 2;
    if (value >= 5)
        return 1;
    return 0;
}
export function spellEvolution(heroId, spellId, level) {
    const tier = spellEvolutionTier(level);
    const profile = {
        ...BASE,
        tier,
        name: tier === 2 ? FINAL_NAMES[heroId][spellId] : tier === 1 ? AWAKENED_NAMES[heroId][spellId] : '',
    };
    if (tier === 0)
        return profile;
    if (spellId === 'fireBolt') {
        profile.damageMultiplier = tier === 1 ? 1.08 : 1.18;
        profile.projectileBonus = tier === 1 ? 1 : 2;
        profile.pierceBonus = tier === 2 ? 1 : 0;
        profile.splashRadiusBonus = tier === 1 ? 10 : 24;
        profile.splashDamageBonus = tier === 1 ? 0.08 : 0.18;
    }
    else if (spellId === 'chainLightning') {
        profile.damageMultiplier = tier === 1 ? 1.06 : 1.14;
        profile.jumpBonus = tier === 1 ? 1 : 3;
        profile.cooldownMultiplier = tier === 1 ? 0.95 : 0.84;
    }
    else if (spellId === 'frostNova') {
        profile.damageMultiplier = tier === 1 ? 1.08 : 1.18;
        profile.areaMultiplier = tier === 1 ? 1.10 : 1.23;
        profile.durationMultiplier = tier === 1 ? 1.10 : 1.22;
        profile.knockbackMultiplier = tier === 1 ? 1.15 : 1.45;
    }
    else if (spellId === 'flameField') {
        profile.damageMultiplier = tier === 1 ? 1.07 : 1.16;
        profile.areaMultiplier = tier === 1 ? 1.10 : 1.24;
        profile.tickMultiplier = tier === 1 ? 1.15 : 1.36;
        profile.durationMultiplier = tier === 1 ? 1.08 : 1.18;
    }
    else if (spellId === 'meteorStorm') {
        profile.damageMultiplier = tier === 1 ? 1.10 : 1.23;
        profile.areaMultiplier = tier === 1 ? 1.08 : 1.19;
        profile.projectileBonus = tier === 1 ? 2 : 5;
        profile.cooldownMultiplier = tier === 2 ? 0.90 : 0.96;
        profile.delayMultiplier = tier === 1 ? 0.92 : 0.82;
    }
    else {
        profile.damageMultiplier = tier === 1 ? 1.08 : 1.18;
        profile.areaMultiplier = tier === 1 ? 1.09 : 1.21;
        profile.tickMultiplier = tier === 1 ? 1.15 : 1.36;
        profile.durationMultiplier = tier === 1 ? 1.10 : 1.24;
        profile.pullMultiplier = tier === 1 ? 1.12 : 1.28;
        profile.cooldownMultiplier = tier === 2 ? 0.91 : 0.97;
    }
    if (heroId === 'arkan') {
        profile.damageMultiplier *= tier === 2 ? 1.10 : 1.05;
        if (spellId === 'fireBolt') {
            profile.splashRadiusBonus += tier === 2 ? 18 : 8;
            profile.splashDamageBonus += tier === 2 ? 0.18 : 0.08;
        }
        if (spellId === 'meteorStorm')
            profile.projectileBonus += tier;
    }
    else if (heroId === 'seria') {
        profile.areaMultiplier *= tier === 2 ? 1.09 : 1.04;
        profile.slowFactorMultiplier = tier === 2 ? 0.78 : 0.90;
        profile.slowDurationMultiplier = tier === 2 ? 1.30 : 1.15;
    }
    else if (heroId === 'kain') {
        profile.cooldownMultiplier *= tier === 2 ? 0.88 : 0.94;
        profile.tickMultiplier *= tier === 2 ? 1.18 : 1.08;
        if (spellId === 'chainLightning')
            profile.jumpBonus += tier;
        if (spellId === 'fireBolt')
            profile.projectileBonus += tier === 2 ? 1 : 0;
    }
    else {
        profile.areaMultiplier *= tier === 2 ? 1.08 : 1.04;
        profile.knockbackMultiplier *= tier === 2 ? 1.18 : 1.08;
        if (spellId === 'fireBolt')
            profile.pierceBonus += tier;
    }
    return profile;
}
