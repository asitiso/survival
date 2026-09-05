const LIMITS = {
    high: { particlesHardCap: 180, trailsHardCap: 72, telegraphsHardCap: 24, decorativeParticles: 168, decorativeTrails: 68 },
    medium: { particlesHardCap: 180, trailsHardCap: 72, telegraphsHardCap: 24, decorativeParticles: 112, decorativeTrails: 48 },
    low: { particlesHardCap: 180, trailsHardCap: 72, telegraphsHardCap: 24, decorativeParticles: 64, decorativeTrails: 28 },
};
export function presentationLimits(quality) {
    return LIMITS[quality];
}
export function adaptiveQuality(current, fps, particleLoad) {
    const load = Math.max(0, particleLoad);
    if (current === 'high')
        return fps < 50 || load >= 0.85 ? 'medium' : 'high';
    if (current === 'medium') {
        if (fps < 42 || load >= 0.94)
            return 'low';
        return fps >= 59 && load <= 0.20 ? 'high' : 'medium';
    }
    return fps >= 59 && load <= 0.15 ? 'medium' : 'low';
}
export function admitEffect(kind, counts, quality) {
    const limits = presentationLimits(quality);
    if (kind === 'telegraph')
        return counts.telegraphs < limits.telegraphsHardCap;
    if (kind === 'trail')
        return counts.trails < Math.min(limits.trailsHardCap, limits.decorativeTrails);
    return counts.particles < Math.min(limits.particlesHardCap, limits.decorativeParticles);
}
