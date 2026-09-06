const clamp01=(v:number)=>Math.max(0,Math.min(1,Number.isFinite(v)?v:1));
export const SAFE_LANE_HAZARD_OCCLUSION_RECOVERY_HOLD_SECONDS=.14;
export interface SafeLaneHazardOcclusionRecoveryState{pathAlphaScale:number;bridgeAlphaScale:number;holdRemaining:number;presentationOnly:true;}
export function createSafeLaneHazardOcclusionRecoveryState():SafeLaneHazardOcclusionRecoveryState{return{pathAlphaScale:1,bridgeAlphaScale:1,holdRemaining:0,presentationOnly:true};}
export function advanceSafeLaneHazardOcclusionRecovery(previous:SafeLaneHazardOcclusionRecoveryState,target:{pathAlphaScale:number;bridgeAlphaScale:number},dt:number,reducedMotion=false):SafeLaneHazardOcclusionRecoveryState{
  const path=clamp01(target.pathAlphaScale),bridge=clamp01(target.bridgeAlphaScale),delta=Math.max(0,Number.isFinite(dt)?dt:0),deepens=path<previous.pathAlphaScale-.0001||bridge<previous.bridgeAlphaScale-.0001;
  if(deepens)return{pathAlphaScale:Math.min(previous.pathAlphaScale,path),bridgeAlphaScale:Math.min(previous.bridgeAlphaScale,bridge),holdRemaining:SAFE_LANE_HAZARD_OCCLUSION_RECOVERY_HOLD_SECONDS,presentationOnly:true};
  const hold=Math.max(0,previous.holdRemaining-delta);if(hold>0)return{pathAlphaScale:previous.pathAlphaScale,bridgeAlphaScale:previous.bridgeAlphaScale,holdRemaining:hold,presentationOnly:true};
  const activeDt=Math.max(0,delta-previous.holdRemaining),pathRate=reducedMotion?4.2:2.4,bridgeRate=reducedMotion?4.6:2.8;
  return{pathAlphaScale:Math.min(path,previous.pathAlphaScale+activeDt*pathRate),bridgeAlphaScale:Math.min(bridge,previous.bridgeAlphaScale+activeDt*bridgeRate),holdRemaining:0,presentationOnly:true};
}
export function safeLaneHazardOcclusionRecoveryPresentation(state:SafeLaneHazardOcclusionRecoveryState){return{pathAlphaScale:clamp01(state.pathAlphaScale),bridgeAlphaScale:clamp01(state.bridgeAlphaScale),locatorAlphaScale:1,presentationOnly:true as const};}
