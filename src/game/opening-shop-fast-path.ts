export interface OpeningShopFastPathProfile{
  promoteQuickBuy:boolean;
  position:'before-grid'|'footer';
  estimatedPointerTravelReduction:number;
  newControlCount:0;
}
export function openingShopFastPath(elapsedSeconds:number,hasSafeQuickOffer:boolean):OpeningShopFastPathProfile{
  const promote=elapsedSeconds<180&&hasSafeQuickOffer;
  return{promoteQuickBuy:promote,position:promote?'before-grid':'footer',estimatedPointerTravelReduction:promote?.56:0,newControlCount:0};
}
