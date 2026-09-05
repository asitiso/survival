export interface OpeningAutoReadyProfile{
  initialAutoEnabled:true;
  savedOpeningTaps:1;
  actionCount:9;
  newActionCount:0;
  snapshotMutation:false;
}
export function openingAutoReadyProfile():OpeningAutoReadyProfile{
  return{initialAutoEnabled:true,savedOpeningTaps:1,actionCount:9,newActionCount:0,snapshotMutation:false};
}
export function openingAutoCastIntent(autoEnabled:boolean,held:boolean):{manualHeld:boolean;autoTriggered:boolean}{
  return{manualHeld:held,autoTriggered:autoEnabled&&!held};
}
