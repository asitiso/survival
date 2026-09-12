import { supabaseClient } from './supabase-client.js';

export interface AuthState {
  status: 'unconfigured' | 'guest' | 'authenticated';
  userId: string | null;
}

interface AuthClient {
  auth: {
    getSession(): Promise<{ data: { session: { user: { id: string } } | null }; error: Error | null }>;
    onAuthStateChange(listener: (_event: string, session: { user: { id: string } } | null) => void): { data: { subscription: { unsubscribe(): void } } };
    signInWithOAuth(options: { provider: 'google'; options: { redirectTo: string } }): Promise<{ error: Error | null }>;
    signOut(): Promise<{ error: Error | null }>;
  };
}

export class GameAuth {
  private state: AuthState = { status: 'guest', userId: null };
  private readonly listeners = new Set<(state: AuthState) => void>();
  private unsubscribeSession: (() => void) | null = null;

  constructor(private readonly client: () => AuthClient | null = supabaseClient) {}

  async initialize(): Promise<AuthState> {
    this.unsubscribeSession?.();
    const supabase = this.client();
    if (!supabase) return this.setState({ status: 'unconfigured', userId: null });
    const result = await supabase.auth.getSession();
    if (result.error) throw result.error;
    const subscription = supabase.auth.onAuthStateChange((_event, session) => {
      this.setState(session ? { status: 'authenticated', userId: session.user.id } : { status: 'guest', userId: null });
    });
    this.unsubscribeSession = () => subscription.data.subscription.unsubscribe();
    return this.setState(result.data.session ? { status: 'authenticated', userId: result.data.session.user.id } : { status: 'guest', userId: null });
  }

  async signInWithGoogle(redirectTo: string): Promise<void> {
    const supabase = this.client();
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
    if (error) throw error;
  }

  async signOut(): Promise<void> {
    const supabase = this.client();
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
    this.setState({ status: 'guest', userId: null });
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private setState(state: AuthState): AuthState {
    this.state = state;
    this.listeners.forEach((listener) => listener(state));
    return state;
  }
}
