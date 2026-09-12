import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type RuntimeConfig = typeof globalThis & {
  __ARCANE_SUPABASE_URL__?: unknown;
  __ARCANE_SUPABASE_PUBLISHABLE_KEY__?: unknown;
};

let cached: SupabaseClient | null | undefined;

export function supabaseConfigured(): boolean {
  const config = globalThis as RuntimeConfig;
  return typeof config.__ARCANE_SUPABASE_URL__ === 'string'
    && typeof config.__ARCANE_SUPABASE_PUBLISHABLE_KEY__ === 'string'
    && config.__ARCANE_SUPABASE_URL__.startsWith('https://')
    && config.__ARCANE_SUPABASE_PUBLISHABLE_KEY__.length > 20;
}

export function supabaseClient(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  if (!supabaseConfigured()) return cached = null;
  const config = globalThis as RuntimeConfig;
  return cached = createClient(
    config.__ARCANE_SUPABASE_URL__ as string,
    config.__ARCANE_SUPABASE_PUBLISHABLE_KEY__ as string,
  );
}
