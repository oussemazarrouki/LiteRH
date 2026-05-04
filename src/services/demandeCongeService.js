import { supabase } from './supabase';

// Full select: joins Employe (for name + current balance) and TypeConge (for label + deductibility)
const DEMANDE_SELECT = `
  id, date_debut, date_fin, statut, commentaire, id_employe, id_type,
  employe:id_employe(id, nom, prenom, solde_conge),
  typeconge:id_type(id, label, est_deductible)
`;

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getDemandesConges() {
  return supabase
    .from('demandeconge')
    .select(DEMANDE_SELECT)
    .order('date_debut', { ascending: false });
}

// ─── Update statut + conditional solde deduction ──────────────────────────────

/**
 * Per user_flows.md §3:
 *   1. UPDATE demandeconge.statut
 *   2. If nouveauStatut === 'VALIDE' AND est_deductible → UPDATE employe.solde_conge
 *
 * newSoldeConge is pre-computed by the hook (current - joursADeduire).
 * Pass undefined/null to skip the balance update.
 */
export async function updateStatutDemande(demandeId, nouveauStatut, employeId, newSoldeConge) {
  const { data, error } = await supabase
    .from('demandeconge')
    .update({ statut: nouveauStatut })
    .eq('id', demandeId)
    .select(DEMANDE_SELECT)
    .single();

  if (error) return { data: null, error };

  if (newSoldeConge !== undefined && newSoldeConge !== null) {
    const { error: soldeError } = await supabase
      .from('employe')
      .update({ solde_conge: newSoldeConge })
      .eq('id', employeId);

    if (soldeError) return { data, error: soldeError };
  }

  return { data, error: null };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteDemande(id) {
  return supabase.from('demandeconge').delete().eq('id', id);
}

// ─── Employee-scoped (no employe join — employee knows who they are) ──────────

const MES_DEMANDES_SELECT = `
  id, date_debut, date_fin, statut, commentaire, id_type,
  typeconge:id_type(id, label, est_deductible)
`;

/**
 * SECURITY: strictly filtered by employeId — an employee can only read their own requests.
 */
export async function fetchMesDemandes(employeId) {
  return supabase
    .from('demandeconge')
    .select(MES_DEMANDES_SELECT)
    .eq('id_employe', employeId)
    .order('date_debut', { ascending: false });
}

export async function createDemande(demandeData) {
  return supabase
    .from('demandeconge')
    .insert(demandeData)
    .select(MES_DEMANDES_SELECT)
    .single();
}
