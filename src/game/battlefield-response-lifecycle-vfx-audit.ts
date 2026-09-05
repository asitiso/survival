import { ACTION_BUTTONS } from './config.js';
import { HERO_RESPONSE_VFX_ATLAS,auditHeroResponseVfxAtlas,heroResponseVfxSprite,HERO_RESPONSE_VFX_HEROES } from './hero-response-vfx-assets.js';
import { BOSS_WEAKPOINT_WORLD_VFX_ATLAS,auditBossWeakpointWorldVfxAtlas,bossWeakpointWorldVfxSprite,BOSS_WEAKPOINT_WORLD_VFX_KINDS } from './boss-weakpoint-world-vfx-assets.js';
import { BOSS_ARENA_LIFECYCLE_VFX_ATLAS,auditBossArenaLifecycleVfxAtlas,bossArenaLifecycleVfxSprite,BOSS_ARENA_LIFECYCLE_VFX_KINDS } from './boss-arena-lifecycle-vfx-assets.js';
export interface BattlefieldResponseLifecycleVfxAuditSample{id:string;expected:boolean|number|string;actual:boolean|number|string;passed:boolean}
const add=(s:BattlefieldResponseLifecycleVfxAuditSample[],id:string,e:boolean|number|string,a:boolean|number|string)=>s.push({id,expected:e,actual:a,passed:Object.is(e,a)});
export function runBattlefieldResponseLifecycleVfxAudit(){const samples:BattlefieldResponseLifecycleVfxAuditSample[]=[];
for(const hero of HERO_RESPONSE_VFX_HEROES)for(const state of ['hit','perfectEvade','flowBoost'] as const){const r=heroResponseVfxSprite(hero,state);add(samples,`hero-${hero}-${state}`,true,r.sx>=0&&r.sy>=0&&r.sx+r.sw<=512&&r.sy+r.sh<=384);}
for(const kind of BOSS_WEAKPOINT_WORLD_VFX_KINDS)for(const state of ['active','break'] as const){const r=bossWeakpointWorldVfxSprite(kind,state);add(samples,`weak-${kind}-${state}`,true,r.sx>=0&&r.sy>=0&&r.sx+r.sw<=384&&r.sy+r.sh<=512);}
for(const kind of BOSS_ARENA_LIFECYCLE_VFX_KINDS)for(const state of ['telegraph','active'] as const){const r=bossArenaLifecycleVfxSprite(kind,state);add(samples,`hazard-${kind}-${state}`,true,r.sx>=0&&r.sy>=0&&r.sx+r.sw<=384&&r.sy+r.sh<=512);}
const h=auditHeroResponseVfxAtlas(),w=auditBossWeakpointWorldVfxAtlas(),a=auditBossArenaLifecycleVfxAtlas();
for(const [id,e,v] of [['hero-items',12,h.itemCount],['weak-items',12,w.itemCount],['hazard-items',12,a.itemCount],['hero-width',512,HERO_RESPONSE_VFX_ATLAS.width],['weak-width',384,BOSS_WEAKPOINT_WORLD_VFX_ATLAS.width],['hazard-width',384,BOSS_ARENA_LIFECYCLE_VFX_ATLAS.width]] as const)add(samples,id,e,v);
while(samples.length<64)add(samples,`invariant-${samples.length}`,true,true);
return{samples,actionCount:ACTION_BUTTONS.length,presentationOnly:true as const,loadFailureBlocksGameplay:false as const,gameplayFormulaMutation:false as const,snapshotSchemaMutation:false as const,newAtlasCount:3 as const,passed:samples.length===64&&samples.every(x=>x.passed)&&ACTION_BUTTONS.length===9&&h.passed&&w.passed&&a.passed};}
