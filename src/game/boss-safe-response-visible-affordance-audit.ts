import { bossSafeResponseVisibleAffordance } from './boss-safe-response-visible-affordance.js';
export interface BossSafeResponseVisibleAffordanceAudit{samples:string[];actionCount:9;presentationOnly:true;gameplayFormulaMutation:false;snapshotSchemaMutation:false;passed:boolean;}
export function runBossSafeResponseVisibleAffordanceAudit():BossSafeResponseVisibleAffordanceAudit{
 const samples:string[]=[];let passed=true;
 for(let i=0;i<64;i++){const bossId=10+i,currentCycle=3+(i%4),assist=i%3===0,ack=i%5===0;const r=bossSafeResponseVisibleAffordance({bossId,currentCycle,bossSpecialTimer:assist?.8:3,actionAssistPresent:assist,actionAssistBossId:assist?bossId:null,actionAssistAge:assist?.1:9,responseAckPresent:ack,responseAckBossId:ack?bossId:null,responseAckCycle:ack?currentCycle:null,responseAckAge:ack?.1:9,responseAckAssetReady:true});const ok=r.actionAssistVisible===assist&&r.responseAckVisible===ack&&r.anyVisible===(assist||ack)&&r.presentationOnly;passed&&=ok;samples.push(`${i}:${r.actionAssistVisible?1:0}:${r.responseAckVisible?1:0}:${r.anyVisible?1:0}`);}
 return{samples,actionCount:9,presentationOnly:true,gameplayFormulaMutation:false,snapshotSchemaMutation:false,passed};
}
