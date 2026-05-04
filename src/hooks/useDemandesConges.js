import { useCallback, useEffect, useState } from 'react';
import * as demandeCongeService from '../services/demandeCongeService';
import { getJoursFeries } from '../services/joursFeriesService';
import { calculerJoursOuvrables } from '../utils/congeUtils';

export function useDemandesConges() {
  const [demandes, setDemandes]       = useState([]);
  const [joursFeries, setJoursFeries] = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState(null);

  const fetchDemandes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await demandeCongeService.getDemandesConges();
    if (error) setError(error.message);
    else setDemandes(data ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchDemandes();
    getJoursFeries().then(({ data }) => setJoursFeries(data ?? []));
  }, [fetchDemandes]);

  // ── Status mutation ────────────────────────────────────────────────────────

  /**
   * Approves or rejects a demande.
   * If approving AND typeconge.est_deductible is true, the employee balance
   * is decremented by the calculated working days.
   */
  const updateStatut = async (demande, nouveauStatut) => {
    let newSoldeConge;

    if (nouveauStatut === 'VALIDE' && demande.typeconge?.est_deductible) {
      const joursADeduire = calculerJoursOuvrables(
        demande.date_debut,
        demande.date_fin,
        joursFeries
      );
      const soldeActuel = demande.employe?.solde_conge ?? 0;
      newSoldeConge = Math.max(0, soldeActuel - joursADeduire);
    }

    const { error } = await demandeCongeService.updateStatutDemande(
      demande.id,
      nouveauStatut,
      demande.id_employe,
      newSoldeConge
    );

    if (error) return { success: false, error: error.message };

    // Full refetch ensures the grid shows the fresh solde_conge from the join
    await fetchDemandes();
    return { success: true };
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const removeDemande = async (id) => {
    const { error } = await demandeCongeService.deleteDemande(id);
    if (error) return { success: false, error: error.message };
    setDemandes((prev) => prev.filter((d) => d.id !== id));
    return { success: true };
  };

  return {
    demandes,
    joursFeries,
    isLoading,
    error,
    refetch: fetchDemandes,
    updateStatut,
    removeDemande,
  };
}
