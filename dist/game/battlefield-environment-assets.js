export const BATTLEFIELD_ENVIRONMENT_ATLAS = {
    src: './assets/arena/battlefield-environments.png',
    columns: 3,
    rows: 3,
    cellWidth: 256,
    cellHeight: 144,
    width: 768,
    height: 432,
};
export const BATTLEFIELD_ENVIRONMENT_MAP_IDS = ['ruinedGate', 'frozenFen', 'crystalQuarry'];
const MAP_ROW = new Map(BATTLEFIELD_ENVIRONMENT_MAP_IDS.map((id, index) => [id, index]));
const pct = (n, total) => total <= 1 ? 0 : (n / (total - 1)) * 100;
const TERRAIN_MATERIAL = {
    ruinedGate: { presentationOnly: true, wallFill: '#34424a', wallHighlight: 'rgba(214,226,222,.08)', poolCenter: 'rgba(87,132,136,.26)', poolEdge: 'rgba(38,73,78,.08)', poolStroke: 'rgba(137,190,191,.23)', crystalInactive: '#66706f' },
    frozenFen: { presentationOnly: true, wallFill: '#2d4755', wallHighlight: 'rgba(219,248,255,.10)', poolCenter: 'rgba(104,188,211,.28)', poolEdge: 'rgba(44,103,119,.09)', poolStroke: 'rgba(162,231,245,.28)', crystalInactive: '#667985' },
    crystalQuarry: { presentationOnly: true, wallFill: '#3c3650', wallHighlight: 'rgba(229,216,255,.09)', poolCenter: 'rgba(129,104,174,.25)', poolEdge: 'rgba(67,49,105,.08)', poolStroke: 'rgba(190,169,235,.25)', crystalInactive: '#756d83' },
};
export function battlefieldEnvironmentSprite(mapId, stage) {
    const row = MAP_ROW.get(mapId);
    if (row === undefined)
        throw new Error(`Unknown battlefield environment map: ${mapId}`);
    const column = stage;
    return {
        mapId, stage, atlasSrc: BATTLEFIELD_ENVIRONMENT_ATLAS.src,
        backgroundSize: '300% 300%', backgroundPosition: `${pct(column, 3)}% ${pct(row, 3)}%`,
        sx: column * BATTLEFIELD_ENVIRONMENT_ATLAS.cellWidth,
        sy: row * BATTLEFIELD_ENVIRONMENT_ATLAS.cellHeight,
        sw: BATTLEFIELD_ENVIRONMENT_ATLAS.cellWidth,
        sh: BATTLEFIELD_ENVIRONMENT_ATLAS.cellHeight,
        animated: false, motionAmplitude: 0, textFallbackPreserved: true, loadFailureBlocksGameplay: false,
    };
}
export function battlefieldEnvironmentIconStyle(mapId, stage) {
    const sprite = battlefieldEnvironmentSprite(mapId, stage);
    return `--battlefield-image:url('${sprite.atlasSrc}');--battlefield-bg-size:${sprite.backgroundSize};--battlefield-bg-position:${sprite.backgroundPosition}`;
}
export function battlefieldTerrainMaterial(mapId) { return TERRAIN_MATERIAL[mapId]; }
export function auditBattlefieldEnvironmentAtlas() {
    const cells = new Set();
    const outOfBounds = [];
    for (const mapId of BATTLEFIELD_ENVIRONMENT_MAP_IDS) {
        for (const stage of [0, 1, 2]) {
            const sprite = battlefieldEnvironmentSprite(mapId, stage);
            cells.add(`${sprite.sx}:${sprite.sy}`);
            if (sprite.sx < 0 || sprite.sy < 0 || sprite.sx + sprite.sw > BATTLEFIELD_ENVIRONMENT_ATLAS.width || sprite.sy + sprite.sh > BATTLEFIELD_ENVIRONMENT_ATLAS.height)
                outOfBounds.push(`${mapId}:${stage}`);
        }
    }
    const itemCount = BATTLEFIELD_ENVIRONMENT_MAP_IDS.length * 3;
    return { itemCount, coverage: itemCount === 9 ? 1 : itemCount / 9, uniqueCellCount: cells.size, outOfBounds, assetSrc: BATTLEFIELD_ENVIRONMENT_ATLAS.src, passed: itemCount === 9 && cells.size === 9 && outOfBounds.length === 0 };
}
