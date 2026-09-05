import type { PresentationQuality } from './presentation-budget.js';
export type BossSafeResponseCompactMode='hidden'|'compact'|'full';
export interface BossSafeResponseCompactPresentation{mode:BossSafeResponseCompactMode;showLabel:boolean;label:'대응 여유';ringAlpha:number;claimsGlobalSafety:false;}
export function bossSafeResponseCompactAcknowledgement(input:{active:boolean;quality:PresentationQuality;actionAssistVisible:boolean;responseAckVisible:boolean;heroCritical:boolean;coreCritical:boolean;}):BossSafeResponseCompactPresentation{
 if(!input.active||input.heroCritical||input.coreCritical)return{mode:'hidden',showLabel:false,label:'대응 여유',ringAlpha:0,claimsGlobalSafety:false};
 const compact=input.quality==='low'||input.actionAssistVisible||input.responseAckVisible;
 const ringAlpha=input.quality==='high'?.78:input.quality==='medium'?.68:.58;
 return{mode:compact?'compact':'full',showLabel:!compact,label:'대응 여유',ringAlpha,claimsGlobalSafety:false};
}
