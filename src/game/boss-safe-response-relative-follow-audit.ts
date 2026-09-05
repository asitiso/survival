import { ACTION_BUTTONS } from './config.js';
import { BOSS_SAFE_RESPONSE_SLOT_BOSS_DISPLACEMENT_GUARD, bossSafeResponseSlotHysteresis } from './boss-safe-response-slot-hysteresis.js';
import type { BossSafeResponseLabelPlacement } from './boss-safe-response-label-placement.js';
const placement=(slot:'above'|'right',x:number,y:number):BossSafeResponseLabelPlacement=>({visible:true,slot,pos:{x,y},animated:false,motionAmplitude:0,presentationOnly:true});
export interface BossSafeResponseRelativeFollowAudit{passed:boolean;samples:string[];actionCount:number;presentationOnly:true;gameplayFormulaMutation:false;snapshotSchemaMutation:false;}
export function runBossSafeResponseRelativeFollowAudit():BossSafeResponseRelativeFollowAudit{
  const samples:string[]=[];let passed=BOSS_SAFE_RESPONSE_SLOT_BOSS_DISPLACEMENT_GUARD>=64;
  for(let i=0;i<64;i++){
    const boss={x:500+i,y:360},base={bossPos:boss,bossRadius:68,heroPos:{x:160,y:360},corePos:{x:1120,y:360},width:1280,height:800,extraProtected:[]};
    let r=bossSafeResponseSlotHysteresis({previous:null,current:placement('above',boss.x,boss.y-100),placementInput:base,bossId:40+i,cycle:3,now:5});
    const moved={x:boss.x+32,y:boss.y+12};r=bossSafeResponseSlotHysteresis({previous:r.memory,current:placement('right',moved.x+140,moved.y),placementInput:{...base,bossPos:moved},bossId:40+i,cycle:3,now:5.04});
    const followed=r.placement.slot==='above'&&r.placement.pos.x===boss.x+32&&r.placement.pos.y===boss.y-88&&r.memory?.bossPos.x===boss.x;
    const ok=followed&&r.presentationOnly;passed&&=ok;samples.push(`${i}:${followed?1:0}:${r.placement.pos.x.toFixed(1)}:${r.placement.pos.y.toFixed(1)}`);
  }
  return{passed,samples,actionCount:ACTION_BUTTONS.length,presentationOnly:true,gameplayFormulaMutation:false,snapshotSchemaMutation:false};
}
