const SPELLS = new Set(['fireBolt', 'chainLightning', 'frostNova', 'flameField']);
function score(choice, context) {
    if (choice.id === 'maxHp' && context.hpRatio < .62)
        return 94;
    if (SPELLS.has(choice.id) && /최종 진화/.test(choice.description))
        return 92;
    if (SPELLS.has(choice.id) && /1차 진화/.test(choice.description))
        return 88;
    if (choice.id === 'spellPower')
        return 72;
    if (choice.id === 'cooldown')
        return 68;
    if (SPELLS.has(choice.id))
        return 64;
    if (choice.id === 'moveSpeed')
        return 46;
    if (choice.id === 'maxHp')
        return 42;
    return 38;
}
function hint(choice, context) {
    if (choice.id === 'maxHp' && context.hpRatio < .62)
        return '즉시 회복 · 초반 안정';
    if (/진화/.test(choice.description))
        return '진화 도달 · 체감 변화 큼';
    if (choice.id === 'spellPower')
        return '전체 마법 화력 상승';
    if (choice.id === 'cooldown')
        return '난사 주기 단축';
    if (SPELLS.has(choice.id))
        return '주력 마법 성장';
    return '초반 성장 보조';
}
export function guideOpeningUpgradeChoices(choices, context) {
    if (context.elapsedSeconds >= 600)
        return choices.map(choice => ({ ...choice }));
    let bestIndex = -1, bestScore = -Infinity;
    choices.forEach((choice, index) => { const s = score(choice, context); if (s > bestScore) {
        bestScore = s;
        bestIndex = index;
    } });
    return choices.map((choice, index) => index === bestIndex ? { ...choice, best: true, badge: '초반 추천', hint: hint(choice, context) } : { ...choice });
}
