import { ACTION_BUTTONS } from './config.js';
import { BOSS_SAFE_RESPONSE_SLOT_BOSS_DISPLACEMENT_GUARD, bossSafeResponseSlotHysteresis } from './boss-safe-response-slot-hysteresis.js';
import type { BossSafeResponseLabelPlacement } from './boss-safe-response-label-placement.js';
const placement=(x:number,y:number):BossSafeResponseLabelPlacement=>({visible:true,slot:'above',pos:{x,y},animated:false,motionAmplitude:0,presentationOnly:true});
export interface BossSafeResponseDisplacementGuardAudit{passed:boolean;samples:string[];actionCount:number;presentationOnly:true;gameplayFormulaMutation:false;snapshotSchemaMutation:false;}
export function runBossSafeResponseDisplacementGuardAudit():BossSafeResponseDisplacementGuardAudit{
  const samples:string[]=[];let passed=BOSS_SAFE_RESPONSE_SLOT_BOSS_DISPLACEMENT_GUARD>=64&&BOSS_SAFE_RESPONSE_SLOT_BOSS_DISPLACEMENT_GUARD<=140;
  for(let i=0;i<64;i++){
    const basePos={x:500+i,y:360};const base={bossPos:basePos,bossRadius:68,heroPos:{x:180,y:360},corePos:{x:1080,y:360},width:1280,height:800,extraProtected:[]};
    let r=bossSafeResponseSlotHysteresis({previous:null,current:placement(basePos.x,basePos.y-100),placementInput:base,bossId:20+i,cycle:3,now:5});
    const dash={x:basePos.x+BOSS_SAFE_RESPONSE_SLOT_BOSS_DISPLACEMENT_GUARD+24,y:basePos.y};
    r=bossSafeResponseSlotHysteresis({previous:r.memory,current:placement(dash.x,dash.y-100),placementInput:{...base,bossPos:dash},bossId:20+i,cycle:3,now:5.04});
    const ok=r.placement.pos.x===dash.x&&r.memory?.bossPos.x===dash.x&&r.presentationOnly;passed&&=ok;samples.push(`${i}:${r.placement.pos.x.toFixed(1)}:${r.memory?.bossPos.x.toFixed(1)??'none'}`);
  }
  return{passed,samples,actionCount:ACTION_BUTTONS.length,presentationOnly:true,gameplayFormulaMutation:false,snapshotSchemaMutation:false};
}
