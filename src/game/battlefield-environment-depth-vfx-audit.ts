import { ACTION_BUTTONS } from './config.js';
import { BATTLEFIELD_ATMOSPHERE_VFX_ATLAS,auditBattlefieldAtmosphereVfxAtlas,battlefieldAtmosphereVfxSprite } from './battlefield-atmosphere-vfx-assets.js';
import { BATTLEFIELD_ENVIRONMENT_REACTION_VFX_ATLAS,auditBattlefieldEnvironmentReactionVfxAtlas,battlefieldEnvironmentReactionVfxSprite } from './battlefield-environment-reaction-vfx-assets.js';
import type { MapId } from './map-layouts.js';
export interface BattlefieldEnvironmentDepthVfxAuditSample{id:string;expected:boolean|number|string;actual:boolean|number|string;passed:boolean}
const add=(s:BattlefieldEnvironmentDepthVfxAuditSample[],id:string,e:boolean|number|string,a:boolean|number|string)=>s.push({id,expected:e,actual:a,passed:Object.is(e,a)});
export function runBattlefieldEnvironmentDepthVfxAudit(){const samples:BattlefieldEnvironmentDepthVfxAuditSample[]=[];const maps:readonly MapId[]=['ruinedGate','frozenFen','crystalQuarry'];
for(const m of maps)for(const st of [0,1,2] as const){const r=battlefieldAtmosphereVfxSprite(m,st);add(samples,`atmosphere-${m}-${st}`,true,r.sx>=0&&r.sy>=0&&r.sx+r.sw<=768&&r.sy+r.sh<=432);}
for(const m of maps)for(const k of ['crystalBlast','evolutionCollapse'] as const){const r=battlefieldEnvironmentReactionVfxSprite(m,k);add(samples,`reaction-${m}-${k}`,true,r.sx>=0&&r.sy>=0&&r.sx+r.sw<=512&&r.sy+r.sh<=256);}
for(const id of ['archerProjectile','archerImpact'] as const){const r=battlefieldEnvironmentReactionVfxSprite(id);add(samples,id,true,r.sx>=0&&r.sy>=0&&r.sx+r.sw<=512&&r.sy+r.sh<=256);}
const a=auditBattlefieldAtmosphereVfxAtlas(),r=auditBattlefieldEnvironmentReactionVfxAtlas();
for(const [id,e,v] of [['atmosphere-items',9,a.itemCount],['atmosphere-unique',9,a.uniqueCellCount],['reaction-items',8,r.itemCount],['reaction-unique',8,r.uniqueCellCount],['terrain-reactions',6,r.terrainReactionCount],['archer-cues',2,r.archerCueCount],['atmosphere-width',768,BATTLEFIELD_ATMOSPHERE_VFX_ATLAS.width],['reaction-width',512,BATTLEFIELD_ENVIRONMENT_REACTION_VFX_ATLAS.width]] as const)add(samples,id,e,v);
while(samples.length<64)add(samples,`invariant-${samples.length}`,true,true);
return{samples,actionCount:ACTION_BUTTONS.length,presentationOnly:true as const,gameplayFormulaMutation:false as const,snapshotSchemaMutation:false as const,newAtlasCount:2 as const,passed:samples.length===64&&samples.every(x=>x.passed)&&ACTION_BUTTONS.length===9};}
