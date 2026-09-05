import type { MetaUpgradeId } from '../domain/meta-profile.js';
import type { HeroId } from './hero-profiles.js';
import { HERO_PORTRAIT_ATLAS, heroPortraitPresentation } from './hero-portrait-assets.js';
import { growthChoiceIcon } from './growth-choice-icon-assets.js';
import { SHOP_ITEM_ATLAS, shopItemIconBackgroundPosition } from './shop-item-assets.js';
import { TACTICAL_STATUS_ICON_ATLAS, tacticalStatusIconPresentation } from './tactical-status-icon-assets.js';
import { BOSS_SPRITE_ATLAS, bossSpriteRect } from './boss-sprite-assets.js';

export type ResultStatIdentityId='kills'|'level'|'gold'|'bosses'|'shards'|'relic'|'mastery';
export interface LobbyResultIdentityIcon {
  atlasSrc:string;
  backgroundSize:string;
  backgroundPosition:string;
  visible:true;
  animated:false;
  motionAmplitude:0;
  textFallbackPreserved:true;
}
const pct=(column:number,row:number,columns:number,rows:number)=>`${columns<=1?0:column/(columns-1)*100}% ${rows<=1?0:row/(rows-1)*100}%`;

export function lobbyHeroIdentity(heroId:HeroId):LobbyResultIdentityIcon{
  const p=heroPortraitPresentation(heroId,true);
  return {atlasSrc:HERO_PORTRAIT_ATLAS.src,backgroundSize:'200% 200%',backgroundPosition:`${p.backgroundX} ${p.backgroundY}`,visible:true,animated:false,motionAmplitude:0,textFallbackPreserved:true};
}

export function metaUpgradeIdentity(id:MetaUpgradeId):LobbyResultIdentityIcon{
  if(id==='bankroll')return {atlasSrc:SHOP_ITEM_ATLAS.src,backgroundSize:'300% 300%',backgroundPosition:shopItemIconBackgroundPosition('golden-wand'),visible:true,animated:false,motionAmplitude:0,textFallbackPreserved:true};
  const choice=id==='vitality'?'maxHp':id==='power'?'spellPower':'pickupRadius';
  const icon=growthChoiceIcon(choice)!;
  return {atlasSrc:icon.atlasSrc,backgroundSize:icon.backgroundSize,backgroundPosition:icon.backgroundPosition,visible:true,animated:false,motionAmplitude:0,textFallbackPreserved:true};
}

function tactical(id:string):LobbyResultIdentityIcon{
  const p=tacticalStatusIconPresentation(id); const col=p.sprite.sx/TACTICAL_STATUS_ICON_ATLAS.cellSize,row=p.sprite.sy/TACTICAL_STATUS_ICON_ATLAS.cellSize;
  return {atlasSrc:TACTICAL_STATUS_ICON_ATLAS.src,backgroundSize:'400% 400%',backgroundPosition:pct(col,row,4,4),visible:true,animated:false,motionAmplitude:0,textFallbackPreserved:true};
}
function boss():LobbyResultIdentityIcon{
  const r=bossSpriteRect('inferno'); const col=r.sx/BOSS_SPRITE_ATLAS.cellSize,row=r.sy/BOSS_SPRITE_ATLAS.cellSize;
  return {atlasSrc:BOSS_SPRITE_ATLAS.src,backgroundSize:'300% 200%',backgroundPosition:pct(col,row,3,2),visible:true,animated:false,motionAmplitude:0,textFallbackPreserved:true};
}
function growth(id:string):LobbyResultIdentityIcon{
  const icon=growthChoiceIcon(id)!;
  return {atlasSrc:icon.atlasSrc,backgroundSize:icon.backgroundSize,backgroundPosition:icon.backgroundPosition,visible:true,animated:false,motionAmplitude:0,textFallbackPreserved:true};
}
export function resultStatIdentity(id:ResultStatIdentityId):LobbyResultIdentityIcon{
  if(id==='kills')return tactical('massacre');
  if(id==='gold')return tactical('goldRush');
  if(id==='bosses')return boss();
  if(id==='shards'||id==='relic')return growth('relic');
  if(id==='mastery')return tactical('eliteHunt');
  return growth('spellPower');
}
export function resultHeroIdentity(heroId:HeroId):LobbyResultIdentityIcon{return lobbyHeroIdentity(heroId);}
export function identityIconStyle(icon:LobbyResultIdentityIcon):string{return `--identity-icon-image:url('${icon.atlasSrc}');--identity-icon-bg-size:${icon.backgroundSize};--identity-icon-bg-position:${icon.backgroundPosition}`;}
