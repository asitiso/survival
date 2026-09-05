const IDENTITY = {
    grunt: { motif: 'dust', color: '#b9c8d6', weight: .80 }, hound: { motif: 'slash', color: '#ee8678', weight: .72 }, brute: { motif: 'fracture', color: '#d29668', weight: 1.18 }, archer: { motif: 'needle', color: '#d89bea', weight: .82 },
    bomber: { motif: 'blast', color: '#ff9b55', weight: 1.05 }, shaman: { motif: 'rune', color: '#83eab2', weight: .92 }, shieldbearer: { motif: 'shield', color: '#9eb4d2', weight: 1.08 }, assassin: { motif: 'shadow', color: '#dc9aff', weight: .84 },
    siegeGolem: { motif: 'quake', color: '#b59a76', weight: 1.32 }, nullifier: { motif: 'null', color: '#85b9ff', weight: 1.02 }, golden: { motif: 'gold', color: '#ffe16b', weight: .96 }, elite: { motif: 'elite', color: '#f5d06c', weight: 1.36 }, boss: { motif: 'boss', color: '#ffcc75', weight: 1.65 },
};
export function enemyStatusCue(kind) {
    if (kind === 'burn')
        return { color: '#ff7b45', style: 'embers', pulse: 0.72 };
    if (kind === 'freeze')
        return { color: '#91ebff', style: 'ring', pulse: 0.52 };
    return { color: '#bca4ff', style: 'arcs', pulse: 0.62 };
}
export function enemyImpactVfxDescriptor(type, tier) {
    const id = IDENTITY[type];
    const tierScale = tier === 'critical' ? 1.45 : tier === 'heavy' ? 1.15 : .82;
    const baseRays = id.motif === 'needle' || id.motif === 'slash' ? 5 : id.motif === 'blast' || id.motif === 'quake' || id.motif === 'boss' ? 6 : id.motif === 'rune' || id.motif === 'null' ? 4 : 2;
    return { motif: id.motif, color: id.color, rayCount: Math.min(10, Math.round(baseRays * tierScale)), glowAlpha: Math.min(.32, (.08 + id.weight * .07) * tierScale), ringRadius: Math.min(46, (13 + id.weight * 10) * tierScale), lineWidth: Math.min(4.2, 1.4 + id.weight * (tier === 'critical' ? 1.55 : 1.05)) };
}
export function enemyDeathCue(type) {
    const id = IDENTITY[type];
    if (type === 'boss')
        return { radius: 150, particles: 24, duration: 0.9, color: id.color, motif: id.motif, rayCount: 12, glowAlpha: .34 };
    if (type === 'elite')
        return { radius: 82, particles: 14, duration: 0.55, color: id.color, motif: id.motif, rayCount: 8, glowAlpha: .26 };
    const radius = type === 'siegeGolem' ? 62 : type === 'brute' || type === 'shieldbearer' ? 52 : type === 'bomber' ? 50 : 42;
    const particles = type === 'siegeGolem' ? 10 : type === 'bomber' || type === 'golden' ? 9 : type === 'brute' || type === 'shieldbearer' ? 8 : 6;
    const rays = id.motif === 'slash' || id.motif === 'needle' ? 6 : id.motif === 'blast' || id.motif === 'quake' ? 8 : id.motif === 'rune' || id.motif === 'null' ? 5 : 3;
    return { radius, particles, duration: type === 'siegeGolem' ? .42 : type === 'brute' ? .34 : .28, color: id.color, motif: id.motif, rayCount: rays, glowAlpha: Math.min(.22, .08 + id.weight * .08) };
}
export function enemyThreatTelegraph(enemy) {
    if (enemy.type === 'boss')
        return { enemyId: enemy.id, type: enemy.type, radius: enemy.radius + 54, priority: 100, color: '#ff5768', style: 'boss-ring' };
    if (enemy.type === 'bomber') {
        if ((enemy.specialTimer ?? 0.8) > 1.2)
            return null;
        return { enemyId: enemy.id, type: enemy.type, radius: Math.max(88, enemy.radius * 5.4), priority: 85, color: '#ff7a43', style: 'danger-ring' };
    }
    if (enemy.type === 'shaman')
        return { enemyId: enemy.id, type: enemy.type, radius: enemy.radius + 58, priority: 25, color: '#70e7a1', style: 'support-ring' };
    return null;
}
export function sortTelegraphsByPriority(telegraphs) {
    return telegraphs.filter((cue) => cue !== null).sort((a, b) => b.priority - a.priority || a.enemyId - b.enemyId);
}
