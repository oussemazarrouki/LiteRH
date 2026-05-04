import { useCallback, useEffect, useState } from 'react';
import * as employeService from '../services/employeService';

/**
 * Controller for the Personnel page.
 * Exposes state (employes, services, isLoading, error) and
 * three mutating actions that keep local state in sync after each operation.
 */
export function useEmployes() {
  const [employes, setEmployes] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmployes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await employeService.getEmployes();
    if (error) setError(error.message);
    else setEmployes(data ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchEmployes();
    // Services list is needed for the form dropdown — fetch once
    employeService.getServices().then(({ data }) => setServices(data ?? []));
  }, [fetchEmployes]);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const addEmploye = async (formData) => {
    const { data, error } = await employeService.createEmploye(formData);
    if (error) return { success: false, error: error.message };
    setEmployes((prev) => [...prev, data].sort((a, b) => a.nom.localeCompare(b.nom)));
    return { success: true };
  };

  const editEmploye = async (id, formData, originalEmail) => {
    const { data, error } = await employeService.updateEmploye(id, formData, originalEmail);
    if (error) return { success: false, error: error.message };
    setEmployes((prev) => prev.map((e) => (e.id === id ? data : e)));
    return { success: true };
  };

  const removeEmploye = async (id) => {
    const { error } = await employeService.deleteEmploye(id);
    if (error) return { success: false, error: error.message };
    setEmployes((prev) => prev.filter((e) => e.id !== id));
    return { success: true };
  };

  return {
    employes,
    services,
    isLoading,
    error,
    refetch: fetchEmployes,
    addEmploye,
    editEmploye,
    removeEmploye,
  };
}
