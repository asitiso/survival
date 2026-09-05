export const HERO_MOTION_RENDER_ATLAS = {
    src: './assets/heroes/hero-motion-render-overlays.png',
    columns: 4,
    rows: 3,
    cellWidth: 256,
    cellHeight: 256,
    width: 1024,
    height: 768,
};
const COLUMN_BY_HERO = {
    arkan: 0,
    seria: 1,
    kain: 2,
    edric: 3,
};
const ROW_BY_LAYER = {
    idle: 0,
    move: 1,
    crest: 2,
};
const SCALE_BY_LAYER = {
    idle: 6.15,
    move: 6.85,
    crest: 6.25,
};
const ALPHA_BY_LAYER = {
    idle: 0.34,
    move: 0.44,
    crest: 0.28,
};
export function heroMotionRenderSprite(heroId, layer) {
    const column = COLUMN_BY_HERO[heroId];
    const row = ROW_BY_LAYER[layer];
    return {
        sx: column * HERO_MOTION_RENDER_ATLAS.cellWidth,
        sy: row * HERO_MOTION_RENDER_ATLAS.cellHeight,
        sw: HERO_MOTION_RENDER_ATLAS.cellWidth,
        sh: HERO_MOTION_RENDER_ATLAS.cellHeight,
        heroId,
        layer,
    };
}
export function heroMotionRenderPresentation(layer, radius, atlasReady, emphasis = 0) {
    const safeRadius = Math.max(18, Math.min(28, Number.isFinite(radius) ? radius : 23));
    const normalizedEmphasis = Math.max(0, Math.min(1, emphasis));
    return {
        visible: atlasReady,
        size: Math.round(safeRadius * SCALE_BY_LAYER[layer] * (1 + normalizedEmphasis * (layer === 'move' ? 0.08 : 0.04))),
        alpha: Math.min(0.72, ALPHA_BY_LAYER[layer] + normalizedEmphasis * (layer === 'crest' ? 0.18 : 0.12)),
        motionAmplitude: layer === 'move' ? 8 : layer === 'idle' ? 4 : 3,
        layer,
    };
}
export function auditHeroMotionRenderAtlas(heroIds) {
    const layers = ['idle', 'move', 'crest'];
    const cells = new Set();
    const outOfBounds = [];
    for (const heroId of heroIds) {
        for (const layer of layers) {
            const rect = heroMotionRenderSprite(heroId, layer);
            cells.add(`${rect.sx}:${rect.sy}`);
            if (rect.sx < 0 ||
                rect.sy < 0 ||
                rect.sx + rect.sw > HERO_MOTION_RENDER_ATLAS.width ||
                rect.sy + rect.sh > HERO_MOTION_RENDER_ATLAS.height) {
                outOfBounds.push(`${heroId}:${layer}`);
            }
        }
    }
    const itemCount = heroIds.length * layers.length;
    return {
        itemCount,
        coverage: itemCount === 0 ? 1 : cells.size / itemCount,
        uniqueCellCount: cells.size,
        outOfBounds,
        heroes: [...heroIds],
        layers,
        passed: cells.size === itemCount && outOfBounds.length === 0,
    };
}
