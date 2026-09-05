import { bossPhaseForRatio } from './boss-patterns.js';
const CINEMATIC_MOTIF = {
    inferno: 'flare', summoner: 'summon', juggernaut: 'slam', abyssWitch: 'void', twinMaw: 'cross', timeEater: 'time',
};
export function bossPhaseCinematicProfile(archetype, phase) {
    const phaseThree = phase === 3;
    return {
        motif: CINEMATIC_MOTIF[archetype],
        shockwaveCount: phaseThree ? 3 : 2,
        edgePulseAlpha: phaseThree ? 0.30 : 0.20,
        vignetteAlpha: phaseThree ? 0.24 : 0.15,
        cameraKind: phaseThree ? 'bossPhase3' : 'bossPhase2',
    };
}
function archetypeColor(archetype) {
    if (archetype === 'inferno')
        return '#ff704d';
    if (archetype === 'summoner')
        return '#72e4aa';
    if (archetype === 'juggernaut')
        return '#ffc255';
    if (archetype === 'abyssWitch')
        return '#cf6cff';
    if (archetype === 'twinMaw')
        return '#ff6ea8';
    return '#5bc8ff';
}
export class BossPresentationTracker {
    lastPhaseByBoss = new Map();
    reset() { this.lastPhaseByBoss.clear(); }
    update(bossId, hpRatio, archetype) {
        const phase = bossPhaseForRatio(hpRatio);
        const previous = this.lastPhaseByBoss.get(bossId);
        this.lastPhaseByBoss.set(bossId, phase);
        if (previous === undefined || phase <= previous || phase === 1)
            return null;
        const cuePhase = phase;
        return { bossId, archetype, phase: cuePhase, title: cuePhase === 2 ? 'BOSS PHASE II' : 'BOSS PHASE III · ENRAGED', color: archetypeColor(archetype), duration: cuePhase === 2 ? 1.25 : 1.55, ringRadius: cuePhase === 2 ? 132 : 172, cinematic: bossPhaseCinematicProfile(archetype, cuePhase) };
    }
}
export function bossPatternTelegraph(archetype, phase) {
    const phaseScale = 1 + (phase - 1) * 0.16;
    if (archetype === 'inferno')
        return { style: 'radial', color: '#ff6a42', radius: 118 * phaseScale, width: 6 + phase * 2, opacity: .82 };
    if (archetype === 'summoner')
        return { style: 'summon', color: '#6fe0a5', radius: 136 * phaseScale, width: 5 + phase, opacity: .76 };
    if (archetype === 'juggernaut')
        return { style: 'lane', color: '#ffc04b', radius: 190 * phaseScale, width: 92 + phase * 18, opacity: .84 };
    if (archetype === 'abyssWitch')
        return { style: 'curse', color: '#cf6cff', radius: 150 * phaseScale, width: 7 + phase, opacity: .80 };
    if (archetype === 'twinMaw')
        return { style: 'cross', color: '#ff6ea8', radius: 175 * phaseScale, width: 72 + phase * 14, opacity: .82 };
    return { style: 'time', color: '#5bc8ff', radius: 162 * phaseScale, width: 8 + phase * 2, opacity: .80 };
}
export function bossLifecycleCinematicProfile(archetype, event) {
    const death = event === 'death';
    return { motif: CINEMATIC_MOTIF[archetype], color: archetypeColor(archetype), shockwaveCount: death ? 4 : 2, rayCount: death ? 16 : 8, flashAlpha: death ? .34 : .20, duration: death ? .72 : .42, cameraKind: death ? 'bossDeath' : 'bossEnter' };
}
