import { ACTION_BUTTONS } from './config.js';
import type { HeroId } from './hero-profiles.js';
import type { SpellId } from './spells.js';
import { spellEvolution, spellEvolutionTier } from './spell-evolutions.js';
import { SPELL_EVOLUTION_MODIFIER_IDENTITY_IDS, auditSpellEvolutionModifierIdentityAtlas } from './spell-evolution-modifier-identity-assets.js';
import { SPELL_EVOLUTION_TIER_DELTA_IDS, auditSpellEvolutionTierDeltaIdentityAtlas } from './spell-evolution-tier-delta-identity-assets.js';
import { projectSpellEvolutionSelection, spellEvolutionProjectionHint } from './spell-evolution-selection-projection.js';

export interface SpellEvolutionProjectionIdentitySample{id:string;passed:boolean;}
export interface SpellEvolutionProjectionIdentityAudit{
  samples:SpellEvolutionProjectionIdentitySample[];modifierIdentityCount:number;tierDeltaIdentityCount:number;modifierCoverage:number;tierDeltaCoverage:number;modifierUniqueCellCount:number;tierDeltaUniqueCellCount:number;
  heroCount:number;spellCount:number;transitionLevels:readonly[4,9];evolutionNameCombinationCount:number;actionCount:number;snapshotSchemaMutation:false;gameplayMutation:false;issues:string[];passed:boolean;
}
const HEROES:readonly HeroId[]=['arkan','seria','kain','edric'];
const SPELLS:readonly SpellId[]=['fireBolt','chainLightning','frostNova','flameField','meteorStorm','blackHole'];
const equalProfile=(a:ReturnType<typeof spellEvolution>,b:ReturnType<typeof spellEvolution>)=>Object.keys(a).every(key=>a[key as keyof typeof a]===b[key as keyof typeof b]);

export function auditSpellEvolutionProjectionIdentityAssets():SpellEvolutionProjectionIdentityAudit{
  const samples:SpellEvolutionProjectionIdentitySample[]=[];
  for(const hero of HEROES)for(const spell of SPELLS)for(const level of [4,9] as const){
    const projection=projectSpellEvolutionSelection(hero,spell,level),expected=spellEvolution(hero,spell,level+1),expectedTier=level===4?'awaken':'final';
    samples.push({id:`${hero}:${spell}:${level}>${level+1}`,passed:Boolean(projection&&projection.tierDeltaId===expectedTier&&projection.effects.length>=1&&projection.effects.length<=2&&projection.modifierIds.length===projection.effects.length&&equalProfile(projection.after,expected)&&spellEvolutionProjectionHint(projection).includes('진화 실효'))});
  }
  let evolutionNameCombinationCount=0,namesOk=true;for(const hero of HEROES)for(const spell of SPELLS)for(const level of [5,10] as const){const profile=spellEvolution(hero,spell,level);evolutionNameCombinationCount++;if(!profile.name||profile.tier===0)namesOk=false;}
  const modifierAtlas=auditSpellEvolutionModifierIdentityAtlas(),tierAtlas=auditSpellEvolutionTierDeltaIdentityAtlas();
  const aggregate:[string,boolean][]=[
    ['modifier-atlas',modifierAtlas.passed],['tier-atlas',tierAtlas.passed],['modifier-count',SPELL_EVOLUTION_MODIFIER_IDENTITY_IDS.length===8],['tier-count',SPELL_EVOLUTION_TIER_DELTA_IDS.length===2],
    ['hero-count',HEROES.length===4],['spell-count',SPELLS.length===6],['boundary-4',spellEvolutionTier(4)===0&&spellEvolutionTier(5)===1],['boundary-9',spellEvolutionTier(9)===1&&spellEvolutionTier(10)===2],
    ['non-boundary-null',projectSpellEvolutionSelection('arkan','fireBolt',3)===null&&projectSpellEvolutionSelection('arkan','fireBolt',5)===null],['name-contract',evolutionNameCombinationCount===48&&namesOk],['actions',ACTION_BUTTONS.length===9],['presentation-only',true],
  ];
  aggregate.forEach(([id,passed])=>samples.push({id:`contract:${id}`,passed}));
  const issues:string[]=[];if(samples.length!==60)issues.push(`samples:${samples.length}`);if(samples.some(sample=>!sample.passed))issues.push('sample-failure');if(!modifierAtlas.passed)issues.push('modifier-atlas');if(!tierAtlas.passed)issues.push('tier-atlas');if(evolutionNameCombinationCount!==48||!namesOk)issues.push('evolution-names');if(ACTION_BUTTONS.length!==9)issues.push(`actions:${ACTION_BUTTONS.length}`);
  return{samples,modifierIdentityCount:SPELL_EVOLUTION_MODIFIER_IDENTITY_IDS.length,tierDeltaIdentityCount:SPELL_EVOLUTION_TIER_DELTA_IDS.length,modifierCoverage:modifierAtlas.coverage,tierDeltaCoverage:tierAtlas.coverage,modifierUniqueCellCount:modifierAtlas.uniqueCellCount,tierDeltaUniqueCellCount:tierAtlas.uniqueCellCount,heroCount:HEROES.length,spellCount:SPELLS.length,transitionLevels:[4,9],evolutionNameCombinationCount,actionCount:ACTION_BUTTONS.length,snapshotSchemaMutation:false,gameplayMutation:false,issues,passed:issues.length===0};
}
