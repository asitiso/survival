import { clamp } from '../../core/math.js';
export function lastLawSafeTimeline(safe, isMythic, hpRatio, identity) {
    const hp = clamp(Number.isFinite(hpRatio) ? hpRatio : 1, 0, 1);
    const active = Boolean(isMythic && identity?.active);
    const warning = Boolean(isMythic && !active && hp <= .22);
    const lawStage = active ? 'active' : warning ? 'warning' : 'none';
    const lawUrgency = active ? 1 : warning ? clamp((.22 - hp) / .07, .15, .92) : 0;
    const urgency = clamp(Math.max(safe.urgency, lawUrgency), 0, 1);
    const stage = active ? 'critical' : warning && urgency >= .7 ? 'move' : safe.stage;
    const label = active ? (identity?.label ?? 'MYTHIC LAST LAW') : warning ? 'LAST LAW · PREPARE' : safe.label;
    const accent = active ? (identity?.accent ?? '#ff6f7f') : warning ? '#ffd36f' : '#8fffd3';
    return { ...safe, label, stage, urgency, lawStage, lawHpRatio: hp, lawUrgency, accent, autoMove: false };
}
