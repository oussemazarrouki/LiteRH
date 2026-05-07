import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  DarkMode,
  LightMode,
  Visibility,
  VisibilityOff,
  WorkspacePremium,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { ROLE_DEFAULT_ROUTES } from '../components/ProtectedRoute';

// Sentinel used to distinguish a timeout rejection from a real error.
const LOGIN_TIMEOUT = Symbol('login-timeout');

export default function Login() {
  const { session, profile, isLoading: authLoading, login } = useAuth();
  const { mode, toggleTheme } = useAppTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Already authenticated → send to their home route
  if (!authLoading && session && profile) {
    return <Navigate to={ROLE_DEFAULT_ROUTES[profile.role] ?? '/'} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Race the sign-in against an 8-second deadline. If the GoTrueClient
      // ever deadlocks (e.g. a future lock regression), the timeout rejects
      // with our sentinel so the button is always guaranteed to unblock.
      const result = await Promise.race([
        login(email, password),
        new Promise((_, reject) =>
          setTimeout(() => reject(LOGIN_TIMEOUT), 8000)
        ),
      ]);

      const { error: authError } = result;
      if (authError) {
        setError('Identifiants incorrects. Veuillez réessayer.');
        return;
      }
      // AuthContext will update profile via onAuthStateChange.
      // Navigate to / which uses RootRedirect once profile is ready.
      navigate('/', { replace: true });
    } catch (err) {
      if (err === LOGIN_TIMEOUT) {
        setError('La connexion a pris trop de temps. Veuillez réessayer.');
      } else {
        console.error('[Login] unexpected sign-in error:', err);
        setError('Une erreur inattendue est survenue. Veuillez réessayer.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const isDark = mode === 'dark';

  return (
    <Box
      className="flex min-h-screen w-full"
      sx={{ bgcolor: 'background.default' }}
    >
      {/* ── Theme toggle ───────────────────────────────────────────────── */}
      <Tooltip title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}>
        <IconButton
          onClick={toggleTheme}
          sx={{ position: 'fixed', top: 16, right: 16, zIndex: 10 }}
          aria-label="Basculer le thème"
        >
          {isDark ? (
            <LightMode sx={{ color: '#a9dfd8' }} />
          ) : (
            <DarkMode sx={{ color: '#4DA6A0' }} />
          )}
        </IconButton>
      </Tooltip>

      {/* ── Left panel — decorative (desktop only) ─────────────────────── */}
      <Box
        className="hidden lg:flex w-1/2 flex-col items-center justify-center relative overflow-hidden"
        sx={{
          background: isDark
            ? 'linear-gradient(135deg, #0d1f1d 0%, #161821 40%, #1a2d2a 100%)'
            : 'linear-gradient(135deg, #e6f7f5 0%, #f0fbfa 50%, #d4f0ec 100%)',
        }}
      >
        {/* Decorative blurred circles */}
        <Box
          sx={{
            position: 'absolute',
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: isDark
              ? 'radial-gradient(circle, rgba(169,223,216,0.08) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(77,166,160,0.12) 0%, transparent 70%)',
            top: '10%',
            left: '10%',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: isDark
              ? 'radial-gradient(circle, rgba(169,223,216,0.05) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(77,166,160,0.08) 0%, transparent 70%)',
            bottom: '15%',
            right: '5%',
          }}
        />

        {/* Branding */}
        <Box className="relative z-10 flex flex-col items-center gap-4 px-12 text-center">
          <WorkspacePremium
            sx={{
              fontSize: 72,
              color: isDark ? '#a9dfd8' : '#4DA6A0',
            }}
          />
          <Typography
            variant="h3"
            fontWeight={700}
            sx={{ color: isDark ? '#FFFFFF' : '#1E293B', letterSpacing: '-0.5px' }}
          >
            LiteRH
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: isDark ? '#94A3B8' : '#64748B', maxWidth: 320 }}
          >
            Plateforme de gestion du personnel,
            <br />
            simple et efficace.
          </Typography>
        </Box>
      </Box>

      {/* ── Right panel — form ─────────────────────────────────────────── */}
      <Box
        className="flex w-full lg:w-1/2 items-center justify-center px-6 py-16"
        sx={{ bgcolor: 'background.default' }}
      >
        <Box className="w-full max-w-sm flex flex-col gap-6">
          {/* Form header */}
          <Box>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ color: 'text.primary', mb: 0.5 }}
            >
              LiteRH
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Veuillez vous connecter à votre espace.
            </Typography>
          </Box>

          {/* Error alert */}
          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            noValidate
          >
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre.email@entreprise.com"
              required
              fullWidth
              autoComplete="email"
              autoFocus
              disabled={isSubmitting}
            />

            <TextField
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              autoComplete="current-password"
              disabled={isSubmitting}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                        tabIndex={-1}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={isSubmitting}
              sx={{ mt: 1, height: 48, fontWeight: 600 }}
            >
              {isSubmitting ? (
                <CircularProgress size={22} sx={{ color: 'inherit' }} />
              ) : (
                'Se connecter'
              )}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
