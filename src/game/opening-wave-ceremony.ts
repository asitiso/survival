export type OpeningWaveBeatId='first-contact'|'pressure-rise'|'elite-break'|'boss-horizon';
export interface OpeningWaveCeremonyProfile{beatId:OpeningWaveBeatId|null;label:string;spawnPulse:number;rewardPulse:number;telegraphPulse:number;}
const BEATS=[
  {id:'first-contact',at:30,label:'FIRST CONTACT',spawn:1.18,reward:1.08,telegraph:1.05},
  {id:'pressure-rise',at:120,label:'PRESSURE RISE',spawn:1.16,reward:1.07,telegraph:1.08},
  {id:'elite-break',at:300,label:'ELITE BREAK',spawn:1.2,reward:1.09,telegraph:1.1},
  {id:'boss-horizon',at:540,label:'BOSS HORIZON',spawn:1.14,reward:1.06,telegraph:1.14},
] as const;
export function openingWaveCeremony(elapsedSeconds:number):OpeningWaveCeremonyProfile{
  const s=Math.max(0,Number.isFinite(elapsedSeconds)?elapsedSeconds:0);
  if(s>=600)return{beatId:null,label:'',spawnPulse:1,rewardPulse:1,telegraphPulse:1};
  for(const beat of BEATS){
    const delta=s-beat.at;
    if(delta>=0&&delta<7){const fade=1-delta/7;return{beatId:beat.id,label:beat.label,spawnPulse:1+(beat.spawn-1)*fade,rewardPulse:1+(beat.reward-1)*fade,telegraphPulse:1+(beat.telegraph-1)*fade};}
  }
  return{beatId:null,label:'',spawnPulse:1,rewardPulse:1,telegraphPulse:1};
}
