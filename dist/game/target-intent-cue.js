import { AUTO_WEAKPOINT_AIM_BLEND } from './auto-combat-brain.js';
import { MANUAL_WEAKPOINT_AIM_BLEND } from './manual-weakpoint-assist.js';
const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
export function targetIntentCuePresentation(input) {
    const targetId = input.committedTargetId;
    const visible = targetId !== null && input.targetAlive;
    const stress = clamp01(input.battlefieldStress ?? 0);
    const protectedOwner = Boolean(input.protectedWarning || input.safeLaneVisible);
    const baseAlpha = input.mode === 'manual' ? 0.36 : 0.30;
    const densityScale = 1 - stress * 0.46;
    const ownerScale = protectedOwner ? 0.46 : 1;
    const flashScale = input.reducedFlash ? 0.72 : 1;
    const alpha = visible ? baseAlpha * densityScale * ownerScale * flashScale : 0;
    const lineWidth = visible ? Math.max(1.15, (input.mode === 'manual' ? 1.9 : 1.7) * (1 - stress * 0.22)) : 0;
    const radius = visible ? Math.max(12, Math.max(0, input.targetRadius) + 9 + stress * 2) : 0;
    const weakpointBlend = input.mode === 'auto' ? AUTO_WEAKPOINT_AIM_BLEND : MANUAL_WEAKPOINT_AIM_BLEND;
    const weakpointAvailable = visible && Boolean(input.weakpointAvailable);
    return {
        visible,
        targetId: visible ? targetId : null,
        mode: input.mode,
        alpha,
        lineWidth,
        radius,
        segmentArc: input.mode === 'manual' ? 0.62 : 0.48,
        pulseAmplitude: input.reducedMotion ? 0 : Math.max(0.8, 2.2 * (1 - stress * 0.55)),
        weakpointBlend,
        showWeakpointDirection: weakpointAvailable,
        weakpointAlpha: weakpointAvailable ? alpha * (input.reducedFlash ? 0.72 : 0.88) : 0,
    };
}
