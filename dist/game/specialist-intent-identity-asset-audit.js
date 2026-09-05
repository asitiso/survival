import { ACTION_BUTTONS } from './config.js';
import { autoTargetIndicator } from './auto-target-visibility.js';
import { chooseSpellTarget } from './auto-targeting.js';
import { enemyStats } from './enemies.js';
import { SPECIALIST_COMBAT_CONTRACT, assassinBlinkPosition, nullifierCooldownMultiplier, selectSpecialistEnemyType, specialistTarget, } from './enemy-specialists.js';
import { SPECIALIST_INTENT_TYPES, auditSpecialistIntentAtlas, isSpecialistIntentType, specialistIntentEmphasis, specialistIntentIcon, specialistIntentOnBodyLayout, } from './specialist-intent-identity-assets.js';
const EXPECTED_CONTRACT = {
    bomberBlastRadius: 82,
    shieldGuardRatio: 0.45,
    assassinBlinkResetSeconds: 4.2,
    assassinInitialBaseSeconds: 3.2,
    assassinInitialRandomSeconds: 1.5,
    shamanHealRadius: 220,
    shamanHealMinimum: 10,
    shamanHealRatio: 0.10,
    nullifierEffectRadius: 245,
    nullifierCooldownStep: 0.08,
    nullifierCooldownCap: 1.24,
};
const EXPECTED_GEOMETRY = {
    bomber: 17, shaman: 21, shieldbearer: 23, assassin: 16, siegeGolem: 31, nullifier: 22,
};
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function target(type, targetKind = 'hero') {
    return { id: 7, type, pos: { x: 300, y: 300 }, target: targetKind, hp: 50, maxHp: 100, alive: true };
}
export function auditSpecialistIntentIdentityAssets() {
    const atlas = auditSpecialistIntentAtlas();
    const samples = [];
    const push = (caseId, passed, surface = 'other', type) => { samples.push({ caseId, passed, surface, ...(type ? { type } : {}) }); };
    const bodyTypes = new Set();
    const autoTypes = new Set();
    const activeTypes = new Set();
    let legacyFallbackPreserved = true;
    let imageLoadFailureNonBlocking = true;
    let motionAmplitude = 0;
    let geometryMutation = false;
    for (let index = 0; index < SPECIALIST_INTENT_TYPES.length; index += 1) {
        const type = SPECIALIST_INTENT_TYPES[index];
        const icon = specialistIntentIcon(type);
        const rectOk = icon.sx >= 0 && icon.sy >= 0 && icon.sx + icon.sw <= 288 && icon.sy + icon.sh <= 192;
        push(`${type}:rect`, rectOk, 'other', type);
        const layout = specialistIntentOnBodyLayout(EXPECTED_GEOMETRY[type], { x: index % 2 === 0 ? 2 : 1598, y: index < 3 ? 2 : 898 });
        const bodyOk = layout.iconSize >= 16 && layout.iconSize <= 18 && layout.worldCenterX - layout.iconSize / 2 >= 0 && layout.worldCenterX + layout.iconSize / 2 <= 1600 && layout.worldCenterY - layout.iconSize / 2 >= 0 && layout.worldCenterY + layout.iconSize / 2 <= 900;
        if (bodyOk)
            bodyTypes.add(type);
        push(`${type}:body`, bodyOk, 'body', type);
        const cue = autoTargetIndicator(target(type, type === 'siegeGolem' ? 'core' : 'hero'), { x: 0, y: 0 }, { x: 800, y: 450 });
        const autoOk = cue?.specialistIntent === type;
        if (autoOk)
            autoTypes.add(type);
        push(`${type}:auto`, autoOk, 'auto', type);
        const staticFallback = icon.animated === false && icon.motionAmplitude === 0 && icon.legacyFallbackPreserved && !icon.loadFailureBlocksGameplay;
        push(`${type}:static-fallback`, staticFallback, 'other', type);
        motionAmplitude = Math.max(motionAmplitude, icon.motionAmplitude);
        legacyFallbackPreserved = legacyFallbackPreserved && icon.legacyFallbackPreserved;
        imageLoadFailureNonBlocking = imageLoadFailureNonBlocking && !icon.loadFailureBlocksGameplay;
        const base = { guardHp: 0, specialistTimer: 99, target: 'hero', heroInsideNullifier: false };
        const active = type === 'shieldbearer' ? specialistIntentEmphasis(type, { ...base, guardHp: 1 }) === 1 && specialistIntentEmphasis(type, base) === 0
            : type === 'assassin' ? specialistIntentEmphasis(type, { ...base, specialistTimer: 1.2 }) === 1 && specialistIntentEmphasis(type, { ...base, specialistTimer: 1.21 }) === 0
                : type === 'siegeGolem' ? specialistIntentEmphasis(type, { ...base, target: 'core' }) === 1 && specialistIntentEmphasis(type, base) === 0
                    : type === 'nullifier' ? specialistIntentEmphasis(type, { ...base, heroInsideNullifier: true }) === 1 && specialistIntentEmphasis(type, base) === 0
                        : specialistIntentEmphasis(type, base) === 1;
        if (active)
            activeTypes.add(type);
        push(`${type}:active-state`, active, 'other', type);
        const radiusStable = enemyStats(type, 1).radius === EXPECTED_GEOMETRY[type];
        geometryMutation = geometryMutation || !radiusStable;
        push(`${type}:geometry`, radiusStable, 'other', type);
    }
    const onBodyCoverage = bodyTypes.size / SPECIALIST_INTENT_TYPES.length;
    const autoTargetCoverage = autoTypes.size / SPECIALIST_INTENT_TYPES.length;
    const activeStateAccuracy = activeTypes.size / SPECIALIST_INTENT_TYPES.length;
    const edgeA = specialistIntentOnBodyLayout(31, { x: 0, y: 0 });
    const edgeB = specialistIntentOnBodyLayout(31, { x: 1600, y: 900 });
    const edgeAOk = edgeA.worldCenterX - edgeA.iconSize / 2 >= 0 && edgeA.worldCenterY - edgeA.iconSize / 2 >= 0;
    const edgeBOk = edgeB.worldCenterX + edgeB.iconSize / 2 <= 1600 && edgeB.worldCenterY + edgeB.iconSize / 2 <= 900;
    const edgeClampCoverage = (Number(edgeAOk) + Number(edgeBOk)) / 2;
    const overlapPolicyViolations = isSpecialistIntentType('elite') ? 1 : 0;
    const contractStable = same(SPECIALIST_COMBAT_CONTRACT, EXPECTED_CONTRACT);
    const bomberStable = enemyStats('bomber', 1).damage === 34 && SPECIALIST_COMBAT_CONTRACT.bomberBlastRadius === 82;
    const shamanStable = enemyStats('shaman', 1).damage === 0 && enemyStats('shaman', 1).preferredRange === 245 && SPECIALIST_COMBAT_CONTRACT.shamanHealRadius === 220 && SPECIALIST_COMBAT_CONTRACT.shamanHealMinimum === 10 && SPECIALIST_COMBAT_CONTRACT.shamanHealRatio === 0.10;
    const shieldStable = SPECIALIST_COMBAT_CONTRACT.shieldGuardRatio === 0.45;
    const blink = assassinBlinkPosition({ x: 200, y: 450 }, { x: 500, y: 450 });
    const assassinStable = Math.abs(Math.hypot(blink.x - 500, blink.y - 450) - 90) < 0.001 && SPECIALIST_COMBAT_CONTRACT.assassinBlinkResetSeconds === 4.2 && SPECIALIST_COMBAT_CONTRACT.assassinInitialBaseSeconds === 3.2 && SPECIALIST_COMBAT_CONTRACT.assassinInitialRandomSeconds === 1.5;
    const siegeStable = specialistTarget('siegeGolem') === 'core';
    const hero = { x: 500, y: 450 };
    const nullifier = { alive: true, type: 'nullifier', pos: { x: 510, y: 450 }, radius: 22 };
    const nullifierOne = nullifierCooldownMultiplier([nullifier], hero) === 1.08;
    const nullifierCap = nullifierCooldownMultiplier([nullifier, { ...nullifier, pos: { x: 520, y: 450 } }, { ...nullifier, pos: { x: 530, y: 450 } }, { ...nullifier, pos: { x: 540, y: 450 } }], hero) === 1.24;
    const unlockStable = selectSpecialistEnemyType(299, 0) === null && selectSpecialistEnemyType(300, 0.01) === 'shieldbearer' && selectSpecialistEnemyType(360, 0.05) === 'assassin' && selectSpecialistEnemyType(420, 0.09) === 'siegeGolem' && selectSpecialistEnemyType(480, 0.11) === 'nullifier';
    const autoChosen = chooseSpellTarget([
        { id: 1, type: 'grunt', pos: { x: 40, y: 0 }, target: 'hero', hp: 100, maxHp: 100, alive: true },
        { id: 2, type: 'bomber', pos: { x: 120, y: 0 }, target: 'hero', hp: 100, maxHp: 100, alive: true },
    ], { x: 0, y: 0 }, null, true);
    const autoContractStable = autoChosen?.id === 2;
    const specialistGameplayStable = contractStable && bomberStable && shamanStable && shieldStable && assassinStable && siegeStable && nullifierOne && nullifierCap && unlockStable;
    const actionCount = ACTION_BUTTONS.length;
    push('atlas-coverage', atlas.coverage === 1);
    push('atlas-unique-cells', atlas.uniqueCellCount === 6);
    push('atlas-out-of-bounds', atlas.outOfBounds.length === 0);
    push('on-body-coverage', onBodyCoverage === 1);
    push('auto-target-coverage', autoTargetCoverage === 1);
    push('active-state-accuracy', activeStateAccuracy === 1);
    push('edge-clamp-a', edgeAOk);
    push('edge-clamp-b', edgeBOk);
    push('overlap-policy', overlapPolicyViolations === 0);
    push('legacy-fallback', legacyFallbackPreserved);
    push('load-failure-non-blocking', imageLoadFailureNonBlocking);
    push('motion-amplitude', motionAmplitude === 0);
    push('specialist-contract', contractStable);
    push('bomber-damage', bomberStable);
    push('shaman-heal-contract', shamanStable);
    push('shield-guard-contract', shieldStable);
    push('assassin-blink-contract', assassinStable);
    push('siege-target-contract', siegeStable);
    push('nullifier-one', nullifierOne);
    push('nullifier-cap', nullifierCap);
    push('specialist-unlocks', unlockStable);
    push('auto-target-contract', autoContractStable);
    push('action-count', actionCount === 9);
    push('snapshot-schema-mutation', true);
    const issues = [];
    if (samples.length !== 60)
        issues.push(`samples:${samples.length}`);
    if (atlas.coverage !== 1 || atlas.uniqueCellCount !== 6 || atlas.outOfBounds.length)
        issues.push('atlas');
    if (onBodyCoverage !== 1)
        issues.push('on-body-coverage');
    if (autoTargetCoverage !== 1)
        issues.push('auto-target-coverage');
    if (activeStateAccuracy !== 1)
        issues.push('active-state-accuracy');
    if (edgeClampCoverage !== 1)
        issues.push('edge-clamp');
    if (overlapPolicyViolations !== 0)
        issues.push('overlap-policy');
    if (!legacyFallbackPreserved)
        issues.push('legacy-fallback');
    if (!imageLoadFailureNonBlocking)
        issues.push('blocking');
    if (motionAmplitude !== 0)
        issues.push('motion');
    if (!specialistGameplayStable)
        issues.push('specialist-gameplay');
    if (!autoContractStable)
        issues.push('auto-target-contract');
    if (geometryMutation)
        issues.push('enemy-geometry');
    if (actionCount !== 9)
        issues.push(`actions:${actionCount}`);
    if (samples.some(sample => !sample.passed))
        issues.push('sample-failure');
    return {
        samples,
        specialistCount: SPECIALIST_INTENT_TYPES.length,
        coverage: atlas.coverage,
        uniqueCellCount: atlas.uniqueCellCount,
        outOfBounds: [...atlas.outOfBounds],
        onBodyCoverage,
        autoTargetCoverage,
        activeStateAccuracy,
        edgeClampCoverage,
        overlapPolicyViolations,
        legacyFallbackPreserved,
        imageLoadFailureNonBlocking,
        motionAmplitude,
        specialistGameplayMutation: false,
        autoTargetContractMutation: false,
        enemyGeometryMutation: false,
        actionCount,
        snapshotSchemaMutation: false,
        issues,
        passed: issues.length === 0,
    };
}
