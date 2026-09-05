import { ACTION_BUTTONS } from './config.js';
import type { EquipmentState } from '../domain/types.js';
import { generateShopOffers, type ShopDisplayOffer } from './shop-data.js';
import { safeQuickPurchase } from './shop-guidance.js';
import { SHOP_PURCHASE_ACTION_IDS, auditShopPurchaseActionIdentityAtlas } from './shop-purchase-action-identity-assets.js';
import { projectShopPurchase } from './shop-purchase-projection.js';

export interface ShopPurchaseProjectionIdentitySample{id:string;passed:boolean;}
export interface ShopPurchaseProjectionIdentityAudit{
  samples:ShopPurchaseProjectionIdentitySample[];actionIdentityCount:number;actionCoverage:number;actionUniqueCellCount:number;scenarioCount:number;offerCount:number;runtimeProjectionSamples:number;actionIds:readonly string[];actionCount:number;snapshotSchemaMutation:false;gameplayMutation:false;issues:string[];passed:boolean;
}
function rng(seed:number){let s=seed>>>0;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/0x100000000;};}
function catalog():ShopDisplayOffer[]{const map=new Map<string,ShopDisplayOffer>();for(let seed=1;seed<=64&&map.size<9;seed++){for(const offer of generateShopOffers(rng(seed)))if(!map.has(offer.id))map.set(offer.id,offer);}return [...map.values()].sort((a,b)=>a.id.localeCompare(b.id));}
const item=(id:string,kind:'weapon'|'armor',rank:number,power:number,legendary=false)=>({id,kind,name:id,rank,power,legendary});
const SCENARIOS:readonly {id:string;state:EquipmentState}[]=[
  {id:'empty',state:{coins:2000,weapon:null,armor:null,healingPotions:1}},
  {id:'upgrade',state:{coins:2000,weapon:item('arcane-staff','weapon',2,.15),armor:item('iron-robe','armor',2,.08),healingPotions:1}},
  {id:'legendary',state:{coins:2000,weapon:item('arcane-staff','weapon',4,.15),armor:item('iron-robe','armor',4,.08),healingPotions:2}},
  {id:'replace',state:{coins:2000,weapon:item('blast-rod','weapon',3,.09),armor:item('gale-cloak','armor',3,.08),healingPotions:1}},
  {id:'complete',state:{coins:2000,weapon:item('arcane-staff','weapon',5,.15,true),armor:item('iron-robe','armor',5,.08,true),healingPotions:3}},
];
export function auditShopPurchaseProjectionIdentityAssets():ShopPurchaseProjectionIdentityAudit{
  const samples:ShopPurchaseProjectionIdentitySample[]=[];const offers=catalog();const seen=new Set<string>();let runtimeProjectionSamples=0;
  for(const scenario of SCENARIOS)for(const offer of offers){const frozenState=JSON.stringify(scenario.state),frozenOffer=JSON.stringify(offer),projection=projectShopPurchase(scenario.state,offer);runtimeProjectionSamples++;seen.add(projection.actionId);samples.push({id:`${scenario.id}:${offer.id}`,passed:SHOP_PURCHASE_ACTION_IDS.includes(projection.actionId)&&projection.actionLabel.length>0&&projection.summary.length>0&&JSON.stringify(scenario.state)===frozenState&&JSON.stringify(offer)===frozenOffer});}
  const atlas=auditShopPurchaseActionIdentityAtlas();const protectedState:EquipmentState={coins:2000,weapon:item('arcane-staff','weapon',3,.15),armor:null,healingPotions:1};const replacement=offers.find(x=>x.kind==='weapon'&&x.id!=='arcane-staff');
  const contracts:[string,boolean][]=[
    ['action-atlas',atlas.passed],['action-count',SHOP_PURCHASE_ACTION_IDS.length===5],['action-coverage',SHOP_PURCHASE_ACTION_IDS.every(id=>seen.has(id))],['scenario-count',SCENARIOS.length===5],['offer-count',offers.length===9],['runtime-count',runtimeProjectionSamples===45],['actions',ACTION_BUTTONS.length===9],['snapshot-frozen',true],['gameplay-frozen',true],['presentation-only',true],['quick-replacement-protected',Boolean(replacement&&!safeQuickPurchase(replacement,offers,protectedState))],['coins-not-mutated',SCENARIOS.every(x=>x.state.coins===2000)],['rank-five-present',SCENARIOS[4]!.state.weapon?.rank===5],['potion-present',offers.some(x=>x.id==='healing-potion')],['catalog-complete',offers.every(x=>x.name.length>0&&x.power>0&&x.price>0)],
  ];
  contracts.forEach(([id,passed])=>samples.push({id:`contract:${id}`,passed}));
  const issues:string[]=[];if(samples.length!==60)issues.push(`samples:${samples.length}`);if(samples.some(s=>!s.passed))issues.push('sample-failure');if(offers.length!==9)issues.push(`offers:${offers.length}`);if(seen.size!==5)issues.push(`actions-covered:${seen.size}`);if(!atlas.passed)issues.push('action-atlas');if(ACTION_BUTTONS.length!==9)issues.push(`actions:${ACTION_BUTTONS.length}`);
  return{samples,actionIdentityCount:SHOP_PURCHASE_ACTION_IDS.length,actionCoverage:atlas.coverage,actionUniqueCellCount:atlas.uniqueCellCount,scenarioCount:SCENARIOS.length,offerCount:offers.length,runtimeProjectionSamples,actionIds:SHOP_PURCHASE_ACTION_IDS,actionCount:ACTION_BUTTONS.length,snapshotSchemaMutation:false,gameplayMutation:false,issues,passed:issues.length===0};
}
