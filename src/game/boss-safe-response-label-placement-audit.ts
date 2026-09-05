import { ACTION_BUTTONS } from './config.js';
import { BOSS_SAFE_RESPONSE_LABEL_ANCHOR_CLEARANCE, bossSafeResponseLabelPlacement } from './boss-safe-response-label-placement.js';
export interface BossSafeResponseLabelPlacementAudit{passed:boolean;samples:string[];actionCount:number;presentationOnly:true;gameplayFormulaMutation:false;snapshotSchemaMutation:false;}
export function runBossSafeResponseLabelPlacementAudit():BossSafeResponseLabelPlacementAudit{
 const samples:string[]=[];let passed=true;
 for(let i=0;i<64;i++){const bossPos={x:500+(i%8)*20,y:360};const heroPos=i%2===0?{x:bossPos.x,y:bossPos.y-102}:{x:180,y:400};const corePos={x:1050,y:400};const r=bossSafeResponseLabelPlacement({bossPos,bossRadius:68,heroPos,corePos,width:1280,height:800});const heroDistance=Math.hypot(r.pos.x-heroPos.x,r.pos.y-heroPos.y);const ok=r.presentationOnly&&r.animated===false&&r.motionAmplitude===0&&(!r.visible||heroDistance>=BOSS_SAFE_RESPONSE_LABEL_ANCHOR_CLEARANCE);passed&&=ok;samples.push(`${i}:${r.slot}:${r.visible?1:0}:${heroDistance.toFixed(1)}`);}
 return{passed,samples,actionCount:ACTION_BUTTONS.length,presentationOnly:true,gameplayFormulaMutation:false,snapshotSchemaMutation:false};
}
