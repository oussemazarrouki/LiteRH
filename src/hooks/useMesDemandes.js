import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as demandeCongeService from '../services/demandeCongeService';
import { getJoursFeries } from '../services/joursFeriesService';
import { getTypeConges } from '../services/typeCongeService';

export function useMesDemandes() {
  const { profile } = useAuth();

  const [demandes, setDemandes]       = useState([]);
  const [typeConges, setTypeConges]   = useState([]);
  const [joursFeries, setJoursFeries] = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState(null);

  const fetchDemandes = useCallback(async () => {
    if (!profile?.id) return;
    setIsLoading(true);
    setError(null);
    const { data, error } = await demandeCongeService.fetchMesDemandes(profile.id);
    if (error) setError(error.message);
    else setDemandes(data ?? []);
    setIsLoading(false);
  }, [profile?.id]);

  useEffect(() => {
    fetchDemandes();
    getJoursFeries().then(({ data }) => setJoursFeries(data ?? []));
    getTypeConges().then(({ data }) => setTypeConges(data ?? []));
  }, [fetchDemandes]);

  const submitDemande = async (formData) => {
    const payload = {
      ...formData,
      id_employe: profile.id,
      statut: 'ATTENTE',
    };
    const { data, error } = await demandeCongeService.createDemande(payload);
    if (error) return { success: false, error: error.message };
    setDemandes((prev) => [data, ...prev]);
    return { success: true };
  };

  return {
    demandes,
    typeConges,
    joursFeries,
    isLoading,
    error,
    submitDemande,
    refetch: fetchDemandes,
  };
}
