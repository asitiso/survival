const clamp01=(value:number)=>Math.max(0,Math.min(1,Number.isFinite(value)?value:0));
const smooth01=(value:number)=>{const x=clamp01(value);return x*x*(3-2*x);};
export function dashPatternReleasePresentation(input:{reacquire:number;stress:number;critical:boolean},reducedMotion=false,reducedFlash=false){
  const settled=smooth01(input.reacquire),stress=clamp01(input.stress),unsettled=clamp01((1-settled)*.7+stress*.3),range=input.critical?.18:.32,accessibility=(reducedMotion?1.015:1)*(reducedFlash?1.04:1);
  return{reacquire:settled,dashGapScale:1+unsettled*range*accessibility,presentationOnly:true as const};
}
