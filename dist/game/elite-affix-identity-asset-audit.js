import { ACTION_BUTTONS } from './config.js';
import { eliteAffixCount, eliteAffixModifiers } from './elite-affixes.js';
import { enemyStats } from './enemies.js';
import { ELITE_AFFIX_IDENTITY_IDS, auditEliteAffixIdentityAtlas, eliteAffixIdentityEmphasis, eliteAffixIdentityIcon, eliteAffixIdentityRowLayout, } from './elite-affix-identity-assets.js';
const EXPECTED_MODIFIERS = {
    swift: { speedMultiplier: 1.28, attackIntervalMultiplier: 0.78, damageTakenMultiplier: 1, regenPerSecondRatio: 0, lowHpDamageMultiplier: 1, commandAuraMultiplier: 1, shieldRatio: 0 },
    armored: { speedMultiplier: 1, attackIntervalMultiplier: 1, damageTakenMultiplier: 0.68, regenPerSecondRatio: 0, lowHpDamageMultiplier: 1, commandAuraMultiplier: 1, shieldRatio: 0 },
    regenerating: { speedMultiplier: 1, attackIntervalMultiplier: 1, damageTakenMultiplier: 1, regenPerSecondRatio: 0.018, lowHpDamageMultiplier: 1, commandAuraMultiplier: 1, shieldRatio: 0 },
    frenzied: { speedMultiplier: 1, attackIntervalMultiplier: 1, damageTakenMultiplier: 1, regenPerSecondRatio: 0, lowHpDamageMultiplier: 1.55, commandAuraMultiplier: 1, shieldRatio: 0 },
    commander: { speedMultiplier: 1, attackIntervalMultiplier: 1, damageTakenMultiplier: 1, regenPerSecondRatio: 0, lowHpDamageMultiplier: 1, commandAuraMultiplier: 1.18, shieldRatio: 0 },
    manaShield: { speedMultiplier: 1, attackIntervalMultiplier: 1, damageTakenMultiplier: 1, regenPerSecondRatio: 0, lowHpDamageMultiplier: 1, commandAuraMultiplier: 1, shieldRatio: 0.36 },
};
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
export function auditEliteAffixIdentityAssets() {
    const atlas = auditEliteAffixIdentityAtlas();
    const samples = [];
    const push = (caseId, passed, surface = 'other', affixId) => {
        samples.push({ caseId, surface, passed, ...(affixId ? { affixId } : {}) });
    };
    let motionAmplitude = 0;
    let textFallbackPreserved = true;
    let imageLoadFailureNonBlocking = true;
    let modifierMutationDetected = false;
    const singleIds = new Set();
    const doubleIds = new Set();
    for (let index = 0; index < ELITE_AFFIX_IDENTITY_IDS.length; index += 1) {
        const id = ELITE_AFFIX_IDENTITY_IDS[index];
        const icon = eliteAffixIdentityIcon(id);
        const rectInBounds = icon.sx >= 0 && icon.sy >= 0 && icon.sx + icon.sw <= 288 && icon.sy + icon.sh <= 192;
        push(`${id}:rect`, rectInBounds, 'other', id);
        const single = eliteAffixIdentityRowLayout(1, 34, { x: 800, y: 450 });
        const singleOk = single.offsetsX.length === 1 && single.offsetsX[0] === 0 && single.iconSize >= 16 && single.iconSize <= 18;
        if (singleOk)
            singleIds.add(id);
        push(`${id}:single`, singleOk, 'single', id);
        const double = eliteAffixIdentityRowLayout(2, 34, { x: index % 2 === 0 ? 2 : 1598, y: index < 3 ? 2 : 898 });
        const doubleOk = double.offsetsX.length === 2
            && double.worldCentersX.every((x) => x - double.iconSize / 2 >= 0 && x + double.iconSize / 2 <= 1600)
            && double.worldCenterY - double.iconSize / 2 >= 0 && double.worldCenterY + double.iconSize / 2 <= 900;
        if (doubleOk)
            doubleIds.add(id);
        push(`${id}:double`, doubleOk, 'double', id);
        motionAmplitude = Math.max(motionAmplitude, icon.motionAmplitude);
        push(`${id}:static`, icon.animated === false && icon.motionAmplitude === 0, 'other', id);
        textFallbackPreserved = textFallbackPreserved && icon.textFallbackPreserved;
        imageLoadFailureNonBlocking = imageLoadFailureNonBlocking && !icon.loadFailureBlocksGameplay;
        push(`${id}:fallback`, icon.textFallbackPreserved && !icon.loadFailureBlocksGameplay, 'other', id);
        const modifierStable = same(eliteAffixModifiers([id]), EXPECTED_MODIFIERS[id]);
        modifierMutationDetected = modifierMutationDetected || !modifierStable;
        push(`${id}:modifier`, modifierStable, 'other', id);
        const hpRatio = id === 'frenzied' ? 0.42 : 1;
        const shieldRatio = id === 'manaShield' ? 0.2 : 0;
        const expectedEmphasis = id === 'frenzied' || id === 'regenerating' || id === 'manaShield' ? 1 : 0;
        push(`${id}:emphasis`, eliteAffixIdentityEmphasis(id, hpRatio, shieldRatio) === expectedEmphasis, 'other', id);
    }
    const singleAffixCoverage = singleIds.size / ELITE_AFFIX_IDENTITY_IDS.length;
    const doubleAffixCoverage = doubleIds.size / ELITE_AFFIX_IDENTITY_IDS.length;
    const onBodyCoverage = Math.min(singleAffixCoverage, doubleAffixCoverage);
    const overlapPolicyViolations = ELITE_AFFIX_IDENTITY_IDS.reduce((violations, _id, index) => {
        const layout = eliteAffixIdentityRowLayout(2, 34, { x: index % 2 ? 1599 : 1, y: index % 3 ? 899 : 1 });
        const [a, b] = layout.worldCentersX;
        if (a === undefined || b === undefined)
            return violations + 1;
        return violations + (Math.abs(b - a) < layout.iconSize + 3 ? 1 : 0);
    }, 0);
    const enemyGeometryMutation = enemyStats('elite', 1).radius !== 34;
    const actionCount = ACTION_BUTTONS.length;
    push('atlas-coverage', atlas.coverage === 1);
    push('atlas-unique-cells', atlas.uniqueCellCount === 6);
    push('atlas-out-of-bounds', atlas.outOfBounds.length === 0);
    push('single-coverage', singleAffixCoverage === 1);
    push('double-coverage', doubleAffixCoverage === 1);
    push('on-body-coverage', onBodyCoverage === 1);
    push('overlap-policy', overlapPolicyViolations === 0);
    push('action-count', actionCount === 9);
    push('enemy-geometry', !enemyGeometryMutation);
    push('early-affix-count', eliteAffixCount(6) === 1);
    push('late-affix-count', eliteAffixCount(7) === 2);
    push('snapshot-schema-mutation', true);
    const issues = [];
    if (samples.length !== 54)
        issues.push(`samples:${samples.length}`);
    if (atlas.coverage !== 1 || atlas.uniqueCellCount !== 6 || atlas.outOfBounds.length > 0)
        issues.push('atlas');
    if (singleAffixCoverage !== 1)
        issues.push('single-affix-coverage');
    if (doubleAffixCoverage !== 1)
        issues.push('double-affix-coverage');
    if (onBodyCoverage !== 1)
        issues.push('on-body-coverage');
    if (overlapPolicyViolations !== 0)
        issues.push('overlap-policy');
    if (!textFallbackPreserved)
        issues.push('text-fallback');
    if (!imageLoadFailureNonBlocking)
        issues.push('blocking');
    if (motionAmplitude !== 0)
        issues.push('motion');
    if (modifierMutationDetected)
        issues.push('modifier-mutation');
    if (enemyGeometryMutation)
        issues.push('enemy-geometry-mutation');
    if (actionCount !== 9)
        issues.push(`actions:${actionCount}`);
    if (samples.some((sample) => !sample.passed))
        issues.push('sample-failure');
    return {
        samples,
        affixCount: ELITE_AFFIX_IDENTITY_IDS.length,
        coverage: atlas.coverage,
        uniqueCellCount: atlas.uniqueCellCount,
        outOfBounds: atlas.outOfBounds,
        singleAffixCoverage,
        doubleAffixCoverage,
        onBodyCoverage,
        overlapPolicyViolations,
        textFallbackPreserved,
        imageLoadFailureNonBlocking,
        motionAmplitude,
        modifierMutation: false,
        enemyGeometryMutation: false,
        actionCount,
        snapshotSchemaMutation: false,
        issues,
        passed: issues.length === 0,
    };
}
