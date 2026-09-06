const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
export type BossHazardLifecycleOwner='telegraph'|'active'|'aftermath'|'retired';
export function bossHazardLifecycleOwnerPresentation(input:{telegraph:number;ttl:number;aftermathTtl:number;aftermathMaxTtl:number},reducedFlash=false){const telegraph=Math.max(0,input.telegraph),ttl=Math.max(0,input.ttl),after=Math.max(0,input.aftermathTtl),afterMax=Math.max(.0001,input.aftermathMaxTtl);if(after>0&&ttl<=0){const sustain=clamp(after/afterMax,0,1);return{owner:'aftermath' as BossHazardLifecycleOwner,telegraphAlphaScale:0,activeAlphaScale:0,aftermathAlphaScale:sustain*(reducedFlash?.62:1),presentationOnly:true as const};}if(telegraph>0&&ttl>0)return{owner:'telegraph' as BossHazardLifecycleOwner,telegraphAlphaScale:1,activeAlphaScale:0,aftermathAlphaScale:0,presentationOnly:true as const};if(ttl>0)return{owner:'active' as BossHazardLifecycleOwner,telegraphAlphaScale:0,activeAlphaScale:1,aftermathAlphaScale:0,presentationOnly:true as const};return{owner:'retired' as BossHazardLifecycleOwner,telegraphAlphaScale:0,activeAlphaScale:0,aftermathAlphaScale:0,presentationOnly:true as const};}


export function bossHazardEndAftermathOwnershipPresentation(input:{aftermathTtl:number;aftermathMaxTtl:number},reducedMotion=false,reducedFlash=false){
 const max=Math.max(.0001,Number.isFinite(input.aftermathMaxTtl)?input.aftermathMaxTtl:.0001),ttl=Math.max(0,Number.isFinite(input.aftermathTtl)?input.aftermathTtl:0);if(ttl<=0)return{owner:'retired' as const,aftermathAlphaScale:0,sizeScale:1,presentationOnly:true as const};
 const progress=clamp(1-ttl/max,0,1),handoffEnd=reducedMotion?.12:.18,fadeStart=reducedMotion?.72:.78;let owner:'handoff'|'aftermath'='aftermath',alpha=1;if(progress<handoffEnd){owner='handoff';alpha=.42+.58*clamp(progress/handoffEnd,0,1);}else if(progress>fadeStart)alpha=clamp((1-progress)/Math.max(.001,1-fadeStart),0,1);alpha*=reducedFlash?.68:1;return{owner,aftermathAlphaScale:alpha,sizeScale:owner==='handoff'?.94+.06*clamp(progress/handoffEnd,0,1):1,presentationOnly:true as const};
}


export function bossHazardAftermathOwnerArbitrationPresentation(input:{endOwner:'handoff'|'aftermath'|'retired';endAlpha:number;terrainOwner:'aftermath'|'terrain'|'retired';aftermathAlpha:number;terrainAlpha:number},reducedFlash=false){
 const endAlpha=clamp(input.endAlpha,0,1),after=clamp(input.aftermathAlpha,0,1),terrain=clamp(input.terrainAlpha,0,1),flashScale=reducedFlash?.72:1;if(input.endOwner==='retired'||input.terrainOwner==='retired'&&after<=0&&terrain<=0)return{owner:'retired' as const,aftermathAlphaScale:0,terrainAlphaScale:0,presentationOnly:true as const};
 if(input.endOwner==='handoff')return{owner:'handoff' as const,aftermathAlphaScale:endAlpha*Math.max(.35,after)*flashScale,terrainAlphaScale:0,presentationOnly:true as const};
 if(input.terrainOwner==='terrain'&&terrain>0)return{owner:'terrain' as const,aftermathAlphaScale:Math.min(.24,endAlpha*after)*flashScale,terrainAlphaScale:terrain*flashScale,presentationOnly:true as const};
 return{owner:'aftermath' as const,aftermathAlphaScale:endAlpha*Math.max(after,.6)*flashScale,terrainAlphaScale:0,presentationOnly:true as const};
}


export function bossHazardAftermathDensityBudgetPresentation(input:{activeCount:number;indexFromNewest:number;owner:'handoff'|'aftermath'|'terrain'|'retired'},reducedMotion=false){
 const count=Math.max(0,Math.floor(input.activeCount)),index=Math.max(0,Math.floor(input.indexFromNewest));if(input.owner==='retired')return{visible:false,alphaScale:0,sizeScale:1,capacity:0,presentationOnly:true as const};if(count<=2)return{visible:true,alphaScale:1,sizeScale:1,capacity:count,presentationOnly:true as const};
 let capacity=input.owner==='handoff'?5:input.owner==='aftermath'?4:2;if(reducedMotion)capacity-=1;capacity=Math.max(1,capacity);const visible=index<capacity,alphaScale=visible?(input.owner==='handoff'?.88:input.owner==='aftermath'?.72:.48):0,sizeScale=visible?(reducedMotion?.94:1):1;return{visible,alphaScale,sizeScale,capacity,presentationOnly:true as const};
}


export interface BossHazardRespawnGroundCoherenceInput{memoryLife:number;aftermathActive:boolean;nextHazardDistance:number;nextHazardRadius:number;nextHazardTelegraph:number}
export function bossHazardRespawnGroundCoherencePresentation(input:BossHazardRespawnGroundCoherenceInput,reducedFlash=false){
 const memoryLife=clamp(input.memoryLife,0,1),distance=Number.isFinite(input.nextHazardDistance)?Math.max(0,input.nextHazardDistance):999,radius=Math.max(24,Number.isFinite(input.nextHazardRadius)?input.nextHazardRadius:60),telegraph=Math.max(0,Number.isFinite(input.nextHazardTelegraph)?input.nextHazardTelegraph:0),near=distance<=Math.max(96,radius*1.5),urgent=telegraph>0&&telegraph<=.18;
 if(!near||telegraph<=0)return{owner:'memory' as const,memoryAlphaScale:input.aftermathActive?.28:1,aftermathAlphaScale:input.aftermathActive?.72:1,telegraphAlphaScale:1,presentationOnly:true as const};
 if(urgent)return{owner:'spawn' as const,memoryAlphaScale:0,aftermathAlphaScale:.08,telegraphAlphaScale:1,presentationOnly:true as const};
 const proximity=clamp(1-distance/Math.max(1,radius*1.5),0,1),handoff=clamp(.42+proximity*.38+(1-memoryLife)*.16,0,1),flashScale=reducedFlash?.82:1;
 return{owner:'handoff' as const,memoryAlphaScale:(input.aftermathActive?.22:1-handoff*.82)*flashScale,aftermathAlphaScale:(input.aftermathActive?.38:.62)*(1-handoff*.45)*flashScale,telegraphAlphaScale:Math.max(.72,1-handoff*.18),presentationOnly:true as const};
}


export interface BossHazardRespawnGroundHandoffInput{coherenceOwner:'memory'|'handoff'|'spawn';memoryLife:number;nextHazardTelegraph:number}
export function bossHazardRespawnGroundHandoffPresentation(input:BossHazardRespawnGroundHandoffInput,reducedFlash=false){
 const memoryLife=clamp(input.memoryLife,0,1),telegraph=Math.max(0,Number.isFinite(input.nextHazardTelegraph)?input.nextHazardTelegraph:0);
 if(input.coherenceOwner==='memory')return{owner:'memory' as const,memoryAlphaScale:1,aftermathAlphaScale:1,telegraphAlphaScale:1,presentationOnly:true as const};
 if(input.coherenceOwner==='spawn')return{owner:'spawn' as const,memoryAlphaScale:0,aftermathAlphaScale:.08,telegraphAlphaScale:1,presentationOnly:true as const};
 const urgency=clamp(1-telegraph/.9,0,1),blend=clamp(.28+urgency*.62+(1-memoryLife)*.10,0,1),flashScale=reducedFlash?.9:1;
 return{owner:'handoff' as const,memoryAlphaScale:(1-blend)*flashScale,aftermathAlphaScale:(1-blend*.72)*flashScale,telegraphAlphaScale:.74+.26*blend,presentationOnly:true as const};
}


export interface BossHazardRespawnGroundDensityBudgetInput{activeTransitionCount:number;indexFromNewest:number;owner:'memory'|'handoff'|'spawn'}
export function bossHazardRespawnGroundDensityBudgetPresentation(input:BossHazardRespawnGroundDensityBudgetInput,reducedMotion=false){
 const count=Math.max(0,Math.floor(input.activeTransitionCount)),index=Math.max(0,Math.floor(input.indexFromNewest));
 if(input.owner==='memory')return{transitionVisible:true,memoryAlphaScale:1,aftermathAlphaScale:1,telegraphAlphaScale:1,capacity:count,presentationOnly:true as const};
 if(input.owner==='spawn')return{transitionVisible:false,memoryAlphaScale:0,aftermathAlphaScale:0,telegraphAlphaScale:1,capacity:0,presentationOnly:true as const};
 if(count<=2)return{transitionVisible:true,memoryAlphaScale:1,aftermathAlphaScale:1,telegraphAlphaScale:1,capacity:count,presentationOnly:true as const};
 let capacity=reducedMotion?2:3;capacity=Math.max(1,capacity);const transitionVisible=index<capacity;
 return{transitionVisible,memoryAlphaScale:transitionVisible?.72:0,aftermathAlphaScale:transitionVisible?.68:0,telegraphAlphaScale:1,capacity,presentationOnly:true as const};
}


export interface BossHazardRespawnMaterializationOwnershipInput{respawnOwner:'memory'|'handoff'|'spawn';footprintOwner:'footprint'|'telegraph'|'active'|'retired';activationOwner:'telegraph'|'activation'|'active'|'retired';footprintProgress:number}
export function bossHazardRespawnMaterializationOwnershipPresentation(input:BossHazardRespawnMaterializationOwnershipInput,reducedFlash=false){
 const progress=clamp(Number.isFinite(input.footprintProgress)?input.footprintProgress:1,0,1),flashScale=reducedFlash?.82:1;
 if(input.activationOwner==='retired'||input.footprintOwner==='retired')return{owner:'retired' as const,memoryAlphaScale:0,footprintAlphaScale:0,telegraphAlphaScale:0,activeAlphaScale:0,presentationOnly:true as const};
 if(input.activationOwner==='active')return{owner:'active' as const,memoryAlphaScale:0,footprintAlphaScale:0,telegraphAlphaScale:0,activeAlphaScale:1,presentationOnly:true as const};
 if(input.activationOwner==='activation')return{owner:'activation' as const,memoryAlphaScale:0,footprintAlphaScale:0,telegraphAlphaScale:0,activeAlphaScale:(.64+.28*progress)*flashScale,presentationOnly:true as const};
 if(input.footprintOwner==='footprint'){const memory=input.respawnOwner==='memory'?.46:input.respawnOwner==='handoff'?.22:.08;return{owner:'footprint' as const,memoryAlphaScale:memory*flashScale,footprintAlphaScale:(.72+.28*(1-progress))*flashScale,telegraphAlphaScale:.76+.24*progress,activeAlphaScale:0,presentationOnly:true as const};}
 return{owner:'telegraph' as const,memoryAlphaScale:(input.respawnOwner==='memory'?.28:input.respawnOwner==='handoff'?.12:0)*flashScale,footprintAlphaScale:0,telegraphAlphaScale:1,activeAlphaScale:0,presentationOnly:true as const};
}


export interface BossHazardRespawnMaterializationSettleInput{owner:'footprint'|'telegraph'|'activation'|'active'|'retired';activationTtl:number;activationMaxTtl:number;ttl:number}
export function bossHazardRespawnMaterializationSettlePresentation(input:BossHazardRespawnMaterializationSettleInput,reducedFlash=false){
 if(input.ttl<=0||input.owner==='retired')return{owner:'retired' as const,materializationAlphaScale:0,persistentAlphaScale:0,presentationOnly:true as const};
 if(input.owner==='footprint')return{owner:'footprint' as const,materializationAlphaScale:reducedFlash?.72:1,persistentAlphaScale:0,presentationOnly:true as const};
 if(input.owner==='telegraph')return{owner:'telegraph' as const,materializationAlphaScale:reducedFlash?.78:1,persistentAlphaScale:0,presentationOnly:true as const};
 if(input.owner==='active')return{owner:'active' as const,materializationAlphaScale:0,persistentAlphaScale:1,presentationOnly:true as const};
 const max=Math.max(.0001,Number.isFinite(input.activationMaxTtl)?input.activationMaxTtl:.0001),left=Math.max(0,Number.isFinite(input.activationTtl)?input.activationTtl:0),progress=clamp(1-left/max,0,1),flashScale=reducedFlash?.86:1;
 return{owner:'activation' as const,materializationAlphaScale:(1-progress)*.58*flashScale,persistentAlphaScale:(.54+.4*progress)*flashScale,presentationOnly:true as const};
}

export interface BossHazardRespawnMaterializationDensityBudgetInput{activeCount:number;indexFromNewest:number;owner:'footprint'|'telegraph'|'activation'|'active'|'retired'}
export function bossHazardRespawnMaterializationDensityBudgetPresentation(input:BossHazardRespawnMaterializationDensityBudgetInput,reducedMotion=false){
 const count=Math.max(0,Math.floor(input.activeCount)),index=Math.max(0,Math.floor(input.indexFromNewest));
 if(input.owner==='active'||input.owner==='telegraph'||input.owner==='retired')return{effectStrength:0,telegraphAlphaScale:1,persistentAlphaScale:1,capacity:0,presentationOnly:true as const};
 if(count<=2)return{effectStrength:1,telegraphAlphaScale:1,persistentAlphaScale:1,capacity:count,presentationOnly:true as const};
 let capacity=input.owner==='activation'?4:3;if(reducedMotion)capacity=Math.max(1,capacity-1);const visible=index<capacity,effectStrength=visible?Math.max(.58,(input.owner==='activation'?.86:.78)-index*.08):0;
 return{effectStrength,telegraphAlphaScale:1,persistentAlphaScale:1,capacity,presentationOnly:true as const};
}


export interface BossHazardPersistentExpirationGroundStateInput{aftermathTtl:number;aftermathMaxTtl:number;memoryTtl:number;memoryMaxTtl:number}
export function bossHazardPersistentExpirationGroundStatePresentation(input:BossHazardPersistentExpirationGroundStateInput,reducedMotion=false,reducedFlash=false){
 const afterMax=Math.max(.0001,Number.isFinite(input.aftermathMaxTtl)?input.aftermathMaxTtl:.0001),after=Math.max(0,Number.isFinite(input.aftermathTtl)?input.aftermathTtl:0),memoryMax=Math.max(.0001,Number.isFinite(input.memoryMaxTtl)?input.memoryMaxTtl:.0001),memory=Math.max(0,Number.isFinite(input.memoryTtl)?input.memoryTtl:0);
 if(after<=0&&memory<=0)return{owner:'retired' as const,aftermathAlphaScale:0,groundAlphaScale:0,groundRadiusScale:1,presentationOnly:true as const};
 if(after<=0)return{owner:'ground' as const,aftermathAlphaScale:0,groundAlphaScale:1,groundRadiusScale:1,presentationOnly:true as const};
 const afterLife=clamp(after/afterMax,0,1),afterProgress=1-afterLife,memoryLife=clamp(memory/memoryMax,0,1),flashScale=reducedFlash?.72:1;
 const handoffStart=reducedMotion?.26:.34;
 if(afterProgress<handoffStart)return{owner:'expiration' as const,aftermathAlphaScale:flashScale,groundAlphaScale:0,groundRadiusScale:.96+.04*afterProgress/handoffStart,presentationOnly:true as const};
 const t=clamp((afterProgress-handoffStart)/Math.max(.001,1-handoffStart),0,1),afterAlpha=(1-t*.82)*flashScale,groundAlpha=clamp((.18+.82*t)*(.72+.28*memoryLife),0,1);
 return{owner:'handoff' as const,aftermathAlphaScale:afterAlpha,groundAlphaScale:groundAlpha,groundRadiusScale:.98+.04*t,presentationOnly:true as const};
}


export interface BossHazardExpirationGroundStateHandoffInput{owner:'expiration'|'handoff'|'ground'|'retired';aftermathLife:number;memoryLife:number}
export function bossHazardExpirationGroundStateHandoffPresentation(input:BossHazardExpirationGroundStateHandoffInput,reducedMotion=false,reducedFlash=false){
 const after=clamp(input.aftermathLife,0,1),memory=clamp(input.memoryLife,0,1),flashScale=reducedFlash?.78:1;
 if(input.owner==='retired')return{owner:'retired' as const,aftermathAlphaScale:0,groundAlphaScale:0,presentationOnly:true as const};
 if(input.owner==='ground')return{owner:'ground' as const,aftermathAlphaScale:0,groundAlphaScale:1,presentationOnly:true as const};
 if(input.owner==='expiration')return{owner:'expiration' as const,aftermathAlphaScale:flashScale,groundAlphaScale:0,presentationOnly:true as const};
 const t=clamp((1-after)*(reducedMotion?1.18:1),0,1),aftermath=(1-t*.78)*flashScale,ground=clamp((.22+.78*t)*(.78+.22*memory),0,1),sum=aftermath+ground,scale=sum>1.3?1.3/sum:1;
 return{owner:'handoff' as const,aftermathAlphaScale:aftermath*scale,groundAlphaScale:ground*scale,presentationOnly:true as const};
}


export interface BossHazardExpirationGroundStateDensityBudgetInput{activeCount:number;indexFromNewest:number;owner:'expiration'|'handoff'|'ground'|'retired'}
export function bossHazardExpirationGroundStateDensityBudgetPresentation(input:BossHazardExpirationGroundStateDensityBudgetInput,reducedMotion=false){
 const count=Math.max(0,Math.floor(input.activeCount)),index=Math.max(0,Math.floor(input.indexFromNewest));
 if(input.owner==='ground'||input.owner==='retired')return{effectStrength:0,aftermathAlphaScale:0,groundAlphaScale:1,capacity:0,presentationOnly:true as const};
 if(count<=2)return{effectStrength:1,aftermathAlphaScale:1,groundAlphaScale:1,capacity:count,presentationOnly:true as const};
 let capacity=input.owner==='expiration'?4:3;if(reducedMotion)capacity=Math.max(1,capacity-1);const visible=index<capacity,effectStrength=visible?Math.max(.58,.84-index*.08):0;
 return{effectStrength,aftermathAlphaScale:effectStrength,groundAlphaScale:1,capacity,presentationOnly:true as const};
}


export interface BossClearedGroundSafeLaneRecoveryCoherenceInput{memoryLife:number;safeLaneConfidence:number;nearLane:boolean;hazardOccluded:boolean}
export function bossClearedGroundSafeLaneRecoveryCoherencePresentation(input:BossClearedGroundSafeLaneRecoveryCoherenceInput,reducedMotion=false){
 const memory=clamp(input.memoryLife,0,1),confidence=clamp(input.safeLaneConfidence,0,1);
 if(!input.nearLane||memory<=.02)return{owner:'safe-lane' as const,groundAlphaScale:input.nearLane?0:1,safeLaneAlphaScale:1,pathRecoveryScale:1,presentationOnly:true as const};
 if(memory>=.58){const lane=(input.hazardOccluded?.34:.42)*(.72+.28*confidence);return{owner:'ground' as const,groundAlphaScale:1,safeLaneAlphaScale:lane,pathRecoveryScale:lane,presentationOnly:true as const};}
 const t=clamp((.58-memory)/.5,0,1),lane=clamp((.42+.58*t)*(.76+.24*confidence),0,1);const occlusion=input.hazardOccluded?.55:1;return{owner:'handoff' as const,groundAlphaScale:clamp(1-t*.72,0,1),safeLaneAlphaScale:lane*occlusion,pathRecoveryScale:(reducedMotion?.86:1)*lane*occlusion,presentationOnly:true as const};
}


export interface BossClearedGroundSafeLaneRecoveryHandoffInput{owner:'ground'|'handoff'|'safe-lane';memoryLife:number;safeLaneConfidence:number;hazardOccluded:boolean}
export function bossClearedGroundSafeLaneRecoveryHandoffPresentation(input:BossClearedGroundSafeLaneRecoveryHandoffInput,reducedMotion=false){
 const memory=clamp(input.memoryLife,0,1),confidence=clamp(input.safeLaneConfidence,0,1),occ=input.hazardOccluded?.58:1;
 if(input.owner==='safe-lane')return{owner:'safe-lane' as const,groundAlphaScale:0,safeLaneAlphaScale:1,pathRecoveryScale:1,presentationOnly:true as const};
 if(input.owner==='ground')return{owner:'ground' as const,groundAlphaScale:1,safeLaneAlphaScale:(.32+.14*confidence)*occ,pathRecoveryScale:(.38+.12*confidence)*occ,presentationOnly:true as const};
 const t=clamp(1-memory,0,1),ground=.72*(1-t)+.18,lane=(.42+.58*t)*(.78+.22*confidence)*occ,total=ground+lane,scale=total>1.4?1.4/total:1;return{owner:'handoff' as const,groundAlphaScale:ground*scale,safeLaneAlphaScale:lane*scale,pathRecoveryScale:lane*scale*(reducedMotion?.88:1),presentationOnly:true as const};
}


export interface BossClearedGroundSafeLaneRecoveryDensityBudgetInput{activeCount:number;indexFromNewest:number;owner:'ground'|'handoff'|'safe-lane'}
export function bossClearedGroundSafeLaneRecoveryDensityBudgetPresentation(input:BossClearedGroundSafeLaneRecoveryDensityBudgetInput,reducedMotion=false){
 const count=Math.max(0,Math.floor(input.activeCount)),index=Math.max(0,Math.floor(input.indexFromNewest));if(input.owner==='safe-lane')return{effectStrength:0,safeLaneAlphaScale:1,groundTransitionAlphaScale:0,capacity:0,presentationOnly:true as const};if(count<=2)return{effectStrength:1,safeLaneAlphaScale:1,groundTransitionAlphaScale:1,capacity:count,presentationOnly:true as const};let capacity=input.owner==='ground'?4:3;if(reducedMotion)capacity=Math.max(1,capacity-1);const visible=index<capacity,effectStrength=visible?Math.max(.56,.84-index*.08):0;return{effectStrength,safeLaneAlphaScale:1,groundTransitionAlphaScale:effectStrength,capacity,presentationOnly:true as const};
}
