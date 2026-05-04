import { createClient } from '@supabase/supabase-js';

/**
 * Admin client initialized with the service-role key.
 * Required for auth.admin operations (createUser, updateUserById, deleteUser).
 * Keep VITE_SUPABASE_SERVICE_ROLE_KEY out of public repos.
 *
 * persistSession / autoRefreshToken / detectSessionInUrl are all disabled so
 * this client never touches browser storage or navigator.locks — preventing
 * the "Multiple GoTrueClient instances" lock-conflict with the anon client.
 */
export const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken:   false,
      persistSession:     false,
      detectSessionInUrl: false,
    },
  }
);
