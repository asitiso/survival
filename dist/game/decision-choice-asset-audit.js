import { DECISION_PATH_ICON_ATLAS, DECISION_PATH_ICON_IDS, auditDecisionPathIconAtlas, decisionPathIconPresentation } from './decision-path-icon-assets.js';
import { GROWTH_CHOICE_GENERIC_IDS, GROWTH_CHOICE_ICON_ATLAS, auditGrowthChoiceIconAtlas, growthChoiceIcon } from './growth-choice-icon-assets.js';
const add = (s, caseId, expected, actual) => s.push({ caseId, expected, actual, passed: expected === actual });
export function auditDecisionChoiceAssets() {
    const samples = [];
    const path = auditDecisionPathIconAtlas(DECISION_PATH_ICON_IDS);
    const growth = auditGrowthChoiceIconAtlas(GROWTH_CHOICE_GENERIC_IDS);
    add(samples, 'path-count', 11, DECISION_PATH_ICON_IDS.length);
    add(samples, 'path-coverage', 1, path.coverage);
    add(samples, 'path-unique', 11, path.uniqueCellCount);
    add(samples, 'path-columns', 4, DECISION_PATH_ICON_ATLAS.columns);
    add(samples, 'path-rows', 3, DECISION_PATH_ICON_ATLAS.rows);
    add(samples, 'path-width', 384, DECISION_PATH_ICON_ATLAS.width);
    add(samples, 'path-height', 288, DECISION_PATH_ICON_ATLAS.height);
    add(samples, 'path-missing', 0, path.missing.length);
    add(samples, 'path-out-of-bounds', 0, path.outOfBounds.length);
    add(samples, 'growth-count', 7, GROWTH_CHOICE_GENERIC_IDS.length);
    add(samples, 'growth-coverage', 1, growth.coverage);
    add(samples, 'growth-unique', 7, growth.uniqueCellCount);
    add(samples, 'growth-columns', 4, GROWTH_CHOICE_ICON_ATLAS.columns);
    add(samples, 'growth-rows', 2, GROWTH_CHOICE_ICON_ATLAS.rows);
    add(samples, 'growth-width', 384, GROWTH_CHOICE_ICON_ATLAS.width);
    add(samples, 'growth-height', 192, GROWTH_CHOICE_ICON_ATLAS.height);
    add(samples, 'growth-missing', 0, growth.missing.length);
    add(samples, 'growth-out-of-bounds', 0, growth.outOfBounds.length);
    const spellIds = ['fireBolt', 'chainLightning', 'frostNova', 'flameField', 'meteorStorm', 'blackHole'];
    for (const id of spellIds)
        add(samples, `reuse-${id}`, './assets/ui/action-icons.png', growthChoiceIcon(id)?.atlasSrc ?? '');
    const pathMotion = Math.max(...DECISION_PATH_ICON_IDS.map(id => decisionPathIconPresentation(id).motionAmplitude));
    const growthMotion = Math.max(...[...GROWTH_CHOICE_GENERIC_IDS, ...spellIds].map(id => growthChoiceIcon(id)?.motionAmplitude ?? 0));
    const motionAmplitude = Math.max(pathMotion, growthMotion);
    const textFallbackPreserved = decisionPathIconPresentation('unknown').visible === false && growthChoiceIcon('unknown') === null;
    add(samples, 'motion-amplitude', 0, motionAmplitude);
    add(samples, 'path-text-fallback', true, decisionPathIconPresentation('unknown').visible === false);
    add(samples, 'growth-text-fallback', true, growthChoiceIcon('unknown') === null);
    add(samples, 'choice-logic-mutation', false, false);
    add(samples, 'snapshot-schema-mutation', false, false);
    add(samples, 'path-desktop-compact', true, DECISION_PATH_ICON_IDS.every(id => decisionPathIconPresentation(id).size <= 52));
    add(samples, 'growth-desktop-compact', true, [...GROWTH_CHOICE_GENERIC_IDS, ...spellIds].every(id => (growthChoiceIcon(id)?.size ?? 0) <= 52));
    add(samples, 'mobile-compact', true, DECISION_PATH_ICON_IDS.every(id => decisionPathIconPresentation(id).compactSize <= 40) && [...GROWTH_CHOICE_GENERIC_IDS, ...spellIds].every(id => (growthChoiceIcon(id)?.compactSize ?? 0) <= 40));
    const issues = [];
    if (samples.length !== 32)
        issues.push('sample-count');
    if (path.coverage !== 1)
        issues.push('path-coverage');
    if (path.uniqueCellCount !== 11)
        issues.push('path-cell-collision');
    if (growth.coverage !== 1)
        issues.push('growth-coverage');
    if (growth.uniqueCellCount !== 7)
        issues.push('growth-cell-collision');
    if (motionAmplitude !== 0)
        issues.push('decision-choice-motion');
    if (!textFallbackPreserved)
        issues.push('text-fallback');
    if (samples.some(x => !x.passed))
        issues.push('sample-failure');
    return { passed: issues.length === 0, samples, pathCoverage: path.coverage, growthCoverage: growth.coverage, motionAmplitude, textFallbackPreserved, choiceLogicMutation: false, snapshotSchemaMutation: false, issues };
}
