import { ACTION_BUTTONS } from './config.js';
import { PROJECTILE_IMPACT_COUNT_DIRECTION_COSINE_MIN, projectileImpactHeldCount, updateProjectileImpactCountHold } from './projectile-impact-count-hold.js';
const cluster = (x, y, vx, vy, count) => ({ impact: { x, y }, incoming: { x: vx, y: vy }, count, sourceClass: 'archer', start: { x: x - 28, y }, end: { x, y }, alpha: .5, accent: '#fff', animated: false, motionAmplitude: 0 });
export function runProjectileImpactCountDirectionIdentityAudit() {
    const samples = [];
    let passed = PROJECTILE_IMPACT_COUNT_DIRECTION_COSINE_MIN > .6 && PROJECTILE_IMPACT_COUNT_DIRECTION_COSINE_MIN < .95;
    for (let i = 0; i < 64; i++) {
        let memory = updateProjectileImpactCountHold([], [cluster(300 + i, 300, 180, 18, 4)], .016);
        const similar = cluster(304 + i, 301, 170, 24, 2), cross = cluster(304 + i, 301, 0, 180, 1);
        const similarMemory = updateProjectileImpactCountHold(memory, [similar], .04);
        const similarHeld = projectileImpactHeldCount(similarMemory, similar) === 4;
        memory = updateProjectileImpactCountHold(memory, [cross], .04);
        const crossHeld = projectileImpactHeldCount(memory, cross) === 1;
        const ok = similarHeld && crossHeld && memory.every((entry) => entry.presentationOnly && Number.isFinite(entry.incoming.x));
        passed &&= ok;
        samples.push(`${i}:${similarHeld ? 1 : 0}:${crossHeld ? 1 : 0}:${memory.length}`);
    }
    return { passed, samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false };
}
