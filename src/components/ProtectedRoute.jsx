import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const ROLE_DEFAULT_ROUTES = {
  ADMIN: '/admin/personnel',
  RH: '/rh/dashboard',
  EMPLOYE: '/employe/profil',
};

function FullPageSpinner() {
  return (
    <Box className="flex h-screen w-full items-center justify-center">
      <CircularProgress color="primary" />
    </Box>
  );
}

/**
 * Wraps route groups to enforce authentication + RBAC.
 *
 * @param {string[]} allowedRoles - Roles permitted to access the nested routes.
 *
 * Behaviour:
 *   - Still loading  → full-page spinner (avoids flash-redirect on page refresh)
 *   - Not logged in  → /login
 *   - Wrong role     → user's own default route
 *   - OK             → <Outlet /> (renders the nested route)
 */
export default function ProtectedRoute({ allowedRoles = [] }) {
  const { session, profile, isLoading } = useAuth();

  if (isLoading) return <FullPageSpinner />;

  if (!session) return <Navigate to="/login" replace />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(profile?.role)) {
    const fallback = ROLE_DEFAULT_ROUTES[profile?.role] ?? '/login';
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}

export { ROLE_DEFAULT_ROUTES };
