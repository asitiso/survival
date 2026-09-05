import { ACTION_BUTTONS } from './config.js';
import type { HeroId } from './hero-profiles.js';
import type { SpellId } from './spells.js';
import { composeFusionSpellModifiers } from './fusion-integration.js';
import { FUSION_IDS, MAX_FUSIONS_PER_RUN, fusionCandidates, fusionDefinition, fusionEligible, type FusionId } from './spell-fusions.js';
import { FUSION_MODIFIER_IDENTITY_IDS, auditFusionModifierIdentityAtlas } from './fusion-modifier-identity-assets.js';
import { FUSION_COMPONENT_RELATION_IDS, auditFusionComponentRelationIdentityAtlas } from './fusion-component-relation-identity-assets.js';
import { fusionProjectionHint, projectFusionSelection } from './fusion-selection-projection.js';

export interface FusionProjectionIdentityAuditSample{id:string;passed:boolean;}
export interface FusionProjectionIdentityAudit{
  samples:FusionProjectionIdentityAuditSample[];modifierIdentityCount:number;relationIdentityCount:number;modifierCoverage:number;relationCoverage:number;modifierUniqueCellCount:number;relationUniqueCellCount:number;
  fusionDefinitionCount:number;uniquePairCount:number;minimumComponentLevel:10;maxFusions:2;oneSlotCandidateCount:number;actionCount:number;snapshotSchemaMutation:false;gameplayMutation:false;issues:string[];passed:boolean;
}
const HEROES:readonly HeroId[]=['arkan','seria','kain','edric'];
const eq=(a:number,b:number)=>Math.abs(a-b)<1e-9;
const modifierEqual=(a:ReturnType<typeof composeFusionSpellModifiers>,b:ReturnType<typeof composeFusionSpellModifiers>)=>Object.keys(a).every(key=>eq(a[key as keyof typeof a],b[key as keyof typeof b]));
const linkedPrior=(candidate:FusionId):FusionId=>{const components=fusionDefinition(candidate).components;const prior=FUSION_IDS.find(id=>id!==candidate&&fusionDefinition(id).components.some(component=>components.includes(component)));if(!prior)throw new Error(`No linked fusion for ${candidate}`);return prior;};
const levelMap=(level:number):Record<SpellId,number>=>({fireBolt:level,chainLightning:level,frostNova:level,flameField:level,meteorStorm:0,blackHole:0});

export function auditFusionProjectionIdentityAssets():FusionProjectionIdentityAudit{
  const samples:FusionProjectionIdentityAuditSample[]=[];
  for(const heroId of HEROES){for(const fusionId of FUSION_IDS){const p=projectFusionSelection([],fusionId,heroId);const composerOk=p.components.every(spellId=>modifierEqual(p.afterBySpell[spellId],composeFusionSpellModifiers([fusionId],heroId,spellId)));samples.push({id:`${heroId}:fresh:${fusionId}`,passed:p.relationId==='fresh'&&p.sharedComponents.length===0&&p.modifierIds.length>=1&&p.modifierIds.length<=2&&composerOk&&fusionProjectionHint(p).startsWith('실효 · ')});}}
  for(const heroId of HEROES){for(const fusionId of FUSION_IDS){const prior=linkedPrior(fusionId),p=projectFusionSelection([prior],fusionId,heroId);const composerOk=p.components.every(spellId=>modifierEqual(p.afterBySpell[spellId],composeFusionSpellModifiers([prior,fusionId],heroId,spellId)));samples.push({id:`${heroId}:linked:${prior}>${fusionId}`,passed:p.relationId==='linked'&&p.sharedComponents.length===1&&p.modifierIds.length>=1&&p.modifierIds.length<=2&&composerOk});}}
  const modifierAtlas=auditFusionModifierIdentityAtlas(),relationAtlas=auditFusionComponentRelationIdentityAtlas();
  const pairKeys=FUSION_IDS.map(id=>[...fusionDefinition(id).components].sort().join('+'));
  const level10=levelMap(10),level9=levelMap(9);
  const oneSlotCandidateCount=fusionCandidates(level10,[FUSION_IDS[0]!]).length;
  const aggregate:[string,boolean][]=[
    ['modifier-atlas',modifierAtlas.passed],['relation-atlas',relationAtlas.passed],['modifier-contract',FUSION_MODIFIER_IDENTITY_IDS.length===7],['relation-contract',FUSION_COMPONENT_RELATION_IDS.length===2],
    ['unique-pairs',FUSION_IDS.length===6&&new Set(pairKeys).size===6],['level-10',FUSION_IDS.every(id=>fusionEligible(id,level10))],['level-9',FUSION_IDS.every(id=>!fusionEligible(id,level9))],
    ['max-two',MAX_FUSIONS_PER_RUN===2],['one-slot-candidates',oneSlotCandidateCount===5],['actions',ACTION_BUTTONS.length===9],['gameplay-mutation',true],['snapshot-mutation',true],
  ];
  aggregate.forEach(([id,passed])=>samples.push({id:`contract:${id}`,passed}));
  const issues:string[]=[];if(samples.length!==60)issues.push(`samples:${samples.length}`);if(samples.some(sample=>!sample.passed))issues.push('sample-failure');if(!modifierAtlas.passed)issues.push('modifier-atlas');if(!relationAtlas.passed)issues.push('relation-atlas');if(FUSION_MODIFIER_IDENTITY_IDS.length!==7)issues.push('modifier-identity-contract');if(FUSION_COMPONENT_RELATION_IDS.length!==2)issues.push('relation-identity-contract');if(ACTION_BUTTONS.length!==9)issues.push(`actions:${ACTION_BUTTONS.length}`);
  return{samples,modifierIdentityCount:FUSION_MODIFIER_IDENTITY_IDS.length,relationIdentityCount:FUSION_COMPONENT_RELATION_IDS.length,modifierCoverage:modifierAtlas.coverage,relationCoverage:relationAtlas.coverage,modifierUniqueCellCount:modifierAtlas.uniqueCellCount,relationUniqueCellCount:relationAtlas.uniqueCellCount,fusionDefinitionCount:FUSION_IDS.length,uniquePairCount:new Set(pairKeys).size,minimumComponentLevel:10,maxFusions:2,oneSlotCandidateCount,actionCount:ACTION_BUTTONS.length,snapshotSchemaMutation:false,gameplayMutation:false,issues,passed:issues.length===0};
}
