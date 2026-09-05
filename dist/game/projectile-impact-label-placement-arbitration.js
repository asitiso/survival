export const PROJECTILE_IMPACT_LABEL_STAMP_CLEARANCE = 24;
export const PROJECTILE_IMPACT_LABEL_LABEL_CLEARANCE = 34;
export const PROJECTILE_IMPACT_LABEL_SCREEN_INSET = 16;
const OFFSETS = [{ x: 0, y: -38 }, { x: 38, y: -10 }, { x: -38, y: -10 }, { x: 0, y: 36 }, { x: 40, y: 24 }, { x: -40, y: 24 }];
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export function projectileImpactLabelPlacements(input) {
    const placed = [];
    const output = [];
    for (let index = 0; index < input.clusters.length; index++) {
        const cluster = input.clusters[index];
        if (cluster.count <= 1) {
            output.push({ clusterIndex: index, sourceClass: cluster.sourceClass, pos: { ...cluster.impact }, visible: false, animated: false, motionAmplitude: 0 });
            continue;
        }
        let best = null, bestScore = -Infinity;
        const offsets = cluster.sourceClass === 'boss' ? OFFSETS : [OFFSETS[0], OFFSETS[2], OFFSETS[1], OFFSETS[3], OFFSETS[5], OFFSETS[4]];
        for (const offset of offsets) {
            const candidate = { x: clamp(cluster.impact.x + offset.x, PROJECTILE_IMPACT_LABEL_SCREEN_INSET, input.width - PROJECTILE_IMPACT_LABEL_SCREEN_INSET), y: clamp(cluster.impact.y + offset.y, PROJECTILE_IMPACT_LABEL_SCREEN_INSET, input.height - PROJECTILE_IMPACT_LABEL_SCREEN_INSET) };
            const stampMin = input.stamps.length ? Math.min(...input.stamps.map((stamp) => distance(candidate, stamp))) : Infinity;
            const labelMin = placed.length ? Math.min(...placed.map((label) => distance(candidate, label))) : Infinity;
            if (stampMin < PROJECTILE_IMPACT_LABEL_STAMP_CLEARANCE || labelMin < PROJECTILE_IMPACT_LABEL_LABEL_CLEARANCE)
                continue;
            const score = Math.min(stampMin, 80) + Math.min(labelMin, 80) - distance(candidate, cluster.impact) * .08;
            if (score > bestScore) {
                best = candidate;
                bestScore = score;
            }
        }
        if (best) {
            placed.push(best);
            output.push({ clusterIndex: index, sourceClass: cluster.sourceClass, pos: best, visible: true, animated: false, motionAmplitude: 0 });
        }
        else
            output.push({ clusterIndex: index, sourceClass: cluster.sourceClass, pos: { ...cluster.impact }, visible: false, animated: false, motionAmplitude: 0 });
    }
    return output;
}
