import { bossSafeResponseCompactAcknowledgement } from './boss-safe-response-compact-acknowledgement.js';
export interface BossSafeResponseCompactAcknowledgementAudit{samples:string[];actionCount:9;presentationOnly:true;gameplayFormulaMutation:false;snapshotSchemaMutation:false;passed:boolean;}
export function runBossSafeResponseCompactAcknowledgementAudit():BossSafeResponseCompactAcknowledgementAudit{
 const samples:string[]=[];let passed=true;
 for(let i=0;i<64;i++){const quality=(['high','medium','low'] as const)[i%3]!;const actionAssistVisible=i%4===0,responseAckVisible=i%5===0;const r=bossSafeResponseCompactAcknowledgement({active:true,quality,actionAssistVisible,responseAckVisible,heroCritical:false,coreCritical:false});const expectedCompact=quality==='low'||actionAssistVisible||responseAckVisible;const ok=r.mode===(expectedCompact?'compact':'full')&&r.showLabel===!expectedCompact&&r.claimsGlobalSafety===false;passed&&=ok;samples.push(`${i}:${quality}:${r.mode}:${r.showLabel?1:0}`);}
 return{samples,actionCount:9,presentationOnly:true,gameplayFormulaMutation:false,snapshotSchemaMutation:false,passed};
}
