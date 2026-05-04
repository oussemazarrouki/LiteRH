import { useCallback, useEffect, useState } from 'react';
import * as departementService from '../services/departementService';

export function useDepartements() {
  const [departements, setDepartements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDepartements = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await departementService.getDepartements();
    if (error) setError(error.message);
    else setDepartements(data ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchDepartements(); }, [fetchDepartements]);

  const addDepartement = async (nom) => {
    const { data, error } = await departementService.createDepartement(nom);
    if (error) return { success: false, error };
    setDepartements((prev) => [...prev, data].sort((a, b) => a.nom.localeCompare(b.nom)));
    return { success: true };
  };

  const editDepartement = async (id, nom) => {
    const { data, error } = await departementService.updateDepartement(id, nom);
    if (error) return { success: false, error };
    setDepartements((prev) => prev.map((d) => (d.id === id ? data : d)));
    return { success: true };
  };

  const removeDepartement = async (id) => {
    const { error } = await departementService.deleteDepartement(id);
    if (error) return { success: false, error };
    setDepartements((prev) => prev.filter((d) => d.id !== id));
    return { success: true };
  };

  return { departements, isLoading, error, refetch: fetchDepartements, addDepartement, editDepartement, removeDepartement };
}
