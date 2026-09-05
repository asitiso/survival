import { catastropheAt, catastropheModifiers } from '../domain/catastrophe.js';
const SAMPLE_TIMES = { goldenNight: 1200, frenzy: 1380, arcaneSurge: 1560, redMoon: 1740, guardianGrace: 1920 };
const METRICS = [
    { id: 'gold', label: '골드', key: 'goldMultiplier', favorable: 'up' }, { id: 'enemy-speed', label: '적속', key: 'enemySpeedMultiplier', favorable: 'down' }, { id: 'cooldown', label: '쿨', key: 'cooldownMultiplier', favorable: 'down' }, { id: 'spawn-pressure', label: '밀도', key: 'spawnPressureMultiplier', favorable: 'down' }, { id: 'elite-pressure', label: '정예간격', key: 'eliteIntervalMultiplier', favorable: 'up' }, { id: 'core-damage', label: '핵피해', key: 'coreDamageMultiplier', favorable: 'down' },
];
function catastropheForId(id) { return catastropheAt(SAMPLE_TIMES[id]); }
function round(v, d = 3) { const p = 10 ** d; return Math.round((v + Number.EPSILON) * p) / p; }
export function projectCatastropheTransition(from, to) { const before = catastropheModifiers(from), after = catastropheModifiers(to), changes = []; for (const m of METRICS) {
    const b = before[m.key], a = after[m.key];
    if (Math.abs(a - b) < 1e-9)
        continue;
    const pct = round(((a / b) - 1) * 100, 1), helpful = m.favorable === 'up' ? a > b : a < b;
    changes.push({ id: m.id, label: m.label, before: round(b), after: round(a), deltaPercent: pct, outcome: helpful ? 'helpful' : 'harmful', salience: Math.abs(pct) });
} changes.sort((a, b) => b.salience - a.salience || a.id.localeCompare(b.id)); const hasHelpful = changes.some(c => c.outcome === 'helpful'), hasHarmful = changes.some(c => c.outcome === 'harmful'), status = hasHelpful && hasHarmful ? 'mixed' : hasHelpful ? 'helpful' : 'harmful'; return { from, to, status, changes, primaryChanges: changes.slice(0, 2) }; }
export function projectCatastropheTransitionByIds(fromId, toId) { return projectCatastropheTransition(fromId ? catastropheForId(fromId) : null, catastropheForId(toId)); }
export function projectCatastropheTransitionForecast(secondsInput) { const seconds = Math.max(0, Number.isFinite(secondsInput) ? secondsInput : 0), current = catastropheAt(seconds); let nextAt; if (seconds < 1200)
    nextAt = 1200;
else
    nextAt = 1200 + (Math.floor((seconds - 1200) / 180) + 1) * 180; const next = catastropheAt(nextAt); const secondsToNext = Math.max(0, Math.ceil(nextAt - seconds)), base = projectCatastropheTransition(current, next); return { ...base, current, next, secondsToNext, visible: secondsToNext > 0 && secondsToNext <= 60 }; }
function signed(p) { return `${p > 0 ? '+' : ''}${Math.round(p)}%`; }
export function catastropheTransitionHint(projection, maxEffects = 2) { return projection.primaryChanges.slice(0, Math.max(0, maxEffects)).map(c => `${c.label} ${signed(c.deltaPercent)}`).join(' · '); }
export function catastropheTransitionForecastLabel(projection) { return `전환 ${projection.secondsToNext}s`; }
