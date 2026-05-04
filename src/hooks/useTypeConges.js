import { useCallback, useEffect, useState } from 'react';
import * as typeCongeService from '../services/typeCongeService';

export function useTypeConges() {
  const [typeConges, setTypeConges] = useState([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState(null);

  const fetchTypeConges = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await typeCongeService.getTypeConges();
    if (error) setError(error.message);
    else setTypeConges(data ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchTypeConges(); }, [fetchTypeConges]);

  const addTypeConge = async (formData) => {
    const { data, error } = await typeCongeService.createTypeConge(formData);
    if (error) return { success: false, error };
    setTypeConges((prev) =>
      [...prev, data].sort((a, b) => a.label.localeCompare(b.label))
    );
    return { success: true };
  };

  const editTypeConge = async (id, formData) => {
    const { data, error } = await typeCongeService.updateTypeConge(id, formData);
    if (error) return { success: false, error };
    setTypeConges((prev) => prev.map((t) => (t.id === id ? data : t)));
    return { success: true };
  };

  const removeTypeConge = async (id) => {
    const { error } = await typeCongeService.deleteTypeConge(id);
    if (error) return { success: false, error };
    setTypeConges((prev) => prev.filter((t) => t.id !== id));
    return { success: true };
  };

  return {
    typeConges,
    isLoading,
    error,
    refetch: fetchTypeConges,
    addTypeConge,
    editTypeConge,
    removeTypeConge,
  };
}
