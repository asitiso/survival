export interface HeroTravelBridgeDensityBudgetInput{activeCount:number;indexFromNewest:number;life:number;evolutionTier:0|1|2}
export interface HeroTravelBridgeDensityBudgetPresentation{visible:boolean;alphaScale:number;capacity:number}
const c=(v:number)=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0));
export function heroTravelBridgeDensityBudgetPresentation(input:HeroTravelBridgeDensityBudgetInput,reducedMotion=false,reducedFlash=false):HeroTravelBridgeDensityBudgetPresentation{
 const count=Math.max(0,Math.floor(input.activeCount)),capacity=count<=3?count:(reducedMotion?3:5),visible=input.indexFromNewest<capacity,life=.48+.52*c(input.life),tier=1+input.evolutionTier*.06,sparse=count<=3?1:Math.min(1,life*tier);
 return{visible,alphaScale:visible?sparse*(reducedFlash?.68:1):0,capacity};
}


export interface HeroPostImpactHandoffDensityBudgetInput{activeCount:number;indexFromNewest:number;life:number;evolutionTier:0|1|2}
export function heroPostImpactHandoffDensityBudgetPresentation(input:HeroPostImpactHandoffDensityBudgetInput,reducedMotion=false){
 const count=Math.max(0,Math.floor(input.activeCount)),capacity=count<=3?count:(reducedMotion?2:4),apply=input.indexFromNewest<capacity,life=.56+.44*c(input.life),tier=1+input.evolutionTier*.04,effectStrength=apply?Math.min(1,life*tier):0;
 return{apply,effectStrength,capacity,presentationOnly:true as const};
}
