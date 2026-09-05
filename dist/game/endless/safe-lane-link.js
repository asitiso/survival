import { clamp, distance } from '../../core/math.js';
import { finalFormAttackPattern } from './final-form-patterns.js';
import { finalFormMobilityProfile } from './final-form-mobility.js';
const ARM_RADIUS = 34;
const ARM_WINDOW_MS = 1500;
export function createSafeLaneLink() { return { armedUntilMs: 0, armedAtMs: 0 }; }
export function advanceSafeLaneLink(state, heroPos, hint, nowMs) {
    const now = Math.max(0, Number.isFinite(nowMs) ? nowMs : 0);
    const active = state.armedUntilMs >= now ? state : createSafeLaneLink();
    if (!hint || distance(heroPos, hint.target) > ARM_RADIUS)
        return active;
    return { armedAtMs: now, armedUntilMs: now + ARM_WINDOW_MS };
}
export function consumeSafeLanePerfectEvade(state, formId, nowMs) {
    const now = Math.max(0, Number.isFinite(nowMs) ? nowMs : 0);
    if (!formId || !finalFormAttackPattern(formId) || state.armedUntilMs < now)
        return { state: createSafeLaneLink(), reward: null };
    const family = finalFormMobilityProfile(formId).family;
    const reward = { label: 'SAFE LINK', flowStackBonus: 1, flowRetentionMs: 760, signatureChargeBonus: 1.6, moveSpeedMultiplier: 1.025, boostMs: 620 };
    if (family === 'surge') {
        reward.signatureChargeBonus = 2.6;
        reward.moveSpeedMultiplier = 1.04;
        reward.boostMs = 720;
    }
    else if (family === 'flow') {
        reward.flowStackBonus = 2;
        reward.flowRetentionMs = 980;
        reward.signatureChargeBonus = 1.5;
        reward.moveSpeedMultiplier = 1.03;
    }
    else if (family === 'drift') {
        reward.flowRetentionMs = 1040;
        reward.signatureChargeBonus = 1.8;
        reward.moveSpeedMultiplier = 1.045;
        reward.boostMs = 860;
    }
    else {
        reward.flowRetentionMs = 900;
        reward.signatureChargeBonus = 1.7;
        reward.moveSpeedMultiplier = 1.015;
        reward.boostMs = 760;
    }
    return { state: createSafeLaneLink(), reward: {
            ...reward,
            flowStackBonus: clamp(Math.floor(reward.flowStackBonus), 1, 2),
            flowRetentionMs: clamp(Math.round(reward.flowRetentionMs), 500, 1100),
            signatureChargeBonus: clamp(reward.signatureChargeBonus, 1, 3),
            moveSpeedMultiplier: clamp(reward.moveSpeedMultiplier, 1, 1.05),
            boostMs: clamp(Math.round(reward.boostMs), 400, 900),
        } };
}
