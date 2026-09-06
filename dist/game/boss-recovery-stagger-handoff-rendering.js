const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, Number.isFinite(v) ? v : 0));
export function bossRecoveryStaggerHandoffPresentation(input, reducedMotion = false) {
    const recovery = clamp(input.recovery), stagger = clamp(input.stagger), telegraphProtected = Number.isFinite(input.specialTimer) && input.specialTimer >= 0 && input.specialTimer <= 1.2;
    if (telegraphProtected)
        return { owner: 'telegraph', telegraphProtected: true, recoveryScale: .12, staggerScale: .72, silhouetteAlphaScale: .72, silhouetteReentryScale: .68, yieldStrength: 0, presentationOnly: true };
    if (recovery >= .62) {
        const critical = input.tier === 'critical';
        return { owner: 'recovery', telegraphProtected: false, recoveryScale: 1, staggerScale: critical ? .46 : .38, silhouetteAlphaScale: 1, silhouetteReentryScale: 1, yieldStrength: 0, presentationOnly: true };
    }
    const threshold = input.tier === 'critical' ? .5 : input.tier === 'heavy' ? .58 : .72, hitPressure = clamp((stagger - threshold) / Math.max(.001, 1 - threshold)), lateWindow = clamp((.62 - recovery) / .42), yieldStrength = clamp(hitPressure * lateWindow * (input.tier === 'critical' ? 1.14 : 1));
    if (yieldStrength > .2) {
        return { owner: 'stagger', telegraphProtected: false, recoveryScale: clamp(1 - yieldStrength * (reducedMotion ? .68 : .86), .16, 1), staggerScale: clamp(.82 + yieldStrength * .18, .82, 1), silhouetteAlphaScale: clamp(1 - yieldStrength * (reducedMotion ? .3 : .44), .48, 1), silhouetteReentryScale: clamp(1 - yieldStrength * (reducedMotion ? .4 : .6), .36, 1), yieldStrength, presentationOnly: true };
    }
    if (recovery > .08) {
        const critical = input.tier === 'critical';
        return { owner: 'recovery', telegraphProtected: false, recoveryScale: critical ? .86 : .92, staggerScale: critical ? .56 : .46, silhouetteAlphaScale: 1, silhouetteReentryScale: clamp(1 - yieldStrength * (reducedMotion ? .3 : .5), .65, 1), yieldStrength, presentationOnly: true };
    }
    if (stagger > .06)
        return { owner: 'stagger', telegraphProtected: false, recoveryScale: 0, staggerScale: 1, silhouetteAlphaScale: .72, silhouetteReentryScale: reducedMotion ? .68 : .5, yieldStrength: 1, presentationOnly: true };
    return { owner: 'neutral', telegraphProtected: false, recoveryScale: 0, staggerScale: 1, silhouetteAlphaScale: 1, silhouetteReentryScale: 1, yieldStrength: 0, presentationOnly: true };
}
