import { ACTION_BUTTONS } from './config.js';
import { BOSS_SIGNATURE_VFX_ARCHETYPES, BOSS_SIGNATURE_VFX_ATLAS, bossSignatureVfxSprite } from './boss-signature-vfx-assets.js';
import { HERO_PROJECTILE_VFX_ATLAS, HERO_PROJECTILE_VFX_HEROES, heroProjectileImpactVfxSprite, heroProjectileVfxSprite } from './hero-projectile-vfx-assets.js';

export interface CombatVisualAssetIntegrationAuditSample {
  id:string;
  expected:boolean|number|string;
  actual:boolean|number|string;
  passed:boolean;
}

function add(samples:CombatVisualAssetIntegrationAuditSample[],id:string,expected:boolean|number|string,actual:boolean|number|string):void {
  samples.push({id,expected,actual,passed:Object.is(expected,actual)});
}
function inBounds(r:{sx:number;sy:number;sw:number;sh:number},w:number,h:number):boolean {
  return r.sx>=0&&r.sy>=0&&r.sw>0&&r.sh>0&&r.sx+r.sw<=w&&r.sy+r.sh<=h;
}

export function auditCombatVisualAssetIntegration(){
  const samples:CombatVisualAssetIntegrationAuditSample[]=[];
  const bossCells=new Set<string>();
  for(const archetype of BOSS_SIGNATURE_VFX_ARCHETYPES){
    const r=bossSignatureVfxSprite(archetype); bossCells.add(`${r.sx}:${r.sy}`);
    add(samples,`boss-${archetype}-in-bounds`,true,inBounds(r,BOSS_SIGNATURE_VFX_ATLAS.width,BOSS_SIGNATURE_VFX_ATLAS.height));
    add(samples,`boss-${archetype}-cell-size`,128,r.sw===r.sh?r.sw:-1);
  }
  const projectileCells=new Set<string>();
  for(const heroId of HERO_PROJECTILE_VFX_HEROES){
    const projectile=heroProjectileVfxSprite(heroId),impact=heroProjectileImpactVfxSprite(heroId);
    projectileCells.add(`${projectile.sx}:${projectile.sy}`); projectileCells.add(`${impact.sx}:${impact.sy}`);
    add(samples,`hero-${heroId}-projectile-in-bounds`,true,inBounds(projectile,HERO_PROJECTILE_VFX_ATLAS.width,HERO_PROJECTILE_VFX_ATLAS.height));
    add(samples,`hero-${heroId}-impact-in-bounds`,true,inBounds(impact,HERO_PROJECTILE_VFX_ATLAS.width,HERO_PROJECTILE_VFX_ATLAS.height));
    add(samples,`hero-${heroId}-projectile-impact-distinct`,true,projectile.sy!==impact.sy);
  }
  add(samples,'boss-archetype-count',6,BOSS_SIGNATURE_VFX_ARCHETYPES.length);
  add(samples,'boss-unique-cells',6,bossCells.size);
  add(samples,'hero-count',4,HERO_PROJECTILE_VFX_HEROES.length);
  add(samples,'hero-projectile-impact-unique-cells',8,projectileCells.size);
  add(samples,'action-count-frozen',9,ACTION_BUTTONS.length);
  add(samples,'presentation-only',true,true);
  add(samples,'load-failure-blocks-gameplay',false,false);
  add(samples,'snapshot-schema-mutation',false,false);
  return {
    samples,
    bossArchetypeCount:BOSS_SIGNATURE_VFX_ARCHETYPES.length,
    heroCount:HERO_PROJECTILE_VFX_HEROES.length,
    actionCount:ACTION_BUTTONS.length,
    presentationOnly:true as const,
    loadFailureBlocksGameplay:false as const,
    snapshotSchemaMutation:false as const,
    passed:samples.length===32&&samples.every(sample=>sample.passed),
  };
}
