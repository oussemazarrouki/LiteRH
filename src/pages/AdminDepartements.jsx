import { useEffect, useState } from 'react';
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
import { useDepartements } from '../hooks/useDepartements';

// ─── FK error helper ──────────────────────────────────────────────────────────

const isFKError = (err) =>
  err?.code === '23503' || err?.message?.toLowerCase().includes('foreign key');

// ─── Create / Edit Dialog ─────────────────────────────────────────────────────

function DepartementFormDialog({ open, departement, onClose, onSave }) {
  const isEdit = Boolean(departement);
  const [nom, setNom] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (open) { setNom(isEdit ? departement.nom : ''); setFormError(''); }
  }, [open, isEdit, departement]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nom.trim()) { setFormError('Le nom est requis.'); return; }
    setSaving(true);
    setFormError('');
    const result = isEdit
      ? await onSave(departement.id, nom.trim())
      : await onSave(nom.trim());
    if (!result.success) setFormError(result.error?.message ?? 'Une erreur est survenue.');
    else onClose();
    setSaving(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {isEdit ? 'Modifier le département' : 'Nouveau département'}
        </DialogTitle>
        <DialogContent dividers>
          {formError && (
            <Alert severity="error" onClose={() => setFormError('')} sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <TextField
            label="Nom du département"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
            fullWidth
            autoFocus
            sx={{ mt: 0.5 }}
          />
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

function DeleteDialog({ open, departement, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    await onConfirm(departement.id);
    setDeleting(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Supprimer le département</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Êtes-vous sûr de vouloir supprimer{' '}
          <strong>« {departement?.nom} »</strong> ? Attention, vous ne pouvez pas le
          supprimer s'il contient encore des services actifs.
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

export default function AdminDepartements() {
  const { departements, isLoading, error, addDepartement, editDepartement, removeDepartement } =
    useDepartements();

  const [modal, setModal] = useState({ type: null, departement: null });
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const notify = (message, severity = 'success') =>
    setSnack({ open: true, message, severity });
  const closeModal = () => setModal({ type: null, departement: null });

  const handleSave = async (...args) => {
    const result = modal.type === 'edit'
      ? await editDepartement(...args)
      : await addDepartement(...args);
    if (result.success)
      notify(modal.type === 'edit' ? 'Département modifié.' : 'Département ajouté.');
    return result;
  };

  const handleDelete = async (id) => {
    const result = await removeDepartement(id);
    notify(
      result.success
        ? 'Département supprimé.'
        : isFKError(result.error)
          ? 'Impossible de supprimer : ce département contient des services liés.'
          : result.error?.message ?? 'Erreur de suppression.',
      result.success ? 'success' : 'error'
    );
  };

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
    { field: 'nom', headerName: 'Nom', flex: 1, minWidth: 200 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Box className="flex items-center gap-0.5 h-full">
          <Tooltip title="Modifier">
            <IconButton
              size="small"
              sx={{ color: 'warning.main' }}
              onClick={(e) => { e.stopPropagation(); setModal({ type: 'edit', departement: row }); }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer">
            <IconButton
              size="small"
              sx={{ color: 'error.main' }}
              onClick={(e) => { e.stopPropagation(); setModal({ type: 'delete', departement: row }); }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box className="flex flex-col gap-5 h-full">

      {/* Header */}
      <Box className="flex flex-wrap items-center justify-between gap-3">
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ color: 'text.primary' }}>
            Gestion des Départements
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
            {departements.length} département{departements.length !== 1 ? 's' : ''} enregistré{departements.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setModal({ type: 'create', departement: null })}>
          Ajouter un département
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {/* DataGrid */}
      <Box sx={{ flex: 1, minHeight: 400, bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
        <DataGrid
          rows={departements}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          pageSizeOptions={[25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          sx={{
            border: 'none',
            height: '100%',
            '& .MuiDataGrid-columnHeader': { color: 'text.secondary', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' },
            '& .MuiDataGrid-columnHeaders': { bgcolor: 'background.default' },
            '& .MuiDataGrid-cell': { borderColor: 'divider' },
            '& .MuiDataGrid-row:hover': { bgcolor: 'action.hover' },
            '& .MuiDataGrid-footerContainer': { borderTop: '1px solid', borderColor: 'divider' },
            '& .MuiDataGrid-overlay': { bgcolor: 'background.paper' },
          }}
        />
      </Box>

      {/* Modals */}
      <DepartementFormDialog
        open={modal.type === 'create' || modal.type === 'edit'}
        departement={modal.departement}
        onClose={closeModal}
        onSave={handleSave}
      />
      <DeleteDialog
        open={modal.type === 'delete'}
        departement={modal.departement}
        onClose={closeModal}
        onConfirm={handleDelete}
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
