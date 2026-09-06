import type { SpecialistEnemyType } from './enemy-specialists.js';
export interface SpecialistStrikeCueBudgetInput{activeCueCount:number;indexFromNewest:number;type:SpecialistEnemyType;life:number}
export interface SpecialistStrikeCueBudgetPresentation{visible:boolean;alphaScale:number;lineWidthScale:number;presentationOnly:true}
const c=(v:number,min=0,max=1)=>Math.max(min,Math.min(max,Number.isFinite(v)?v:0));
export function specialistStrikeCueBudgetPresentation(input:SpecialistStrikeCueBudgetInput,reducedMotion=false,reducedFlash=false):SpecialistStrikeCueBudgetPresentation{
 const count=Math.max(0,Math.round(c(input.activeCueCount,0,99))),index=Math.max(0,Math.round(c(input.indexFromNewest,0,99))),life=c(input.life),maxVisible=reducedMotion?3:5,visible=index<maxVisible;
 if(!visible)return{visible:false,alphaScale:0,lineWidthScale:.8,presentationOnly:true};
 if(count<=3)return{visible:true,alphaScale:reducedFlash?.7:1,lineWidthScale:1,presentationOnly:true};
 const density=c(1-(count-3)*.075,.5,1),typeBoost=input.type==='assassin'?1.06:input.type==='siegeGolem'?1.02:1,lifeScale=.42+.58*life,flash=reducedFlash?.68:1,alphaScale=c(density*typeBoost*lifeScale*flash,0,1),lineWidthScale=c(.82+density*.18,.82,1);
 return{visible:true,alphaScale,lineWidthScale,presentationOnly:true};
}
