const MIN_VISIBLE_PERCENT = 1;
const SOURCE_ORDER = ['special-cadence', 'summon-pressure', 'dash-distance', 'boss-vulnerability'];
function roundedPercent(multiplier) {
    const safe = Number.isFinite(multiplier) ? multiplier : 1;
    const value = Math.round((safe - 1) * 1000) / 10;
    return Object.is(value, -0) ? 0 : value;
}
function compactPercent(value) {
    const magnitude = Math.abs(value);
    const text = Number.isInteger(magnitude) ? String(magnitude) : magnitude.toFixed(1);
    return `${value >= 0 ? '+' : '-'}${text}%`;
}
function semanticImpact(effectId, deltaPercent) {
    if (deltaPercent === 0)
        return 'neutral';
    if (effectId === 'special-cadence')
        return deltaPercent < 0 ? 'threat' : 'opportunity';
    if (effectId === 'boss-vulnerability')
        return deltaPercent > 0 ? 'opportunity' : 'threat';
    return deltaPercent > 0 ? 'threat' : 'opportunity';
}
function effect(effectId, labelStem, after) {
    const safeAfter = Number.isFinite(after) ? after : 1;
    const deltaPercent = roundedPercent(safeAfter), impact = semanticImpact(effectId, deltaPercent);
    const impactLabel = impact === 'threat' ? '위험' : impact === 'opportunity' ? '기회' : '중립';
    const label = `${labelStem} ${compactPercent(deltaPercent)}`;
    return { effectId, labelStem, after: safeAfter, deltaPercent, magnitude: Math.abs(deltaPercent), label, impact, impactLabel, semanticLabel: `${label} · ${impactLabel}` };
}
export function projectBossEffectivePressure(modifiers) {
    const effects = [
        effect('special-cadence', '특수주기', modifiers.specialCadenceMultiplier),
        effect('summon-pressure', '소환', modifiers.summonCountMultiplier),
        effect('dash-distance', '돌진거리', modifiers.dashDistanceMultiplier),
        effect('boss-vulnerability', '보스피해', modifiers.bossDamageTakenMultiplier),
    ];
    const order = new Map(SOURCE_ORDER.map((id, index) => [id, index]));
    const visible = effects.filter(entry => entry.magnitude >= MIN_VISIBLE_PERCENT).sort((a, b) => (b.magnitude - a.magnitude) || ((order.get(a.effectId) ?? 99) - (order.get(b.effectId) ?? 99)));
    const threats = visible.filter(entry => entry.impact === 'threat');
    const primaryEffects = threats.length >= 2
        ? threats.slice(0, 2)
        : threats.length === 1
            ? [threats[0], ...visible.filter(entry => entry !== threats[0]).slice(0, 1)]
            : visible.slice(0, 2);
    const visibleThreatCount = threats.length;
    const visiblePrimaryThreats = primaryEffects.filter(entry => entry.impact === 'threat').length;
    const hiddenThreatCount = Math.max(0, visibleThreatCount - visiblePrimaryThreats);
    const hiddenThreatLabel = hiddenThreatCount > 0 ? `+${hiddenThreatCount} 위험` : '';
    return { effects, primaryEffects, maxPrimaryEffects: 2, visibleThreatCount, hiddenThreatCount, hiddenThreatLabel };
}
export function bossEffectivePressureHint(projection, limit = 2) {
    return projection.primaryEffects.slice(0, Math.max(0, Math.min(2, limit))).map(effect => effect.label).join(' · ');
}
export function bossEffectivePressureSemanticHint(projection, limit = 2) {
    return projection.primaryEffects.slice(0, Math.max(0, Math.min(2, limit))).map(effect => effect.semanticLabel).join(' / ');
}
export function bossEffectivePressureHiddenThreatHint(projection) {
    return projection.hiddenThreatLabel;
}
