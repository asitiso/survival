import type { HeroId } from '../game/hero-profiles.js';
import type { RunTraitId } from '../game/run-traits.js';
import type { ThreatLevel } from './threat-level.js';
import type { MapId } from '../game/map-layouts.js';
import type { HeroFinalFormId } from '../game/endless/final-form.js';
import type { HeroAscensionId } from '../game/endless/hero-ascension.js';
import type { FatePathId } from '../game/fate-paths.js';
import type { RelicId } from '../game/relics.js';
import type { FusionId } from '../game/spell-fusions.js';
import type { BuildArchetype } from '../game/endless/build-overdrive.js';
import type { SpellId } from '../game/spells.js';

export interface BuildCapsulePayload {
  version:1;
  heroId:HeroId;
  traitId:RunTraitId|null;
  threatLevel:ThreatLevel;
  mapId:MapId;
  seed:number;
  finalForm:HeroFinalFormId|null;
  ascensions:HeroAscensionId[];
  fateChoices:FatePathId[];
  relic:RelicId|null;
  fusions:FusionId[];
  archetype:BuildArchetype;
  spellLevels:Record<SpellId,number>;
}

const HERO_IDS=['arkan','seria','kain','edric'] as const;
const TRAIT_IDS=['destruction','rapidCasting','goldSense','guardianOath','infernalPact','glacialFocus','stormPursuit','bastionVow'] as const;
const MAP_IDS=['ruinedGate','frozenFen','crystalQuarry'] as const;
const FINAL_FORMS=['solar-sovereign','phoenix-lord','volcanic-archon','absolute-empress','winter-warden','crystal-oracle','thunder-tyrant','tempest-runner','storm-oracle','radiant-king','oath-guardian','light-pilgrim'] as const;
const ASCENSIONS=[
  'wildfire-doctrine','ash-step','solar-collapse','cinder-heart','eruption-chain','phoenix-cycle','absolute-zero','frozen-time','crystal-echo','glacier-step','whiteout','winter-covenant',
  'storm-circuit','thunder-step','overcharge','sky-breaker','static-shell','tempest-loop','holy-bastion','vow-of-light','judgment-bell','pilgrim-step','radiant-wall','last-oath',
] as const;
const FATES=['frenzy','golden','guardian'] as const;
const RELICS=['abyss-eye','chrono-shard','guardian-heart','ember-crown','winter-heart','storm-core','oath-seal','inferno-heart','summoner-sigil','juggernaut-core','phoenix-brand','zero-crystal','storm-crown','citadel-sigil'] as const;
const FUSIONS=['solar-detonation','storm-crucible','frostfire-cataclysm','thunder-singularity','glacial-conduit','cataclysmic-domain'] as const;
const ARCHETYPES=['burst','cycle','domain','fortress'] as const;
const SPELL_IDS=['fireBolt','chainLightning','frostNova','flameField','meteorStorm','blackHole'] as const satisfies readonly SpellId[];

type UnknownRecord=Record<string,unknown>;
function object(value:unknown):UnknownRecord { return value!==null&&typeof value==='object'&&!Array.isArray(value)?value as UnknownRecord:{}; }
function boundedInt(value:unknown,min:number,max:number,fallback:number):number { const n=Number(value); return Number.isFinite(n)?Math.max(min,Math.min(max,Math.floor(n))):fallback; }
function includes<T extends readonly string[]>(items:T,value:unknown):value is T[number] { return typeof value==='string' && (items as readonly string[]).includes(value); }
function uniqueFrom<T extends readonly string[]>(items:T,value:unknown,limit:number):T[number][] { return Array.isArray(value)?value.filter((id):id is T[number]=>includes(items,id)).filter((id,index,array)=>array.indexOf(id)===index).slice(0,limit):[]; }

export function sanitizeBuildCapsulePayload(raw:unknown):BuildCapsulePayload {
  const r=object(raw);
  const levels=object(r.spellLevels); const spellLevels={} as Record<SpellId,number>;
  for (const id of SPELL_IDS) spellLevels[id]=boundedInt(levels[id],1,10,1);
  return {
    version:1,
    heroId:(includes(HERO_IDS,r.heroId)?r.heroId:'arkan') as HeroId,
    traitId:r.traitId===null?null:(includes(TRAIT_IDS,r.traitId)?r.traitId:null) as RunTraitId|null,
    threatLevel:boundedInt(r.threatLevel,0,5,0) as ThreatLevel,
    mapId:(includes(MAP_IDS,r.mapId)?r.mapId:'ruinedGate') as MapId,
    seed:boundedInt(r.seed,0,0xffff_ffff,0)>>>0,
    finalForm:(includes(FINAL_FORMS,r.finalForm)?r.finalForm:null) as HeroFinalFormId|null,
    ascensions:uniqueFrom(ASCENSIONS,r.ascensions,3) as HeroAscensionId[],
    fateChoices:uniqueFrom(FATES,r.fateChoices,3) as FatePathId[],
    relic:(includes(RELICS,r.relic)?r.relic:null) as RelicId|null,
    fusions:uniqueFrom(FUSIONS,r.fusions,2) as FusionId[],
    archetype:(includes(ARCHETYPES,r.archetype)?r.archetype:'burst') as BuildArchetype,
    spellLevels,
  };
}

function checksum(input:string):string { let hash=0x811c9dc5; for(let i=0;i<input.length;i+=1){hash^=input.charCodeAt(i);hash=Math.imul(hash,0x01000193)>>>0;} return hash.toString(36).toUpperCase().padStart(7,'0'); }
function indexToken(items:readonly string[],value:string|null):string { return value===null?'z':Math.max(0,items.indexOf(value)).toString(36); }
function listToken(items:readonly string[],values:readonly string[]):string { return values.length?values.map((value)=>indexToken(items,value)).join(''):'_'; }
function decodeIndex<T extends readonly string[]>(items:T,token:string,nullable=false):T[number]|null|undefined { if(nullable&&token==='z')return null; const index=parseInt(token,36); return Number.isInteger(index)&&index>=0&&index<items.length?items[index]:undefined; }
function decodeList<T extends readonly string[]>(items:T,token:string,limit:number):T[number][]|null { if(token==='_')return[]; if(token.length>limit)return null; const out:T[number][]=[]; for(const char of token){const value=decodeIndex(items,char);if(value===undefined||value===null||out.includes(value))return null;out.push(value);} return out; }

export function encodeBuildCapsule(payload:unknown):string {
  const safe=sanitizeBuildCapsulePayload(payload);
  const levels=SPELL_IDS.map((id)=>safe.spellLevels[id].toString(36).toUpperCase()).join('');
  const body=[
    indexToken(HERO_IDS,safe.heroId),indexToken(TRAIT_IDS,safe.traitId),safe.threatLevel.toString(36),indexToken(MAP_IDS,safe.mapId),safe.seed.toString(36),
    indexToken(FINAL_FORMS,safe.finalForm),listToken(ASCENSIONS,safe.ascensions),listToken(FATES,safe.fateChoices),indexToken(RELICS,safe.relic),listToken(FUSIONS,safe.fusions),indexToken(ARCHETYPES,safe.archetype),levels,
  ].join('-');
  return `BLD1.${body}.${checksum(body)}`;
}

export function decodeBuildCapsule(code:string):BuildCapsulePayload|null {
  try {
    const outer=code.split('.'); if(outer.length!==3||outer[0]!=='BLD1')return null;
    const body=outer[1]??''; if(checksum(body)!==outer[2])return null;
    const parts=body.split('-'); if(parts.length!==12)return null;
    const heroId=decodeIndex(HERO_IDS,parts[0]??'');
    const traitId=decodeIndex(TRAIT_IDS,parts[1]??'',true);
    const threat=parseInt(parts[2]??'',36); const mapId=decodeIndex(MAP_IDS,parts[3]??''); const seed=parseInt(parts[4]??'',36);
    const finalForm=decodeIndex(FINAL_FORMS,parts[5]??'',true); const ascensions=decodeList(ASCENSIONS,parts[6]??'',3); const fateChoices=decodeList(FATES,parts[7]??'',3);
    const relic=decodeIndex(RELICS,parts[8]??'',true); const fusions=decodeList(FUSIONS,parts[9]??'',2); const archetype=decodeIndex(ARCHETYPES,parts[10]??''); const levels=parts[11]??'';
    if(heroId===undefined||heroId===null||traitId===undefined||!Number.isInteger(threat)||threat<0||threat>5||mapId===undefined||mapId===null||!Number.isInteger(seed)||seed<0||seed>0xffff_ffff||finalForm===undefined||ascensions===null||fateChoices===null||relic===undefined||fusions===null||archetype===undefined||archetype===null||levels.length!==SPELL_IDS.length)return null;
    const spellLevels={} as Record<SpellId,number>;
    for(let i=0;i<SPELL_IDS.length;i+=1){const level=parseInt(levels[i]??'',36);if(!Number.isInteger(level)||level<1||level>10)return null;spellLevels[SPELL_IDS[i]!]=level;}
    const payload:BuildCapsulePayload={version:1,heroId:heroId as HeroId,traitId:traitId as RunTraitId|null,threatLevel:threat as ThreatLevel,mapId:mapId as MapId,seed:seed>>>0,finalForm:finalForm as HeroFinalFormId|null,ascensions:ascensions as HeroAscensionId[],fateChoices:fateChoices as FatePathId[],relic:relic as RelicId|null,fusions:fusions as FusionId[],archetype:archetype as BuildArchetype,spellLevels};
    return encodeBuildCapsule(payload)===code?payload:null;
  } catch { return null; }
}
