const PALETTE = {
    arkan: { family: 'fire', primary: '#ff7548', secondary: '#ffcf61' },
    seria: { family: 'frost', primary: '#8ee9ff', secondary: '#d9f8ff' },
    kain: { family: 'lightning', primary: '#a88cff', secondary: '#e7dcff' },
    edric: { family: 'holy', primary: '#ffe7a0', secondary: '#fff8db' },
};
const SHAPE = {
    fireBolt: 'bolt',
    chainLightning: 'fork',
    frostNova: 'nova',
    flameField: 'field',
    meteorStorm: 'meteor',
    blackHole: 'vortex',
};
const STRUCTURE = {
    fireBolt: { waves: [0, 0, 1], rays: [1, 2, 3] },
    chainLightning: { waves: [0, 1, 1], rays: [3, 5, 8] },
    frostNova: { waves: [1, 2, 3], rays: [4, 6, 8] },
    flameField: { waves: [1, 2, 3], rays: [0, 2, 4] },
    meteorStorm: { waves: [2, 3, 4], rays: [6, 10, 14] },
    blackHole: { waves: [2, 3, 4], rays: [8, 12, 16] },
};
export function spellVfxDescriptor(heroId, spellId, level) {
    const palette = PALETTE[heroId];
    const tier = level >= 10 ? 2 : level >= 5 ? 1 : 0;
    const ultimate = spellId === 'meteorStorm' || spellId === 'blackHole';
    const slotScale = spellId === 'frostNova' || spellId === 'flameField' ? 1.18 : spellId === 'chainLightning' ? 0.92 : 1;
    const tierScale = tier === 0 ? 1 : tier === 1 ? 1.35 : 1.75;
    const structure = STRUCTURE[spellId];
    return {
        family: palette.family,
        tier,
        ultimate,
        shape: SHAPE[spellId],
        primary: palette.primary,
        secondary: palette.secondary,
        trailWidth: (ultimate ? 6 : 3.2) * tierScale,
        burstRadius: (ultimate ? 72 : 34) * slotScale * tierScale,
        sparkCount: Math.min(18, (ultimate ? 8 : 4) + tier * (ultimate ? 5 : 4)),
        opacity: Math.min(0.92, 0.62 + tier * 0.10 + (ultimate ? 0.08 : 0)),
        persistence: Math.min(0.8, (ultimate ? 0.44 : 0.22) + tier * 0.11),
        waveCount: structure.waves[tier],
        rayCount: structure.rays[tier],
        screenPulse: (ultimate ? 0.78 : 0.28) + tier * (ultimate ? 0.08 : 0.04),
        flashAlpha: Math.min(0.44, (ultimate ? 0.28 : 0.10) + tier * (ultimate ? 0.07 : 0.03)),
    };
}
export function ultimateChoreographyDescriptor(spellId, level) {
    const tier = level >= 10 ? 2 : level >= 5 ? 1 : 0;
    if (spellId === 'meteorStorm')
        return { motion: 'descent', trailCount: [4, 6, 8][tier], ringCount: [2, 3, 4][tier], orbitCount: 0, glowAlpha: [.20, .27, .34][tier], afterglow: [.16, .22, .28][tier], streakLength: [110, 145, 180][tier] };
    return { motion: 'orbit', trailCount: [3, 5, 7][tier], ringCount: [3, 4, 5][tier], orbitCount: [2, 3, 4][tier], glowAlpha: [.18, .25, .32][tier], afterglow: [.22, .28, .34][tier], streakLength: [72, 92, 118][tier] };
}
