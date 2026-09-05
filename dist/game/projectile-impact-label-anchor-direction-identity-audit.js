import { ACTION_BUTTONS } from './config.js';
import { PROJECTILE_IMPACT_LABEL_ANCHOR_DIRECTION_COSINE_MIN, projectileImpactAnchoredPlacements, projectileImpactLabelAnchorDirectionCompatible, updateProjectileImpactLabelAnchorHold } from './projectile-impact-label-anchor-hold.js';
const cluster = (x, y, vx, vy) => ({ impact: { x, y }, incoming: { x: vx, y: vy }, count: 3, sourceClass: 'archer', start: { x: x - 28, y }, end: { x, y }, alpha: .5, accent: '#fff', animated: false, motionAmplitude: 0 });
const placement = (x, y) => ({ clusterIndex: 0, sourceClass: 'archer', pos: { x, y }, visible: true, animated: false, motionAmplitude: 0 });
export function runProjectileImpactLabelAnchorDirectionIdentityAudit() {
    const samples = [];
    let passed = PROJECTILE_IMPACT_LABEL_ANCHOR_DIRECTION_COSINE_MIN > .6 && PROJECTILE_IMPACT_LABEL_ANCHOR_DIRECTION_COSINE_MIN < .95;
    for (let i = 0; i < 64; i++) {
        let memory = updateProjectileImpactLabelAnchorHold([], [cluster(300 + i, 300, 180, 18)], [placement(300 + i, 262)], .016);
        const cross = cluster(303 + i, 301, 0, 180), similar = cluster(303 + i, 301, 170, 24);
        const similarCompatible = projectileImpactLabelAnchorDirectionCompatible(memory[0].incoming, similar.incoming), crossCompatible = projectileImpactLabelAnchorDirectionCompatible(memory[0].incoming, cross.incoming);
        memory = updateProjectileImpactLabelAnchorHold(memory, [cross], [placement(341 + i, 291)], .04);
        const placed = projectileImpactAnchoredPlacements(memory, [cross], [placement(341 + i, 291)])[0];
        const ok = similarCompatible && !crossCompatible && placed.pos.x === 341 + i && memory.every((entry) => entry.presentationOnly);
        passed &&= ok;
        samples.push(`${i}:${similarCompatible ? 1 : 0}:${crossCompatible ? 1 : 0}:${placed.pos.x.toFixed(1)}`);
    }
    return { passed, samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false };
}
