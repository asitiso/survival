const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const DURATION = { inferno: .46, summoner: .58, juggernaut: .62, abyssWitch: .6, twinMaw: .5, timeEater: .54 };
export function advanceBossSpecialRecoveryState(previous, triggered, dt, archetype) { if (triggered)
    return { recovery: 1 }; const prev = previous ?? { recovery: 0 }; const safeDt = clamp(Number.isFinite(dt) ? dt : 0, 0, .1); return { recovery: Math.max(0, prev.recovery - safeDt / DURATION[archetype]) }; }
export function bossSpecialRecoveryPresentation(archetype, phase, state, facingX, facingY, reducedMotion = false) { const recovery = clamp(state?.recovery ?? 0, 0, 1); const len = Math.hypot(facingX, facingY) || 1, fx = facingX / len, fy = facingY / len; const settle = clamp(1 - Math.abs(recovery - .48) / .48, 0, 1); const phaseWeight = phase === 3 ? 1.14 : phase === 2 ? 1.07 : 1; const motionScale = reducedMotion ? .38 : 1; let stance = 'rebound', forward = 0, down = 0, rotation = 0, scaleX = 1, scaleY = 1, shadowBoost = 0; if (recovery > 0) {
    if (archetype === 'inferno') {
        stance = 'rebound';
        forward = -3.8 * recovery * phaseWeight;
        down = settle * .8;
        rotation = (fy - fx * .1) * -.035 * recovery;
        scaleX = 1 - recovery * .04;
        scaleY = 1 + settle * .025;
        shadowBoost = recovery * .12;
    }
    else if (archetype === 'summoner') {
        stance = 'descend';
        down = 4.4 * recovery * phaseWeight;
        rotation = (fx * .06 - fy * .04) * -.03 * recovery;
        scaleX = 1 - recovery * .015;
        scaleY = 1 - recovery * .035;
        shadowBoost = settle * .08;
    }
    else if (archetype === 'juggernaut') {
        stance = 'followThrough';
        forward = 5.1 * recovery * phaseWeight;
        down = 1.5 * settle;
        rotation = (fy - fx * .12) * .045 * recovery;
        scaleX = 1 + recovery * .055;
        scaleY = 1 - recovery * .05;
        shadowBoost = recovery * .16;
    }
    else if (archetype === 'abyssWitch') {
        stance = 'uncoil';
        down = 5 * recovery * phaseWeight;
        rotation = (fx * .05 + fy * .07) * -.04 * recovery;
        scaleX = 1 + recovery * .015;
        scaleY = 1 - recovery * .045;
        shadowBoost = settle * .06;
    }
    else if (archetype === 'twinMaw') {
        stance = 'counterYaw';
        forward = -.8 * recovery;
        rotation = -.09 * recovery * phaseWeight;
        scaleX = 1 - recovery * .035;
        scaleY = 1 + recovery * .02;
        shadowBoost = recovery * .09;
    }
    else {
        stance = 'release';
        down = -.5 * settle;
        rotation = (fy - fx * .1) * -.018 * recovery;
        scaleX = 1 + recovery * .05;
        scaleY = 1 - recovery * .018;
        shadowBoost = settle * .08;
    }
} const offsetX = (fx * forward - fy * down * .06) * motionScale, offsetY = (fy * forward + down) * motionScale; return { archetype, phase, stance, recovery, settle, offsetX, offsetY, rotation: rotation * motionScale, scaleX: 1 + (scaleX - 1) * motionScale, scaleY: 1 + (scaleY - 1) * motionScale, shadowBoost }; }
