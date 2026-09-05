import { clamp } from '../../core/math.js';
export function shouldTriggerArenaDodgeFinisher(previousCount, nextCount) {
    const previous = clamp(Math.floor(Number.isFinite(previousCount) ? previousCount : 0), 0, 5);
    const next = clamp(Math.floor(Number.isFinite(nextCount) ? nextCount : 0), 0, 5);
    return previous < 5 && next === 5;
}
export function arenaDodgeFinisherProfile() {
    return {
        label: 'EVADE FINISH',
        radius: 178,
        damageMultiplier: .92,
        pushDistance: 34,
        slowFactor: .72,
        slowDuration: .78,
        signatureChargeBonus: 4.2,
    };
}
