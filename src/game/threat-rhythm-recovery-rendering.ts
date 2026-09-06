const clamp01=(value:number)=>Math.max(0,Math.min(1,Number.isFinite(value)?value:0));
const smooth01=(value:number)=>{const x=clamp01(value);return x*x*(3-2*x);};

function recoveryScale(input:{suppression:number;release:number;stress:number;critical:boolean},floor:number,reducedMotion=false,reducedFlash=false){
  const suppression=clamp01(input.suppression),stress=clamp01(input.stress),release=smooth01(input.release);
  const pressure=clamp01(suppression*(.62+.38*stress));
  const recovery=clamp01(release*(1-pressure*.35)+(1-suppression)*.18);
  const ceiling=input.critical?.94:.96;
  const motion=reducedMotion?.98:1,flash=reducedFlash?.97:1;
  return{pressure,recovery,scale:Math.max(floor,Math.min(ceiling,floor+(ceiling-floor)*recovery))*motion*flash};
}

export function projectileTrailRhythmRecoveryPresentation(input:{suppression:number;release:number;stress:number;critical:boolean},reducedMotion=false,reducedFlash=false){const r=recoveryScale(input,input.critical?.5:.44,reducedMotion,reducedFlash);return{hold:r.pressure,recovery:r.recovery,canonicalScale:1,secondaryScale:r.scale,presentationOnly:true as const};}

export function impactRhythmRecoveryPresentation(input:{suppression:number;release:number;stress:number;critical:boolean},reducedMotion=false,reducedFlash=false){const r=recoveryScale(input,input.critical?.5:.42,reducedMotion,reducedFlash);return{hold:r.pressure,recovery:r.recovery,edgeScale:1,interiorScale:r.scale,presentationOnly:true as const};}

export function bossHazardRhythmRecoveryPresentation(input:{suppression:number;release:number;stress:number;critical:boolean},reducedMotion=false,reducedFlash=false){const r=recoveryScale(input,input.critical?.4:.36,reducedMotion,reducedFlash);return{hold:r.pressure,recovery:r.recovery,bossEdgeScale:1,hazardInteriorScale:Math.max(input.critical?.36:.34,r.scale),presentationOnly:true as const};}

export function safeLaneRhythmRecoveryPresentation(input:{suppression:number;release:number;stress:number;confidence:number;critical:boolean},reducedMotion=false,reducedFlash=false){const r=recoveryScale(input,input.critical?.48:.42,reducedMotion,reducedFlash),confidence=clamp01(input.confidence);return{hold:r.pressure,recovery:r.recovery,safeLaneScale:1+confidence*.035*(reducedFlash?.45:1),decorationScale:Math.min(1,r.scale),presentationOnly:true as const};}

export function specialistRhythmRecoveryPresentation(input:{suppression:number;release:number;stress:number;critical:boolean},reducedMotion=false,reducedFlash=false){const r=recoveryScale(input,input.critical?.46:.4,reducedMotion,reducedFlash);return{hold:r.pressure,recovery:r.recovery,silhouetteScale:1,trailScale:r.scale,presentationOnly:true as const};}

export function rhythmRecoveryBudgetPresentation(input:{recoveringFamilies:number;stress:number;criticalCount:number;safeLaneVisible:boolean;bossActive:boolean},reducedMotion=false,reducedFlash=false){const families=clamp01(Math.max(0,input.recoveringFamilies)/5),stress=clamp01(input.stress),critical=clamp01(Math.max(0,input.criticalCount)/3),load=clamp01(families*.5+stress*.28+critical*.14+(input.safeLaneVisible?.04:0)+(input.bossActive?.04:0)),motion=reducedMotion?.98:1,flash=reducedFlash?.97:1;return{load,canonicalScale:1,secondaryScale:Math.max(.5,1-load*.44)*motion*flash,safeLaneScale:input.safeLaneVisible?(1+load*.035)*flash:1,bossEdgeScale:input.bossActive?Math.max(.86,1-load*.08)*flash:1,presentationOnly:true as const};}
