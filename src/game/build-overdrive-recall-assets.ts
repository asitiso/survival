import { clamp } from '../core/math.js';
import type { BuildOverdriveState } from './endless/build-overdrive.js';

export type BuildOverdriveRecallMode='charging'|'ready'|'active';
export type BuildOverdriveSegments=0|1|2|3|4;

export interface BuildOverdriveRecallPresentation{
  mode:BuildOverdriveRecallMode;
  charge:number;
  filledSegments:BuildOverdriveSegments;
  totalSegments:4;
  remainingSeconds:number;
  numericLabel:string;
  compact:boolean;
  animated:false;
  motionAmplitude:0;
  textFallbackPreserved:true;
  loadFailureBlocksGameplay:false;
}

export function buildOverdriveReadinessSegments(charge:number):BuildOverdriveSegments{
  const value=clamp(Number.isFinite(charge)?charge:0,0,100);
  if(value>=100)return 4;
  if(value>=75)return 3;
  if(value>=50)return 2;
  if(value>=25)return 1;
  return 0;
}

export function buildOverdriveRecallPresentation(state:BuildOverdriveState,elapsedMs:number,compact=false):BuildOverdriveRecallPresentation{
  const now=Math.max(0,Number.isFinite(elapsedMs)?elapsedMs:0);
  const charge=clamp(Number.isFinite(state.charge)?state.charge:0,0,100);
  const activeUntil=Math.max(0,Number.isFinite(state.activeUntilMs)?state.activeUntilMs:0);
  const active=activeUntil>now;
  if(active){
    const remainingSeconds=Math.max(1,Math.ceil((activeUntil-now)/1000));
    return{mode:'active',charge,filledSegments:compact?4:0,totalSegments:4,remainingSeconds,numericLabel:compact?'':`OD ${remainingSeconds}s`,compact,animated:false,motionAmplitude:0,textFallbackPreserved:true,loadFailureBlocksGameplay:false};
  }
  const mode:BuildOverdriveRecallMode=charge>=100?'ready':'charging';
  return{mode,charge,filledSegments:buildOverdriveReadinessSegments(charge),totalSegments:4,remainingSeconds:0,numericLabel:compact?'':`${Math.floor(charge)}`,compact,animated:false,motionAmplitude:0,textFallbackPreserved:true,loadFailureBlocksGameplay:false};
}
