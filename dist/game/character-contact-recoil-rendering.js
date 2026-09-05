const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export function characterGroundContactPresentation(radius, motionBlend, recoilIntensity, facingX, reducedMotion = false, weight = 1) {
    const safeRadius = Math.max(10, Number.isFinite(radius) ? radius : 20);
    const motion = clamp(motionBlend, 0, 1) * (reducedMotion ? 0.45 : 1);
    const recoil = clamp(recoilIntensity, 0, 1) * (reducedMotion ? 0.45 : 1);
    const safeWeight = clamp(weight, 0.5, 2);
    return {
        width: safeRadius * (0.92 + safeWeight * 0.18 + motion * 0.24),
        height: safeRadius * (0.36 + safeWeight * 0.08 + motion * 0.05),
        offsetX: facingX * (motion * 2.2 - recoil * 1.4),
        offsetY: safeRadius * 0.42 + motion * 1.4 + recoil * 0.8,
        alpha: clamp(0.2 + safeWeight * 0.055 + motion * 0.045, 0.22, 0.38),
    };
}
export function characterHitRecoilPresentation(intensity, facingX, facingY, weight = 1, reducedMotion = false) {
    const normalized = clamp(intensity, 0, 1.25) / 1.25;
    const safeWeight = clamp(weight, 0.5, 2);
    const maxDisplacement = clamp(7.5 / safeWeight, 2.6, 8);
    const motionScale = reducedMotion ? 0.4 : 1;
    const displacement = normalized * maxDisplacement * motionScale;
    const dirLength = Math.hypot(facingX, facingY) || 1;
    const nx = facingX / dirLength;
    const ny = facingY / dirLength;
    return {
        intensity: normalized,
        offsetX: -nx * displacement,
        offsetY: -ny * displacement - normalized * 1.2 * motionScale,
        rotation: -ny * normalized * 0.055 * motionScale / safeWeight,
        flashAlpha: clamp(normalized * 0.34, 0, reducedMotion ? 0.16 : 0.34),
        maxDisplacement,
    };
}
