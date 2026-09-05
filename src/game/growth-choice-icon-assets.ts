import { ACTION_ICON_ATLAS, actionIconSprite } from './action-icon-assets.js';
import type { ActionId } from './config.js';
import { buildIdentityIcon, parseBuildIdentity } from './build-identity-assets.js';
import { heroAbilitySpellIdentityIcon } from './hero-ability-identity-assets.js';
import type { HeroId } from './hero-profiles.js';
import type { SpellId } from './spells.js';

export const GROWTH_CHOICE_GENERIC_IDS = ['maxHp','moveSpeed','spellPower','cooldown','pickupRadius','relic','fusion'] as const;
export type GrowthChoiceGenericId = typeof GROWTH_CHOICE_GENERIC_IDS[number];

export const GROWTH_CHOICE_ICON_ATLAS = {
  src:'./assets/ui/growth-choice-icons.png', columns:4, rows:2, cellSize:96, width:384, height:192,
} as const;

const CELL_BY_GENERIC:Readonly<Record<GrowthChoiceGenericId,readonly [number,number]>>={
  maxHp:[0,0], moveSpeed:[1,0], spellPower:[2,0], cooldown:[3,0], pickupRadius:[0,1], relic:[1,1], fusion:[2,1],
};

const SPELL_ACTION:Readonly<Record<string,ActionId>>={
  fireBolt:'spell1', chainLightning:'spell2', frostNova:'spell3', flameField:'spell4', meteorStorm:'ultimate1', blackHole:'ultimate2',
};

export interface GrowthChoiceIcon {
  assetId:string;
  atlasSrc:string;
  backgroundSize:string;
  backgroundPosition:string;
  animated:false;
  motionAmplitude:0;
  size:number;
  compactSize:number;
}

function genericId(choiceId:string,kind?:string):GrowthChoiceGenericId|null {
  if(kind==='relic'||choiceId.startsWith('relic:')) return 'relic';
  if(kind==='fusion'||choiceId.startsWith('fusion:')) return 'fusion';
  return Object.prototype.hasOwnProperty.call(CELL_BY_GENERIC,choiceId)?choiceId as GrowthChoiceGenericId:null;
}

function percent(column:number,row:number,columns:number,rows:number):string {
  const x=columns<=1?0:(column/(columns-1))*100;
  const y=rows<=1?0:(row/(rows-1))*100;
  return `${x}% ${y}%`;
}

export function growthChoiceIcon(choiceId:string,kind?:string,heroId?:HeroId):GrowthChoiceIcon|null {
  const buildId=parseBuildIdentity(choiceId,kind);
  if(buildId){const icon=buildIdentityIcon(buildId);return {assetId:buildId,atlasSrc:icon.atlasSrc,backgroundSize:icon.backgroundSize,backgroundPosition:icon.backgroundPosition,animated:false,motionAmplitude:0,size:52,compactSize:40};}
  const action=SPELL_ACTION[choiceId];
  if(action){
    if(heroId){
      const icon=heroAbilitySpellIdentityIcon(heroId,choiceId as SpellId);
      return {assetId:`${heroId}:${choiceId}`,atlasSrc:icon.atlasSrc,backgroundSize:icon.backgroundSize,backgroundPosition:icon.backgroundPosition,animated:false,motionAmplitude:0,size:52,compactSize:40};
    }
    const sprite=actionIconSprite(action);
    const column=sprite.sx/ACTION_ICON_ATLAS.cellSize, row=sprite.sy/ACTION_ICON_ATLAS.cellSize;
    return {assetId:choiceId,atlasSrc:ACTION_ICON_ATLAS.src,backgroundSize:'300% 300%',backgroundPosition:percent(column,row,ACTION_ICON_ATLAS.columns,ACTION_ICON_ATLAS.rows),animated:false,motionAmplitude:0,size:52,compactSize:40};
  }
  const id=genericId(choiceId,kind); if(!id)return null;
  const [column,row]=CELL_BY_GENERIC[id];
  return {assetId:id,atlasSrc:GROWTH_CHOICE_ICON_ATLAS.src,backgroundSize:'400% 200%',backgroundPosition:percent(column,row,GROWTH_CHOICE_ICON_ATLAS.columns,GROWTH_CHOICE_ICON_ATLAS.rows),animated:false,motionAmplitude:0,size:52,compactSize:40};
}

export function growthChoiceIconStyle(choiceId:string,kind?:string,heroId?:HeroId):string {
  const icon=growthChoiceIcon(choiceId,kind,heroId); if(!icon)return '';
  return `--growth-icon-image:url('${icon.atlasSrc}');--growth-icon-bg-size:${icon.backgroundSize};--growth-icon-bg-position:${icon.backgroundPosition}`;
}

export interface GrowthChoiceIconAtlasAudit{itemCount:number;coverage:number;uniqueCellCount:number;missing:string[];outOfBounds:string[];}
export function auditGrowthChoiceIconAtlas(ids:readonly string[]):GrowthChoiceIconAtlasAudit{
  const missing:string[]=[];const outOfBounds:string[]=[];const cells=new Set<string>();
  for(const raw of ids){
    const id=genericId(raw); if(!id){missing.push(raw);continue;}
    const [column,row]=CELL_BY_GENERIC[id];cells.add(`${column}:${row}`);
    if(column<0||row<0||column>=GROWTH_CHOICE_ICON_ATLAS.columns||row>=GROWTH_CHOICE_ICON_ATLAS.rows)outOfBounds.push(raw);
  }
  return{itemCount:ids.length,coverage:ids.length===0?1:(ids.length-missing.length)/ids.length,uniqueCellCount:cells.size,missing,outOfBounds};
}
