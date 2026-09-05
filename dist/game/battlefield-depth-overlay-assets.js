export const BATTLEFIELD_DEPTH_OVERLAY_ATLAS = { src: './assets/arena/battlefield-depth-overlays.png', columns: 3, rows: 3, cellWidth: 256, cellHeight: 144, width: 768, height: 432 };
const MAPS = ['ruinedGate', 'frozenFen', 'crystalQuarry'];
const ROW = new Map(MAPS.map((id, i) => [id, i]));
export function battlefieldDepthOverlaySprite(mapId, stage) {
    const row = ROW.get(mapId);
    if (row === undefined)
        throw new Error(`Unknown battlefield depth overlay map: ${mapId}`);
    return { sx: stage * 256, sy: row * 144, sw: 256, sh: 144, mapId, stage, motionAmplitude: stage === 2 ? 6 : stage === 1 ? 4 : 2, presentationOnly: true, blocksGameplay: false };
}
export function auditBattlefieldDepthOverlayAtlas() {
    const seen = new Set(), outOfBounds = [];
    for (const mapId of MAPS)
        for (const stage of [0, 1, 2]) {
            const r = battlefieldDepthOverlaySprite(mapId, stage);
            seen.add(`${r.sx}:${r.sy}`);
            if (r.sx < 0 || r.sy < 0 || r.sx + r.sw > BATTLEFIELD_DEPTH_OVERLAY_ATLAS.width || r.sy + r.sh > BATTLEFIELD_DEPTH_OVERLAY_ATLAS.height)
                outOfBounds.push(`${mapId}:${stage}`);
        }
    return { itemCount: 9, coverage: seen.size / 9, uniqueCellCount: seen.size, outOfBounds, motionAmplitudeMax: 6, presentationOnly: true, blocksGameplay: false, passed: seen.size === 9 && outOfBounds.length === 0 };
}
