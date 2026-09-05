import { clamp } from '../../core/math.js';
function normalizedPoint(archetype, index) {
    const i = Math.max(0, index);
    if (archetype === 'inferno')
        return [{ x: .5, y: .54 }, { x: .31, y: .62 }, { x: .69, y: .38 }][i % 3];
    if (archetype === 'summoner')
        return [{ x: .28, y: .34 }, { x: .72, y: .34 }, { x: .5, y: .7 }][i % 3];
    if (archetype === 'juggernaut')
        return i % 2 === 0 ? { x: .26, y: .52 } : { x: .74, y: .48 };
    if (archetype === 'twinMaw')
        return [{ x: .3, y: .34 }, { x: .7, y: .66 }, { x: .7, y: .34 }, { x: .3, y: .66 }][i % 4];
    const steps = archetype === 'timeEater' ? 8 : 6;
    const a = -Math.PI / 2 + (i % steps) * Math.PI * 2 / steps;
    const rx = archetype === 'timeEater' ? .23 : .25, ry = archetype === 'timeEater' ? .24 : .19;
    return { x: .5 + Math.cos(a) * rx, y: .52 + Math.sin(a) * ry };
}
function arenaPoint(p, width, height) {
    const w = Math.max(320, width), h = Math.max(240, height);
    return { x: clamp(p.x * w, 80, w - 80), y: clamp(p.y * h, 120, h - 80) };
}
function baseRadius(archetype) {
    if (archetype === 'inferno')
        return 82;
    if (archetype === 'summoner')
        return 96;
    if (archetype === 'juggernaut')
        return 72;
    if (archetype === 'abyssWitch')
        return 86;
    if (archetype === 'twinMaw')
        return 78;
    return 88;
}
export function mythicSafeZoneState(archetype, encounterElapsedMs, width, height, destroyedWeakpointRatio, lifecycle) {
    const elapsed = Math.max(0, Number.isFinite(encounterElapsedMs) ? encounterElapsedMs : 0);
    const timing = lifecycle ?? { active: false, cycleMs: 9000, stableEndMs: 4800, collapseEndMs: 6200, collapsedEndMs: 7800, reformEndMs: 9000, radiusMultiplier: 1 };
    const cycleIndex = Math.floor(elapsed / timing.cycleMs), local = elapsed % timing.cycleMs;
    const phase = local < timing.stableEndMs ? 'stable' : local < timing.collapseEndMs ? 'collapse' : local < timing.collapsedEndMs ? 'collapsed' : 'reform';
    const phaseEndMs = phase === 'stable' ? timing.stableEndMs : phase === 'collapse' ? timing.collapseEndMs : phase === 'collapsed' ? timing.collapsedEndMs : timing.reformEndMs;
    const destroyed = clamp(Number.isFinite(destroyedWeakpointRatio) ? destroyedWeakpointRatio : 0, 0, 1);
    const nominal = baseRadius(archetype) + destroyed * 18;
    const scale = phase === 'stable' ? 1 : phase === 'collapse' ? .72 : phase === 'collapsed' ? .58 : .64;
    const radius = clamp(nominal * scale * timing.radiusMultiplier, 48, 150);
    const nextCenter = arenaPoint(normalizedPoint(archetype, cycleIndex + 1), width, height);
    const center = phase === 'reform' ? nextCenter : arenaPoint(normalizedPoint(archetype, cycleIndex), width, height);
    const active = phase !== 'collapsed';
    const preferenceWeight = phase === 'stable' ? 100 : phase === 'collapse' ? 58 : phase === 'reform' ? 76 : 0;
    return { label: 'SAFE ZONE', phase, center, nextCenter, radius, cycleIndex, active, preferenceWeight, cycleMs: timing.cycleMs, phaseEndMs };
}
export function mythicSafeZoneDamageMultiplier(zone, point) {
    if (!zone || !zone.active)
        return 1;
    if (Math.hypot(point.x - zone.center.x, point.y - zone.center.y) > zone.radius)
        return 1;
    if (zone.phase === 'stable')
        return .18;
    if (zone.phase === 'collapse')
        return .58;
    if (zone.phase === 'reform')
        return .34;
    return 1;
}
