import { useCallback, useEffect, useState } from 'react';
import * as joursFeriesService from '../services/joursFeriesService';

export function useJoursFeries() {
  const [joursFeries, setJoursFeries] = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState(null);

  const fetchJoursFeries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await joursFeriesService.getJoursFeries();
    if (error) setError(error.message);
    else setJoursFeries(data ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchJoursFeries(); }, [fetchJoursFeries]);

  const addJourFerie = async (formData) => {
    const { data, error } = await joursFeriesService.createJourFerie(formData);
    if (error) return { success: false, error };
    // Keep sorted by date after insert
    setJoursFeries((prev) =>
      [...prev, data].sort((a, b) => new Date(a.date) - new Date(b.date))
    );
    return { success: true };
  };

  const editJourFerie = async (id, formData) => {
    const { data, error } = await joursFeriesService.updateJourFerie(id, formData);
    if (error) return { success: false, error };
    setJoursFeries((prev) =>
      prev
        .map((j) => (j.id === id ? data : j))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
    );
    return { success: true };
  };

  const removeJourFerie = async (id) => {
    const { error } = await joursFeriesService.deleteJourFerie(id);
    if (error) return { success: false, error };
    setJoursFeries((prev) => prev.filter((j) => j.id !== id));
    return { success: true };
  };

  return {
    joursFeries,
    isLoading,
    error,
    refetch: fetchJoursFeries,
    addJourFerie,
    editJourFerie,
    removeJourFerie,
  };
}
