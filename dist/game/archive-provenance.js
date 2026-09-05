export function evaluateArchiveProvenance(input) { const issues = []; if (input.sourceRevision !== input.archiveComment)
    issues.push('revision-mismatch'); if (input.criticalFileCount <= 0 || input.matchingCriticalFiles !== input.criticalFileCount)
    issues.push('critical-file-drift'); if (input.dirty)
    issues.push('source-dirty'); if (input.archiveErrors > 0)
    issues.push('archive-errors'); const criticalFileCoverage = input.criticalFileCount > 0 ? input.matchingCriticalFiles / input.criticalFileCount : 0; return { ...input, criticalFileCoverage, passed: issues.length === 0, issues }; }
