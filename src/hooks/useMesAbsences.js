import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchMesAbsences } from '../services/absenceService';

export function useMesAbsences() {
  const { profile } = useAuth();
  const [absences, setAbsences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;
    setIsLoading(true);
    setError(null);
    const { data, error } = await fetchMesAbsences(profile.id);
    if (error) setError(error.message);
    else setAbsences(data ?? []);
    setIsLoading(false);
  }, [profile?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { absences, isLoading, error };
}
