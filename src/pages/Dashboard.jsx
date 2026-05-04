import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Typography,
} from '@mui/material';
import {
  Business,
  EventAvailable,
  PendingActions,
  People,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { useDashboardStats } from '../hooks/useDashboardStats';

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ title, value, icon, accentColor, isLoading }) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={500} letterSpacing={0.5}>
            {title.toUpperCase()}
          </Typography>
          {isLoading ? (
            <Skeleton variant="text" width={64} height={48} />
          ) : (
            <Typography variant="h3" fontWeight={800} lineHeight={1.1} className="mt-1">
              {value}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            bgcolor: `${accentColor}18`,
            color: accentColor,
            borderRadius: 3,
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </CardContent>
    </Card>
  );
}

// ── Recent demandes list ───────────────────────────────────────────────────────

function RecentDemandeItem({ demande }) {
  const nom       = `${demande.employe?.prenom ?? ''} ${demande.employe?.nom ?? ''}`.trim() || '—';
  const initial   = (demande.employe?.prenom?.[0] ?? demande.employe?.nom?.[0] ?? '?').toUpperCase();
  const typeLabel = demande.typeconge?.label ?? '—';
  const debut     = dayjs(demande.date_debut).format('DD/MM/YYYY');
  const fin       = dayjs(demande.date_fin).format('DD/MM/YYYY');

  return (
    <ListItem alignItems="flex-start" disablePadding className="py-2">
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'primary.main', color: 'background.default', width: 36, height: 36, fontSize: 14, fontWeight: 700 }}>
          {initial}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box className="flex flex-wrap items-center gap-2">
            <Typography variant="body2" fontWeight={600}>{nom}</Typography>
            <Chip label={typeLabel} size="small" variant="outlined" />
          </Box>
        }
        secondary={
          <Typography variant="caption" color="text.secondary">
            {debut} → {fin}
          </Typography>
        }
      />
    </ListItem>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const STAT_CARDS = [
  {
    key: 'totalEmployes',
    title: 'Employés',
    icon: <People />,
    accentColor: '#4DA6A0',
  },
  {
    key: 'demandesEnAttente',
    title: 'Demandes en attente',
    icon: <PendingActions />,
    accentColor: '#ff9800',
  },
  {
    key: 'totalDepartements',
    title: 'Départements',
    icon: <Business />,
    accentColor: '#9c27b0',
  },
  {
    key: 'congesValidesCeMois',
    title: 'Congés validés ce mois',
    icon: <EventAvailable />,
    accentColor: '#4caf50',
  },
];

export default function Dashboard() {
  const { stats, recentDemandes, isLoading, error } = useDashboardStats();

  return (
    <Box className="p-6 space-y-6">

      {/* Page header */}
      <Box>
        <Typography variant="h5" fontWeight={700}>Tableau de bord</Typography>
        <Typography variant="body2" color="text.secondary">
          Vue d'ensemble — {dayjs().format('MMMM YYYY')}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error">{error}</Alert>
      )}

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <StatCard
            key={card.key}
            title={card.title}
            value={stats[card.key]}
            icon={card.icon}
            accentColor={card.accentColor}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* ── Recent activity ────────────────────────────────────────────────── */}
      <Card variant="outlined">
        <CardContent className="p-5">
          <Box className="mb-3 flex items-center gap-2">
            <PendingActions fontSize="small" sx={{ color: 'warning.main' }} />
            <Typography variant="subtitle1" fontWeight={700}>
              Dernières demandes en attente
            </Typography>
          </Box>
          <Divider className="mb-3" />

          {isLoading ? (
            <Box className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
              ))}
            </Box>
          ) : recentDemandes.length === 0 ? (
            <Box className="flex flex-col items-center justify-center py-10 gap-2">
              <EventAvailable sx={{ fontSize: 40, color: 'success.main', opacity: 0.6 }} />
              <Typography variant="body2" color="text.secondary">
                Aucune demande en attente
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {recentDemandes.map((d, idx) => (
                <Box key={d.id}>
                  <RecentDemandeItem demande={d} />
                  {idx < recentDemandes.length - 1 && <Divider component="li" />}
                </Box>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

    </Box>
  );
}
