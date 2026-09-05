import { clamp } from '../../core/math.js';

export interface LastLawSafeZoneLifecycle {
  active:boolean;
  cycleMs:number;
  stableEndMs:number;
  collapseEndMs:number;
  collapsedEndMs:number;
  reformEndMs:number;
  radiusMultiplier:number;
}

export function lastLawSafeZoneLifecycle(active:boolean,destroyedWeakpointRatio:number):LastLawSafeZoneLifecycle{
  if(!active)return{active:false,cycleMs:9000,stableEndMs:4800,collapseEndMs:6200,collapsedEndMs:7800,reformEndMs:9000,radiusMultiplier:1};
  const d=clamp(Number.isFinite(destroyedWeakpointRatio)?destroyedWeakpointRatio:0,0,1);
  const cycleMs=Math.round(clamp(7600+d*800,7000,9000));
  const stableEndMs=Math.round(clamp(3300+d*500,3000,4200));
  const collapseDuration=Math.round(clamp(1150+d*100,1050,1300));
  const collapsedDuration=Math.round(clamp(1650-d*350,1200,1700));
  const collapseEndMs=stableEndMs+collapseDuration;
  const collapsedEndMs=Math.min(cycleMs-600,collapseEndMs+collapsedDuration);
  return{
    active:true,cycleMs,stableEndMs,collapseEndMs,collapsedEndMs,reformEndMs:cycleMs,
    radiusMultiplier:clamp(.9+d*.16,.88,1.08),
  };
}
