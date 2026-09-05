import { clamp } from '../../core/math.js';
import type { BossArchetype } from '../boss-patterns.js';
import type { BossArenaMutationModifiers } from './boss-arena-mutations.js';

export type MythicArenaIdentityId = 'solar-crucible'|'brood-field'|'iron-lane'|'void-orbit'|'twin-crossfire'|'broken-clock';

export interface MythicArenaIdentityProfile {
  identityId: MythicArenaIdentityId;
  label: string;
  accent: string;
  modifiers: BossArenaMutationModifiers;
}

interface Bias {
  identityId: MythicArenaIdentityId;
  label: string;
  accent: string;
  cadence: number;
  radius: number;
  telegraph: number;
  damage: number;
  hazardDelta: number;
  orbitDelta: number;
}

const BIASES: Record<BossArchetype,Bias> = {
  inferno:{identityId:'solar-crucible',label:'MYTHIC ARENA · SOLAR',accent:'#ff6d42',cadence:.93,radius:1.12,telegraph:1.00,damage:1.07,hazardDelta:0,orbitDelta:.12},
  summoner:{identityId:'brood-field',label:'MYTHIC ARENA · BROOD',accent:'#79efa8',cadence:.86,radius:.94,telegraph:1.02,damage:1.01,hazardDelta:1,orbitDelta:-.08},
  juggernaut:{identityId:'iron-lane',label:'MYTHIC ARENA · IRON',accent:'#ffd06b',cadence:1.02,radius:.84,telegraph:1.05,damage:1.10,hazardDelta:-1,orbitDelta:0},
  abyssWitch:{identityId:'void-orbit',label:'MYTHIC ARENA · VOID',accent:'#cf72ff',cadence:.89,radius:1.18,telegraph:.98,damage:1.04,hazardDelta:0,orbitDelta:.28},
  twinMaw:{identityId:'twin-crossfire',label:'MYTHIC ARENA · TWIN',accent:'#ff6fa7',cadence:.91,radius:.91,telegraph:1.00,damage:1.06,hazardDelta:0,orbitDelta:.52},
  timeEater:{identityId:'broken-clock',label:'MYTHIC ARENA · CLOCK',accent:'#62caff',cadence:.82,radius:1.03,telegraph:.96,damage:1.03,hazardDelta:0,orbitDelta:-.34},
};

function safeRatio(value:number):number { return clamp(Number.isFinite(value)?value:0,0,1); }

export function mythicArenaIdentityProfile(archetype:BossArchetype, base:BossArenaMutationModifiers, destroyedWeakpointRatio:number):MythicArenaIdentityProfile {
  const bias=BIASES[archetype];
  const relief=safeRatio(destroyedWeakpointRatio);
  const rawCadence=clamp(base.cadenceMultiplier*bias.cadence,.68,1.08);
  const rawRadius=clamp(base.radiusMultiplier*bias.radius,.78,1.34);
  const rawTelegraph=clamp(base.telegraphMultiplier*bias.telegraph,.78,1.24);
  const rawDamage=clamp(base.damageMultiplier*bias.damage,.82,1.22);
  const rawHazards=Math.max(4,Math.min(8,Math.round(base.maxHazards+bias.hazardDelta)));
  const rawOrbit=clamp(base.orbitOffsetRadians+bias.orbitDelta,-1.2,1.2);
  return {
    identityId:bias.identityId,
    label:bias.label,
    accent:bias.accent,
    modifiers:{
      cadenceMultiplier:clamp(rawCadence+(1.08-rawCadence)*relief*.62,.68,1.08),
      radiusMultiplier:clamp(rawRadius+(1-rawRadius)*relief*.5,.78,1.34),
      telegraphMultiplier:clamp(rawTelegraph+(1.18-rawTelegraph)*relief*.55,.78,1.24),
      damageMultiplier:clamp(rawDamage-(rawDamage-.88)*relief*.68,.82,1.22),
      maxHazards:Math.max(4,Math.min(8,rawHazards-Math.floor(relief*2+.001))),
      orbitOffsetRadians:clamp(rawOrbit*(1-relief*.45),-1.2,1.2),
    },
  };
}
