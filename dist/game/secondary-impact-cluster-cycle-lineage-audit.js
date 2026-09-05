import { ACTION_BUTTONS } from './config.js';
import { advanceSecondaryImpactClusterSplitLineage, createSecondaryImpactClusterSplitLineageState, secondaryImpactSplitLineageFor } from './secondary-impact-cluster-split-lineage-rendering.js';
export function runSecondaryImpactClusterCycleLineageAudit() { const samples = []; for (let offset = 0; offset < 8; offset++) {
    let s = createSecondaryImpactClusterSplitLineageState();
    s = advanceSecondaryImpactClusterSplitLineage(s, [{ pos: { x: 180 + offset, y: 220 } }, { pos: { x: 320 + offset, y: 220 } }], .016);
    const old = secondaryImpactSplitLineageFor(s, { x: 320 + offset, y: 220 }).key;
    s = advanceSecondaryImpactClusterSplitLineage(s, [{ pos: { x: 250 + offset, y: 220 } }], .04);
    const tombstone = s.entries.find(e => e.key === old);
    s = advanceSecondaryImpactClusterSplitLineage(s, [{ pos: { x: 188 + offset, y: 220 } }, { pos: { x: 312 + offset, y: 220 } }], .04);
    const fresh = secondaryImpactSplitLineageFor(s, { x: 312 + offset, y: 220 }).key;
    samples.push({ id: `cycle-${offset}`, passed: Boolean(tombstone?.retired) && fresh !== old });
} return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 8 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
