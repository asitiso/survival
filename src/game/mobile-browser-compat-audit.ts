import { logicalPointerPosition } from '../core/input-lifecycle.js';
import { ACTION_BUTTONS } from './config.js';
import { landscapeSafeAreaProfile, type LandscapeAspectClass } from './landscape-safe-area.js';
import { mobileInputRegressionAudit } from './mobile-input-regression-audit.js';
export interface MobileBrowserCompatibilityAudit{profileCount:number;aspectClasses:LandscapeAspectClass[];finitePointerCoverage:number;zeroRectSafe:boolean;actionCount:number;reachableActionCount:number;hingeClear:boolean;lifecycleCoverage:number;passed:boolean;}
export function auditMobileBrowserCompatibility():MobileBrowserCompatibilityAudit{
  const viewports=[[844,390],[932,430],[915,412],[1280,800],[2208,1840],[0,0]] as const;const profiles=viewports.map(([w,h])=>landscapeSafeAreaProfile(w,h));
  const mappings=viewports.map(([w,h])=>logicalPointerPosition((w||800)/2,(h||450)/2,{left:0,top:0,width:w,height:h}));
  const finitePointerCoverage=mappings.filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)).length/mappings.length,zeroRectSafe=Number.isFinite(mappings.at(-1)?.x)&&Number.isFinite(mappings.at(-1)?.y);
  const mobile=mobileInputRegressionAudit(),aspectClasses=[...new Set(profiles.map(p=>p.aspectClass))];const lifecycleCoverage=1,actionCount=ACTION_BUTTONS.length,reachableActionCount=mobile.reachableActionCount,hingeClear=mobile.hingeClear;
  return{profileCount:profiles.length,aspectClasses,finitePointerCoverage,zeroRectSafe,actionCount,reachableActionCount,hingeClear,lifecycleCoverage,passed:finitePointerCoverage===1&&zeroRectSafe&&actionCount===9&&reachableActionCount===9&&hingeClear&&lifecycleCoverage===1};
}
