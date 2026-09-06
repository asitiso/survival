export type SafeLaneIdentityOwner='law'|'direction'|'geometry'|'combat'|'none';
export interface SafeLaneIdentityOwnerArbitrationInput{lawActive:boolean;lawIdAvailable:boolean;mythic:boolean;directionVisible:boolean;attentionOwner:'navigation'|'combat'|'law';}
export function safeLaneIdentityOwnerArbitrationPresentation(input:SafeLaneIdentityOwnerArbitrationInput){
  let owner:SafeLaneIdentityOwner='none';
  if(input.attentionOwner==='combat')owner='combat';else if(input.lawActive&&input.lawIdAvailable)owner='law';else if(input.directionVisible)owner='direction';else if(input.mythic)owner='geometry';
  return{owner,showLawIcon:owner==='law',showDirectionIcon:owner==='direction',showGeometryIcon:owner==='geometry',presentationOnly:true as const};
}
