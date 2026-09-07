const BASE_SIZE = { regular: 78, specialist: 92, elite: 112, boss: 142 };
const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
export function freezeStatusPresentation(input) {
    const slowTimer = Math.max(0, Number.isFinite(input.slowTimer) ? input.slowTimer : 0);
    const slowFactor = Math.max(.25, Math.min(1, Number.isFinite(input.slowFactor) ? input.slowFactor : 1));
    const visible = slowTimer > 0 && slowFactor < .999;
    const fading = visible && slowTimer <= .32;
    const severity = clamp01((1 - slowFactor) / .75);
    const band = fading ? 'fading' : severity >= .5 ? 'strong' : 'medium';
    const fade = fading ? clamp01(slowTimer / .32) : 1;
    const baseAlpha = band === 'strong' ? .72 : band === 'medium' ? .50 : .36 * fade;
    const flashScale = input.reducedFlash ? .64 : 1;
    const sizeScale = band === 'strong' ? 1 : band === 'medium' ? .86 : .72 + .08 * fade;
    return {
        visible,
        band,
        alpha: visible ? baseAlpha * flashScale : 0,
        sizeScale: visible ? sizeScale : 0,
        baseSize: BASE_SIZE[input.enemyClass],
        pulseAmplitude: visible && band !== 'fading' ? (band === 'strong' ? .10 : .055) : 0,
    };
}
const SOURCE_STYLE = {
    frost: { renderMode: 'freezeAtlas', alphaScale: 1, sizeScale: 1, lineWidth: 2.5, segmentCount: 0, groundOffsetRatio: 0, color: '#9fe8ff' },
    gravity: { renderMode: 'gravityOrbit', alphaScale: .86, sizeScale: .94, lineWidth: 2.2, segmentCount: 4, groundOffsetRatio: 0, color: '#b9a4ff' },
    terrain: { renderMode: 'terrainGround', alphaScale: .70, sizeScale: .92, lineWidth: 2.0, segmentCount: 2, groundOffsetRatio: .58, color: '#8dd8c5' },
    impact: { renderMode: 'impactResistance', alphaScale: .54, sizeScale: .84, lineWidth: 1.8, segmentCount: 2, groundOffsetRatio: 0, color: '#ffd39a' },
    generic: { renderMode: 'genericResistance', alphaScale: .46, sizeScale: .80, lineWidth: 1.5, segmentCount: 2, groundOffsetRatio: 0, color: '#c9d5df' },
};
export function slowSourceCuePresentation(input) {
    const status = freezeStatusPresentation(input), style = SOURCE_STYLE[input.source];
    return { source: input.source, renderMode: style.renderMode, useFreezeAtlas: input.source === 'frost', visible: status.visible, alpha: status.alpha * style.alphaScale, sizeScale: status.sizeScale * style.sizeScale, baseSize: status.baseSize, pulseAmplitude: status.pulseAmplitude * (input.source === 'frost' ? 1 : .55), lineWidth: style.lineWidth, segmentCount: style.segmentCount, groundOffsetRatio: style.groundOffsetRatio, color: style.color };
}
const CLASS_PRIORITY = { regular: 0, specialist: 3, elite: 4, boss: 5 };
export function freezeCrowdBudget(entries, context = {}) {
    const stress = clamp01(context.battlefieldStress ?? 0);
    const fullCueCapacity = stress >= .75 ? 3 : stress >= .4 ? 4 : 6;
    const ranked = [...entries].sort((a, b) => {
        const aScore = (a.currentTarget ? 6 : 0) + CLASS_PRIORITY[a.enemyClass];
        const bScore = (b.currentTarget ? 6 : 0) + CLASS_PRIORITY[b.enemyClass];
        if (aScore !== bScore)
            return bScore - aScore;
        if (a.distanceToHero !== b.distanceToHero)
            return a.distanceToHero - b.distanceToHero;
        return a.id - b.id;
    });
    const fullIds = new Set(ranked.slice(0, fullCueCapacity).map(entry => entry.id));
    const warningScale = context.protectedWarning ? .58 : 1;
    const laneScale = context.safeLaneVisible ? .72 : 1;
    return {
        fullCueCapacity,
        entries: entries.map(entry => {
            const protectedIdentity = Boolean(entry.currentTarget) || entry.enemyClass !== 'regular';
            const fullDetail = fullIds.has(entry.id);
            const baseAlpha = fullDetail ? 1 : protectedIdentity ? .72 : .38;
            const resultScale = entry.resultCueNearby ? .56 : 1;
            const alphaScale = baseAlpha * warningScale * laneScale * resultScale;
            const pulseScale = (fullDetail ? 1 : protectedIdentity ? .48 : .24) * (context.protectedWarning ? .45 : 1) * (context.safeLaneVisible ? .7 : 1) * (entry.resultCueNearby ? .5 : 1);
            return { id: entry.id, protectedIdentity, fullDetail, alphaScale, sizeScale: fullDetail ? 1 : protectedIdentity ? .92 : .82, pulseScale };
        }),
    };
}
export function createFreezeStatusLifecycleState() {
    return { visible: false, alpha: 0, sizeScale: .72, pulseScale: 0, source: 'frost', sourceBlend: 1 };
}
function moveToward(current, target, maxDelta) {
    if (current < target)
        return Math.min(target, current + maxDelta);
    if (current > target)
        return Math.max(target, current - maxDelta);
    return current;
}
export function advanceFreezeStatusLifecycle(previous, input, dt, reducedMotion = false) {
    const safeDt = Math.max(0, Number.isFinite(dt) ? dt : 0);
    const targetAlpha = input.active ? clamp01(input.targetAlpha) : 0;
    const targetSize = Math.max(.55, Math.min(1.2, Number.isFinite(input.targetSizeScale) ? input.targetSizeScale : .72));
    const alphaRate = input.active ? 2.4 : 2.8;
    const sizeRate = input.active ? 1.35 : 1.05;
    const alpha = moveToward(clamp01(previous.alpha), targetAlpha, safeDt * alphaRate);
    const sizeScale = moveToward(Math.max(.55, Math.min(1.2, previous.sizeScale)), targetSize, safeDt * sizeRate);
    const visible = input.active || alpha > .01;
    const source = input.source ?? previous.source;
    const sourceChanged = source !== previous.source;
    const sourceBlendStart = sourceChanged ? Math.min(.38, clamp01(previous.sourceBlend)) : clamp01(previous.sourceBlend);
    const sourceBlend = moveToward(sourceBlendStart, 1, safeDt * (reducedMotion ? 7 : 4.5));
    return { visible, alpha: visible ? alpha : 0, sizeScale, pulseScale: visible && !reducedMotion ? 1 : 0, source, sourceBlend };
}
export function freezeStatusEdgePresentation(input) {
    const margin = Math.max(0, input.margin ?? 12), half = Math.max(1, input.size / 2);
    const clearance = Math.max(0, Math.min(input.x - margin, input.viewportWidth - margin - input.x, input.y - margin, input.viewportHeight - margin - input.y));
    const sizeScale = Math.max(.55, Math.min(1, clearance / half));
    return { sizeScale, offsetX: 0, offsetY: 0 };
}
export function slowDeathUsesFreezeShatter(source) { return source === undefined || source === 'frost'; }
