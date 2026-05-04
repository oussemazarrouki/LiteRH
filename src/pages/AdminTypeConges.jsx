import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Snackbar,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useTypeConges } from '../hooks/useTypeConges';

// ─── FK error helper ──────────────────────────────────────────────────────────

const isFKError = (err) =>
  err?.code === '23503' || err?.message?.toLowerCase().includes('foreign key');

// ─── Create / Edit Dialog ─────────────────────────────────────────────────────

const EMPTY_FORM = { label: '', est_deductible: true };

function TypeCongeFormDialog({ open, typeConge, onClose, onSave }) {
  const isEdit = Boolean(typeConge);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(isEdit
        ? { label: typeConge.label, est_deductible: typeConge.est_deductible }
        : EMPTY_FORM
      );
      setFormError('');
    }
  }, [open, isEdit, typeConge]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.label.trim()) { setFormError('Le label est requis.'); return; }
    setSaving(true);
    setFormError('');
    const payload = { label: form.label.trim(), est_deductible: form.est_deductible };
    const result  = isEdit ? await onSave(typeConge.id, payload) : await onSave(payload);
    if (!result.success) setFormError(result.error?.message ?? 'Une erreur est survenue.');
    else onClose();
    setSaving(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {isEdit ? 'Modifier le type de congé' : 'Nouveau type de congé'}
        </DialogTitle>

        <DialogContent dividers>
          {formError && (
            <Alert severity="error" onClose={() => setFormError('')} sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Box className="flex flex-col gap-5 pt-1">
            <TextField
              label="Label"
              value={form.label}
              onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
              required
              fullWidth
              autoFocus
              placeholder="Ex: Congé Payé, Maladie, Sans Solde…"
            />

            {/* Switch for est_deductible */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 1.5,
                py: 1,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.default',
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={500} sx={{ color: 'text.primary' }}>
                  Déductible du solde
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Si activé, les jours seront retranchés du solde de l'employé lors de la validation.
                </Typography>
              </Box>
              <Switch
                checked={form.est_deductible}
                onChange={(e) => setForm((prev) => ({ ...prev, est_deductible: e.target.checked }))}
                color="primary"
              />
            </Box>
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

function DeleteDialog({ open, typeConge, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    await onConfirm(typeConge.id);
    setDeleting(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Supprimer le type de congé</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Êtes-vous sûr de vouloir supprimer{' '}
          <strong>« {typeConge?.label} »</strong> ? Vous ne pouvez pas le supprimer s'il
          est déjà utilisé dans l'historique des demandes.
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

export default function AdminTypeConges() {
  const { typeConges, isLoading, error, addTypeConge, editTypeConge, removeTypeConge } =
    useTypeConges();

  const [modal, setModal] = useState({ type: null, typeConge: null });
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const notify     = (message, severity = 'success') => setSnack({ open: true, message, severity });
  const closeModal = () => setModal({ type: null, typeConge: null });

  const handleSave = async (...args) => {
    const result = modal.type === 'edit'
      ? await editTypeConge(...args)
      : await addTypeConge(...args);
    if (result.success) notify(modal.type === 'edit' ? 'Type de congé modifié.' : 'Type de congé ajouté.');
    return result;
  };

  const handleDelete = async (id) => {
    const result = await removeTypeConge(id);
    notify(
      result.success
        ? 'Type de congé supprimé.'
        : isFKError(result.error)
          ? 'Impossible de supprimer : ce type est lié à des demandes de congés existantes.'
          : result.error?.message ?? 'Erreur de suppression.',
      result.success ? 'success' : 'error'
    );
  };

  // ── DataGrid columns ──────────────────────────────────────────────────────

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 120,
      renderCell: ({ value }) => (
        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
          {value?.slice(0, 8)}…
        </Typography>
      ),
    },
    {
      field: 'label',
      headerName: 'Label',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'est_deductible',
      headerName: 'Déductible du solde',
      width: 180,
      renderCell: ({ value }) => (
        <Chip
          label={value ? 'Oui' : 'Non'}
          color={value ? 'success' : 'default'}
          size="small"
          variant="filled"
          sx={{ fontWeight: 600, fontSize: '0.7rem' }}
        />
      ),
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
              onClick={(e) => { e.stopPropagation(); setModal({ type: 'edit', typeConge: row }); }}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer">
            <IconButton size="small" sx={{ color: 'error.main' }}
              onClick={(e) => { e.stopPropagation(); setModal({ type: 'delete', typeConge: row }); }}>
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
            Types de Congés
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
            {typeConges.length} type{typeConges.length !== 1 ? 's' : ''} enregistré{typeConges.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />}
          onClick={() => setModal({ type: 'create', typeConge: null })}>
          Ajouter un type de congé
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ flex: 1, minHeight: 400, bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
        <DataGrid
          rows={typeConges}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          pageSizeOptions={[25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
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

      <TypeCongeFormDialog
        open={modal.type === 'create' || modal.type === 'edit'}
        typeConge={modal.typeConge}
        onClose={closeModal}
        onSave={handleSave}
      />
      <DeleteDialog
        open={modal.type === 'delete'}
        typeConge={modal.typeConge}
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
