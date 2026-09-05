import { bossArchetypeForOrdinal, bossArchetypeSpecial, bossArchetypeTuning, type BossArchetype } from './boss-patterns.js';
import { completedBuildMetaSamples, type CompletedBuildMetaSample } from './completed-build-meta-audit.js';
import { HERO_PROFILES } from './hero-profiles.js';

export interface BossBuildMatchupSample extends CompletedBuildMetaSample { bossArchetype:BossArchetype; matchupIndex:number; matchupReleaseMargin:number; }
export interface BossBuildMatchupSummary { bossArchetype:BossArchetype; best:BossBuildMatchupSample; worst:BossBuildMatchupSample; bestToWorstSpread:number; heroTopSpread:number; topHeroCount:number; }
export interface BossBuildMatchupAudit { samples:BossBuildMatchupSample[]; bosses:BossBuildMatchupSummary[]; maxBestToWorstSpread:number; maxHeroTopSpread:number; minWorstReleaseMargin:number; passed:boolean; }
function round(value:number):number{return Math.round(value*10000)/10000;}
function spread(values:readonly number[]):number{return round(Math.max(...values)/Math.max(.0001,Math.min(...values)));}
function clamp(value:number,min:number,max:number):number{return Math.max(min,Math.min(max,value));}
function matchupModifier(sample:CompletedBuildMetaSample,boss:BossArchetype):number{
  const tuning=bossArchetypeTuning(boss,3),special=bossArchetypeSpecial(boss,3);
  const projectilePressure=((tuning.fanProjectiles+tuning.ringProjectiles*.75)/20)*tuning.projectileSpeedMultiplier;
  const summonPressure=tuning.summonCount/7;
  const mobilityPressure=tuning.speedMultiplier*(1+tuning.dashDistance/500);
  const cadencePressure=(3.8/tuning.specialInterval)*special.cooldownPressureMultiplier;
  const areaNeed=.20+summonPressure*.18;
  const survivalNeed=.18+projectilePressure*.10+mobilityPressure*.04;
  const tempoNeed=.12+Math.max(0,cadencePressure-1)*.18;
  const offenseNeed=.50-areaNeed*.18;
  const raw=Math.pow(sample.offenseIndex,offenseNeed)*Math.pow(sample.areaIndex,areaNeed)*Math.pow(sample.tempoIndex,tempoNeed)*Math.pow(sample.survivalIndex,survivalNeed)*Math.pow(sample.bossDamageIndex,.16);
  const baseline=Math.pow(sample.offenseIndex,.50)*Math.pow(sample.areaIndex,.20)*Math.pow(sample.tempoIndex,.12)*Math.pow(sample.survivalIndex,.22)*Math.pow(sample.bossDamageIndex,.16);
  return clamp(Math.pow(raw/Math.max(.001,baseline),.24),.90,1.10);
}
export function bossBuildMatchupSamples():BossBuildMatchupSample[]{
  const builds=completedBuildMetaSamples().filter((sample)=>sample.threat===5);
  const out:BossBuildMatchupSample[]=[];
  for(let ordinal=0;ordinal<6;ordinal+=1){
    const bossArchetype=bossArchetypeForOrdinal(ordinal);
    for(const sample of builds){
      const modifier=matchupModifier(sample,bossArchetype);
      const matchupIndex=sample.compositeIndex*modifier;
      out.push({...sample,bossArchetype,matchupIndex:round(matchupIndex),matchupReleaseMargin:round(sample.releaseMargin*modifier)});
    }
  }
  return out;
}
export function auditBossBuildMatchups():BossBuildMatchupAudit{
  const samples=bossBuildMatchupSamples();
  const bosses:Array<BossBuildMatchupSummary>=[];
  for(let ordinal=0;ordinal<6;ordinal+=1){
    const bossArchetype=bossArchetypeForOrdinal(ordinal);
    const group=samples.filter((sample)=>sample.bossArchetype===bossArchetype).sort((a,b)=>b.matchupIndex-a.matchupIndex);
    const best=group[0]!,worst=group[group.length-1]!;
    const heroTops=HERO_PROFILES.map((hero)=>Math.max(...group.filter((sample)=>sample.heroId===hero.id).map((sample)=>sample.matchupIndex)));
    bosses.push({bossArchetype,best,worst,bestToWorstSpread:spread([best.matchupIndex,worst.matchupIndex]),heroTopSpread:spread(heroTops),topHeroCount:heroTops.length});
  }
  const maxBestToWorstSpread=round(Math.max(...bosses.map((boss)=>boss.bestToWorstSpread)));
  const maxHeroTopSpread=round(Math.max(...bosses.map((boss)=>boss.heroTopSpread)));
  const minWorstReleaseMargin=round(Math.min(...bosses.map((boss)=>boss.worst.matchupReleaseMargin)));
  const passed=samples.length===34560&&bosses.length===6&&maxBestToWorstSpread<=2.10&&maxHeroTopSpread<=1.35&&minWorstReleaseMargin>=.55&&bosses.every((boss)=>boss.topHeroCount===4);
  return{samples,bosses,maxBestToWorstSpread,maxHeroTopSpread,minWorstReleaseMargin,passed};
}
