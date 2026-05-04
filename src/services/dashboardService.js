import dayjs from 'dayjs';
import { supabase } from './supabase';

const RECENT_DEMANDE_SELECT = `
  id, date_debut, date_fin, statut,
  employe:id_employe(nom, prenom),
  typeconge:id_type(label)
`;

/**
 * Runs all dashboard count queries in parallel.
 * Uses { count: 'exact', head: true } — returns only the count header,
 * no row data is transferred.
 */
export async function getDashboardStats() {
  const debutMois = dayjs().startOf('month').format('YYYY-MM-DD');
  const finMois   = dayjs().endOf('month').format('YYYY-MM-DD');

  const [
    employes,
    attente,
    departements,
    validesMois,
    recent,
  ] = await Promise.all([
    supabase.from('employe').select('*', { count: 'exact', head: true }),
    supabase.from('demandeconge').select('*', { count: 'exact', head: true }).eq('statut', 'ATTENTE'),
    supabase.from('departement').select('*', { count: 'exact', head: true }),
    supabase
      .from('demandeconge')
      .select('*', { count: 'exact', head: true })
      .eq('statut', 'VALIDE')
      .gte('date_debut', debutMois)
      .lte('date_debut', finMois),
    supabase
      .from('demandeconge')
      .select(RECENT_DEMANDE_SELECT)
      .eq('statut', 'ATTENTE')
      .order('date_debut', { ascending: false })
      .limit(5),
  ]);

  const firstError =
    employes.error ?? attente.error ?? departements.error ?? validesMois.error ?? recent.error;

  return {
    data: {
      totalEmployes:        employes.count     ?? 0,
      demandesEnAttente:    attente.count       ?? 0,
      totalDepartements:    departements.count  ?? 0,
      congesValidesCeMois:  validesMois.count   ?? 0,
      recentDemandes:       recent.data         ?? [],
    },
    error: firstError ?? null,
  };
}
