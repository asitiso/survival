export const FIELD_EVENT_LIFECYCLE_WORLD_VFX_EVENTS = ['goldenGoblin', 'supplyDrop', 'manaStorm', 'goldenNight', 'eliteRush'];
export const FIELD_EVENT_LIFECYCLE_WORLD_VFX_STATES = ['entrance', 'exit'];
export const FIELD_EVENT_LIFECYCLE_WORLD_VFX_ATLAS = { src: './assets/arena/field-event-lifecycle-world-vfx.png', columns: 5, rows: 2, cellSize: 128, width: 640, height: 256 };
const COL = { goldenGoblin: 0, supplyDrop: 1, manaStorm: 2, goldenNight: 3, eliteRush: 4 };
const ROW = { entrance: 0, exit: 1 };
export function fieldEventLifecycleWorldVfxSprite(eventId, state) { return { sx: COL[eventId] * 128, sy: ROW[state] * 128, sw: 128, sh: 128, presentationOnly: true, loadFailureBlocksGameplay: false }; }
export function auditFieldEventLifecycleWorldVfxAtlas() { const cells = new Set(), outOfBounds = []; for (const eventId of FIELD_EVENT_LIFECYCLE_WORLD_VFX_EVENTS)
    for (const state of FIELD_EVENT_LIFECYCLE_WORLD_VFX_STATES) {
        const r = fieldEventLifecycleWorldVfxSprite(eventId, state);
        cells.add(`${r.sx}:${r.sy}`);
        if (r.sx < 0 || r.sy < 0 || r.sx + r.sw > FIELD_EVENT_LIFECYCLE_WORLD_VFX_ATLAS.width || r.sy + r.sh > FIELD_EVENT_LIFECYCLE_WORLD_VFX_ATLAS.height)
            outOfBounds.push(`${eventId}:${state}`);
    } return { eventCount: 5, stateCount: 2, itemCount: 10, uniqueCellCount: cells.size, outOfBounds, passed: cells.size === 10 && outOfBounds.length === 0 }; }
