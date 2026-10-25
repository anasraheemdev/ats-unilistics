import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve client-safe environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Supabase client instance.
 * If credentials are not yet configured in local environment,
 * a lightweight mock/fallback client is provided to support development without crashes.
 */
let client: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export const supabase = client;

export const isLiveSupabaseConnected = Boolean(supabaseUrl && supabaseAnonKey);
