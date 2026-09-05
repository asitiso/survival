export type RegularDefeatGroundType='grunt'|'hound'|'brute'|'archer'|'bomber'|'shaman'|'golden'|'elite';
export type RegularDefeatGroundOwner='body'|'retire';
export interface RegularDefeatGroundBody{offsetX:number;offsetY:number;alpha:number;radius:number;}
export interface RegularDefeatGroundRetirementPresentation{owner:RegularDefeatGroundOwner;shadowOffsetX:number;shadowOffsetY:number;shadowAlpha:number;widthScale:number;heightScale:number;groundPulseScale:number;}
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const width:Readonly<Record<RegularDefeatGroundType,number>>={grunt:.94,hound:.86,brute:1.14,archer:.9,bomber:1.02,shaman:.96,golden:.92,elite:1.18};
const alpha:Readonly<Record<RegularDefeatGroundType,number>>={grunt:.27,hound:.22,brute:.34,archer:.24,bomber:.3,shaman:.26,golden:.28,elite:.38};
const follow:Readonly<Record<RegularDefeatGroundType,number>>={grunt:.15,hound:.17,brute:.11,archer:.16,bomber:.13,shaman:.14,golden:.17,elite:.1};
const height:Readonly<Record<RegularDefeatGroundType,number>>={grunt:.48,hound:.42,brute:.58,archer:.44,bomber:.52,shaman:.47,golden:.43,elite:.62};
export function regularDefeatGroundRetirementPresentation(type:RegularDefeatGroundType,progress:number,body:RegularDefeatGroundBody,reducedMotion=false):RegularDefeatGroundRetirementPresentation{
  const p=clamp(progress,0,1),owner:RegularDefeatGroundOwner=p>=.86?'retire':'body',fade=p>=.88?0:clamp(1-p/.88,0,1);
  const followScale=follow[type]*(reducedMotion?.5:1),maxX=reducedMotion?1.45:2.8,maxY=reducedMotion?.9:1.7;
  const ox=clamp((Number.isFinite(body.offsetX)?body.offsetX:0)*followScale,-maxX,maxX),oy=clamp((Number.isFinite(body.offsetY)?body.offsetY:0)*followScale,-maxY,maxY);
  const weight=type==='elite'?1.12:type==='brute'?1.06:1,shadowAlpha=clamp(body.alpha,0,1)*alpha[type]*fade*weight;
  return{owner,shadowOffsetX:ox,shadowOffsetY:oy,shadowAlpha:clamp(shadowAlpha,0,.42),widthScale:clamp(width[type]*(1-p*.035),.78,1.2),heightScale:clamp(height[type]*(1-p*.16),.32,.65),groundPulseScale:0};
}
