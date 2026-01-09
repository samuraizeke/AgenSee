import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';

// Create Supabase client with service role key
// This bypasses RLS - use for server-side operations only
export const supabase: SupabaseClient = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Create a client for a specific user (when needed for user-context operations)
export const createUserClient = (accessToken: string): SupabaseClient => {
  return createClient(
    config.supabase.url,
    config.supabase.serviceRoleKey,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};

export default supabase;
