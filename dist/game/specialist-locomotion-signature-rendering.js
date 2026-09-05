const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export function advanceSpecialistLocomotionSignatureState(previous, type, event, dt) {
    const prev = previous ?? { arrival: 0, brace: 0, plant: 0 };
    const safeDt = clamp(Number.isFinite(dt) ? dt : 0, 0, .1);
    let arrival = Math.max(0, prev.arrival - safeDt * (type === 'assassin' ? 4.8 : 4));
    let brace = Math.max(0, prev.brace - safeDt * (type === 'shieldbearer' ? 2.8 : 3.8));
    let plant = Math.max(0, prev.plant - safeDt * (type === 'siegeGolem' ? 2.1 : 3.5));
    if (event === 'blink' && type === 'assassin')
        arrival = 1;
    if (event === 'brace' && type === 'shieldbearer')
        brace = 1;
    if (event === 'plant' && type === 'siegeGolem')
        plant = 1;
    return { arrival, brace, plant };
}
export function specialistLocomotionSignaturePresentation(type, state, motionBlend, recovery, facingX, facingY, reducedMotion = false) {
    const s = state ?? { arrival: 0, brace: 0, plant: 0 };
    const arrival = clamp(s.arrival, 0, 1), brace = clamp(s.brace, 0, 1), plant = clamp(s.plant, 0, 1);
    const len = Math.hypot(facingX, facingY) || 1, fx = facingX / len, fy = facingY / len;
    const motion = clamp(motionBlend, 0, 1), recover = clamp(recovery, 0, 1);
    const motionScale = reducedMotion ? .38 : 1;
    let offsetX = 0, offsetY = 0, rotation = 0, scaleX = 1, scaleY = 1, groundPulseAlpha = 0, groundPulseRadius = 0;
    if (type === 'assassin') {
        const catchUp = arrival * (.75 + .25 * motion);
        offsetX = -fx * 5.6 * catchUp * motionScale;
        offsetY = -fy * 4.2 * catchUp * motionScale - arrival * .8 * motionScale;
        rotation = (fy - fx * .18) * arrival * .07 * motionScale;
        scaleX = 1 - arrival * .08 * motionScale;
        scaleY = 1 + arrival * .10 * motionScale;
    }
    else if (type === 'shieldbearer') {
        const settle = brace * (.82 + .18 * recover);
        offsetX = -fx * 1.8 * settle * motionScale;
        offsetY = -fy * .7 * settle * motionScale + brace * 1.05 * motionScale;
        rotation = -fy * brace * .028 * motionScale;
        scaleX = 1 + brace * .07 * motionScale;
        scaleY = 1 - brace * .05 * motionScale;
        groundPulseAlpha = Math.min(.2, brace * .095);
        groundPulseRadius = 30 + brace * 8;
    }
    else if (type === 'siegeGolem') {
        const settle = plant * (.84 + .16 * recover);
        offsetX = -fx * .9 * settle * motionScale;
        offsetY = plant * (3.2 + recover * .9) * motionScale;
        rotation = (fx * .08 - fy * .12) * plant * .025 * motionScale;
        scaleX = 1 + plant * .045 * motionScale;
        scaleY = 1 - plant * .055 * motionScale;
        groundPulseAlpha = Math.min(.2, plant * (.09 + plant * .08));
        groundPulseRadius = 38 + plant * 15;
    }
    return { kind: type, arrival, brace, plant, offsetX, offsetY, rotation, scaleX, scaleY, groundPulseAlpha, groundPulseRadius };
}
