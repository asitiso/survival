import { ACTION_BUTTONS, LOGICAL_HEIGHT, LOGICAL_WIDTH } from './config.js';
import { landscapeSafeAreaProfile } from './landscape-safe-area.js';
import { visualRegressionProbe } from './visual-regression-probe.js';
function basePrimitives(safe) {
    return [
        { kind: 'rect', role: 'critical-hud', id: 'hero-hud', x: safe.heroPanel.x, y: safe.heroPanel.y, width: safe.heroPanel.width, height: safe.heroPanel.height },
        { kind: 'rect', role: 'critical-hud', id: 'status-hud', x: safe.statusPanel.x, y: safe.statusPanel.y, width: safe.statusPanel.width, height: safe.statusPanel.height },
        { kind: 'rect', role: 'critical-hud', id: 'core-hud', x: 1125, y: 18, width: 452, height: 62 },
        ...ACTION_BUTTONS.map((b) => ({ kind: 'circle', role: 'interactive', id: `action-${b.id}`, x: b.x, y: b.y, radius: b.radius })),
    ];
}
function statePrimitives(id, safe) {
    const labelX = safe.headerX + 8, labelWidth = Math.max(40, safe.headerWidth - 16);
    if (id === 'opening')
        return [{ kind: 'text', role: 'label', id: 'opening-label', x: labelX, y: 88, width: labelWidth, height: 24, text: 'FIRST CONTACT' }];
    if (id === 'boss')
        return [{ kind: 'circle', role: 'telegraph', id: 'boss-ring', x: 800, y: 430, radius: 170 }, { kind: 'text', role: 'label', id: 'boss-label', x: labelX, y: 88, width: labelWidth, height: 24, text: 'BOSS' }];
    if (id === 'mythic')
        return [{ kind: 'circle', role: 'telegraph', id: 'mythic-ring', x: 800, y: 430, radius: 230 }, { kind: 'text', role: 'label', id: 'mythic-label', x: labelX, y: 88, width: labelWidth, height: 24, text: 'MYTHIC' }];
    if (id === 'final-flow')
        return [{ kind: 'circle', role: 'decorative', id: 'flow-aura', x: 800, y: 520, radius: 54 }, { kind: 'text', role: 'label', id: 'flow-label', x: labelX, y: 88, width: labelWidth, height: 24, text: 'FLOW ×5' }];
    return [{ kind: 'text', role: 'label', id: 'long-run-label', x: labelX, y: 88, width: labelWidth, height: 24, text: 'LONG RUN' }];
}
export function renderContract(width, height) {
    const probe = visualRegressionProbe(width, height), safe = landscapeSafeAreaProfile(width, height);
    return { viewport: probe.viewport, safeArea: safe, actionCount: ACTION_BUTTONS.length, frames: probe.states.map((state) => ({ id: state.id, primitives: [...basePrimitives(safe), ...statePrimitives(state.id, safe)] })) };
}
function fnv(text) { let hash = 2166136261; for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
} return (hash >>> 0).toString(16).padStart(8, '0').toUpperCase(); }
export function renderContractSignature(contract) {
    const data = [contract.viewport.width, contract.viewport.height, contract.safeArea.aspectClass, contract.actionCount, ...contract.frames.flatMap((frame) => [frame.id, ...frame.primitives.flatMap((p) => p.kind === 'circle' ? [p.id, p.kind, p.role, p.x, p.y, p.radius] : [p.id, p.kind, p.role, p.x, p.y, p.width, p.height, p.kind === 'text' ? p.text : ''])])].join('|');
    return `RC-${fnv(data)}`;
}
function outside(p) {
    if (p.kind === 'circle')
        return p.x - p.radius < 0 || p.y - p.radius < 0 || p.x + p.radius > LOGICAL_WIDTH || p.y + p.radius > LOGICAL_HEIGHT;
    return p.x < 0 || p.y < 0 || p.x + p.width > LOGICAL_WIDTH || p.y + p.height > LOGICAL_HEIGHT;
}
function intersectsRect(p, r) {
    if (p.kind === 'circle') {
        const nx = Math.max(r.x, Math.min(p.x, r.x + r.width)), ny = Math.max(r.y, Math.min(p.y, r.y + r.height));
        return Math.hypot(p.x - nx, p.y - ny) < p.radius;
    }
    return p.x < r.x + r.width && p.x + p.width > r.x && p.y < r.y + r.height && p.y + p.height > r.y;
}
export function auditRenderContract(contract) {
    const issues = [];
    let primitiveCount = 0;
    if (contract.actionCount !== 9)
        issues.push(`action-count:${contract.actionCount}`);
    const required = ['opening', 'boss', 'mythic', 'final-flow', 'long-run'];
    for (const id of required)
        if (!contract.frames.some((f) => f.id === id))
            issues.push(`missing-frame:${id}`);
    for (const frame of contract.frames) {
        const actionIds = new Set(frame.primitives.filter((p) => p.role === 'interactive' && p.id.startsWith('action-')).map((p) => p.id));
        if (actionIds.size !== 9)
            issues.push(`frame-action-count:${frame.id}:${actionIds.size}`);
        for (const p of frame.primitives) {
            primitiveCount += 1;
            if (outside(p))
                issues.push(`out-of-bounds:${frame.id}:${p.id}`);
            const hinge = contract.safeArea.hingeExclusion;
            if (hinge && (p.role === 'interactive' || p.role === 'critical-hud') && intersectsRect(p, hinge))
                issues.push(`hinge-overlap:${frame.id}:${p.id}`);
        }
    }
    return { ok: issues.length === 0, issues, primitiveCount };
}
