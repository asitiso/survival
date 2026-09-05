import { PROJECTILE_IMPACT_LABEL_LABEL_CLEARANCE, projectileImpactLabelPlacements } from './projectile-impact-label-placement-arbitration.js';
export function runProjectileImpactLabelPlacementArbitrationAudit() {
    const samples = [];
    let passed = true;
    for (let i = 0; i < 64; i++) {
        const clusters = [{ impact: { x: 220 + i, y: 260 }, count: 3, sourceClass: i % 4 === 0 ? 'boss' : 'archer' }, { impact: { x: 258 + i, y: 262 }, count: 2, sourceClass: 'archer' }];
        const stamps = clusters.map((entry) => entry.impact);
        const r = projectileImpactLabelPlacements({ clusters, stamps, width: 1280, height: 800 });
        const visible = r.filter((entry) => entry.visible);
        const separation = visible.length < 2 || Math.hypot(visible[0].pos.x - visible[1].pos.x, visible[0].pos.y - visible[1].pos.y) >= PROJECTILE_IMPACT_LABEL_LABEL_CLEARANCE;
        const ok = r.length === 2 && visible.length >= 1 && separation && r.every((entry) => entry.animated === false);
        passed &&= ok;
        samples.push(`${i}:${visible.length}:${separation ? 1 : 0}:${r[0].sourceClass}`);
    }
    return { samples, actionCount: 9, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, passed };
}
