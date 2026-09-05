import { clamp } from '../../core/math.js';
import { finalFormAttackPattern } from './final-form-patterns.js';
import { finalFormMobilityProfile } from './final-form-mobility.js';
const ACCENTS = {
    execution: '#fff09a',
    chain: '#82f4ff',
    control: '#b9a6ff',
    bulwark: '#9effc6',
};
function familyFor(formId) {
    if (formId === 'solar-sovereign' || formId === 'thunder-tyrant' || formId === 'radiant-king')
        return 'execution';
    if (formId === 'phoenix-lord' || formId === 'crystal-oracle' || formId === 'tempest-runner')
        return 'chain';
    if (formId === 'volcanic-archon' || formId === 'absolute-empress' || formId === 'storm-oracle')
        return 'control';
    return 'bulwark';
}
export function finalFormEvadeFinisher(formId, base) {
    if (!formId)
        return { ...base, family: 'base', accent: '#b8fff1', chainTargets: 0, coreHealPercent: 0 };
    const family = familyFor(formId);
    const pattern = finalFormAttackPattern(formId);
    const mobility = finalFormMobilityProfile(formId);
    let radius = base.radius, damage = base.damageMultiplier, push = base.pushDistance, slowFactor = base.slowFactor, slowDuration = base.slowDuration, signature = base.signatureChargeBonus, chainTargets = 0, coreHealPercent = 0;
    if (family === 'execution') {
        radius *= 1.04;
        damage *= 1.28;
        push *= 1.12;
        signature += .6;
    }
    else if (family === 'chain') {
        radius *= .98;
        damage *= 1.03;
        push *= .82;
        chainTargets = Math.max(4, Math.min(8, Math.round((pattern?.chainTargets ?? 5) * .65)));
        signature += .35;
    }
    else if (family === 'control') {
        radius *= 1.16;
        damage *= .9;
        push *= 1.06;
        slowFactor = Math.min(slowFactor, .58);
        slowDuration = Math.max(slowDuration, 1.35) + (pattern?.slowDuration ?? 0) * .18;
        signature += .25;
    }
    else {
        radius *= 1.08;
        damage *= .8;
        push *= 1.9;
        slowFactor = Math.min(slowFactor, .7);
        slowDuration = Math.max(slowDuration, 1.0);
        coreHealPercent = .008 + (mobility.family === 'anchor' ? .007 : .003);
        signature += .15;
    }
    return {
        label: 'EVADE FINISH',
        family,
        accent: ACCENTS[family],
        radius: clamp(Math.round(radius), 145, 230),
        damageMultiplier: clamp(damage, .7, 1.24),
        pushDistance: clamp(Math.round(push), 18, 82),
        slowFactor: clamp(slowFactor, .42, 1),
        slowDuration: clamp(slowDuration, .5, 2.2),
        signatureChargeBonus: clamp(signature, 2.5, 5.2),
        chainTargets: clamp(Math.floor(chainTargets), 0, 8),
        coreHealPercent: clamp(coreHealPercent, 0, .018),
    };
}
