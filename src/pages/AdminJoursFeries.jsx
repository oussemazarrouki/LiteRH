import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useJoursFeries } from '../hooks/useJoursFeries';

// ─── Create / Edit Dialog ─────────────────────────────────────────────────────

const EMPTY_FORM = { nom: '', date: null };

function JourFerieFormDialog({ open, jourFerie, onClose, onSave }) {
  const isEdit = Boolean(jourFerie);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [saving, setSaving]   = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(isEdit
        ? { nom: jourFerie.nom, date: jourFerie.date }
        : EMPTY_FORM
      );
      setFormError('');
    }
  }, [open, isEdit, jourFerie]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom.trim()) { setFormError('Le nom est requis.'); return; }
    if (!form.date)       { setFormError('La date est requise.'); return; }
    setSaving(true);
    setFormError('');
    const payload = { nom: form.nom.trim(), date: form.date };
    const result  = isEdit ? await onSave(jourFerie.id, payload) : await onSave(payload);
    if (!result.success) setFormError(result.error?.message ?? 'Une erreur est survenue.');
    else onClose();
    setSaving(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {isEdit ? 'Modifier le jour férié' : 'Nouveau jour férié'}
        </DialogTitle>

        <DialogContent dividers>
          {formError && (
            <Alert severity="error" onClose={() => setFormError('')} sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Box className="flex flex-col gap-4 pt-1">
            <TextField
              label="Nom de l'événement"
              value={form.nom}
              onChange={(e) => setForm((prev) => ({ ...prev, nom: e.target.value }))}
              required
              fullWidth
              autoFocus
              placeholder="Ex: Fête du Travail"
            />
            <DatePicker
              label="Date"
              // DatePicker expects a dayjs object; we store/send 'YYYY-MM-DD' strings
              value={form.date ? dayjs(form.date) : null}
              onChange={(newVal) =>
                setForm((prev) => ({
                  ...prev,
                  date: newVal && newVal.isValid() ? newVal.format('YYYY-MM-DD') : null,
                }))
              }
              format="DD/MM/YYYY"
              slotProps={{
                textField: { required: true, fullWidth: true },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={onClose} disabled={saving} variant="outlined">Annuler</Button>
          <Button type="submit" variant="contained" disabled={saving} sx={{ minWidth: 110 }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Enregistrer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

// ─── Delete Confirmation Dialog ───────────────────────────────────────────────

function DeleteDialog({ open, jourFerie, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    await onConfirm(jourFerie.id);
    setDeleting(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Supprimer le jour férié</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Êtes-vous sûr de vouloir supprimer{' '}
          <strong>« {jourFerie?.nom} »</strong> ?
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={deleting} variant="outlined">Annuler</Button>
        <Button onClick={handleConfirm} color="error" variant="contained" disabled={deleting} sx={{ minWidth: 100 }}>
          {deleting ? <CircularProgress size={20} color="inherit" /> : 'Confirmer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminJoursFeries() {
  const { joursFeries, isLoading, error, addJourFerie, editJourFerie, removeJourFerie } =
    useJoursFeries();

  const [modal, setModal] = useState({ type: null, jourFerie: null });
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const notify    = (message, severity = 'success') => setSnack({ open: true, message, severity });
  const closeModal = () => setModal({ type: null, jourFerie: null });

  const handleSave = async (...args) => {
    const result = modal.type === 'edit'
      ? await editJourFerie(...args)
      : await addJourFerie(...args);
    if (result.success) notify(modal.type === 'edit' ? 'Jour férié modifié.' : 'Jour férié ajouté.');
    return result;
  };

  const handleDelete = async (id) => {
    const result = await removeJourFerie(id);
    notify(
      result.success ? 'Jour férié supprimé.' : (result.error?.message ?? 'Erreur de suppression.'),
      result.success ? 'success' : 'error'
    );
  };

  // ── DataGrid columns ──────────────────────────────────────────────────────

  const columns = [
    {
      field: 'nom',
      headerName: 'Nom',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'date',
      headerName: 'Date',
      width: 150,
      // Sort on the raw 'YYYY-MM-DD' string — ISO format sorts correctly
      valueFormatter: (value) => (value ? dayjs(value).format('DD/MM/YYYY') : '—'),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Box className="flex items-center gap-0.5 h-full">
          <Tooltip title="Modifier">
            <IconButton size="small" sx={{ color: 'warning.main' }}
              onClick={(e) => { e.stopPropagation(); setModal({ type: 'edit', jourFerie: row }); }}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer">
            <IconButton size="small" sx={{ color: 'error.main' }}
              onClick={(e) => { e.stopPropagation(); setModal({ type: 'delete', jourFerie: row }); }}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Box className="flex flex-col gap-5 h-full">

      <Box className="flex flex-wrap items-center justify-between gap-3">
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ color: 'text.primary' }}>
            Jours Fériés
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
            {joursFeries.length} jour{joursFeries.length !== 1 ? 's' : ''} férié{joursFeries.length !== 1 ? 's' : ''} enregistré{joursFeries.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />}
          onClick={() => setModal({ type: 'create', jourFerie: null })}>
          Ajouter un jour férié
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ flex: 1, minHeight: 400, bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
        <DataGrid
          rows={joursFeries}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
            sorting:    { sortModel: [{ field: 'date', sort: 'asc' }] },
          }}
          sx={{
            border: 'none',
            height: '100%',
            '& .MuiDataGrid-columnHeader':    { color: 'text.secondary', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' },
            '& .MuiDataGrid-columnHeaders':   { bgcolor: 'background.default' },
            '& .MuiDataGrid-cell':            { borderColor: 'divider' },
            '& .MuiDataGrid-row:hover':       { bgcolor: 'action.hover' },
            '& .MuiDataGrid-footerContainer': { borderTop: '1px solid', borderColor: 'divider' },
            '& .MuiDataGrid-overlay':         { bgcolor: 'background.paper' },
          }}
        />
      </Box>

      <JourFerieFormDialog
        open={modal.type === 'create' || modal.type === 'edit'}
        jourFerie={modal.jourFerie}
        onClose={closeModal}
        onSave={handleSave}
      />
      <DeleteDialog
        open={modal.type === 'delete'}
        jourFerie={modal.jourFerie}
        onClose={closeModal}
        onConfirm={handleDelete}
      />

      <Snackbar open={snack.open} autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} variant="filled"
          onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
