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
import { Add, Delete, Edit } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useServices } from '../hooks/useServices';

// ─── FK error helper ──────────────────────────────────────────────────────────

const isFKError = (err) =>
  err?.code === '23503' || err?.message?.toLowerCase().includes('foreign key');

// ─── Create / Edit Dialog ─────────────────────────────────────────────────────

const EMPTY_FORM = { nom: '', id_departement: '' };

function ServiceFormDialog({ open, service, departements, onClose, onSave }) {
  const isEdit = Boolean(service);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(isEdit ? { nom: service.nom, id_departement: service.id_departement ?? '' } : EMPTY_FORM);
      setFormError('');
    }
  }, [open, isEdit, service]);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom.trim())         { setFormError('Le nom est requis.'); return; }
    if (!form.id_departement)     { setFormError('Le département est requis.'); return; }
    setSaving(true);
    setFormError('');
    const result = isEdit
      ? await onSave(service.id, form)
      : await onSave(form);
    if (!result.success) setFormError(result.error?.message ?? 'Une erreur est survenue.');
    else onClose();
    setSaving(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {isEdit ? 'Modifier le service' : 'Nouveau service'}
        </DialogTitle>
        <DialogContent dividers>
          {formError && (
            <Alert severity="error" onClose={() => setFormError('')} sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Box className="flex flex-col gap-4 pt-1">
            <TextField
              label="Nom du service"
              value={form.nom}
              onChange={set('nom')}
              required
              fullWidth
              autoFocus
            />
            <FormControl required fullWidth>
              <InputLabel>Département de rattachement</InputLabel>
              <Select
                label="Département de rattachement"
                value={form.id_departement}
                onChange={set('id_departement')}
              >
                {departements.map((d) => (
                  <MenuItem key={d.id} value={d.id}>{d.nom}</MenuItem>
                ))}
              </Select>
            </FormControl>
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

function DeleteDialog({ open, service, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    await onConfirm(service.id);
    setDeleting(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Supprimer le service</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Êtes-vous sûr de vouloir supprimer{' '}
          <strong>« {service?.nom} »</strong> ? Cette action est impossible s'il
          contient encore des employés actifs.
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

export default function AdminServices() {
  const { services, departements, isLoading, error, addService, editService, removeService } =
    useServices();

  const [modal, setModal] = useState({ type: null, service: null });
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const notify = (message, severity = 'success') =>
    setSnack({ open: true, message, severity });
  const closeModal = () => setModal({ type: null, service: null });

  const handleSave = async (...args) => {
    const result = modal.type === 'edit'
      ? await editService(...args)
      : await addService(...args);
    if (result.success)
      notify(modal.type === 'edit' ? 'Service modifié.' : 'Service ajouté.');
    return result;
  };

  const handleDelete = async (id) => {
    const result = await removeService(id);
    notify(
      result.success
        ? 'Service supprimé.'
        : isFKError(result.error)
          ? 'Impossible de supprimer : ce service contient des employés rattachés. Veuillez d\'abord réassigner ces employés.'
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
    { field: 'nom', headerName: 'Nom', flex: 1, minWidth: 180 },
    {
      field: 'departement',
      headerName: 'Département',
      flex: 1,
      minWidth: 180,
      valueGetter: (value) => value?.nom ?? '—',
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
            <IconButton
              size="small"
              sx={{ color: 'warning.main' }}
              onClick={(e) => { e.stopPropagation(); setModal({ type: 'edit', service: row }); }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer">
            <IconButton
              size="small"
              sx={{ color: 'error.main' }}
              onClick={(e) => { e.stopPropagation(); setModal({ type: 'delete', service: row }); }}
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
            Gestion des Services
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
            {services.length} service{services.length !== 1 ? 's' : ''} enregistré{services.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setModal({ type: 'create', service: null })}>
          Ajouter un service
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {/* DataGrid */}
      <Box sx={{ flex: 1, minHeight: 400, bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
        <DataGrid
          rows={services}
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
      <ServiceFormDialog
        open={modal.type === 'create' || modal.type === 'edit'}
        service={modal.service}
        departements={departements}
        onClose={closeModal}
        onSave={handleSave}
      />
      <DeleteDialog
        open={modal.type === 'delete'}
        service={modal.service}
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
