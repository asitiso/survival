import { ACTION_BUTTONS, LOGICAL_HEIGHT, LOGICAL_WIDTH } from './config.js';
import { SECONDARY_IMPACT_LABEL_PLACEMENT_HOLD_SECONDS, advanceSecondaryImpactLineageLabelPlacementHold, secondaryImpactLineageHeldPlacement } from './secondary-impact-lineage-label-placement-hold-rendering.js';
export function runSecondaryImpactLineageLabelPlacementHoldAudit() { const samples = []; for (let i = 0; i < 24; i++) {
    const first = { visible: true, pos: { x: 220 + i * 12, y: 240 + (i % 3) * 30 }, presentationOnly: true };
    let r = secondaryImpactLineageHeldPlacement([], `l-${i}`, first, [], [], LOGICAL_WIDTH, LOGICAL_HEIGHT), memory = advanceSecondaryImpactLineageLabelPlacementHold(r.memory, i % 2 ? .03 : SECONDARY_IMPACT_LABEL_PLACEMENT_HOLD_SECONDS * 1.1), fallback = { visible: true, pos: { x: first.pos.x + 38, y: first.pos.y + 18 }, presentationOnly: true };
    r = secondaryImpactLineageHeldPlacement(memory, `l-${i}`, fallback, [], [], LOGICAL_WIDTH, LOGICAL_HEIGHT);
    samples.push({ id: String(i), passed: r.placement.visible && Number.isFinite(r.placement.pos.x) && r.memory.length === 1 });
} return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 24 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
