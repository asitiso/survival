import { ACTION_BUTTONS } from './config.js';
import { BOSS_SAFE_RESPONSE_SLOT_BOSS_DISPLACEMENT_GUARD, bossSafeResponseSlotHysteresis } from './boss-safe-response-slot-hysteresis.js';
import type { BossSafeResponseLabelPlacement } from './boss-safe-response-label-placement.js';
const placement=(slot:'above'|'right',x:number,y:number):BossSafeResponseLabelPlacement=>({visible:true,slot,pos:{x,y},animated:false,motionAmplitude:0,presentationOnly:true});
export interface BossSafeResponseSameSlotRebaseAudit{passed:boolean;samples:string[];actionCount:number;presentationOnly:true;gameplayFormulaMutation:false;snapshotSchemaMutation:false;}
export function runBossSafeResponseSameSlotRebaseAudit():BossSafeResponseSameSlotRebaseAudit{
  const samples:string[]=[];let passed=BOSS_SAFE_RESPONSE_SLOT_BOSS_DISPLACEMENT_GUARD===96;
  for(let i=0;i<64;i++){
    const baseBoss={x:500+(i%7),y:400},base={bossPos:baseBoss,bossRadius:70,heroPos:{x:120,y:400},corePos:{x:1150,y:400},width:1280,height:800,extraProtected:[]};let r=bossSafeResponseSlotHysteresis({previous:null,current:placement('above',baseBoss.x,290),placementInput:base,bossId:50+i,cycle:4,now:10});
    const moved={x:baseBoss.x+110,y:390};r=bossSafeResponseSlotHysteresis({previous:r.memory,current:placement('above',moved.x,282),placementInput:{...base,bossPos:moved},bossId:50+i,cycle:4,now:10.05});const rebased=r.placement.slot==='above'&&r.placement.pos.x===moved.x&&r.placement.pos.y===280&&r.memory?.bossPos.x===moved.x&&r.memory?.pos.y===280;
    const changed=bossSafeResponseSlotHysteresis({previous:r.memory,current:placement('right',moved.x+150,moved.y),placementInput:{...base,bossPos:{x:moved.x+110,y:moved.y}},bossId:50+i,cycle:4,now:10.1});const releases=changed.placement.slot==='right';const ok=rebased&&releases&&r.presentationOnly;passed&&=ok;samples.push(`${i}:${rebased?1:0}:${releases?1:0}`);
  }
  return{passed,samples,actionCount:ACTION_BUTTONS.length,presentationOnly:true,gameplayFormulaMutation:false,snapshotSchemaMutation:false};
}
