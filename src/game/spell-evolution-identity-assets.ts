import type { HeroId } from './hero-profiles.js';
import type { SpellId } from './spells.js';
import type { SpellEvolutionTier } from './spell-evolutions.js';

export type SpellEvolutionVisualTier = 1 | 2;
export const SPELL_EVOLUTION_CREST_IDS = [
  'arkan:awakened','seria:awakened','kain:awakened','edric:awakened',
  'arkan:final','seria:final','kain:final','edric:final',
] as const;
export type SpellEvolutionCrestId = typeof SPELL_EVOLUTION_CREST_IDS[number];

export const SPELL_EVOLUTION_CREST_ATLAS = {
  src:'./assets/ui/spell-evolution-crests.png',columns:4,rows:2,cellSize:96,width:384,height:192,
} as const;

const HEROES:readonly HeroId[]=['arkan','seria','kain','edric'] as const;
const CELL_BY_ID:Readonly<Record<SpellEvolutionCrestId,readonly [number,number]>>={
  'arkan:awakened':[0,0],'seria:awakened':[1,0],'kain:awakened':[2,0],'edric:awakened':[3,0],
  'arkan:final':[0,1],'seria:final':[1,1],'kain:final':[2,1],'edric:final':[3,1],
};

export interface SpellEvolutionCrestIcon {
  id:SpellEvolutionCrestId; heroId:HeroId; tier:SpellEvolutionVisualTier;
  atlasSrc:string; sx:number; sy:number; sw:number; sh:number;
  backgroundSize:string; backgroundPosition:string;
  animated:false; motionAmplitude:0; textFallbackPreserved:true; loadFailureBlocksGameplay:false;
}

const pct=(value:number,total:number):number=>total<=1?0:(value/(total-1))*100;
export function spellEvolutionCrestId(heroId:HeroId,tier:SpellEvolutionTier):SpellEvolutionCrestId|null{
  if(tier===0)return null; return `${heroId}:${tier===1?'awakened':'final'}` as SpellEvolutionCrestId;
}
export function spellEvolutionCrestIcon(id:SpellEvolutionCrestId):SpellEvolutionCrestIcon{
  const [column,row]=CELL_BY_ID[id];const [heroRaw,tierRaw]=id.split(':');const size=SPELL_EVOLUTION_CREST_ATLAS.cellSize;
  return{id,heroId:heroRaw as HeroId,tier:tierRaw==='awakened'?1:2,atlasSrc:SPELL_EVOLUTION_CREST_ATLAS.src,sx:column*size,sy:row*size,sw:size,sh:size,backgroundSize:'400% 200%',backgroundPosition:`${pct(column,4)}% ${pct(row,2)}%`,animated:false,motionAmplitude:0,textFallbackPreserved:true,loadFailureBlocksGameplay:false};
}
export function spellEvolutionCrestFor(heroId:HeroId,tier:SpellEvolutionTier):SpellEvolutionCrestIcon|null{const id=spellEvolutionCrestId(heroId,tier);return id?spellEvolutionCrestIcon(id):null;}
export function spellEvolutionCrestStyle(heroId:HeroId,tier:SpellEvolutionTier):string{const icon=spellEvolutionCrestFor(heroId,tier);if(!icon)return'';return `--spell-evolution-crest-image:url('${icon.atlasSrc}');--spell-evolution-crest-size:${icon.backgroundSize};--spell-evolution-crest-position:${icon.backgroundPosition}`;}
export function spellEvolutionPreviewTier(currentLevel:number):SpellEvolutionVisualTier|null{const next=Math.max(1,Math.floor(currentLevel))+1;return next===5?1:next===10?2:null;}
export function spellEvolutionPreviewCrestStyle(heroId:HeroId,currentLevel:number):string{const tier=spellEvolutionPreviewTier(currentLevel);return tier?spellEvolutionCrestStyle(heroId,tier):'';}
export function spellEvolutionActionTier(level:number):SpellEvolutionVisualTier|null{return level>=10?2:level>=5?1:null;}

export const SPELL_EVOLUTION_ACTION_TO_SPELL = {spell1:'fireBolt',spell2:'chainLightning',spell3:'frostNova',spell4:'flameField',ultimate1:'meteorStorm',ultimate2:'blackHole'} as const satisfies Readonly<Record<string,SpellId>>;
export function spellEvolutionSpellForAction(actionId:string):SpellId|null{return (SPELL_EVOLUTION_ACTION_TO_SPELL as Readonly<Record<string,SpellId>>)[actionId]??null;}

export function auditSpellEvolutionCrestAtlas(){const cells=new Set<string>();const outOfBounds:string[]=[];for(const id of SPELL_EVOLUTION_CREST_IDS){const icon=spellEvolutionCrestIcon(id);cells.add(`${icon.sx}:${icon.sy}`);if(icon.sx<0||icon.sy<0||icon.sx+icon.sw>SPELL_EVOLUTION_CREST_ATLAS.width||icon.sy+icon.sh>SPELL_EVOLUTION_CREST_ATLAS.height)outOfBounds.push(id);}return{itemCount:SPELL_EVOLUTION_CREST_IDS.length,coverage:SPELL_EVOLUTION_CREST_IDS.length===8?1:SPELL_EVOLUTION_CREST_IDS.length/8,uniqueCellCount:cells.size,outOfBounds,passed:SPELL_EVOLUTION_CREST_IDS.length===8&&cells.size===8&&outOfBounds.length===0};}
export const SPELL_EVOLUTION_HERO_IDS=HEROES;
