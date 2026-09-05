import { ACTION_BUTTONS } from './config.js';
import { BOSS_SAFE_RESPONSE_SLOT_REBASE_MAX_COUNT, BOSS_SAFE_RESPONSE_SLOT_STRICT_HANDOFF_SECONDS, bossSafeResponseSlotHysteresis } from './boss-safe-response-slot-hysteresis.js';
import type { BossSafeResponseLabelPlacement } from './boss-safe-response-label-placement.js';
const placement=(x:number,y:number):BossSafeResponseLabelPlacement=>({visible:true,slot:'above',pos:{x,y},animated:false,motionAmplitude:0,presentationOnly:true});
export interface BossSafeResponseStrictHandoffEpochAudit{passed:boolean;samples:string[];actionCount:number;presentationOnly:true;gameplayFormulaMutation:false;snapshotSchemaMutation:false;}
export function runBossSafeResponseStrictHandoffEpochAudit():BossSafeResponseStrictHandoffEpochAudit{
  const samples:string[]=[];let passed=BOSS_SAFE_RESPONSE_SLOT_STRICT_HANDOFF_SECONDS>0&&BOSS_SAFE_RESPONSE_SLOT_STRICT_HANDOFF_SECONDS<=.25;
  for(let i=0;i<64;i++){
    const bossId=120+i,baseBoss={x:500+i%5,y:400},base={bossPos:baseBoss,bossRadius:70,heroPos:{x:120,y:400},corePos:{x:1180,y:400},width:1280,height:800,extraProtected:[]};let r=bossSafeResponseSlotHysteresis({previous:null,current:placement(baseBoss.x,290),placementInput:base,bossId,cycle:7,now:10});
    for(let n=1;n<=BOSS_SAFE_RESPONSE_SLOT_REBASE_MAX_COUNT;n++){const moved={x:baseBoss.x+n*110,y:390};r=bossSafeResponseSlotHysteresis({previous:r.memory,current:placement(moved.x,282-n*2),placementInput:{...base,bossPos:moved},bossId,cycle:7,now:10+n*.05});}
    const strictBoss={x:baseBoss.x+330,y:390};r=bossSafeResponseSlotHysteresis({previous:r.memory,current:placement(strictBoss.x,260),placementInput:{...base,bossPos:strictBoss},bossId,cycle:7,now:10.15});
    const epoch=(r.memory?.strictHandoffUntil??0)>10.15,nextBoss={x:strictBoss.x+110,y:390};const nextStrict=placement(nextBoss.x,244);r=bossSafeResponseSlotHysteresis({previous:r.memory,current:nextStrict,placementInput:{...base,bossPos:nextBoss},bossId,cycle:7,now:10.16});
    const strict=r.placement.pos.y===244&&r.memory?.rebaseCount===0,ok=epoch&&strict&&r.presentationOnly;passed&&=ok;samples.push(`${i}:${epoch?1:0}:${strict?1:0}`);
  }
  return{passed,samples,actionCount:ACTION_BUTTONS.length,presentationOnly:true,gameplayFormulaMutation:false,snapshotSchemaMutation:false};
}
