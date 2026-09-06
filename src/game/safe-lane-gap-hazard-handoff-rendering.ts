export interface SafeLaneGapHandoffGap{start:number;end:number;}
export interface SafeLaneGapHandoffCurrent extends SafeLaneGapHandoffGap{visible:boolean;release:number;}
const clamp=(v:number)=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0));const norm=(g:SafeLaneGapHandoffGap)=>({start:clamp(Math.min(g.start,g.end)),end:clamp(Math.max(g.start,g.end))});
export function safeLaneGapHazardHandoffPresentation(input:{current:SafeLaneGapHandoffCurrent|null;next:SafeLaneGapHandoffGap|null},reducedMotion=false){
  const current=input.current&&input.current.visible?norm(input.current):null,next=input.next?norm(input.next):null;if(!next)return{mode:'release' as const,resetBeforeAdvance:false,nextGap:null,presentationOnly:true as const};if(!current||reducedMotion)return{mode:'snap' as const,resetBeforeAdvance:true,nextGap:next,presentationOnly:true as const};
  const overlap=Math.max(0,Math.min(current.end,next.end)-Math.max(current.start,next.start)),currentWidth=Math.max(.001,current.end-current.start),nextWidth=Math.max(.001,next.end-next.start),overlapRatio=overlap/Math.min(currentWidth,nextWidth),centerDelta=Math.abs((current.start+current.end-next.start-next.end)*.5),expandsDanger=next.start<current.start-.04||next.end>current.end+.04,disconnected=overlapRatio<.18||centerDelta>.22;
  const snap=expandsDanger||disconnected;return{mode:snap?'snap' as const:'track' as const,resetBeforeAdvance:snap,nextGap:next,presentationOnly:true as const};
}
