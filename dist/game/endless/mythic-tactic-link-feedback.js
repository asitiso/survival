import { clamp } from '../../core/math.js';
const P = {
    inferno: { label: 'EMBER INTERCEPTED', accent: '#ff9a62', secondaryAccent: '#ffd36f', soundKind: 'finisherExecution', ringCount: 2, particleCount: 10, trailCount: 2, ttl: .28, radius: 104 },
    summoner: { label: 'BROOD SEVERED', accent: '#7ff0ac', secondaryAccent: '#c8ffd8', soundKind: 'meter', ringCount: 1, particleCount: 9, trailCount: 4, ttl: .34, radius: 118 },
    juggernaut: { label: 'IRON LINE BROKEN', accent: '#ffd36f', secondaryAccent: '#fff0ae', soundKind: 'finisherBulwark', ringCount: 2, particleCount: 8, trailCount: 2, ttl: .31, radius: 96 },
    abyssWitch: { label: 'VOID DISRUPTED', accent: '#d18cff', secondaryAccent: '#9ed7ff', soundKind: 'finisherControl', ringCount: 2, particleCount: 12, trailCount: 3, ttl: .42, radius: 124 },
    twinMaw: { label: 'TWIN PATTERN BROKEN', accent: '#ff7fb4', secondaryAccent: '#8ce7ff', soundKind: 'finisherChain', ringCount: 1, particleCount: 12, trailCount: 4, ttl: .30, radius: 112 },
    timeEater: { label: 'TIME PRESSURE RELEASED', accent: '#76d8ff', secondaryAccent: '#fff48d', soundKind: 'flowImpact', ringCount: 2, particleCount: 7, trailCount: 3, ttl: .46, radius: 128 },
};
export function mythicTacticLinkFeedback(archetype) {
    const p = P[archetype];
    return {
        archetype, label: p.label, accent: p.accent, secondaryAccent: p.secondaryAccent, soundKind: p.soundKind,
        ringCount: Math.round(clamp(p.ringCount, 1, 2)), particleCount: Math.round(clamp(p.particleCount, 5, 12)), trailCount: Math.round(clamp(p.trailCount, 0, 4)),
        ttl: clamp(p.ttl, .18, .48), radius: clamp(p.radius, 72, 132),
    };
}
