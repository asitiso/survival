export const FIELD_EVENT_EFFECT_PROFILE_IDENTITY_IDS = ['gold-bounty', 'free-supply', 'mana-tradeoff', 'gold-elite-tradeoff', 'elite-pressure'];
const CELL = { 'gold-bounty': 0, 'free-supply': 1, 'mana-tradeoff': 2, 'gold-elite-tradeoff': 3, 'elite-pressure': 4 };
const META = {
    'gold-bounty': { label: 'GOLD BOUNTY', accent: '#ffd85d' },
    'free-supply': { label: 'FREE SUPPLY', accent: '#75d7ff' },
    'mana-tradeoff': { label: 'CAST FAST / PRESSURE UP', accent: '#b894ff' },
    'gold-elite-tradeoff': { label: 'GOLD ×2 / ELITE UP', accent: '#f3d36b' },
    'elite-pressure': { label: 'ELITE PRESSURE', accent: '#ff7d69' },
};
const EVENT_TO_EFFECT = { goldenGoblin: 'gold-bounty', supplyDrop: 'free-supply', manaStorm: 'mana-tradeoff', goldenNight: 'gold-elite-tradeoff', eliteRush: 'elite-pressure' };
export const FIELD_EVENT_EFFECT_PROFILE_IDENTITY_ATLAS = { src: './assets/ui/field-event-effect-profile-icons.png', columns: 5, rows: 1, cellSize: 96, width: 480, height: 96 };
export function fieldEventEffectProfileIdentityForEvent(id) { return EVENT_TO_EFFECT[id]; }
export function fieldEventEffectProfileIdentityIcon(id) { const meta = META[id]; return { id, label: meta.label, accent: meta.accent, sx: CELL[id] * 96, sy: 0, sw: 96, sh: 96, maxVisibleIcons: 1, animated: false, motionAmplitude: 0, textFallbackPreserved: true, loadFailureBlocksGameplay: false }; }
export function auditFieldEventEffectProfileIdentityAtlas() { const icons = FIELD_EVENT_EFFECT_PROFILE_IDENTITY_IDS.map(fieldEventEffectProfileIdentityIcon); const outOfBounds = icons.filter(icon => icon.sx < 0 || icon.sx + icon.sw > FIELD_EVENT_EFFECT_PROFILE_IDENTITY_ATLAS.width || icon.sy + icon.sh > FIELD_EVENT_EFFECT_PROFILE_IDENTITY_ATLAS.height).map(icon => icon.id); const uniqueCellCount = new Set(icons.map(icon => `${icon.sx}:${icon.sy}`)).size; const coverage = icons.length / 5; return { coverage, uniqueCellCount, outOfBounds, passed: coverage === 1 && uniqueCellCount === 5 && outOfBounds.length === 0 }; }
