const { releaseCandidateAudit }=await import('../dist/game/release-candidate-audit.js');
const audit=releaseCandidateAudit();
console.log(audit.markdown);
console.log(`CANDIDATE_AUDIT_EVIDENCE ${JSON.stringify({ok:audit.ok,signature:audit.signature,issues:audit.issues})}`);
process.exitCode=audit.exitCode;
