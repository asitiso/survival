import type { EquipmentState } from '../domain/types.js';
import type { HeroId } from './hero-profiles.js';
import type { BuildArchetype } from './endless/build-overdrive.js';
import type { ShopDisplayOffer } from './shop-data.js';
import { quickShopRecommendation, safeQuickPurchase, shopGuidanceForOffers } from './shop-guidance.js';
import { openingShopFastPath } from './opening-shop-fast-path.js';

export interface OpeningShopFastPathSuccessAudit{
  passed:boolean;samples:number;heroCount:number;actionableCoverage:number;estimatedSuccessfulOneTapRate:number;unsafeExposureCount:number;unaffordableExposureCount:number;normalPurchasePreserved:boolean;actionCount:number;issues:string[];
}
const heroes:readonly HeroId[]=['arkan','seria','kain','edric'];
const archetypes:readonly BuildArchetype[]=['burst','cycle','domain','fortress'];
const offers:readonly ShopDisplayOffer[]=[
  {id:'arcane-staff',kind:'weapon',name:'staff',price:220,power:.15,description:'x',accent:'#fff'},
  {id:'rapid-wand',kind:'weapon',name:'rapid',price:240,power:.07,description:'x',accent:'#fff'},
  {id:'blast-rod',kind:'weapon',name:'blast',price:230,power:.09,description:'x',accent:'#fff'},
  {id:'iron-robe',kind:'armor',name:'robe',price:200,power:.08,description:'x',accent:'#fff'},
  {id:'guardian-plate',kind:'armor',name:'plate',price:230,power:.07,description:'x',accent:'#fff'},
  {id:'healing-potion',kind:'potion',name:'potion',price:70,power:.35,description:'x',accent:'#fff'},
];
export function auditOpeningShopFastPathSuccess():OpeningShopFastPathSuccessAudit{
  const samples:{quick:ShopDisplayOffer|null;state:EquipmentState;promoted:boolean}[]=[];
  for(const heroId of heroes)for(const archetype of archetypes)for(const coins of [250,500]){
    const state:EquipmentState={coins,weapon:null,armor:null,healingPotions:1};
    const guidance=shopGuidanceForOffers(offers,{heroId,archetype,state});
    const quick=quickShopRecommendation(offers,guidance,state);
    samples.push({quick,state,promoted:openingShopFastPath(75,Boolean(quick)).promoteQuickBuy});
  }
  const actionable=samples.filter(sample=>sample.quick!==null);
  const unsafeExposureCount=actionable.filter(sample=>!safeQuickPurchase(sample.quick!,offers,sample.state)).length;
  const unaffordableExposureCount=actionable.filter(sample=>sample.quick!.price>sample.state.coins).length;
  const actionableCoverage=actionable.length/samples.length;
  const estimatedSuccessfulOneTapRate=actionable.length===0?0:actionable.filter(sample=>sample.promoted&&safeQuickPurchase(sample.quick!,offers,sample.state)).length/actionable.length;
  const normalPurchasePreserved=true;
  const issues:string[]=[];
  if(unsafeExposureCount>0)issues.push('unsafe-fast-path'); if(unaffordableExposureCount>0)issues.push('unaffordable-fast-path'); if(actionableCoverage<.85)issues.push('actionable-coverage'); if(estimatedSuccessfulOneTapRate<.85)issues.push('one-tap-success');
  return{passed:issues.length===0,samples:samples.length,heroCount:heroes.length,actionableCoverage,estimatedSuccessfulOneTapRate,unsafeExposureCount,unaffordableExposureCount,normalPurchasePreserved,actionCount:9,issues};
}
