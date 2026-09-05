export type BrowserLifecycleEvent='pageshow'|'resize'|'orientationchange'|'visibilitychange'|'pagehide'|'beforeunload';
export interface BrowserLifecyclePolicy{resetTransient:boolean;syncVisibility:boolean;checkpoint:boolean;}
export function browserLifecyclePolicy(event:BrowserLifecycleEvent):BrowserLifecyclePolicy{
  if(event==='pageshow')return{resetTransient:true,syncVisibility:true,checkpoint:false};
  if(event==='resize'||event==='orientationchange')return{resetTransient:true,syncVisibility:false,checkpoint:false};
  if(event==='visibilitychange')return{resetTransient:true,syncVisibility:true,checkpoint:true};
  return{resetTransient:true,syncVisibility:false,checkpoint:true};
}
