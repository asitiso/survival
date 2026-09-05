export interface PackageRuntimeSmokeInput{sourceRevision:string;archiveComment:string;requiredPathCount:number;okPathCount:number;httpFailures:number;processExitErrors:number;}
export interface PackageRuntimeSmokeAudit extends PackageRuntimeSmokeInput{pathCoverage:number;commentMatch:boolean;passed:boolean;issues:string[];}
export function evaluatePackageRuntimeSmoke(input:PackageRuntimeSmokeInput):PackageRuntimeSmokeAudit{
  const pathCoverage=input.requiredPathCount>0?input.okPathCount/input.requiredPathCount:0;
  const commentMatch=input.archiveComment===input.sourceRevision&&input.sourceRevision.length>0;
  const issues:string[]=[];
  if(pathCoverage!==1)issues.push('package-http-paths');
  if(input.httpFailures>0)issues.push('package-http-failures');
  if(input.processExitErrors>0)issues.push('package-server-exit');
  if(!commentMatch)issues.push('package-source-comment');
  return{...input,pathCoverage,commentMatch,passed:issues.length===0,issues};
}
