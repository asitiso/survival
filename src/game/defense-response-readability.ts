export type DefenseResponseKind='guard'|'guardBreak'|'shield'|'shieldBreak'|'armor';
export interface DefenseResponsePresentationInput {kind:DefenseResponseKind;battlefieldStress?:number;protectedWarning?:boolean;safeLaneVisible?:boolean;reducedFlash?:boolean;reducedMotion?:boolean;}
export interface DefenseResponsePresentation {alpha:number;lineWidth:number;radius:number;pulse:number;priority:number;}
export function defenseResponsePresentation(input:DefenseResponsePresentationInput):DefenseResponsePresentation{
  const stress=Math.max(0,Math.min(1,input.battlefieldStress??0));
  const isBreak=input.kind==='guardBreak'||input.kind==='shieldBreak';
  const base=input.kind==='guardBreak'?.34:input.kind==='shieldBreak'?.32:input.kind==='guard'?.24:input.kind==='shield'?.22:.18;
  let alpha=base*(1-stress*(isBreak?.18:.48));
  if(input.protectedWarning)alpha*=isBreak?.76:.52;
  if(input.safeLaneVisible)alpha*=isBreak?.82:.62;
  if(input.reducedFlash)alpha*=.66;
  const min=isBreak?.16:.045;
  alpha=Math.max(min,alpha);
  return {alpha,lineWidth:isBreak?2.6:input.kind==='armor'?1.4:2,radius:input.kind.startsWith('shield')?24:input.kind==='armor'?21:22,pulse:input.reducedMotion?0:isBreak?.9:.34,priority:isBreak?2:1};
}
