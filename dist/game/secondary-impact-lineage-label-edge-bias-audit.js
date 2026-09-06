import { ACTION_BUTTONS, LOGICAL_HEIGHT, LOGICAL_WIDTH } from './config.js';
import { secondaryImpactLineageLabelEdgeBias } from './secondary-impact-lineage-label-edge-bias-rendering.js';
export function runSecondaryImpactLineageLabelEdgeBiasAudit() { const samples = []; for (const x of [18, 24, 48, 320, 640, 1232, 1256, 1262])
    for (const y of [18, 30, 360, 690, 702]) {
        const p = secondaryImpactLineageLabelEdgeBias({ pos: { x, y }, blockers: [], occupied: [], width: LOGICAL_WIDTH, height: LOGICAL_HEIGHT });
        samples.push({ id: `${x}:${y}`, passed: Number.isFinite(p.pos.x) && Number.isFinite(p.pos.y) && p.pos.x >= 18 && p.pos.x <= LOGICAL_WIDTH - 18 && p.pos.y >= 18 && p.pos.y <= LOGICAL_HEIGHT - 18 });
    } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 40 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
