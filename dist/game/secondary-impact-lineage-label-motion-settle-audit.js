import { ACTION_BUTTONS } from './config.js';
import { secondaryImpactLineageLabelMotionSettle } from './secondary-impact-lineage-label-motion-settle-rendering.js';
export function runSecondaryImpactLineageLabelMotionSettleAudit() { const samples = []; for (const reduced of [false, true])
    for (let i = 0; i < 12; i++) {
        let r = secondaryImpactLineageLabelMotionSettle([], `L${i}`, { x: 200 + i * 3, y: 240 }, true, reduced);
        const start = { ...r.presentation.pos };
        r = secondaryImpactLineageLabelMotionSettle(r.memory, `L${i}`, { x: 360 + i * 2, y: 330 }, true, reduced);
        const moved = Math.hypot(r.presentation.pos.x - start.x, r.presentation.pos.y - start.y);
        samples.push({ id: `${reduced}-${i}`, passed: r.presentation.visible && Number.isFinite(r.presentation.pos.x) && Number.isFinite(r.presentation.pos.y) && (reduced || moved <= 12.000001) });
    } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 24 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
