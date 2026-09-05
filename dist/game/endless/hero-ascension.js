import { clamp } from '../../core/math.js';
const MILESTONES = [35, 50, 65];
function makeOptions(heroId, accent, rows) {
    return rows.map(([optionId, title, description]) => ({ optionId, heroId, title, description, accent }));
}
const CATALOG = {
    arkan: makeOptions('arkan', '#ff7557', [
        ['wildfire-doctrine', '야화 교리', '마법 피해와 융합 위력 강화'], ['ash-step', '재의 걸음', '이동속도와 생존성 강화'], ['solar-collapse', '태양 붕괴', '보스 피해와 범위 강화'],
        ['cinder-heart', '잿불 심장', '피해와 받는 피해 균형 강화'], ['eruption-chain', '분화 연쇄', '융합과 범위 강화'], ['phoenix-cycle', '불사조 순환', '쿨타임 강화'],
    ]),
    seria: makeOptions('seria', '#7ce8ff', [
        ['absolute-zero', '절대영도', '범위와 마법 피해 강화'], ['frozen-time', '빙결 시간', '쿨타임과 수호핵 방어 강화'], ['crystal-echo', '결정 메아리', '융합 위력과 범위 강화'],
        ['glacier-step', '빙하 걸음', '이동속도와 생존성 강화'], ['whiteout', '화이트아웃', '범위와 보스 피해 강화'], ['winter-covenant', '겨울의 서약', '방어와 쿨타임 강화'],
    ]),
    kain: makeOptions('kain', '#a58bff', [
        ['storm-circuit', '폭풍 회로', '쿨타임과 융합 위력 강화'], ['thunder-step', '뇌광 보법', '이동속도와 피해 강화'], ['overcharge', '초과 충전', '마법 피해와 보스 피해 강화'],
        ['sky-breaker', '천공 파쇄', '범위와 보스 피해 강화'], ['static-shell', '정전기 갑각', '생존성과 수호핵 방어 강화'], ['tempest-loop', '폭풍 순환', '쿨타임과 이동속도 강화'],
    ]),
    edric: makeOptions('edric', '#ffe091', [
        ['holy-bastion', '성광 성채', '수호핵과 영웅 방어 강화'], ['vow-of-light', '빛의 서약', '마법 피해와 수호핵 방어 강화'], ['judgment-bell', '심판의 종', '보스 피해와 범위 강화'],
        ['pilgrim-step', '순례자의 걸음', '이동속도와 생존성 강화'], ['radiant-wall', '광휘 장벽', '범위와 방어 강화'], ['last-oath', '최후의 맹세', '융합 위력과 보스 피해 강화'],
    ]),
};
export function createDefaultHeroAscensionState() { return { nextMilestoneIndex: 0, selected: [] }; }
export function advanceHeroAscension(heroId, elapsedMs, state) {
    if (state.pendingOffer || state.nextMilestoneIndex >= MILESTONES.length)
        return { state, offered: false };
    const milestone = MILESTONES[state.nextMilestoneIndex];
    if (elapsedMs < milestone * 60_000)
        return { state, offered: false };
    const pool = CATALOG[heroId].filter((option) => !state.selected.includes(option.optionId));
    const offset = state.nextMilestoneIndex % Math.max(1, pool.length);
    const rotated = [...pool.slice(offset), ...pool.slice(0, offset)];
    const options = rotated.slice(0, 3);
    return { state: { ...state, pendingOffer: { milestone, options } }, offered: true };
}
export function selectHeroAscension(state, optionId) {
    const offer = state.pendingOffer;
    if (!offer)
        return state;
    const option = offer.options.find((entry) => entry.optionId === optionId);
    if (!option || state.selected.includes(option.optionId))
        return state;
    return {
        nextMilestoneIndex: Math.min(MILESTONES.length, state.nextMilestoneIndex + 1),
        selected: [...state.selected, option.optionId].slice(0, 3),
    };
}
export function heroAscensionModifiers(selected) {
    const out = { spellPowerMultiplier: 1, cooldownMultiplier: 1, areaMultiplier: 1, moveSpeedMultiplier: 1, heroDamageTakenMultiplier: 1, coreDamageTakenMultiplier: 1, fusionPowerMultiplier: 1, bossDamageMultiplier: 1 };
    for (const id of selected.slice(0, 3)) {
        if (['wildfire-doctrine', 'absolute-zero', 'overcharge', 'vow-of-light', 'cinder-heart', 'thunder-step'].includes(id))
            out.spellPowerMultiplier *= 1.10;
        if (['ash-step', 'glacier-step', 'thunder-step', 'pilgrim-step', 'tempest-loop'].includes(id))
            out.moveSpeedMultiplier *= 1.07;
        if (['phoenix-cycle', 'frozen-time', 'storm-circuit', 'winter-covenant', 'tempest-loop'].includes(id))
            out.cooldownMultiplier *= 0.92;
        if (['solar-collapse', 'eruption-chain', 'absolute-zero', 'crystal-echo', 'whiteout', 'sky-breaker', 'judgment-bell', 'radiant-wall'].includes(id))
            out.areaMultiplier *= 1.09;
        if (['ash-step', 'cinder-heart', 'glacier-step', 'static-shell', 'holy-bastion', 'pilgrim-step', 'radiant-wall'].includes(id))
            out.heroDamageTakenMultiplier *= 0.93;
        if (['frozen-time', 'winter-covenant', 'static-shell', 'holy-bastion', 'vow-of-light'].includes(id))
            out.coreDamageTakenMultiplier *= 0.91;
        if (['wildfire-doctrine', 'eruption-chain', 'crystal-echo', 'storm-circuit', 'last-oath'].includes(id))
            out.fusionPowerMultiplier *= 1.11;
        if (['solar-collapse', 'whiteout', 'overcharge', 'sky-breaker', 'judgment-bell', 'last-oath'].includes(id))
            out.bossDamageMultiplier *= 1.10;
    }
    return {
        spellPowerMultiplier: clamp(out.spellPowerMultiplier, 1, 1.45), cooldownMultiplier: clamp(out.cooldownMultiplier, .72, 1), areaMultiplier: clamp(out.areaMultiplier, 1, 1.35), moveSpeedMultiplier: clamp(out.moveSpeedMultiplier, 1, 1.22),
        heroDamageTakenMultiplier: clamp(out.heroDamageTakenMultiplier, .78, 1), coreDamageTakenMultiplier: clamp(out.coreDamageTakenMultiplier, .72, 1), fusionPowerMultiplier: clamp(out.fusionPowerMultiplier, 1, 1.4), bossDamageMultiplier: clamp(out.bossDamageMultiplier, 1, 1.35),
    };
}
export function heroAscensionCatalog(heroId) { return CATALOG[heroId]; }
const ASCENSION_IDS = new Set(Object.values(CATALOG).flat().map((option) => option.optionId));
export function sanitizeHeroAscensionState(value) {
    const raw = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const selected = Array.isArray(raw.selected)
        ? raw.selected.filter((id) => typeof id === 'string' && ASCENSION_IDS.has(id)).slice(0, 3)
        : [];
    const nextMilestoneIndex = Math.max(0, Math.min(3, Number.isFinite(raw.nextMilestoneIndex) ? Math.floor(raw.nextMilestoneIndex) : selected.length));
    const pendingRaw = raw.pendingOffer && typeof raw.pendingOffer === 'object' && !Array.isArray(raw.pendingOffer) ? raw.pendingOffer : null;
    let pendingOffer;
    if (pendingRaw && Number.isFinite(pendingRaw.milestone) && Array.isArray(pendingRaw.options)) {
        const options = [];
        for (const entry of pendingRaw.options) {
            if (!entry || typeof entry !== 'object' || Array.isArray(entry))
                continue;
            const optionId = entry.optionId;
            if (typeof optionId !== 'string' || !ASCENSION_IDS.has(optionId))
                continue;
            const canonical = Object.values(CATALOG).flat().find((option) => option.optionId === optionId);
            if (canonical && !selected.includes(canonical.optionId))
                options.push(canonical);
        }
        if (options.length === 3)
            pendingOffer = { milestone: Math.max(35, Math.min(65, Math.floor(pendingRaw.milestone))), options };
    }
    return pendingOffer ? { nextMilestoneIndex, selected, pendingOffer } : { nextMilestoneIndex, selected };
}
