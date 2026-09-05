import type { KeyValueStorage } from '../domain/meta-rewards.js';

export type SoundKind = 'fire' | 'ice' | 'lightning' | 'holy' | 'ultimate' | 'eliteDeath' | 'coin' | 'levelUp' | 'legendary' | 'bossSpawn' | 'bossPhase' | 'purchase' | 'meter' | 'flowImpact' | 'finisherExecution' | 'finisherChain' | 'finisherControl' | 'finisherBulwark';

export interface AudioSettings { enabled: boolean; volume: number; }
export interface AudioPlayVariation { frequencyMultiplier?:number; durationMultiplier?:number; gainMultiplier?:number; }
export interface SoundDescriptor { frequency: number; duration: number; cooldown: number; priority: number; type: OscillatorType; gain: number; }

const AUDIO_KEY = 'arcane-last-stand.audio-settings';
const DESCRIPTORS: Record<SoundKind, SoundDescriptor> = {
  fire: { frequency: 170, duration: 0.10, cooldown: 0.08, priority: 1, type: 'sawtooth', gain: 0.18 },
  ice: { frequency: 520, duration: 0.12, cooldown: 0.09, priority: 1, type: 'sine', gain: 0.16 },
  lightning: { frequency: 760, duration: 0.08, cooldown: 0.07, priority: 1, type: 'square', gain: 0.12 },
  holy: { frequency: 360, duration: 0.14, cooldown: 0.10, priority: 1, type: 'triangle', gain: 0.14 },
  ultimate: { frequency: 110, duration: 0.42, cooldown: 0.30, priority: 3, type: 'sawtooth', gain: 0.24 },
  eliteDeath: { frequency: 240, duration: 0.24, cooldown: 0.12, priority: 2, type: 'triangle', gain: 0.18 },
  coin: { frequency: 880, duration: 0.06, cooldown: 0.08, priority: 0, type: 'sine', gain: 0.08 },
  levelUp: { frequency: 620, duration: 0.28, cooldown: 0.25, priority: 2, type: 'triangle', gain: 0.16 },
  legendary: { frequency: 300, duration: 0.36, cooldown: 0.35, priority: 3, type: 'sawtooth', gain: 0.20 },
  bossSpawn: { frequency: 82, duration: 0.55, cooldown: 0.5, priority: 4, type: 'square', gain: 0.22 },
  bossPhase: { frequency: 130, duration: 0.48, cooldown: 0.35, priority: 5, type: 'sawtooth', gain: 0.24 },
  purchase: { frequency: 470, duration: 0.12, cooldown: 0.10, priority: 1, type: 'sine', gain: 0.12 },
  meter: { frequency: 410, duration: 0.24, cooldown: 0.25, priority: 3, type: 'triangle', gain: 0.18 },
  flowImpact: { frequency: 285, duration: 0.13, cooldown: 0.11, priority: 3, type: 'triangle', gain: 0.16 },
  finisherExecution: { frequency: 190, duration: 0.22, cooldown: 0.18, priority: 4, type: 'sawtooth', gain: 0.20 },
  finisherChain: { frequency: 680, duration: 0.18, cooldown: 0.16, priority: 4, type: 'square', gain: 0.14 },
  finisherControl: { frequency: 320, duration: 0.28, cooldown: 0.20, priority: 4, type: 'sine', gain: 0.18 },
  finisherBulwark: { frequency: 145, duration: 0.30, cooldown: 0.22, priority: 4, type: 'triangle', gain: 0.22 },
};

export function soundDescriptor(kind: SoundKind): SoundDescriptor { return DESCRIPTORS[kind]; }
export function soundDescriptorWithVariation(kind:SoundKind,variation:AudioPlayVariation={}):SoundDescriptor {
  const base=DESCRIPTORS[kind];
  const f=Math.max(.85,Math.min(1.2,Number.isFinite(variation.frequencyMultiplier)?Number(variation.frequencyMultiplier):1));
  const d=Math.max(.85,Math.min(1.25,Number.isFinite(variation.durationMultiplier)?Number(variation.durationMultiplier):1));
  const g=Math.max(.75,Math.min(1.15,Number.isFinite(variation.gainMultiplier)?Number(variation.gainMultiplier):1));
  return{...base,frequency:base.frequency*f,duration:base.duration*d,gain:base.gain*g};
}
export function defaultAudioSettings(): AudioSettings { return { enabled: true, volume: 0.65 }; }
export function sanitizeAudioSettings(raw: Partial<AudioSettings> | null | undefined): AudioSettings {
  return {
    enabled: typeof raw?.enabled === 'boolean' ? raw.enabled : true,
    volume: Math.max(0, Math.min(1, Number.isFinite(raw?.volume) ? Number(raw?.volume) : 0.65)),
  };
}
export function loadAudioSettings(storage: KeyValueStorage): AudioSettings {
  try { const raw = storage.getItem(AUDIO_KEY); return raw === null ? defaultAudioSettings() : sanitizeAudioSettings(JSON.parse(raw)); }
  catch { return defaultAudioSettings(); }
}
export function saveAudioSettings(storage: KeyValueStorage, settings: AudioSettings): void {
  try { storage.setItem(AUDIO_KEY, JSON.stringify(sanitizeAudioSettings(settings))); } catch { /* optional */ }
}

interface Voice { kind: SoundKind; until: number; priority: number; }
export class SoundScheduler {
  private lastByKind = new Map<SoundKind, number>();
  private voices: Voice[] = [];
  constructor(private readonly maxVoices = 8) {}
  get activeVoices(): number { return this.voices.length; }
  trySchedule(kind: SoundKind, now: number): boolean {
    const time = Number.isFinite(now) ? now : 0;
    this.voices = this.voices.filter((voice) => voice.until > time);
    const descriptor = soundDescriptor(kind);
    const last = this.lastByKind.get(kind) ?? Number.NEGATIVE_INFINITY;
    if (time - last < descriptor.cooldown) return false;
    if (this.voices.length >= this.maxVoices) {
      let weakestIndex = -1;
      let weakestPriority = Number.POSITIVE_INFINITY;
      for (let i = 0; i < this.voices.length; i++) {
        const voice = this.voices[i]!;
        if (voice.priority < weakestPriority) { weakestPriority = voice.priority; weakestIndex = i; }
      }
      if (descriptor.priority <= weakestPriority) return false;
      if (weakestIndex >= 0) this.voices.splice(weakestIndex, 1);
    }
    this.lastByKind.set(kind, time);
    this.voices.push({ kind, until: time + descriptor.duration, priority: descriptor.priority });
    return true;
  }
}

export class ArcaneAudio {
  readonly scheduler = new SoundScheduler();
  settings: AudioSettings;
  private context: AudioContext | null = null;
  constructor(settings: AudioSettings = defaultAudioSettings()) { this.settings = sanitizeAudioSettings(settings); }
  play(kind: SoundKind, nowSeconds?: number, variation:AudioPlayVariation={}): boolean {
    const now = nowSeconds ?? (typeof performance !== 'undefined' ? performance.now() / 1000 : Date.now() / 1000);
    if (!this.settings.enabled || this.settings.volume <= 0 || !this.scheduler.trySchedule(kind, now)) return false;
    if (typeof window === 'undefined') return true;
    const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return true;
    try {
      this.context ??= new AudioCtor();
      const ctx = this.context;
      const desc = soundDescriptorWithVariation(kind, variation);
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = desc.type;
      oscillator.frequency.setValueAtTime(desc.frequency, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, desc.frequency * 0.72), ctx.currentTime + desc.duration);
      gain.gain.setValueAtTime(desc.gain * this.settings.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + desc.duration);
      oscillator.connect(gain); gain.connect(ctx.destination);
      oscillator.start(); oscillator.stop(ctx.currentTime + desc.duration);
    } catch { /* audio is optional */ }
    return true;
  }
}
