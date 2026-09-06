const clamp = (v) => Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));
const delta = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
export function heroDirectionalOverlayOwnerPresentation(input, reducedMotion = false) {
    const owner = input.owner, bodyAngle = Number.isFinite(input.bodyAngle) ? input.bodyAngle : 0, movementAngle = Number.isFinite(input.movementAngle) ? input.movementAngle : bodyAngle, castAngle = Number.isFinite(input.castAngle) ? input.castAngle : bodyAngle, retention = clamp(input.actionRetention), separation = Math.abs(delta(movementAngle, bodyAngle));
    if (owner === 'movement')
        return { owner, movementAngle, castAngle, movementAlphaScale: 1, castAlphaScale: 1, singleDirectionalOwner: true, presentationOnly: true };
    const separationScale = separation > 2.2 ? .22 : separation > 1.2 ? .34 : separation > .55 ? .52 : .78, movementAlphaScale = Math.max(.18, separationScale * (1 - retention * .18)), castAlphaScale = reducedMotion ? .82 : 1;
    return { owner, movementAngle: bodyAngle, castAngle: bodyAngle, movementAlphaScale: reducedMotion ? Math.min(.5, movementAlphaScale) : movementAlphaScale, castAlphaScale, singleDirectionalOwner: true, presentationOnly: true };
}
