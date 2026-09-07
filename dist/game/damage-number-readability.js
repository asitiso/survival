export function damageNumberPresentation(input) {
    const stress = Math.max(0, Math.min(1, input.battlefieldStress ?? 0));
    const clusterIndex = Math.max(0, Math.floor(input.clusterIndex ?? 0));
    const resultPriority = Math.max(0, input.resultPriorityNearby ?? 0);
    const resultDistance = Number.isFinite(input.resultDistance) ? Math.max(0, input.resultDistance ?? 0) : Number.POSITIVE_INFINITY;
    const resultOwnsCenter = resultPriority >= 2 && resultDistance <= 56;
    const motionScale = input.reducedMotion ? .45 : 1;
    const sameTargetIndex = Math.max(0, Math.floor(input.sameTargetIndex ?? 0));
    const denseNeighborIndex = Math.max(0, Math.floor(input.denseNeighborIndex ?? 0));
    const resultVectorX = Number.isFinite(input.resultVectorX) ? input.resultVectorX ?? 0 : 0;
    const resultVectorY = Number.isFinite(input.resultVectorY) ? input.resultVectorY ?? 0 : 0;
    const sourceVectorX = Number.isFinite(input.sourceVectorX) ? input.sourceVectorX ?? 0 : 0;
    const sourceVectorY = Number.isFinite(input.sourceVectorY) ? input.sourceVectorY ?? 0 : 0;
    const avoidanceDirection = () => {
        const resultLength = Math.hypot(resultVectorX, resultVectorY);
        if (resultLength > 1)
            return { x: resultVectorX / resultLength, y: resultVectorY / resultLength };
        const sourceLength = Math.hypot(sourceVectorX, sourceVectorY);
        if (sourceLength > 1)
            return { x: sourceVectorX / sourceLength, y: sourceVectorY / sourceLength };
        return { x: 0, y: -1 };
    };
    const resultAvoidance = (magnitude) => {
        if (!resultOwnsCenter)
            return { x: 0, y: 0 };
        const direction = avoidanceDirection();
        return { x: direction.x * magnitude * motionScale, y: direction.y * magnitude * motionScale };
    };
    const packingOffset = (step) => {
        if (sameTargetIndex === 0)
            return 0;
        const ring = Math.ceil(sameTargetIndex / 2);
        const sign = sameTargetIndex % 2 === 1 ? 1 : -1;
        return sign * ring * step * motionScale;
    };
    const denseOffset = (step) => {
        if (denseNeighborIndex === 0)
            return 0;
        const ring = Math.ceil(denseNeighborIndex / 2);
        const sign = denseNeighborIndex % 2 === 1 ? -1 : 1;
        return sign * ring * step * motionScale;
    };
    const clampToViewport = (offsetX, offsetY) => {
        const anchorX = Number.isFinite(input.anchorX) ? input.anchorX ?? 0 : Number.NaN;
        const anchorY = Number.isFinite(input.anchorY) ? input.anchorY ?? 0 : Number.NaN;
        const width = Number.isFinite(input.viewportWidth) ? input.viewportWidth ?? 0 : 0;
        const height = Number.isFinite(input.viewportHeight) ? input.viewportHeight ?? 0 : 0;
        if (!Number.isFinite(anchorX) || !Number.isFinite(anchorY) || width <= 36 || height <= 40)
            return { x: offsetX, y: offsetY };
        const finalX = Math.max(18, Math.min(width - 18, anchorX + offsetX));
        const finalY = Math.max(22, Math.min(height - 18, anchorY + offsetY));
        return { x: finalX - anchorX, y: finalY - anchorY };
    };
    if (input.tier === 'critical') {
        const ownershipScale = resultOwnsCenter ? .96 : 1;
        const warningScale = input.protectedWarning ? .78 : 1;
        const safeLaneScale = input.safeLaneVisible ? .82 : 1;
        const flashScale = input.reducedFlash ? .80 : 1;
        const avoidance = resultAvoidance(4);
        const offset = clampToViewport(avoidance.x, avoidance.y);
        return { visible: true, alpha: Math.max(.45, ownershipScale * warningScale * safeLaneScale * flashScale), maxVisible: Number.MAX_SAFE_INTEGER, offsetX: offset.x, offsetY: offset.y };
    }
    if (input.tier === 'heavy') {
        const warningScale = input.protectedWarning ? .68 : 1;
        const safeLaneScale = input.safeLaneVisible ? .78 : 1;
        const flashScale = input.reducedFlash ? .78 : 1;
        const avoidance = resultAvoidance(8);
        const offset = clampToViewport(packingOffset(9) + avoidance.x, avoidance.y + denseOffset(5));
        return { visible: true, alpha: .82 * (resultOwnsCenter ? .72 : 1) * warningScale * safeLaneScale * flashScale, maxVisible: 12, offsetX: offset.x, offsetY: offset.y };
    }
    const maxVisible = Math.max(3, Math.round(8 - stress * 5));
    const warningScale = input.protectedWarning ? .46 : 1;
    const safeLaneScale = input.safeLaneVisible ? .62 : 1;
    const flashScale = input.reducedFlash ? .72 : 1;
    const alpha = (1 - stress * .58) * (resultOwnsCenter ? .42 : 1) * warningScale * safeLaneScale * flashScale;
    const avoidance = resultAvoidance(12);
    const offset = clampToViewport(packingOffset(14) + avoidance.x, avoidance.y + denseOffset(8));
    return { visible: clusterIndex < maxVisible, alpha, maxVisible, offsetX: offset.x, offsetY: offset.y };
}
