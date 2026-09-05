export const OBJECTIVE_ACTIVATION_MATERIALIZATION_VFX_OBJECTIVES = ['riftSeal', 'beaconDefense', 'cursedAltar'];
export const OBJECTIVE_ACTIVATION_MATERIALIZATION_VFX_STATES = ['materialize', 'locator'];
export const OBJECTIVE_ACTIVATION_MATERIALIZATION_VFX_ATLAS = { src: './assets/arena/objective-activation-materialization-vfx.png', columns: 3, rows: 2, cellSize: 128, width: 384, height: 256 };
const COL = { riftSeal: 0, beaconDefense: 1, cursedAltar: 2 };
const ROW = { materialize: 0, locator: 1 };
export function objectiveActivationMaterializationVfxSprite(objectiveId, state) { return { sx: COL[objectiveId] * 128, sy: ROW[state] * 128, sw: 128, sh: 128, presentationOnly: true, loadFailureBlocksGameplay: false }; }
export function auditObjectiveActivationMaterializationVfxAtlas() { const cells = new Set(), outOfBounds = []; for (const objectiveId of OBJECTIVE_ACTIVATION_MATERIALIZATION_VFX_OBJECTIVES)
    for (const state of OBJECTIVE_ACTIVATION_MATERIALIZATION_VFX_STATES) {
        const r = objectiveActivationMaterializationVfxSprite(objectiveId, state);
        cells.add(`${r.sx}:${r.sy}`);
        if (r.sx < 0 || r.sy < 0 || r.sx + r.sw > OBJECTIVE_ACTIVATION_MATERIALIZATION_VFX_ATLAS.width || r.sy + r.sh > OBJECTIVE_ACTIVATION_MATERIALIZATION_VFX_ATLAS.height)
            outOfBounds.push(`${objectiveId}:${state}`);
    } return { objectiveCount: 3, stateCount: 2, itemCount: 6, uniqueCellCount: cells.size, outOfBounds, passed: cells.size === 6 && outOfBounds.length === 0 }; }
