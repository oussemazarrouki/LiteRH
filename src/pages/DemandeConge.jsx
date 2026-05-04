import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Add, Close, InfoOutlined } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { DataGrid } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { useAuth } from '../context/AuthContext';
import { useMesDemandes } from '../hooks/useMesDemandes';
import { calculerJoursOuvrables } from '../utils/congeUtils';

// ── Status chip ───────────────────────────────────────────────────────────────

const STATUT_CONFIG = {
  ATTENTE: { label: 'En attente', color: 'warning' },
  VALIDE:  { label: 'Approuvée',  color: 'success' },
  REFUSE:  { label: 'Rejetée',    color: 'error'   },
};

function StatutChip({ statut }) {
  const cfg = STATUT_CONFIG[statut] ?? { label: statut, color: 'default' };
  return <Chip label={cfg.label} color={cfg.color} size="small" />;
}

// ── DataGrid columns ──────────────────────────────────────────────────────────

const columns = [
  {
    field: 'type',
    headerName: 'Type',
    flex: 1,
    valueGetter: (_value, row) => row.typeconge?.label ?? '—',
  },
  {
    field: 'date_debut',
    headerName: 'Début',
    width: 120,
    valueFormatter: (value) => (value ? dayjs(value).format('DD/MM/YYYY') : '—'),
  },
  {
    field: 'date_fin',
    headerName: 'Fin',
    width: 120,
    valueFormatter: (value) => (value ? dayjs(value).format('DD/MM/YYYY') : '—'),
  },
  {
    field: 'statut',
    headerName: 'Statut',
    width: 140,
    renderCell: ({ value }) => <StatutChip statut={value} />,
  },
  {
    field: 'commentaire',
    headerName: 'Commentaire',
    flex: 1.5,
    renderCell: ({ value }) =>
      value ? (
        <Tooltip title={value} placement="top">
          <Box className="flex items-center gap-1 overflow-hidden">
            <InfoOutlined fontSize="small" color="action" />
            <span className="truncate text-sm">{value}</span>
          </Box>
        </Tooltip>
      ) : (
        <Typography variant="body2" color="text.disabled">—</Typography>
      ),
  },
];

// ── Initial form state ────────────────────────────────────────────────────────

const INIT_FORM = { id_type: '', date_debut: null, date_fin: null, commentaire: '' };

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DemandeConge() {
  const { profile } = useAuth();
  const { demandes, typeConges, joursFeries, isLoading, submitDemande } = useMesDemandes();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm]             = useState(INIT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack]           = useState({ open: false, message: '', severity: 'success' });

  const solde = profile?.solde_conge ?? 0;

  // ── Live working-days calculation ────────────────────────────────────────────

  const selectedType    = typeConges.find((t) => t.id === form.id_type);
  const isDeductible    = selectedType?.est_deductible ?? true;

  const joursOuvrables = useMemo(() => {
    if (!form.date_debut || !form.date_fin) return null;
    const start = dayjs(form.date_debut);
    const end   = dayjs(form.date_fin);
    if (!start.isValid() || !end.isValid()) return null;
    if (end.isBefore(start)) return null;
    return calculerJoursOuvrables(form.date_debut, form.date_fin, joursFeries);
  }, [form.date_debut, form.date_fin, joursFeries]);

  const insuffisantApresDeduction =
    isDeductible && joursOuvrables !== null && joursOuvrables > solde;

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleOpen  = () => { setForm(INIT_FORM); setDialogOpen(true); };
  const handleClose = () => { if (!submitting) setDialogOpen(false); };

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.id_type || !form.date_debut || !form.date_fin) return;
    setSubmitting(true);
    const result = await submitDemande({
      id_type:      form.id_type,
      date_debut:   form.date_debut,
      date_fin:     form.date_fin,
      commentaire:  form.commentaire || null,
    });
    setSubmitting(false);
    if (result.success) {
      setDialogOpen(false);
      setSnack({ open: true, message: 'Demande soumise avec succès !', severity: 'success' });
    } else {
      setSnack({ open: true, message: result.error, severity: 'error' });
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <Box className="flex h-full flex-col p-6">

      {/* Header */}
      <Box className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Box>
          <Typography variant="h6" fontWeight={700}>Mes Demandes de Congés</Typography>
          <Typography variant="body2" color="text.secondary">
            Solde actuel&nbsp;: <strong>{solde}</strong> jour{solde !== 1 ? 's' : ''}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpen}
          disabled={solde <= 0}
        >
          Nouvelle Demande
        </Button>
      </Box>

      {/* Solde insuffisant warning */}
      {solde <= 0 && (
        <Alert severity="warning" className="mb-4">
          Solde insuffisant pour une nouvelle demande.
        </Alert>
      )}

      {/* DataGrid */}
      <Box className="flex-1" sx={{ minHeight: 400 }}>
        <DataGrid
          rows={demandes}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
        />
      </Box>

      {/* ── New request dialog ─────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle className="flex items-center justify-between">
          <span>Nouvelle demande de congé</span>
          <IconButton size="small" onClick={handleClose} disabled={submitting}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Divider />

        <DialogContent className="flex flex-col gap-4 pt-4">

          {/* Type de congé */}
          <FormControl fullWidth size="small" required>
            <InputLabel>Type de congé</InputLabel>
            <Select
              value={form.id_type}
              label="Type de congé"
              onChange={(e) => setField('id_type', e.target.value)}
            >
              {typeConges.map((t) => (
                <MenuItem key={t.id} value={t.id}>{t.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Date range */}
          <Box className="flex flex-col gap-4 sm:flex-row">
            <DatePicker
              label="Date de début"
              value={form.date_debut ? dayjs(form.date_debut) : null}
              onChange={(d) => setField('date_debut', d ? d.format('YYYY-MM-DD') : null)}
              slotProps={{ textField: { size: 'small', fullWidth: true, required: true } }}
            />
            <DatePicker
              label="Date de fin"
              value={form.date_fin ? dayjs(form.date_fin) : null}
              minDate={form.date_debut ? dayjs(form.date_debut) : undefined}
              onChange={(d) => setField('date_fin', d ? d.format('YYYY-MM-DD') : null)}
              slotProps={{ textField: { size: 'small', fullWidth: true, required: true } }}
            />
          </Box>

          {/* Commentaire */}
          <TextField
            label="Commentaire (optionnel)"
            multiline
            minRows={2}
            size="small"
            fullWidth
            value={form.commentaire}
            onChange={(e) => setField('commentaire', e.target.value)}
          />

          {/* Live calculation */}
          {joursOuvrables !== null && joursOuvrables > 0 && isDeductible && (
            <Alert severity={insuffisantApresDeduction ? 'error' : 'warning'}>
              Cette demande consommera&nbsp;<strong>{joursOuvrables}</strong>&nbsp;
              jour{joursOuvrables !== 1 ? 's' : ''} ouvrable{joursOuvrables !== 1 ? 's' : ''} de votre solde.
              {insuffisantApresDeduction && (
                <> Solde insuffisant ({solde} jour{solde !== 1 ? 's' : ''} disponible{solde !== 1 ? 's' : ''}).</>
              )}
            </Alert>
          )}
          {joursOuvrables !== null && joursOuvrables > 0 && !isDeductible && (
            <Alert severity="info">
              Ce type de congé ne déduit pas votre solde.
            </Alert>
          )}
          {joursOuvrables === 0 && form.date_debut && form.date_fin && (
            <Alert severity="info">
              Aucun jour ouvrable entre ces deux dates (week-end ou jours fériés).
            </Alert>
          )}

        </DialogContent>

        <Divider />
        <DialogActions className="px-4 py-3">
          <Button onClick={handleClose} disabled={submitting}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              submitting ||
              !form.id_type ||
              !form.date_debut ||
              !form.date_fin ||
              (isDeductible && insuffisantApresDeduction)
            }
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {submitting ? 'Envoi…' : 'Confirmer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          variant="filled"
        >
          {snack.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}
