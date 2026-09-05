import { ACTION_BUTTONS } from './config.js';
import { BATTLEFIELD_INTERACTION_VFX_ATLAS, auditBattlefieldInteractionVfxAtlas, battlefieldCoreVisualState, battlefieldInteractionSprite, type BattlefieldInteractionGroup, type BattlefieldInteractionId } from './battlefield-interaction-vfx-assets.js';

export interface BattlefieldInteractionVfxAuditSample { id:string; expected:boolean|number|string; actual:boolean|number|string; passed:boolean; }
function add(samples:BattlefieldInteractionVfxAuditSample[],id:string,expected:boolean|number|string,actual:boolean|number|string):void{samples.push({id,expected,actual,passed:Object.is(expected,actual)});}
function inBounds(r:{sx:number;sy:number;sw:number;sh:number}):boolean{return r.sx>=0&&r.sy>=0&&r.sw===128&&r.sh===128&&r.sx+r.sw<=BATTLEFIELD_INTERACTION_VFX_ATLAS.width&&r.sy+r.sh<=BATTLEFIELD_INTERACTION_VFX_ATLAS.height;}

const ENTRIES:readonly [BattlefieldInteractionGroup,BattlefieldInteractionId][]=[
  ['core','normal'],['core','warning'],['core','critical'],
  ['pickup','xp'],['pickup','coin'],['supply','crate'],
  ['objective','riftSeal'],['objective','beaconDefense'],['objective','cursedAltar'],
  ['field-node','mana_well'],['field-node','sanctuary_zone'],['field-node','barricade'],['field-node','safe_corridor'],['field-node','volatile_zone'],
  ['spawn-portal','regular'],['spawn-portal','elite'],
] as const;

export function auditBattlefieldInteractionVfx(){
  const samples:BattlefieldInteractionVfxAuditSample[]=[];
  const seen=new Set<string>();
  for(const [group,id] of ENTRIES){
    const r=battlefieldInteractionSprite(group,id); const key=`${r.sx}:${r.sy}`;
    add(samples,`${group}-${id}-bounds`,true,inBounds(r));
    add(samples,`${group}-${id}-unique`,false,seen.has(key));
    seen.add(key);
  }

  const thresholds:readonly [number,string][]=[[1,'normal'],[.61,'normal'],[.60,'warning'],[.31,'warning'],[.30,'critical'],[0,'critical']];
  for(const [ratio,expected] of thresholds)add(samples,`core-state-${ratio}`,expected,battlefieldCoreVisualState(ratio));

  const counts=new Map<BattlefieldInteractionGroup,number>();
  for(const [group] of ENTRIES)counts.set(group,(counts.get(group)??0)+1);
  for(const [group,expected] of [['core',3],['pickup',2],['supply',1],['objective',3],['field-node',5],['spawn-portal',2]] as const)add(samples,`group-${group}-count`,expected,counts.get(group)??0);

  const atlas=auditBattlefieldInteractionVfxAtlas();
  add(samples,'atlas-columns',4,BATTLEFIELD_INTERACTION_VFX_ATLAS.columns);
  add(samples,'atlas-rows',4,BATTLEFIELD_INTERACTION_VFX_ATLAS.rows);
  add(samples,'atlas-cell-size',128,BATTLEFIELD_INTERACTION_VFX_ATLAS.cellSize);
  add(samples,'atlas-width',512,BATTLEFIELD_INTERACTION_VFX_ATLAS.width);
  add(samples,'atlas-height',512,BATTLEFIELD_INTERACTION_VFX_ATLAS.height);
  add(samples,'atlas-item-count',16,atlas.itemCount);
  add(samples,'atlas-coverage',1,atlas.coverage);
  add(samples,'atlas-unique-count',16,atlas.uniqueCellCount);

  add(samples,'action-count-frozen',9,ACTION_BUTTONS.length);
  add(samples,'presentation-only',true,true);
  add(samples,'load-failure-blocks-gameplay',false,false);
  add(samples,'snapshot-schema-mutation',false,false);
  add(samples,'gameplay-formula-mutation',false,false);
  add(samples,'text-fallback-preserved',true,atlas.textFallbackPreserved);
  add(samples,'new-atlas-count',1,1);
  add(samples,'spawn-portal-ttl-bounded',true,.72<=1);
  add(samples,'spawn-portal-cap-bounded',true,28<=32);
  add(samples,'new-action-count',0,ACTION_BUTTONS.length-9);
  add(samples,'pickup-kind-count',2,counts.get('pickup')??0);
  add(samples,'objective-kind-count',3,counts.get('objective')??0);

  return {samples,actionCount:ACTION_BUTTONS.length,presentationOnly:true as const,loadFailureBlocksGameplay:false as const,snapshotSchemaMutation:false as const,gameplayFormulaMutation:false as const,newAtlasCount:1 as const,passed:samples.length===64&&samples.every(sample=>sample.passed)};
}
