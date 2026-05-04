import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from './context/AuthContext';
import ProtectedRoute, { ROLE_DEFAULT_ROUTES } from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import AdminEmployes    from './pages/AdminEmployes';
import AdminDepartements from './pages/AdminDepartements';
import AdminServices     from './pages/AdminServices';
import AdminJoursFeries  from './pages/AdminJoursFeries';
import AdminTypeConges         from './pages/AdminTypeConges';
import AdminDemandesConges     from './pages/AdminDemandesConges';
import ProfilEmploye           from './pages/ProfilEmploye';
import DemandeConge            from './pages/DemandeConge';
import Dashboard               from './pages/Dashboard';
import AdminAbsences           from './pages/AdminAbsences';
import MesAbsences             from './pages/MesAbsences';

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
  );
}
