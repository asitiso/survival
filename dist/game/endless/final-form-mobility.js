import { clampMagnitude, normalize } from '../../core/math.js';
const PROFILES = {
    'solar-sovereign': { formId: 'solar-sovereign', family: 'surge', moveSpeedMultiplier: 1.04, response: 13, signatureImpulse: 72 },
    'phoenix-lord': { formId: 'phoenix-lord', family: 'flow', moveSpeedMultiplier: 1.05, response: 15, signatureImpulse: 54 },
    'volcanic-archon': { formId: 'volcanic-archon', family: 'drift', moveSpeedMultiplier: 1.02, response: 7, signatureImpulse: 34 },
    'absolute-empress': { formId: 'absolute-empress', family: 'drift', moveSpeedMultiplier: 1.01, response: 6.5, signatureImpulse: 28 },
    'winter-warden': { formId: 'winter-warden', family: 'anchor', moveSpeedMultiplier: 1.00, response: 9, signatureImpulse: 18 },
    'crystal-oracle': { formId: 'crystal-oracle', family: 'flow', moveSpeedMultiplier: 1.04, response: 14, signatureImpulse: 46 },
    'thunder-tyrant': { formId: 'thunder-tyrant', family: 'surge', moveSpeedMultiplier: 1.05, response: 14, signatureImpulse: 78 },
    'tempest-runner': { formId: 'tempest-runner', family: 'flow', moveSpeedMultiplier: 1.08, response: 18, signatureImpulse: 64 },
    'storm-oracle': { formId: 'storm-oracle', family: 'drift', moveSpeedMultiplier: 1.03, response: 8, signatureImpulse: 38 },
    'radiant-king': { formId: 'radiant-king', family: 'surge', moveSpeedMultiplier: 1.03, response: 12, signatureImpulse: 58 },
    'oath-guardian': { formId: 'oath-guardian', family: 'anchor', moveSpeedMultiplier: .99, response: 10, signatureImpulse: 12 },
    'light-pilgrim': { formId: 'light-pilgrim', family: 'flow', moveSpeedMultiplier: 1.06, response: 16, signatureImpulse: 50 },
};
export function finalFormMobilityProfile(formId) { return PROFILES[formId]; }
export function advanceFinalFormMotion(current, desired, dt, formId) {
    const target = clampMagnitude(desired, 1);
    if (!formId)
        return target;
    const profile = PROFILES[formId];
    const safeDt = Math.max(0, Math.min(.1, Number.isFinite(dt) ? dt : 0));
    const alpha = 1 - Math.exp(-profile.response * safeDt);
    const next = { x: current.x + (target.x - current.x) * alpha, y: current.y + (target.y - current.y) * alpha };
    if (Math.hypot(target.x, target.y) < .001 && Math.hypot(next.x, next.y) < .015)
        return { x: 0, y: 0 };
    return clampMagnitude(next, 1);
}
export function signatureMobilityImpulse(formId, facing) {
    if (!formId)
        return { x: 0, y: 0 };
    const dir = normalize(facing);
    const distance = PROFILES[formId].signatureImpulse;
    return { x: dir.x * distance, y: dir.y * distance };
}
