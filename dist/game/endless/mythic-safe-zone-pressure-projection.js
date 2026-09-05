import { mythicSafeZonePressure } from './mythic-safe-zone-pressure.js';
const round3 = (value) => Math.round((value + Number.EPSILON) * 1000) / 1000;
const round1 = (value) => Math.round((value + Number.EPSILON) * 10) / 10;
const pct = (value) => Number.isInteger(value) ? `${Math.abs(value)}` : `${Math.abs(value).toFixed(1)}`;
const signed = (value) => value > 0 ? `+${pct(value)}%` : value < 0 ? `-${pct(value)}%` : '±0%';
function effect(effectId, afterRaw, label) {
    const after = round3(afterRaw), deltaPercent = round1((afterRaw - 1) * 100);
    return { effectId, before: 1, after, deltaPercent, saliencePercent: Math.abs(deltaPercent), label: `${label} ${signed(deltaPercent)}` };
}
export function projectMythicSafeZonePressureEffects(archetype, zone, destroyedWeakpointRatio) {
    const ratio = Math.max(0, Math.min(1, Number.isFinite(destroyedWeakpointRatio) ? destroyedWeakpointRatio : 0));
    const pressure = mythicSafeZonePressure(archetype, zone, ratio);
    const effects = [
        effect('special-cadence', pressure.specialCadenceMultiplier, '특수주기'),
        effect('summon-pressure', pressure.summonCountMultiplier, '소환'),
        effect('dash-distance', pressure.dashDistanceMultiplier, '돌진거리'),
        effect('boss-vulnerability', pressure.bossDamageTakenMultiplier, '보스피해'),
    ];
    const primaryEffects = effects.map((value, index) => ({ value, index })).sort((a, b) => b.value.saliencePercent - a.value.saliencePercent || a.index - b.index).slice(0, 2).map(entry => entry.value);
    return { archetype, phase: zone?.phase ?? null, destroyedWeakpointRatio: ratio, effects, primaryEffects, maxPrimaryEffects: 2 };
}
export function mythicSafeZonePressureEffectHint(projection, limit = 2) {
    return projection.primaryEffects.slice(0, Math.max(0, Math.min(2, limit))).map(effect => effect.label).join(' · ');
}
