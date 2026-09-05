const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export function advanceBossSpecialOriginHandoffState(previous, event, dt, radius, reducedMotion = false) {
    const safeRadius = Math.max(1, Number.isFinite(radius) ? radius : 1);
    if (event) {
        const base = event.kind === 'summon' ? .8 : 1, cap = Math.min(20, Math.max(5, safeRadius * (reducedMotion ? .34 : .56))), offsetScale = reducedMotion ? .62 : 1;
        return { kind: event.kind, strength: base, offsetX: event.kind === 'teleport' ? clamp((Number.isFinite(event.offsetX) ? event.offsetX : 0) * offsetScale, -cap, cap) : 0, offsetY: event.kind === 'teleport' ? clamp((Number.isFinite(event.offsetY) ? event.offsetY : 0) * offsetScale, -cap * .72, cap * .72) : 0 };
    }
    if (!previous)
        return { kind: 'materialize', strength: 0, offsetX: 0, offsetY: 0 };
    const duration = previous.kind === 'materialize' ? (reducedMotion ? .28 : .44) : previous.kind === 'summon' ? (reducedMotion ? .2 : .3) : (reducedMotion ? .15 : .23), safeDt = clamp(Number.isFinite(dt) ? dt : 0, 0, .14), strength = Math.max(0, previous.strength - safeDt / duration);
    return { ...previous, strength };
}
export function bossSpecialOriginHandoffPresentation(state, reducedMotion = false) {
    const strength = clamp(state?.strength ?? 0, 0, 1), kind = state?.kind ?? 'materialize';
    let shadowAlphaScale = 1, locomotionScale = 1, contactPulseScale = 1;
    if (kind === 'materialize') {
        shadowAlphaScale = 1 - strength * .56;
        locomotionScale = 1 - strength * .82;
        contactPulseScale = 1 - strength * .82;
    }
    else if (kind === 'summon') {
        shadowAlphaScale = 1 - strength * .14;
        locomotionScale = 1 - strength * .45;
        contactPulseScale = 1 - strength * .82;
    }
    else {
        shadowAlphaScale = 1 - strength * .22;
        locomotionScale = 1 - strength * .68;
        contactPulseScale = 1 - strength * .9;
    }
    const motionScale = reducedMotion ? .74 : 1;
    return { groundOffsetX: (state?.offsetX ?? 0) * strength * motionScale, groundOffsetY: (state?.offsetY ?? 0) * strength * motionScale, shadowAlphaScale: clamp(shadowAlphaScale, .38, 1), locomotionScale: clamp(locomotionScale, .16, 1), contactPulseScale: clamp(contactPulseScale, .08, 1) };
}
