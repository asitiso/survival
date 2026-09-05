function fnv(text) { let hash = 2166136261; for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
} return (hash >>> 0).toString(16).padStart(8, '0').toUpperCase(); }
function finite(n) { return Number.isFinite(n) ? Math.round(n * 10) / 10 : 0; }
export function releaseManifest(input) {
    const sourceRevision = (input.sourceRevision || 'unknown').trim() || 'unknown';
    const testCount = Math.max(0, Math.floor(Number.isFinite(input.test.count) ? input.test.count : 0));
    const actionCount = Math.max(0, Math.floor(Number.isFinite(input.release.actionCount) ? input.release.actionCount : 0));
    const issues = [];
    if (!input.test.ok)
        issues.push('tests-failed');
    if (!input.buildOk)
        issues.push('build-failed');
    if (!input.raster.ok)
        issues.push('raster-review-required');
    if (!input.release.ok)
        issues.push('release-gate-failed');
    if (actionCount !== 9)
        issues.push(`action-count:${actionCount}!=9`);
    if (input.release.profileCount !== 5)
        issues.push(`raster-profile-count:${input.release.profileCount}!=5`);
    if (!input.foldable.ok)
        issues.push('foldable-thumb-travel');
    if (input.foldable.reachableActionCount !== 9)
        issues.push(`foldable-actions:${input.foldable.reachableActionCount}!=9`);
    if (!input.foldable.hingeClear)
        issues.push('foldable-hinge-crossing');
    if (input.baselineMutation)
        issues.push('baseline-mutation-enabled');
    if (input.candidateAudit && !input.candidateAudit.ok)
        issues.push(`candidate-audit:${input.candidateAudit.issues.join(',') || 'failed'}`);
    if (input.archiveReproducibility && !input.archiveReproducibility.passed)
        issues.push('archive-reproducibility');
    if (input.archiveProvenance && !input.archiveProvenance.passed)
        issues.push('archive-provenance');
    if (input.packageRuntime && !input.packageRuntime.passed)
        issues.push('package-runtime-smoke');
    if (input.packageRunCycle && !input.packageRunCycle.passed)
        issues.push('package-run-cycle');
    const status = issues.length === 0 ? 'PASS' : 'REVIEW';
    const payload = [sourceRevision, status, testCount, input.buildOk, input.raster.signature, input.release.signature, actionCount, input.release.profileCount, input.foldable.signature, input.foldable.reachableActionCount, finite(input.foldable.maxLeftTravel), finite(input.foldable.maxRightTravel), finite(input.foldable.averageRightTravel), input.foldable.hingeClear, input.baselineMutation, input.candidateAudit?.signature ?? 'legacy-candidate-not-supplied', input.candidateAudit?.summary ?? '', input.archiveReproducibility?.firstSha256 ?? 'legacy-archive-not-supplied', input.archiveReproducibility?.secondSha256 ?? '', input.archiveReproducibility?.firstEntryCount ?? 0, input.archiveReproducibility?.secondEntryCount ?? 0, input.archiveReproducibility?.commentMatch ?? false, input.archiveProvenance?.criticalFileCoverage ?? 0, input.archiveProvenance?.sourceRevision === input.archiveProvenance?.archiveComment, input.archiveProvenance?.dirty ?? false, input.packageRuntime?.pathCoverage ?? 0, input.packageRuntime?.commentMatch ?? false, input.packageRuntime?.httpFailures ?? 0, input.packageRuntime?.processExitErrors ?? 0, input.packageRunCycle?.newRunOk ?? false, input.packageRunCycle?.checkpointOk ?? false, input.packageRunCycle?.resumeOk ?? false, input.packageRunCycle?.elapsedDrift ?? 0, input.packageRunCycle?.endlessStateMatch ?? false, input.packageRunCycle?.commentMatch ?? false, ...issues].join('|');
    const signature = `RM-${fnv(payload)}`;
    const json = {
        schemaVersion: 1, sourceRevision, status, signature,
        evidence: {
            tests: { ok: input.test.ok, count: testCount }, buildOk: input.buildOk,
            raster: { ok: input.raster.ok, signature: input.raster.signature },
            release: { ok: input.release.ok, signature: input.release.signature, actionCount, profileCount: input.release.profileCount },
            foldable: { ok: input.foldable.ok, signature: input.foldable.signature, reachableActionCount: input.foldable.reachableActionCount, maxLeftTravel: finite(input.foldable.maxLeftTravel), maxRightTravel: finite(input.foldable.maxRightTravel), averageRightTravel: finite(input.foldable.averageRightTravel), hingeClear: input.foldable.hingeClear },
            baselineMutation: input.baselineMutation,
            ...(input.candidateAudit ? { candidateAudit: { ...input.candidateAudit, issues: [...input.candidateAudit.issues] } } : {}),
            ...(input.archiveReproducibility ? { archiveReproducibility: { ...input.archiveReproducibility, issues: [...input.archiveReproducibility.issues] } } : {}),
            ...(input.archiveProvenance ? { archiveProvenance: { ...input.archiveProvenance, issues: [...input.archiveProvenance.issues] } } : {}),
            ...(input.packageRuntime ? { packageRuntime: { ...input.packageRuntime, issues: [...input.packageRuntime.issues] } } : {}),
            ...(input.packageRunCycle ? { packageRunCycle: { ...input.packageRunCycle, issues: [...input.packageRunCycle.issues] } } : {}),
        }, issues: [...issues],
    };
    const markdown = [
        '# Arcane Last Stand Release Manifest', '',
        `- Status | ${status}`,
        `- Signature | ${signature}`,
        `- Source revision | ${sourceRevision}`,
        `- Tests | ${input.test.ok ? 'PASS' : 'FAIL'} · ${testCount}`,
        `- Build | ${input.buildOk ? 'PASS' : 'FAIL'}`,
        `- Raster CI | ${input.raster.ok ? 'PASS' : 'REVIEW'} · ${input.raster.signature}`,
        `- Release gate | ${input.release.ok ? 'PASS' : 'REVIEW'} · ${input.release.signature}`,
        `- Action invariant | ${actionCount}/9`,
        `- Foldable thumb travel | ${input.foldable.ok ? 'PASS' : 'REVIEW'} · ${input.foldable.signature}`,
        `- Foldable actions | ${input.foldable.reachableActionCount}/9 · hinge ${input.foldable.hingeClear ? 'clear' : 'crossing'}`,
        `- Thumb travel | left ${finite(input.foldable.maxLeftTravel)} · right max ${finite(input.foldable.maxRightTravel)} · right avg ${finite(input.foldable.averageRightTravel)}`,
        `- Baseline mutation | ${input.baselineMutation ? 'ENABLED' : 'disabled'}`,
        ...(input.candidateAudit ? [`- Candidate balance/performance | ${input.candidateAudit.ok ? 'PASS' : 'REVIEW'} · ${input.candidateAudit.signature}`, ...(input.candidateAudit.summary ? [`- Candidate budgets | ${input.candidateAudit.summary}`] : [])] : []),
        ...(input.archiveReproducibility ? [`- Archive reproducibility | ${input.archiveReproducibility.passed ? 'PASS' : 'REVIEW'} · entries ${input.archiveReproducibility.firstEntryCount}/${input.archiveReproducibility.secondEntryCount} · hash ${input.archiveReproducibility.hashMatch ? 'match' : 'drift'}`] : []),
        ...(input.archiveProvenance ? [`- Archive provenance | ${input.archiveProvenance.passed ? 'PASS' : 'REVIEW'} · critical ${input.archiveProvenance.matchingCriticalFiles}/${input.archiveProvenance.criticalFileCount} · comment ${input.archiveProvenance.sourceRevision === input.archiveProvenance.archiveComment ? 'match' : 'drift'}`] : []),
        ...(input.packageRuntime ? [`- Packaged runtime | ${input.packageRuntime.passed ? 'PASS' : 'REVIEW'} · paths ${input.packageRuntime.okPathCount}/${input.packageRuntime.requiredPathCount} · comment ${input.packageRuntime.commentMatch ? 'match' : 'drift'}`] : []),
        ...(input.packageRunCycle ? [`- Packaged run cycle | ${input.packageRunCycle.passed ? 'PASS' : 'REVIEW'} · new ${input.packageRunCycle.newRunOk ? 'ok' : 'review'} · checkpoint ${input.packageRunCycle.checkpointOk ? 'ok' : 'review'} · resume ${input.packageRunCycle.resumeOk ? 'ok' : 'review'}`] : []),
        ...(issues.length ? ['', '## Issues', ...issues.map((issue) => `- ${issue}`)] : []),
    ].join('\n');
    return { ok: issues.length === 0, status, exitCode: issues.length === 0 ? 0 : 2, signature, sourceRevision, testCount, actionCount, issues, markdown, json };
}
