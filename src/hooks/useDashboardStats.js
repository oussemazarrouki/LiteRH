import { useEffect, useState } from 'react';
import { getDashboardStats } from '../services/dashboardService';

const INIT_STATS = {
  totalEmployes:       0,
  demandesEnAttente:   0,
  totalDepartements:   0,
  congesValidesCeMois: 0,
};

export function useDashboardStats() {
  const [stats, setStats]               = useState(INIT_STATS);
  const [recentDemandes, setRecent]     = useState([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [error, setError]               = useState(null);

  useEffect(() => {
    getDashboardStats().then(({ data, error }) => {
      if (error) {
        setError(error.message);
      } else {
        const { recentDemandes: recent, ...counts } = data;
        setStats(counts);
        setRecent(recent);
      }
      setIsLoading(false);
    });
  }, []);

  return { stats, recentDemandes, isLoading, error };
}
