export interface BossHazardTelegraphHandoffInput{telegraph:number;launchTtl?:number|undefined;launchMaxTtl?:number|undefined}
export interface BossHazardTelegraphHandoffPresentation{owner:'launch'|'telegraph'|'active';launchCueAlpha:number;telegraphAlphaScale:number;retireLaunchOrigin:boolean}
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
export function bossHazardTelegraphHandoffPresentation(input:BossHazardTelegraphHandoffInput,reducedFlash=false):BossHazardTelegraphHandoffPresentation{
 const telegraph=Math.max(0,Number.isFinite(input.telegraph)?input.telegraph:0),max=Math.max(.0001,Number.isFinite(input.launchMaxTtl??0)?input.launchMaxTtl??0:0),ttl=Math.max(0,Number.isFinite(input.launchTtl??0)?input.launchTtl??0:0);
 if(telegraph<=0)return{owner:'active',launchCueAlpha:0,telegraphAlphaScale:1,retireLaunchOrigin:true};
 const launchWeight=clamp(ttl/max,0,1);if(launchWeight<=0)return{owner:'telegraph',launchCueAlpha:0,telegraphAlphaScale:1,retireLaunchOrigin:true};
 return{owner:'launch',launchCueAlpha:(reducedFlash?.18:.32)*launchWeight,telegraphAlphaScale:.72+.28*(1-launchWeight),retireLaunchOrigin:false};
}
