import type { Vec2 } from '../core/math.js';
export type SecondaryImpactKind='splash'|'chain';
export function secondaryImpactCanonicalPresentation(kind:SecondaryImpactKind,pos:Vec2,reducedFlash=false){const sizeScale=kind==='splash'?.68:.58,alphaScale=(kind==='splash'?.72:.64)*(reducedFlash?.62:1);return{owner:'canonical' as const,kind,pos:{x:pos.x,y:pos.y},entryOffset:{x:0,y:0},sizeScale,alphaScale,presentationOnly:true as const};}
