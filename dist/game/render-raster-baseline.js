import { renderContract } from './render-contract.js';
import { rasterContractSignature, rasterSimilarity, rasterizeRenderContract } from './render-raster-contract.js';
function normalizeThresholds(input) {
    const minSimilarity = Math.max(.5, Math.min(1, input?.minSimilarity ?? .985));
    const minCriticalSimilarity = Math.max(.5, Math.min(1, input?.minCriticalSimilarity ?? .995));
    return { minSimilarity, minCriticalSimilarity };
}
function cloneRaster(raster) {
    return { viewport: { ...raster.viewport }, frames: raster.frames.map((frame) => ({ ...frame, cells: [...frame.cells] })) };
}
function criticalSimilarity(a, b) {
    const byId = new Map(b.frames.map((frame) => [frame.id, frame]));
    let same = 0, total = 0;
    for (const fa of a.frames) {
        const fb = byId.get(fa.id);
        if (!fb)
            continue;
        const n = Math.max(fa.cells.length, fb.cells.length);
        for (let i = 0; i < n; i++) {
            const av = fa.cells[i] ?? 0, bv = fb.cells[i] ?? 0, weight = Math.max(av, bv);
            if (weight < 4)
                continue;
            total += weight;
            same += Math.max(0, weight - Math.abs(av - bv));
        }
    }
    return total <= 0 ? 1 : Math.max(0, Math.min(1, same / total));
}
export function captureRasterBaseline(id, raster, thresholds) {
    const reference = cloneRaster(raster);
    return { id: id.trim() || 'baseline', signature: rasterContractSignature(reference), reference, thresholds: normalizeThresholds(thresholds) };
}
export function auditRasterBaseline(current, baseline) {
    const similarity = rasterSimilarity(current, baseline.reference);
    const critical = criticalSimilarity(current, baseline.reference);
    const currentSignature = rasterContractSignature(current), issues = [];
    if (similarity < baseline.thresholds.minSimilarity)
        issues.push(`similarity:${similarity.toFixed(6)}<${baseline.thresholds.minSimilarity.toFixed(6)}`);
    if (critical < baseline.thresholds.minCriticalSimilarity)
        issues.push(`critical-similarity:${critical.toFixed(6)}<${baseline.thresholds.minCriticalSimilarity.toFixed(6)}`);
    return { ok: issues.length === 0, similarity, criticalSimilarity: critical, currentSignature, baselineSignature: baseline.signature, issues };
}
export const DEFAULT_RASTER_BASELINE_SPECS = [
    { id: '16:9', width: 1600, height: 900, signature: 'RR-FE2C6B74', minSimilarity: .985, minCriticalSimilarity: .995 },
    { id: '20:9', width: 2400, height: 1080, signature: 'RR-0937F125', minSimilarity: .985, minCriticalSimilarity: .995 },
    { id: '4:3', width: 1200, height: 900, signature: 'RR-4C84B218', minSimilarity: .985, minCriticalSimilarity: .995 },
    { id: 'foldable', width: 2208, height: 1840, signature: 'RR-023FFC4B', minSimilarity: .985, minCriticalSimilarity: .995 },
    { id: '32:9', width: 3840, height: 1080, signature: 'RR-737044D6', minSimilarity: .985, minCriticalSimilarity: .995 },
];
export function auditDefaultRasterBaselines() {
    const entries = DEFAULT_RASTER_BASELINE_SPECS.map((spec) => {
        const actual = rasterContractSignature(rasterizeRenderContract(renderContract(spec.width, spec.height)));
        return { id: spec.id, ok: actual === spec.signature, expected: spec.signature, actual };
    });
    const issues = entries.filter((entry) => !entry.ok).map((entry) => `baseline-signature:${entry.id}:${entry.actual}!=${entry.expected}`);
    return { ok: issues.length === 0, issues, entries };
}
