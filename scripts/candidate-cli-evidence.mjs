export function parseCandidateCliEvidence(stdout){
  const match=String(stdout??'').match(/^CANDIDATE_AUDIT_EVIDENCE (\{.*\})$/m);
  if(!match)return null;
  try{
    const parsed=JSON.parse(match[1]);
    if(typeof parsed?.ok!=='boolean'||typeof parsed?.signature!=='string'||!Array.isArray(parsed?.issues))return null;
    return{ok:parsed.ok,signature:parsed.signature,issues:parsed.issues.map(String)};
  }catch{return null;}
}

function normalizedIssues(issues){return[...new Set((issues??[]).map(String))].sort();}

export function auditCandidateCliConsistency(cliEvidence,internalEvidence){
  const issues=[];
  if(!cliEvidence){
    issues.push('candidate-cli-evidence-missing');
    return{passed:false,issues};
  }
  if(cliEvidence.signature!==internalEvidence.signature)issues.push('candidate-cli-signature-mismatch');
  if(cliEvidence.ok!==internalEvidence.ok)issues.push('candidate-cli-status-mismatch');
  const cliIssues=normalizedIssues(cliEvidence.issues);
  const internalIssues=normalizedIssues(internalEvidence.issues);
  if(JSON.stringify(cliIssues)!==JSON.stringify(internalIssues))issues.push('candidate-cli-issues-mismatch');
  return{passed:issues.length===0,issues};
}
