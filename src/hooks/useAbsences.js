import { useCallback, useEffect, useState } from 'react';
import * as absenceService from '../services/absenceService';
import { getEmployes } from '../services/employeService';

export function useAbsences() {
  const [absences, setAbsences] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await absenceService.fetchAbsences();
    if (error) setError(error.message);
    else setAbsences(data ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    getEmployes().then(({ data }) => setEmployes(data ?? []));
  }, [fetchData]);

  const addAbsence = async (formData) => {
    const { data, error } = await absenceService.createAbsence(formData);
    if (error) return { success: false, error: error.message };
    setAbsences((prev) => [data, ...prev]);
    return { success: true };
  };

  const editAbsence = async (id, updates) => {
    const { data, error } = await absenceService.updateAbsence(id, updates);
    if (error) return { success: false, error: error.message };
    setAbsences((prev) => prev.map((a) => (a.id === id ? data : a)));
    return { success: true };
  };

  const removeAbsence = async (id) => {
    const { error } = await absenceService.deleteAbsence(id);
    if (error) return { success: false, error: error.message };
    setAbsences((prev) => prev.filter((a) => a.id !== id));
    return { success: true };
  };

  return {
    absences,
    employes,
    isLoading,
    error,
    refetch: fetchData,
    addAbsence,
    editAbsence,
    removeAbsence,
  };
}
