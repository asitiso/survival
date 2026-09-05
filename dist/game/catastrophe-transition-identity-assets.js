export const CATASTROPHE_TRANSITION_IDENTITY_IDS = ['helpful', 'harmful', 'mixed', 'transition'];
const CELL = { helpful: [0, 0], harmful: [1, 0], mixed: [0, 1], transition: [1, 1] };
const META = {
    helpful: { label: '전환 이득', accent: '#65e6a5' }, harmful: { label: '전환 위험', accent: '#ff6f7f' }, mixed: { label: '혼합 전환', accent: '#ffd46a' }, transition: { label: '재앙 전환', accent: '#8cc8ff' },
};
export const CATASTROPHE_TRANSITION_IDENTITY_ATLAS = { src: './assets/ui/catastrophe-transition-icons.png', columns: 2, rows: 2, cellSize: 96, width: 192, height: 192 };
export function catastropheTransitionIdentityIcon(id) { const [c, r] = CELL[id], m = META[id]; return { id, label: m.label, accent: m.accent, sx: c * 96, sy: r * 96, sw: 96, sh: 96, animated: false, motionAmplitude: 0, textFallbackPreserved: true, loadFailureBlocksGameplay: false }; }
export function auditCatastropheTransitionIdentityAtlas() { const icons = CATASTROPHE_TRANSITION_IDENTITY_IDS.map(catastropheTransitionIdentityIcon), outOfBounds = icons.filter(i => i.sx < 0 || i.sy < 0 || i.sx + i.sw > CATASTROPHE_TRANSITION_IDENTITY_ATLAS.width || i.sy + i.sh > CATASTROPHE_TRANSITION_IDENTITY_ATLAS.height).map(i => i.id), uniqueCellCount = new Set(icons.map(i => `${i.sx}:${i.sy}`)).size, coverage = icons.length / CATASTROPHE_TRANSITION_IDENTITY_IDS.length; return { coverage, uniqueCellCount, outOfBounds, passed: coverage === 1 && uniqueCellCount === 4 && outOfBounds.length === 0 }; }
