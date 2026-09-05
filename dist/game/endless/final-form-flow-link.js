import { clamp } from '../../core/math.js';
import { finalFormAttackPattern } from './final-form-patterns.js';
import { finalFormMobilityProfile } from './final-form-mobility.js';
export function finalFormFlowLink(formId, streak) {
    if (Math.floor(Number.isFinite(streak) ? streak : 0) < 5 || !finalFormAttackPattern(formId))
        return null;
    const family = finalFormMobilityProfile(formId).family;
    const out = { label: 'FLOW LINK', damageMultiplier: 1.08, radiusMultiplier: 1.06, pushMultiplier: 1.06, chainBonus: 1, slowDurationBonus: .12 };
    if (family === 'surge') {
        out.damageMultiplier = 1.2;
        out.radiusMultiplier = 1.08;
        out.pushMultiplier = 1.1;
        out.chainBonus = 1;
        out.slowDurationBonus = .08;
    }
    else if (family === 'flow') {
        out.damageMultiplier = 1.12;
        out.radiusMultiplier = 1.08;
        out.pushMultiplier = 1.08;
        out.chainBonus = 3;
        out.slowDurationBonus = .12;
    }
    else if (family === 'drift') {
        out.damageMultiplier = 1.1;
        out.radiusMultiplier = 1.16;
        out.pushMultiplier = 1.08;
        out.chainBonus = 2;
        out.slowDurationBonus = .35;
    }
    else {
        out.damageMultiplier = 1.08;
        out.radiusMultiplier = 1.1;
        out.pushMultiplier = 1.22;
        out.chainBonus = 1;
        out.slowDurationBonus = .25;
    }
    return {
        label: 'FLOW LINK',
        damageMultiplier: clamp(out.damageMultiplier, 1, 1.22),
        radiusMultiplier: clamp(out.radiusMultiplier, 1, 1.18),
        pushMultiplier: clamp(out.pushMultiplier, 1, 1.25),
        chainBonus: clamp(Math.floor(out.chainBonus), 0, 4),
        slowDurationBonus: clamp(out.slowDurationBonus, 0, .4),
    };
}
