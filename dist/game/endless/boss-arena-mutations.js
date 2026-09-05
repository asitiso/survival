import { clamp } from '../../core/math.js';
const KINDS = ['rotating_front', 'fractured_ring', 'gravity_well', 'mirror_lanes', 'shrinking_sanctum'];
const LABELS = {
    rotating_front: '회전 전선',
    fractured_ring: '균열 고리',
    gravity_well: '중력 우물',
    mirror_lanes: '거울 통로',
    shrinking_sanctum: '수축 성역',
};
const ARCHETYPE_OFFSET = {
    inferno: 0,
    summoner: 1,
    juggernaut: 2,
    abyssWitch: 3,
    twinMaw: 4,
    timeEater: 2,
};
export function createBossArenaMutation(archetype, ascensionTier, encounterIndex) {
    const tier = Math.max(0, Math.min(10, Math.floor(ascensionTier)));
    if (tier < 2)
        return null;
    const index = Math.abs((ARCHETYPE_OFFSET[archetype] ?? 0) + Math.floor(encounterIndex) + tier) % KINDS.length;
    const kind = KINDS[index];
    return { kind, tier, intensity: clamp(0.35 + tier * 0.055, 0.35, 0.9), label: LABELS[kind] };
}
export function bossArenaMutationModifiers(mutation) {
    if (!mutation)
        return { cadenceMultiplier: 1, radiusMultiplier: 1, telegraphMultiplier: 1, damageMultiplier: 1, maxHazards: 6, orbitOffsetRadians: 0 };
    const i = clamp(mutation.intensity, 0, 1);
    const base = {
        cadenceMultiplier: clamp(1 - i * 0.22, 0.72, 1.05),
        radiusMultiplier: 1,
        telegraphMultiplier: clamp(1 - i * 0.12, 0.78, 1.15),
        damageMultiplier: clamp(1 + i * 0.12, 1, 1.16),
        maxHazards: Math.min(8, 6 + (mutation.tier >= 6 ? 1 : 0) + (mutation.tier >= 9 ? 1 : 0)),
        orbitOffsetRadians: 0,
    };
    if (mutation.kind === 'rotating_front')
        base.orbitOffsetRadians = 0.4 + i * 0.7;
    else if (mutation.kind === 'fractured_ring')
        base.radiusMultiplier = clamp(0.92 + i * 0.3, 0.82, 1.28);
    else if (mutation.kind === 'gravity_well')
        base.radiusMultiplier = clamp(1.04 + i * 0.2, 0.82, 1.28);
    else if (mutation.kind === 'mirror_lanes')
        base.radiusMultiplier = clamp(0.86 + i * 0.08, 0.82, 1.28);
    else if (mutation.kind === 'shrinking_sanctum') {
        base.radiusMultiplier = clamp(1.08 - i * 0.22, 0.82, 1.28);
        base.telegraphMultiplier = clamp(1.08 - i * 0.1, 0.78, 1.15);
    }
    return base;
}
