export interface ArchiveReproducibilityInput{sourceRevision:string;firstSha256:string;secondSha256:string;firstEntryCount:number;secondEntryCount:number;trackedFileCount:number;firstComment:string;secondComment:string;missingTrackedFiles:number;unexpectedFiles:number;archiveErrors:number;}
export interface ArchiveReproducibilityAudit extends ArchiveReproducibilityInput{passed:boolean;hashMatch:boolean;entryCountMatch:boolean;commentMatch:boolean;issues:string[];}
export function evaluateArchiveReproducibility(input:ArchiveReproducibilityInput):ArchiveReproducibilityAudit{
 const hashMatch=input.firstSha256===input.secondSha256&&input.firstSha256.length===64,entryCountMatch=input.firstEntryCount===input.secondEntryCount,commentMatch=input.firstComment===input.sourceRevision&&input.secondComment===input.sourceRevision,issues:string[]=[];
 if(!hashMatch)issues.push('archive-hash-drift');if(!entryCountMatch)issues.push('archive-entry-drift');if(!commentMatch)issues.push('archive-source-comment');if(input.missingTrackedFiles>0)issues.push('archive-missing-tracked');if(input.unexpectedFiles>0)issues.push('archive-unexpected-files');if(input.archiveErrors>0)issues.push('archive-errors');if(input.trackedFileCount<=0)issues.push('archive-no-tracked-files');
 return{...input,passed:issues.length===0,hashMatch,entryCountMatch,commentMatch,issues};
}
