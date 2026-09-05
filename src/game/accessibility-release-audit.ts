import { ACTION_BUTTONS } from './config.js';
import { ArcaneAudio } from './audio.js';
import { applyPresentationSettings, defaultPresentationSettings } from './presentation-settings.js';
export interface AccessibilityReleaseAudit{reducedFlashSafe:boolean;reducedShakeSafe:boolean;reducedMotionSafe:boolean;hapticsCanDisable:boolean;audioCanMute:boolean;criticalTelegraphsPreserved:boolean;actionCount:number;settingsFieldCount:number;passed:boolean;}
export function auditAccessibilityRelease():AccessibilityReleaseAudit{
  const reduced={...defaultPresentationSettings(true),haptics:false};
  const cue=applyPresentationSettings({alpha:.95,shake:12,haptic:true},reduced);
  const reducedFlashSafe=cue.alpha<=.58&&cue.alpha>=.4;
  const reducedShakeSafe=cue.shake<=4.8;
  const reducedMotionSafe=reduced.reducedMotion===true;
  const hapticsCanDisable=cue.haptic===false;
  const audioCanMute=new ArcaneAudio({enabled:false,volume:.65}).play('bossSpawn',0)===false;
  const criticalTelegraphsPreserved=cue.alpha>0&&ACTION_BUTTONS.length===9;
  const actionCount=ACTION_BUTTONS.length,settingsFieldCount=Object.keys(defaultPresentationSettings()).length;
  const passed=reducedFlashSafe&&reducedShakeSafe&&reducedMotionSafe&&hapticsCanDisable&&audioCanMute&&criticalTelegraphsPreserved&&actionCount===9&&settingsFieldCount===5;
  return{reducedFlashSafe,reducedShakeSafe,reducedMotionSafe,hapticsCanDisable,audioCanMute,criticalTelegraphsPreserved,actionCount,settingsFieldCount,passed};
}
