import { ACTION_BUTTONS } from '../config.js';
import { mythicBossProfile } from './mythic-boss.js';
import { mythicLastLawIdentityProfile } from './mythic-last-law-identity.js';
import { lastLawSafeZoneLifecycle } from './last-law-safe-zone-lifecycle.js';
import { MYTHIC_LAST_LAW_IDENTITY_IDS, auditMythicLastLawIdentityAtlas, mythicLastLawIdentityIcon } from './mythic-last-law-identity-assets.js';
const ARCHETYPE_BY_ID = {
    'solar-rupture': 'inferno', 'brood-crown': 'summoner', 'iron-verdict': 'juggernaut', 'null-eclipse': 'abyssWitch', 'twin-cataclysm': 'twinMaw', 'broken-hour': 'timeEater',
};
const EXPECTED = {
    'solar-rupture': { label: 'LAST LAW · SOLAR RUPTURE', boss: .8858, cadence: .6762, summon: 1.1424, dash: 1.1616, projectile: 1.4148, reward: 1.12 },
    'brood-crown': { label: 'LAST LAW · BROOD CROWN', boss: .8686, cadence: .6693, summon: 1.3328, dash: 1.1132, projectile: 1.2838, reward: 1.12 },
    'iron-verdict': { label: 'LAST LAW · IRON VERDICT', boss: .8428, cadence: .69, summon: 1.071, dash: 1.3794, projectile: 1.179, reward: 1.12 },
    'null-eclipse': { label: 'LAST LAW · NULL ECLIPSE', boss: .8514, cadence: .6279, summon: 1.19, dash: 1.1374, projectile: 1.3886, reward: 1.12 },
    'twin-cataclysm': { label: 'LAST LAW · TWIN CATACLYSM', boss: .86, cadence: .6555, summon: 1.1305, dash: 1.2826, projectile: 1.3886, reward: 1.12 },
    'broken-hour': { label: 'LAST LAW · BROKEN HOUR', boss: .8772, cadence: .62, summon: 1.0472, dash: 1.1858, projectile: 1.3493, reward: 1.12 },
};
function near(a, b) { return Math.abs(a - b) <= 1e-9; }
export function auditMythicLastLawIdentityAssets() {
    const atlas = auditMythicLastLawIdentityAtlas();
    const samples = [];
    const push = (caseId, passed, id) => { samples.push({ caseId, passed, ...(id ? { id } : {}) }); };
    const toastSet = new Set(), safeLaneSet = new Set(), fallbackSet = new Set();
    let textFallbackPreserved = true, imageLoadFailureNonBlocking = true, iconMotionAmplitude = 0, activationThresholdMutation = false, modifierMutation = false;
    const mythic = mythicBossProfile(7200, 5, 3);
    for (const id of MYTHIC_LAST_LAW_IDENTITY_IDS) {
        const icon = mythicLastLawIdentityIcon(id);
        const archetype = ARCHETYPE_BY_ID[id];
        const expected = EXPECTED[id];
        const bodyOk = icon.sx >= 0 && icon.sy >= 0 && icon.sx + icon.sw <= 288 && icon.sy + icon.sh <= 192;
        push(`${id}:body`, bodyOk, id);
        const fallbackOk = icon.textFallbackPreserved;
        if (fallbackOk)
            fallbackSet.add(id);
        push(`${id}:fallback`, fallbackOk, id);
        push(`${id}:non-blocking`, !icon.loadFailureBlocksGameplay, id);
        push(`${id}:static`, icon.animated === false && icon.motionAmplitude === 0, id);
        push(`${id}:kind`, icon.id === id, id);
        push(`${id}:cell-size`, icon.sw === 96 && icon.sh === 96, id);
        const toastOk = icon.toastIdentitySupported;
        if (toastOk)
            toastSet.add(id);
        push(`${id}:toast`, toastOk, id);
        const safeLaneOk = icon.safeLaneIdentitySupported;
        if (safeLaneOk)
            safeLaneSet.add(id);
        push(`${id}:safe-lane`, safeLaneOk, id);
        const before = mythicLastLawIdentityProfile(mythic, archetype, .151, 1);
        const threshold = mythicLastLawIdentityProfile(mythic, archetype, .15, 1);
        const activationOk = !before.active && before.lawId === 'none' && threshold.active && threshold.lawId === id;
        activationThresholdMutation = activationThresholdMutation || !activationOk;
        push(`${id}:activation`, activationOk, id);
        const intact = mythicLastLawIdentityProfile(mythic, archetype, .1, 1);
        const cleared = mythicLastLawIdentityProfile(mythic, archetype, .1, 0);
        const modifierOk = intact.label === expected.label && near(intact.bossDamageTakenMultiplier, expected.boss) && near(intact.specialCadenceMultiplier, expected.cadence) && near(intact.summonCountMultiplier, expected.summon) && near(intact.dashDistanceMultiplier, expected.dash) && near(intact.projectileDensityMultiplier, expected.projectile) && near(intact.rewardMultiplier, expected.reward) && cleared.bossDamageTakenMultiplier >= intact.bossDamageTakenMultiplier && cleared.specialCadenceMultiplier >= intact.specialCadenceMultiplier && cleared.summonCountMultiplier <= intact.summonCountMultiplier && cleared.dashDistanceMultiplier <= intact.dashDistanceMultiplier && cleared.projectileDensityMultiplier <= intact.projectileDensityMultiplier && cleared.rewardMultiplier >= intact.rewardMultiplier;
        modifierMutation = modifierMutation || !modifierOk;
        push(`${id}:modifiers`, modifierOk, id);
        textFallbackPreserved = textFallbackPreserved && icon.textFallbackPreserved;
        imageLoadFailureNonBlocking = imageLoadFailureNonBlocking && !icon.loadFailureBlocksGameplay;
        iconMotionAmplitude = Math.max(iconMotionAmplitude, icon.motionAmplitude);
    }
    const inactiveLifecycle = lastLawSafeZoneLifecycle(false, .4);
    const activeLifecycle = lastLawSafeZoneLifecycle(true, 0);
    const clearedLifecycle = lastLawSafeZoneLifecycle(true, 1);
    const safeZoneLifecycleMutation = !(inactiveLifecycle.active === false && inactiveLifecycle.cycleMs === 9000 && inactiveLifecycle.stableEndMs === 4800 && inactiveLifecycle.collapseEndMs === 6200 && inactiveLifecycle.collapsedEndMs === 7800 && inactiveLifecycle.reformEndMs === 9000 && inactiveLifecycle.radiusMultiplier === 1 && activeLifecycle.cycleMs === 7600 && activeLifecycle.stableEndMs === 3300 && activeLifecycle.collapseEndMs === 4450 && activeLifecycle.collapsedEndMs === 6100 && activeLifecycle.reformEndMs === 7600 && near(activeLifecycle.radiusMultiplier, .9) && clearedLifecycle.cycleMs === 8400 && clearedLifecycle.stableEndMs === 3800 && clearedLifecycle.collapseEndMs === 5050 && clearedLifecycle.collapsedEndMs === 6350 && clearedLifecycle.reformEndMs === 8400 && near(clearedLifecycle.radiusMultiplier, 1.06));
    const toastCoverage = toastSet.size / 6, safeLaneCoverage = safeLaneSet.size / 6, fallbackCoverage = fallbackSet.size / 6, actionCount = ACTION_BUTTONS.length;
    const issues = [];
    if (samples.length !== 60)
        issues.push(`samples:${samples.length}`);
    if (atlas.coverage !== 1 || atlas.uniqueCellCount !== 6 || atlas.outOfBounds.length)
        issues.push('atlas');
    if (toastCoverage !== 1)
        issues.push('toast-coverage');
    if (safeLaneCoverage !== 1)
        issues.push('safe-lane-coverage');
    if (fallbackCoverage !== 1)
        issues.push('fallback-coverage');
    if (!textFallbackPreserved)
        issues.push('text-fallback');
    if (!imageLoadFailureNonBlocking)
        issues.push('blocking');
    if (iconMotionAmplitude !== 0)
        issues.push('motion');
    if (activationThresholdMutation)
        issues.push('activation-threshold-mutation');
    if (modifierMutation)
        issues.push('modifier-mutation');
    if (safeZoneLifecycleMutation)
        issues.push('safe-zone-lifecycle-mutation');
    if (actionCount !== 9)
        issues.push(`actions:${actionCount}`);
    if (samples.some(sample => !sample.passed))
        issues.push('sample-failure');
    return { samples, lawCount: 6, coverage: atlas.coverage, uniqueCellCount: atlas.uniqueCellCount, outOfBounds: [...atlas.outOfBounds], toastCoverage, safeLaneCoverage, fallbackCoverage, textFallbackPreserved, imageLoadFailureNonBlocking, iconMotionAmplitude, activationThresholdMutation, modifierMutation, safeZoneLifecycleMutation, actionCount, snapshotSchemaMutation: false, issues, passed: issues.length === 0 };
}
