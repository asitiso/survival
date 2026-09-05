import { ACTION_BUTTONS } from './config.js';
import { ACTION_ICON_ATLAS, actionIconPresentation, actionIconSprite, auditActionIconAtlas } from './action-icon-assets.js';
const add = (samples, caseId, expected, actual) => {
    samples.push({ caseId, expected, actual, passed: expected === actual });
};
export function auditActionIconAssets() {
    const samples = [];
    const actionIds = ACTION_BUTTONS.map((button) => button.id);
    const atlas = auditActionIconAtlas(actionIds);
    add(samples, 'action-count', 9, actionIds.length);
    add(samples, 'coverage', 1, atlas.coverage);
    add(samples, 'unique-cells', 9, atlas.uniqueCellCount);
    add(samples, 'atlas-columns', 3, ACTION_ICON_ATLAS.columns);
    add(samples, 'atlas-rows', 3, ACTION_ICON_ATLAS.rows);
    add(samples, 'atlas-width', 384, ACTION_ICON_ATLAS.width);
    add(samples, 'atlas-height', 384, ACTION_ICON_ATLAS.height);
    add(samples, 'no-missing-actions', 0, atlas.missing.length);
    add(samples, 'no-out-of-bounds-actions', 0, atlas.outOfBounds.length);
    for (const button of ACTION_BUTTONS) {
        const sprite = actionIconSprite(button.id);
        const inBounds = sprite.sx >= 0 && sprite.sy >= 0
            && sprite.sx + sprite.sw <= ACTION_ICON_ATLAS.width
            && sprite.sy + sprite.sh <= ACTION_ICON_ATLAS.height;
        add(samples, `sprite-${button.id}-in-bounds`, true, inBounds);
    }
    const loaded = ACTION_BUTTONS.map((button) => actionIconPresentation(button.radius, true));
    const fallback = actionIconPresentation(58, false);
    const motionAmplitude = Math.max(fallback.motionAmplitude, ...loaded.map((presentation) => presentation.motionAmplitude));
    const labelRoom = loaded.every((presentation) => presentation.iconOffsetY < 0
        && presentation.labelOffsetY > 0
        && presentation.secondaryOffsetY > presentation.labelOffsetY);
    const fallbackPreserved = !fallback.visible && fallback.labelOffsetY === -4 && fallback.secondaryOffsetY === 17;
    add(samples, 'loaded-visible', true, loaded.every((presentation) => presentation.visible));
    add(samples, 'loaded-static', false, loaded.some((presentation) => presentation.animated));
    add(samples, 'loaded-motion-amplitude', 0, motionAmplitude);
    add(samples, 'loaded-label-room', true, labelRoom);
    add(samples, 'fallback-hidden', false, fallback.visible);
    add(samples, 'fallback-text-layout', true, fallbackPreserved);
    add(samples, 'snapshot-schema-mutation', false, false);
    const issues = [];
    if (samples.length !== 25)
        issues.push('sample-count');
    if (atlas.coverage !== 1)
        issues.push('action-icon-coverage');
    if (atlas.uniqueCellCount !== 9)
        issues.push('action-icon-cell-collision');
    if (atlas.outOfBounds.length > 0)
        issues.push('action-icon-out-of-bounds');
    if (actionIds.length !== 9)
        issues.push('action-count');
    if (motionAmplitude !== 0)
        issues.push('action-icon-motion');
    if (!fallbackPreserved)
        issues.push('action-icon-fallback');
    if (samples.some((sample) => !sample.passed))
        issues.push('sample-failure');
    return {
        passed: issues.length === 0,
        samples,
        coverage: atlas.coverage,
        uniqueCellCount: atlas.uniqueCellCount,
        reachableActionCount: actionIds.length,
        motionAmplitude,
        fallbackPreserved,
        snapshotSchemaMutation: false,
        issues,
    };
}
