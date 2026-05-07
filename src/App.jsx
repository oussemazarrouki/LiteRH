import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from './context/AuthContext';
import ProtectedRoute, { ROLE_DEFAULT_ROUTES } from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
// Login is kept as an eager import — it is the first screen for unauthenticated
// users and must render without any dynamic-import delay.
import Login from './pages/Login';

// All authenticated pages are lazy-loaded so their module graphs (including
// employeService → supabaseAdmin) are never evaluated during the initial boot.
// This prevents supabaseAdmin from competing for the same navigator.locks lock
// as the main supabase client during AuthContext initialization.
const AdminEmployes       = lazy(() => import('./pages/AdminEmployes'));
const AdminDepartements   = lazy(() => import('./pages/AdminDepartements'));
const AdminServices       = lazy(() => import('./pages/AdminServices'));
const AdminJoursFeries    = lazy(() => import('./pages/AdminJoursFeries'));
const AdminTypeConges     = lazy(() => import('./pages/AdminTypeConges'));
const AdminDemandesConges = lazy(() => import('./pages/AdminDemandesConges'));
const AdminAbsences       = lazy(() => import('./pages/AdminAbsences'));
const ProfilEmploye       = lazy(() => import('./pages/ProfilEmploye'));
const DemandeConge        = lazy(() => import('./pages/DemandeConge'));
const Dashboard           = lazy(() => import('./pages/Dashboard'));
const MesAbsences         = lazy(() => import('./pages/MesAbsences'));

function PageLoader() {
  return (
    <Box className="flex h-screen items-center justify-center">
      <CircularProgress color="primary" />
    </Box>
  );
}

// ── Placeholder ───────────────────────────────────────────────────────────────

function PlaceholderPage({ label }) {
  return (
    <Box className="flex h-full min-h-[60vh] items-center justify-center">
      <p className="text-lg font-medium text-slate-400">{label}</p>
    </Box>
  );
}

// ── Root redirect ─────────────────────────────────────────────────────────────

function RootRedirect() {
  const { session, profile, isLoading } = useAuth();

  if (isLoading || (session && !profile)) {
    return (
      <Box className="flex h-screen items-center justify-center">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!session) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_DEFAULT_ROUTES[profile.role] ?? '/login'} replace />;
}

// ── Router ────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* ── Public ──────────────────────────────────────────────────── */}
      <Route path="/login" element={<Login />} />
      <Route path="/"      element={<RootRedirect />} />

      {/* ── ADMIN ───────────────────────────────────────────────────── */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<MainLayout />}>
          <Route path="/admin/personnel"    element={<AdminEmployes />} />
          <Route path="/admin/absences"     element={<AdminAbsences />} />
          <Route path="/admin/departements" element={<AdminDepartements />} />
          <Route path="/admin/services"     element={<AdminServices />} />
          <Route path="/admin/jours-feries" element={<AdminJoursFeries />} />
          <Route path="/admin/types-conges" element={<AdminTypeConges />} />
          <Route path="/admin/demandes"     element={<AdminDemandesConges />} />
        </Route>
      </Route>

      {/* ── RH ──────────────────────────────────────────────────────── */}
      <Route element={<ProtectedRoute allowedRoles={['RH']} />}>
        <Route element={<MainLayout />}>
          <Route path="/rh/dashboard" element={<Dashboard />} />
        </Route>
      </Route>

      {/* ── EMPLOYE ─────────────────────────────────────────────────── */}
      <Route element={<ProtectedRoute allowedRoles={['EMPLOYE']} />}>
        <Route element={<MainLayout />}>
          <Route path="/employe/profil"          element={<ProfilEmploye />} />
          <Route path="/employe/demande-conges"  element={<DemandeConge />} />
          <Route path="/employe/absences"        element={<MesAbsences />} />
        </Route>
      </Route>

      {/* ── Catch-all ───────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}
