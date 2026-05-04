import { useCallback, useEffect, useState } from 'react';
import * as serviceService from '../services/serviceService';
import { getDepartements } from '../services/departementService';

export function useServices() {
  const [services, setServices]       = useState([]);
  const [departements, setDepartements] = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState(null);

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await serviceService.getServices();
    if (error) setError(error.message);
    else setServices(data ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchServices();
    // Departments are needed once for the form dropdown
    getDepartements().then(({ data }) => setDepartements(data ?? []));
  }, [fetchServices]);

  const addService = async (formData) => {
    const { data, error } = await serviceService.createService(formData);
    if (error) return { success: false, error };
    setServices((prev) => [...prev, data].sort((a, b) => a.nom.localeCompare(b.nom)));
    return { success: true };
  };

  const editService = async (id, formData) => {
    const { data, error } = await serviceService.updateService(id, formData);
    if (error) return { success: false, error };
    setServices((prev) => prev.map((s) => (s.id === id ? data : s)));
    return { success: true };
  };

  const removeService = async (id) => {
    const { error } = await serviceService.deleteService(id);
    if (error) return { success: false, error };
    setServices((prev) => prev.filter((s) => s.id !== id));
    return { success: true };
  };

  return { services, departements, isLoading, error, refetch: fetchServices, addService, editService, removeService };
}
