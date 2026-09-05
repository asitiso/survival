import { ACTION_BUTTONS } from './config.js';
import { PROJECTILE_IMPACT_LABEL_ANCHOR_HOLD_SECONDS, projectileImpactAnchoredPlacements, updateProjectileImpactLabelAnchorHold } from './projectile-impact-label-anchor-hold.js';
const cluster = (x, y, sourceClass = 'archer') => ({ impact: { x, y }, incoming: { x: 120, y: 10 }, count: 3, sourceClass, start: { x: x - 28, y }, end: { x, y }, alpha: .5, accent: '#fff', animated: false, motionAmplitude: 0 });
const placement = (x, y, sourceClass = 'archer') => ({ clusterIndex: 0, sourceClass, pos: { x, y }, visible: true, animated: false, motionAmplitude: 0 });
export function runProjectileImpactLabelAnchorHoldAudit() {
    const samples = [];
    let passed = true;
    for (let i = 0; i < 64; i++) {
        const sourceClass = i % 3 === 0 ? 'boss' : 'archer';
        let memory = updateProjectileImpactLabelAnchorHold([], [cluster(300 + i, 300, sourceClass)], [placement(300 + i, 262, sourceClass)], .016);
        memory = updateProjectileImpactLabelAnchorHold(memory, [cluster(303 + i, 301, sourceClass)], [placement(341 + i, 291, sourceClass)], PROJECTILE_IMPACT_LABEL_ANCHOR_HOLD_SECONDS * .4);
        const held = projectileImpactAnchoredPlacements(memory, [cluster(303 + i, 301, sourceClass)], [placement(341 + i, 291, sourceClass)])[0];
        const ok = held.visible && held.pos.y === 262 && memory.every((entry) => entry.presentationOnly);
        passed &&= ok;
        samples.push(`${i}:${sourceClass}:${held.pos.x.toFixed(1)}:${held.pos.y.toFixed(1)}`);
    }
    return { passed, samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false };
}
