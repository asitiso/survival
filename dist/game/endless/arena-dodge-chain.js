import { clamp } from '../../core/math.js';
const CHAIN_WINDOW_MS = 3200;
export function createArenaDodgeChain() { return { count: 0, lastEvadeAtMs: 0, expiresAtMs: 0 }; }
export function recordArenaDodgeChain(state, nowMs) {
    const now = Math.max(0, Number.isFinite(nowMs) ? nowMs : 0);
    const continues = state.count > 0 && now <= state.expiresAtMs;
    const count = clamp((continues ? state.count : 0) + 1, 1, 5);
    return { count, lastEvadeAtMs: now, expiresAtMs: now + CHAIN_WINDOW_MS };
}
export function breakArenaDodgeChain(_state) { return createArenaDodgeChain(); }
export function arenaDodgeChainReward(count) {
    const c = clamp(Math.floor(Number.isFinite(count) ? count : 0), 1, 5);
    return {
        flowRetentionBonusMs: Math.round(clamp(120 + (c - 1) * 170, 120, 900)),
        signatureChargeBonus: clamp(.35 + (c - 1) * .42, .35, 2.1),
        moveSpeedBonusMultiplier: clamp(1.005 + (c - 1) * .008, 1.005, 1.04),
        boostBonusMs: Math.round(clamp(80 + (c - 1) * 95, 80, 480)),
    };
}
