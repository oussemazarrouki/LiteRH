import { createClient } from '@supabase/supabase-js';

// GoTrueClient derives its navigator.locks lock name from storageKey.
// If two clients share the same storageKey they compete for the same lock,
// deadlocking the main client's getSession() on page reload.
// Using a unique storageKey gives this client its own separate lock,
// and pointing it at an in-memory store means it never touches localStorage
// under any code path — eliminating all contention with the anon client.
const memoryStorage = {
  _store: new Map(),
  getItem(key)        { return this._store.get(key) ?? null; },
  setItem(key, value) { this._store.set(key, value); },
  removeItem(key)     { this._store.delete(key); },
};

export const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken:   false,
      persistSession:     false,
      detectSessionInUrl: false,
      storageKey:         'supabase-admin-auth-token',
      storage:            memoryStorage,
    },
  }
);
