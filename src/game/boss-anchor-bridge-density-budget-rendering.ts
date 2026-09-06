export interface BossAnchorBridgeDensityBudgetInput{activeCount:number;indexFromNewest:number;life:number}
export interface BossAnchorBridgeDensityBudgetPresentation{visible:boolean;alphaScale:number;capacity:number}
const c=(v:number)=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0));
export function bossAnchorBridgeDensityBudgetPresentation(input:BossAnchorBridgeDensityBudgetInput,reducedMotion=false,reducedFlash=false):BossAnchorBridgeDensityBudgetPresentation{
 const count=Math.max(0,Math.floor(input.activeCount)),capacity=count<=4?count:(reducedMotion?3:5),visible=input.indexFromNewest<capacity,alpha=(.38+.62*c(input.life))*(reducedFlash?.66:1);
 return{visible,alphaScale:visible?alpha:0,capacity};
}
