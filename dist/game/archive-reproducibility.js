export function evaluateArchiveReproducibility(input) {
    const hashMatch = input.firstSha256 === input.secondSha256 && input.firstSha256.length === 64, entryCountMatch = input.firstEntryCount === input.secondEntryCount, commentMatch = input.firstComment === input.sourceRevision && input.secondComment === input.sourceRevision, issues = [];
    if (!hashMatch)
        issues.push('archive-hash-drift');
    if (!entryCountMatch)
        issues.push('archive-entry-drift');
    if (!commentMatch)
        issues.push('archive-source-comment');
    if (input.missingTrackedFiles > 0)
        issues.push('archive-missing-tracked');
    if (input.unexpectedFiles > 0)
        issues.push('archive-unexpected-files');
    if (input.archiveErrors > 0)
        issues.push('archive-errors');
    if (input.trackedFileCount <= 0)
        issues.push('archive-no-tracked-files');
    return { ...input, passed: issues.length === 0, hashMatch, entryCountMatch, commentMatch, issues };
}
