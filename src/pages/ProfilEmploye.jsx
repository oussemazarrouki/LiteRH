import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Typography,
} from '@mui/material';
import {
  Badge,
  BeachAccess,
  Business,
  Category,
  Email,
  Person,
} from '@mui/icons-material';
import { useEmployeProfil } from '../hooks/useEmployeProfil';

// ── Info row ──────────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }) {
  return (
    <Box className="flex items-start gap-3 py-3">
      <Box sx={{ color: 'primary.main', mt: '2px', flexShrink: 0 }}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={500}>
          {value || '—'}
        </Typography>
      </Box>
    </Box>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProfilEmploye() {
  const navigate = useNavigate();
  const { profil, isLoading } = useEmployeProfil();

  if (isLoading) {
    return (
      <Box className="flex h-full min-h-[60vh] items-center justify-center">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const nomComplet  = `${profil?.prenom ?? ''} ${profil?.nom ?? ''}`.trim();
  const initial     = (profil?.prenom?.[0] ?? profil?.nom?.[0] ?? '?').toUpperCase();
  const service     = profil?.service?.nom ?? '—';
  const departement = profil?.service?.departement?.nom ?? '—';

  return (
    <Box className="p-6">
      {/* Header */}
      <Box className="mb-6 flex items-center gap-4">
        <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', color: 'background.default', fontSize: 22, fontWeight: 700 }}>
          {initial}
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight={700}>{nomComplet}</Typography>
          <Typography variant="body2" color="text.secondary">{profil?.email}</Typography>
        </Box>
      </Box>

      {/* Two-card grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Card 1 — Informations Personnelles */}
        <Card variant="outlined">
          <CardContent className="p-6">
            <Typography variant="subtitle1" fontWeight={700} className="mb-2">
              Mes Informations
            </Typography>
            <Divider className="mb-2" />

            <InfoRow icon={<Person fontSize="small" />}  label="Nom complet"   value={nomComplet} />
            <InfoRow icon={<Badge fontSize="small" />}   label="Matricule"      value={profil?.matricule} />
            <InfoRow icon={<Email fontSize="small" />}   label="Email"          value={profil?.email} />
            <InfoRow icon={<Business fontSize="small" />} label="Département"   value={departement} />
            <InfoRow icon={<Category fontSize="small" />} label="Service"       value={service} />
          </CardContent>
        </Card>

        {/* Card 2 — Solde de Congés */}
        <Card variant="outlined">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <Typography variant="overline" color="text.secondary" letterSpacing={2}>
              Mon Solde
            </Typography>

            <Typography
              variant="h1"
              fontWeight={800}
              sx={{ color: 'primary.main', lineHeight: 1.1, mt: 1 }}
            >
              {profil?.solde_conge ?? 0}
            </Typography>

            <Typography variant="body1" color="text.secondary" className="mt-2 mb-6">
              Jours disponibles
            </Typography>

            <Button
              variant="contained"
              size="large"
              startIcon={<BeachAccess />}
              onClick={() => navigate('/employe/demande-conges')}
            >
              Demander un congé
            </Button>
          </CardContent>
        </Card>

      </div>
    </Box>
  );
}
