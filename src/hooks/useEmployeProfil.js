import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEmployeProfil } from '../services/employeService';

export function useEmployeProfil() {
  const { profile: authProfile } = useAuth();
  const [profil, setProfil] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authProfile?.id) return;
    getEmployeProfil(authProfile.id).then(({ data }) => {
      setProfil(data);
      setIsLoading(false);
    });
  }, [authProfile?.id]);

  return { profil, isLoading };
}
