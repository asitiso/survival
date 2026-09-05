import { ACTION_BUTTONS } from './config.js';
import { BOSS_SAFE_RESPONSE_SLOT_HOLD_SECONDS, bossSafeResponseSlotHysteresis } from './boss-safe-response-slot-hysteresis.js';
import type { BossSafeResponseLabelPlacement } from './boss-safe-response-label-placement.js';
const placement=(slot:'above'|'right',x:number,y:number):BossSafeResponseLabelPlacement=>({visible:true,slot,pos:{x,y},animated:false,motionAmplitude:0,presentationOnly:true});
export interface BossSafeResponseSlotHysteresisAudit{passed:boolean;samples:string[];actionCount:number;presentationOnly:true;gameplayFormulaMutation:false;snapshotSchemaMutation:false;}
export function runBossSafeResponseSlotHysteresisAudit():BossSafeResponseSlotHysteresisAudit{
  const samples:string[]=[];let passed=true;
  for(let i=0;i<64;i++){
    const base={bossPos:{x:640,y:400},bossRadius:70,heroPos:{x:250,y:400},corePos:{x:1030,y:400},width:1280,height:800,extraProtected:[]};
    let r=bossSafeResponseSlotHysteresis({previous:null,current:placement('above',640,298),placementInput:base,bossId:10+i,cycle:2,now:5});
    r=bossSafeResponseSlotHysteresis({previous:r.memory,current:placement('right',768,392),placementInput:{...base,heroPos:{x:640,y:348}},bossId:10+i,cycle:2,now:5+BOSS_SAFE_RESPONSE_SLOT_HOLD_SECONDS*.4});
    const ok=r.presentationOnly&&r.placement.visible&&r.placement.slot==='above'&&r.memory?.presentationOnly===true;passed&&=ok;samples.push(`${i}:${r.placement.slot}:${r.memory?.holdUntil.toFixed(3)??'none'}`);
  }
  return{passed,samples,actionCount:ACTION_BUTTONS.length,presentationOnly:true,gameplayFormulaMutation:false,snapshotSchemaMutation:false};
}
