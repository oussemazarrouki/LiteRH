import { supabase } from './supabase';

const ABSENCE_SELECT = `
  id, date_debut, date_fin, motif, id_employe,
  employe:id_employe(id, nom, prenom)
`;

// ─── Admin: full table ────────────────────────────────────────────────────────

export async function fetchAbsences() {
  return supabase
    .from('absence')
    .select(ABSENCE_SELECT)
    .order('date_debut', { ascending: false });
}

export async function createAbsence(absenceData) {
  return supabase
    .from('absence')
    .insert(absenceData)
    .select(ABSENCE_SELECT)
    .single();
}

export async function updateAbsence(id, updates) {
  return supabase
    .from('absence')
    .update(updates)
    .eq('id', id)
    .select(ABSENCE_SELECT)
    .single();
}

export async function deleteAbsence(id) {
  return supabase.from('absence').delete().eq('id', id);
}

// ─── Employee-scoped ──────────────────────────────────────────────────────────

const MES_ABSENCES_SELECT = `id, date_debut, date_fin, motif`;

/**
 * SECURITY: strictly filtered by employeId.
 */
export async function fetchMesAbsences(employeId) {
  return supabase
    .from('absence')
    .select(MES_ABSENCES_SELECT)
    .eq('id_employe', employeId)
    .order('date_debut', { ascending: false });
}
