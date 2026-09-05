export const MYTHIC_SAFE_ZONE_LIFECYCLE_IDENTITY_IDS = ['stable', 'collapse', 'collapsed', 'reform'];
const CELL = { stable: 0, collapse: 1, collapsed: 2, reform: 3 };
const META = {
    stable: { label: 'SAFE STABLE', accent: '#78ffd1' },
    collapse: { label: 'SAFE COLLAPSE', accent: '#ffd36f' },
    collapsed: { label: 'SAFE CLOSED', accent: '#ff6f7f' },
    reform: { label: 'SAFE REFORM', accent: '#7fd9ff' },
};
export const MYTHIC_SAFE_ZONE_LIFECYCLE_IDENTITY_ATLAS = { src: './assets/bosses/mythic-safe-zone-lifecycle-icons.png', columns: 4, rows: 1, cellSize: 96, width: 384, height: 96 };
export function mythicSafeZoneLifecycleIdentityIcon(phase) { const m = META[phase]; return { phase, label: m.label, accent: m.accent, sx: CELL[phase] * 96, sy: 0, sw: 96, sh: 96, safeZoneLabelCompanion: true, maxVisibleIcons: 1, animated: false, motionAmplitude: 0, textFallbackPreserved: true, loadFailureBlocksGameplay: false }; }
export function auditMythicSafeZoneLifecycleIdentityAtlas() { const icons = MYTHIC_SAFE_ZONE_LIFECYCLE_IDENTITY_IDS.map(mythicSafeZoneLifecycleIdentityIcon); const outOfBounds = icons.filter(i => i.sx < 0 || i.sx + i.sw > MYTHIC_SAFE_ZONE_LIFECYCLE_IDENTITY_ATLAS.width || i.sy + i.sh > MYTHIC_SAFE_ZONE_LIFECYCLE_IDENTITY_ATLAS.height).map(i => i.phase); const uniqueCellCount = new Set(icons.map(i => `${i.sx}:${i.sy}`)).size; const coverage = icons.length / 4; return { coverage, uniqueCellCount, outOfBounds, passed: coverage === 1 && uniqueCellCount === 4 && outOfBounds.length === 0 }; }
