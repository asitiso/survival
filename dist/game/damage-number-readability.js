export function damageNumberPresentation(input) {
    const stress = Math.max(0, Math.min(1, input.battlefieldStress ?? 0));
    const clusterIndex = Math.max(0, Math.floor(input.clusterIndex ?? 0));
    const resultPriority = Math.max(0, input.resultPriorityNearby ?? 0);
    const resultDistance = Number.isFinite(input.resultDistance) ? Math.max(0, input.resultDistance ?? 0) : Number.POSITIVE_INFINITY;
    const resultOwnsCenter = resultPriority >= 2 && resultDistance <= 56;
    const motionScale = input.reducedMotion ? .45 : 1;
    if (input.tier === 'critical') {
        const ownershipScale = resultOwnsCenter ? .96 : 1;
        const warningScale = input.protectedWarning ? .78 : 1;
        const safeLaneScale = input.safeLaneVisible ? .82 : 1;
        const flashScale = input.reducedFlash ? .80 : 1;
        return { visible: true, alpha: Math.max(.45, ownershipScale * warningScale * safeLaneScale * flashScale), maxVisible: Number.MAX_SAFE_INTEGER, offsetY: resultOwnsCenter ? -6 * motionScale : 0 };
    }
    if (input.tier === 'heavy') {
        const warningScale = input.protectedWarning ? .68 : 1;
        const safeLaneScale = input.safeLaneVisible ? .78 : 1;
        const flashScale = input.reducedFlash ? .78 : 1;
        return { visible: true, alpha: .82 * (resultOwnsCenter ? .72 : 1) * warningScale * safeLaneScale * flashScale, maxVisible: 12, offsetY: resultOwnsCenter ? -8 * motionScale : 0 };
    }
    const maxVisible = Math.max(3, Math.round(8 - stress * 5));
    const warningScale = input.protectedWarning ? .46 : 1;
    const safeLaneScale = input.safeLaneVisible ? .62 : 1;
    const flashScale = input.reducedFlash ? .72 : 1;
    const alpha = (1 - stress * .58) * (resultOwnsCenter ? .42 : 1) * warningScale * safeLaneScale * flashScale;
    return { visible: clusterIndex < maxVisible, alpha, maxVisible, offsetY: resultOwnsCenter ? -12 * motionScale : 0 };
}
