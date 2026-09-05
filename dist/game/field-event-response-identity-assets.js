export const FIELD_EVENT_RESPONSE_IDENTITY_IDS = ['chase', 'retrieve', 'overcast', 'harvest', 'burst-control'];
const CELL = { 'chase': 0, 'retrieve': 1, 'overcast': 2, 'harvest': 3, 'burst-control': 4 };
const META = {
    chase: { label: 'CHASE', accent: '#ffd85d' },
    retrieve: { label: 'RETRIEVE', accent: '#75d7ff' },
    overcast: { label: 'OVERCAST', accent: '#b894ff' },
    harvest: { label: 'HARVEST', accent: '#f3d36b' },
    'burst-control': { label: 'BURST CONTROL', accent: '#ff7d69' },
};
const EVENT_TO_RESPONSE = { goldenGoblin: 'chase', supplyDrop: 'retrieve', manaStorm: 'overcast', goldenNight: 'harvest', eliteRush: 'burst-control' };
export const FIELD_EVENT_RESPONSE_IDENTITY_ATLAS = { src: './assets/ui/field-event-response-icons.png', columns: 5, rows: 1, cellSize: 96, width: 480, height: 96 };
export function fieldEventResponseIdentityForEvent(id) { return EVENT_TO_RESPONSE[id]; }
export function fieldEventResponseIdentityIcon(id) { const meta = META[id]; return { id, label: meta.label, accent: meta.accent, sx: CELL[id] * 96, sy: 0, sw: 96, sh: 96, maxVisibleIcons: 1, animated: false, motionAmplitude: 0, textFallbackPreserved: true, loadFailureBlocksGameplay: false }; }
export function auditFieldEventResponseIdentityAtlas() { const icons = FIELD_EVENT_RESPONSE_IDENTITY_IDS.map(fieldEventResponseIdentityIcon); const outOfBounds = icons.filter(icon => icon.sx < 0 || icon.sx + icon.sw > FIELD_EVENT_RESPONSE_IDENTITY_ATLAS.width || icon.sy + icon.sh > FIELD_EVENT_RESPONSE_IDENTITY_ATLAS.height).map(icon => icon.id); const uniqueCellCount = new Set(icons.map(icon => `${icon.sx}:${icon.sy}`)).size; const coverage = icons.length / 5; return { coverage, uniqueCellCount, outOfBounds, passed: coverage === 1 && uniqueCellCount === 5 && outOfBounds.length === 0 }; }
