import { renderContract } from './render-contract.js';
import { DEFAULT_RASTER_BASELINE_SPECS } from './render-raster-baseline.js';
import { rasterContractSignature, rasterSimilarity, rasterizeRenderContract } from './render-raster-contract.js';
function fnv(text) { let hash = 2166136261; for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
} return (hash >>> 0).toString(16).padStart(8, '0').toUpperCase(); }
function thresholds(input) { return { minSimilarity: Math.max(.5, Math.min(1, input?.minSimilarity ?? .985)), minCriticalSimilarity: Math.max(.5, Math.min(1, input?.minCriticalSimilarity ?? .995)) }; }
function compareCells(baseline, current) {
    const currentById = new Map(current.frames.map((frame) => [frame.id, frame]));
    let changed = 0, criticalChanged = 0, criticalSame = 0, criticalTotal = 0;
    for (const baseFrame of baseline.frames) {
        const currentFrame = currentById.get(baseFrame.id);
        const n = Math.max(baseFrame.cells.length, currentFrame?.cells.length ?? 0);
        for (let i = 0; i < n; i++) {
            const a = baseFrame.cells[i] ?? 0, b = currentFrame?.cells[i] ?? 0;
            if (a !== b)
                changed += 1;
            const weight = Math.max(a, b);
            if (weight >= 4) {
                criticalTotal += weight;
                criticalSame += Math.max(0, weight - Math.abs(a - b));
                if (a !== b)
                    criticalChanged += 1;
            }
        }
    }
    return { changed, criticalChanged, criticalSimilarity: criticalTotal <= 0 ? 1 : Math.max(0, Math.min(1, criticalSame / criticalTotal)) };
}
function tokenFor(id, baselineSignature, currentSignature, changedCells, criticalChangedCells) {
    return `RB-${fnv([id, baselineSignature, currentSignature, changedCells, criticalChangedCells].join('|'))}`;
}
export function rasterBaselineChangeReport(id, baseline, current, input) {
    const t = thresholds(input), baselineSignature = rasterContractSignature(baseline), currentSignature = rasterContractSignature(current);
    const similarity = rasterSimilarity(baseline, current), cells = compareCells(baseline, current), issues = [];
    if (similarity < t.minSimilarity)
        issues.push(`similarity:${similarity.toFixed(6)}<${t.minSimilarity.toFixed(6)}`);
    if (cells.criticalSimilarity < t.minCriticalSimilarity)
        issues.push(`critical-similarity:${cells.criticalSimilarity.toFixed(6)}<${t.minCriticalSimilarity.toFixed(6)}`);
    if (currentSignature !== baselineSignature && issues.length === 0)
        issues.push(`signature-change:${baselineSignature}->${currentSignature}`);
    const status = currentSignature === baselineSignature ? 'unchanged' : 'review-required';
    return { id, status, baselineSignature, currentSignature, similarity, criticalSimilarity: cells.criticalSimilarity, changedCells: cells.changed, criticalChangedCells: cells.criticalChanged, thresholds: t, approvalToken: tokenFor(id, baselineSignature, currentSignature, cells.changed, cells.criticalChanged), issues };
}
export function approveRasterBaselineChange(report, token) {
    const approved = report.status === 'review-required' && token === report.approvalToken;
    return { approved, id: report.id, signature: approved ? report.currentSignature : report.baselineSignature, token: report.approvalToken };
}
export function defaultRasterBaselineReport() {
    const entries = DEFAULT_RASTER_BASELINE_SPECS.map((spec) => {
        const currentSignature = rasterContractSignature(rasterizeRenderContract(renderContract(spec.width, spec.height)));
        const status = currentSignature === spec.signature ? 'unchanged' : 'review-required';
        return { id: spec.id, status, expectedSignature: spec.signature, currentSignature, approvalToken: `RB-${fnv([spec.id, spec.signature, currentSignature].join('|'))}` };
    });
    const issues = entries.filter((entry) => entry.status === 'review-required').map((entry) => `baseline-review:${entry.id}:${entry.expectedSignature}->${entry.currentSignature}:${entry.approvalToken}`);
    return { ok: issues.length === 0, issues, entries };
}
