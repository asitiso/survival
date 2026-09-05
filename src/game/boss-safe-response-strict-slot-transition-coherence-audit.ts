import { ACTION_BUTTONS } from './config.js';
import { BOSS_SAFE_RESPONSE_STRICT_SLOT_TRANSITION_LOCK_SECONDS, BOSS_SAFE_RESPONSE_SLOT_REBASE_MAX_COUNT, bossSafeResponseSlotHysteresis } from './boss-safe-response-slot-hysteresis.js';
import type { BossSafeResponseLabelPlacement, BossSafeResponseLabelSlot } from './boss-safe-response-label-placement.js';
const placement=(slot:Exclude<BossSafeResponseLabelSlot,'hidden'>,x:number,y:number):BossSafeResponseLabelPlacement=>({visible:true,slot,pos:{x,y},animated:false,motionAmplitude:0,presentationOnly:true});
export interface BossSafeResponseStrictSlotTransitionCoherenceAudit{passed:boolean;samples:string[];actionCount:number;presentationOnly:true;gameplayFormulaMutation:false;snapshotSchemaMutation:false;}
export function runBossSafeResponseStrictSlotTransitionCoherenceAudit():BossSafeResponseStrictSlotTransitionCoherenceAudit{
  const samples:string[]=[];let passed=BOSS_SAFE_RESPONSE_STRICT_SLOT_TRANSITION_LOCK_SECONDS>0&&BOSS_SAFE_RESPONSE_STRICT_SLOT_TRANSITION_LOCK_SECONDS<.18;
  for(let i=0;i<64;i++){
    const bossId=300+i,baseBoss={x:500+i%5,y:400},base={bossPos:baseBoss,bossRadius:70,heroPos:{x:120,y:400},corePos:{x:1180,y:400},width:1280,height:800,extraProtected:[]};let r=bossSafeResponseSlotHysteresis({previous:null,current:placement('above',baseBoss.x,290),placementInput:base,bossId,cycle:8,now:10});
    for(let n=1;n<=BOSS_SAFE_RESPONSE_SLOT_REBASE_MAX_COUNT;n++){const moved={x:baseBoss.x+n*110,y:390};r=bossSafeResponseSlotHysteresis({previous:r.memory,current:placement('above',moved.x,282-n*2),placementInput:{...base,bossPos:moved},bossId,cycle:8,now:10+n*.05});}
    const strictBoss={x:baseBoss.x+330,y:390};r=bossSafeResponseSlotHysteresis({previous:r.memory,current:placement('above',strictBoss.x,260),placementInput:{...base,bossPos:strictBoss},bossId,cycle:8,now:10.15});
    const above={x:strictBoss.x,y:strictBoss.y-102},right={x:strictBoss.x+128,y:strictBoss.y-8};r=bossSafeResponseSlotHysteresis({previous:r.memory,current:placement('right',right.x,right.y),placementInput:{...base,bossPos:strictBoss,heroPos:above},bossId,cycle:8,now:10.16});const transition=r.placement.slot==='right'&&(r.memory?.strictSlotLockUntil??0)>10.16;
    r=bossSafeResponseSlotHysteresis({previous:r.memory,current:placement('left',strictBoss.x-128,right.y),placementInput:{...base,bossPos:strictBoss,heroPos:above},bossId,cycle:8,now:10.17});const locked=r.placement.slot==='right';
    const ok=transition&&locked&&r.presentationOnly;passed&&=ok;samples.push(`${i}:${transition?1:0}:${locked?1:0}`);
  }
  return{passed,samples,actionCount:ACTION_BUTTONS.length,presentationOnly:true,gameplayFormulaMutation:false,snapshotSchemaMutation:false};
}
