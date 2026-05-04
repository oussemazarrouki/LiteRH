import { supabase } from './supabase';
import { supabaseAdmin } from './supabaseAdmin';

// Reusable select string — service name + department via nested FK joins.
// mot_de_passe is intentionally omitted from all reads (security).
const EMPLOYE_SELECT = `
  id, matricule, nom, prenom, email, role, solde_conge, id_service,
  service:service(id, nom, departement:departement(id, nom))
`;

// ─── Read ────────────────────────────────────────────────────────────────────

export async function getEmployes() {
  return supabase
    .from('employe')
    .select(EMPLOYE_SELECT)
    .order('nom', { ascending: true });
}

export async function getServices() {
  return supabase
    .from('service')
    .select('id, nom, departement:departement(id, nom)')
    .order('nom', { ascending: true });
}

export async function getEmployeProfil(id) {
  return supabase
    .from('employe')
    .select(EMPLOYE_SELECT)
    .eq('id', id)
    .single();
}

// ─── Create ──────────────────────────────────────────────────────────────────

/**
 * Two-step creation per user_flows.md §4-A:
 *   1. supabase.auth.admin.createUser  → generates the UUID
 *   2. INSERT into public `employe`    → using that UUID as primary key
 *
 * mot_de_passe is used only for Auth and is never stored in the public table.
 */
export async function createEmploye({ mot_de_passe, ...fields }) {
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: fields.email,
    password: mot_de_passe,
    email_confirm: true,
  });
  if (authError) return { data: null, error: authError };

  const { data, error } = await supabase
    .from('employe')
    .insert({ ...fields, id: authData.user.id })
    .select(EMPLOYE_SELECT)
    .single();

  // Roll back the Auth user if the DB insert fails
  if (error) await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

  return { data, error };
}

// ─── Update ──────────────────────────────────────────────────────────────────

/**
 * Per user_flows.md §4-B: if email or password changed, sync Auth first,
 * then UPDATE the public table. mot_de_passe is never written to the DB.
 */
export async function updateEmploye(id, updates, originalEmail) {
  // Strip non-column keys: mot_de_passe is auth-only; service/departement are
  // joined objects from the SELECT that Supabase rejects in an UPDATE payload.
  const { mot_de_passe, service, departement, ...publicFields } = updates;

  const authUpdates = {};
  if (publicFields.email && publicFields.email !== originalEmail) {
    authUpdates.email = publicFields.email;
  }
  if (mot_de_passe) {
    authUpdates.password = mot_de_passe;
  }

  if (Object.keys(authUpdates).length > 0) {
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, authUpdates);
    if (authError) return { data: null, error: authError };
  }

  const { data, error } = await supabase
    .from('employe')
    .update(publicFields)
    .eq('id', id)
    .select(EMPLOYE_SELECT)
    .single();

  return { data, error };
}

// ─── Delete ──────────────────────────────────────────────────────────────────

/**
 * Delete public row first (prevents FK conflicts), then remove Auth account.
 * Assumes DemandeConge/Absence rows cascade-delete with the employe row.
 */
export async function deleteEmploye(id) {
  const { error: dbError } = await supabase.from('employe').delete().eq('id', id);
  if (dbError) return { error: dbError };

  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
  return { error: authError };
}
