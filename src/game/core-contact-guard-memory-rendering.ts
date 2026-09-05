function clamp01(v:number){return Math.max(0,Math.min(1,Number.isFinite(v)?v:0));}
export type CoreContactGuardMemoryOwner='impact'|'contact-guard'|'memory'|'retired';
export interface CoreContactGuardMemoryInput{preventedRatio:number;ttl:number;maxTtl:number;}
export function coreContactGuardMemoryPresentation(input:CoreContactGuardMemoryInput,reducedFlash=false){
  const life=input.maxTtl>0?clamp01(input.ttl/input.maxTtl):0,prevented=clamp01(input.preventedRatio);
  if(life<=0)return{owner:'retired' as CoreContactGuardMemoryOwner,contactAlpha:0,memoryAlpha:0,braceWidth:28,braceHeight:10,projectileArcAlphaScale:1,presentationOnly:true as const};
  if(prevented<.14)return{owner:'impact' as CoreContactGuardMemoryOwner,contactAlpha:0,memoryAlpha:0,braceWidth:28,braceHeight:10,projectileArcAlphaScale:1,presentationOnly:true as const};
  const flashScale=reducedFlash?.58:1,braceWidth=Math.min(62,34+prevented*32),braceHeight=Math.min(24,10+prevented*16);
  if(life<=.28)return{owner:'memory' as CoreContactGuardMemoryOwner,contactAlpha:0,memoryAlpha:Math.min(.2,(.05+prevented*.16)*life/.28*flashScale),braceWidth,braceHeight,projectileArcAlphaScale:0,presentationOnly:true as const};
  return{owner:'contact-guard' as CoreContactGuardMemoryOwner,contactAlpha:clamp01((.36+prevented*.48)*life*flashScale),memoryAlpha:0,braceWidth,braceHeight,projectileArcAlphaScale:0,presentationOnly:true as const};
}
