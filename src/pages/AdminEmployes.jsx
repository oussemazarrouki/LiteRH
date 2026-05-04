import { useEffect, useMemo, useState } from 'react';
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
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  Search,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useEmployes } from '../hooks/useEmployes';

// ─── Constants ───────────────────────────────────────────────────────────────

const ROLES = ['ADMIN', 'RH', 'EMPLOYE'];
const ROLE_COLORS = { ADMIN: 'info', RH: 'warning', EMPLOYE: 'success' };
const EMPTY_FORM = {
  matricule: '',
  nom: '',
  prenom: '',
  email: '',
  mot_de_passe: '',
  role: 'EMPLOYE',
  id_service: '',
  solde_conge: 0,
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function RoleChip({ role }) {
  return (
    <Chip
      label={role}
      color={ROLE_COLORS[role] ?? 'default'}
      size="small"
      variant="filled"
      sx={{ fontWeight: 600, fontSize: '0.7rem' }}
    />
  );
}

// ─── Create / Edit Dialog ─────────────────────────────────────────────────────

function EmployeFormDialog({ open, mode, employe, services, onClose, onSave }) {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPwd, setShowPwd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!open) return;
    setForm(isEdit && employe ? { ...EMPTY_FORM, ...employe, mot_de_passe: '' } : EMPTY_FORM);
    setFormError('');
    setShowPwd(false);
  }, [open, isEdit, employe]);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    const result = isEdit
      ? await onSave(employe.id, form, employe.email)
      : await onSave(form);
    if (!result.success) setFormError(result.error);
    else onClose();
    setSaving(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {isEdit ? "Modifier l'employé" : 'Ajouter un employé'}
        </DialogTitle>

        <DialogContent dividers>
          {formError && (
            <Alert severity="error" onClose={() => setFormError('')} sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}

          {/* 2-column grid for form fields */}
          <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <TextField
              label="Matricule"
              value={form.matricule}
              onChange={set('matricule')}
              required
              fullWidth
            />

            <FormControl required fullWidth>
              <InputLabel>Rôle</InputLabel>
              <Select label="Rôle" value={form.role} onChange={set('role')}>
                {ROLES.map((r) => (
                  <MenuItem key={r} value={r}>{r}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Nom"
              value={form.nom}
              onChange={set('nom')}
              required
              fullWidth
            />

            <TextField
              label="Prénom"
              value={form.prenom}
              onChange={set('prenom')}
              required
              fullWidth
            />

            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={set('email')}
              required
              fullWidth
            />

            <FormControl required={!isEdit} fullWidth>
              <InputLabel>Service</InputLabel>
              <Select
                label="Service"
                value={form.id_service}
                onChange={set('id_service')}
                displayEmpty
              >
                {services.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.nom}
                    {s.departement ? ` (${s.departement.nom})` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label={isEdit ? 'Nouveau mot de passe' : 'Mot de passe'}
              type={showPwd ? 'text' : 'password'}
              value={form.mot_de_passe}
              onChange={set('mot_de_passe')}
              required={!isEdit}
              fullWidth
              placeholder={isEdit ? 'Laisser vide pour ne pas modifier' : ''}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPwd((v) => !v)} edge="end" tabIndex={-1}>
                        {showPwd ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              label="Solde de congés (jours)"
              type="number"
              value={form.solde_conge}
              onChange={set('solde_conge')}
              fullWidth
              slotProps={{ htmlInput: { min: 0, step: 0.5 } }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={onClose} disabled={saving} variant="outlined">
            Annuler
          </Button>
          <Button type="submit" variant="contained" disabled={saving} sx={{ minWidth: 110 }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Enregistrer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

// ─── View (Read-only) Dialog ──────────────────────────────────────────────────

function EmployeViewDialog({ open, employe, onClose }) {
  if (!employe) return null;

  const rows = [
    ['Matricule', employe.matricule],
    ['Nom', employe.nom],
    ['Prénom', employe.prenom],
    ['Email', employe.email],
    ['Rôle', <RoleChip key="role" role={employe.role} />],
    ['Service', employe.service?.nom ?? '—'],
    ['Département', employe.service?.departement?.nom ?? '—'],
    ['Solde de congés', `${employe.solde_conge ?? 0} jour(s)`],
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Détails de l'employé</DialogTitle>
      <DialogContent dividers>
        <Box className="flex flex-col gap-3">
          {rows.map(([label, value]) => (
            <Box key={label} className="flex items-center justify-between gap-4">
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, flexShrink: 0 }}>
                {label}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.primary', textAlign: 'right' }}>
                {value}
              </Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">Fermer</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Delete Confirmation Dialog ───────────────────────────────────────────────

function DeleteConfirmDialog({ open, employe, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    await onConfirm(employe.id);
    setDeleting(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Supprimer l'employé</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Êtes-vous sûr de vouloir supprimer{' '}
          <strong>{employe?.prenom} {employe?.nom}</strong> ?
          Cette action est <strong>irréversible</strong>.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={deleting} variant="outlined">
          Annuler
        </Button>
        <Button
          onClick={handleConfirm}
          color="error"
          variant="contained"
          disabled={deleting}
          sx={{ minWidth: 100 }}
        >
          {deleting ? <CircularProgress size={20} color="inherit" /> : 'Confirmer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminEmployes() {
  const { employes, services, isLoading, error, addEmploye, editEmploye, removeEmploye } =
    useEmployes();

  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ type: null, employe: null });
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const notify = (message, severity = 'success') =>
    setSnack({ open: true, message, severity });

  const closeModal = () => setModal({ type: null, employe: null });

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleCreate = async (formData) => {
    const result = await addEmploye(formData);
    if (result.success) notify('Employé ajouté avec succès.');
    return result;
  };

  const handleEdit = async (id, formData, originalEmail) => {
    const result = await editEmploye(id, formData, originalEmail);
    if (result.success) notify('Employé modifié avec succès.');
    return result;
  };

  const handleDelete = async (id) => {
    const result = await removeEmploye(id);
    notify(
      result.success ? 'Employé supprimé.' : result.error,
      result.success ? 'success' : 'error'
    );
  };

  // ── Client-side search ───────────────────────────────────────────────────────

  const filteredEmployes = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return employes;
    return employes.filter((e) =>
      [e.matricule, e.nom, e.prenom, e.email].some((v) =>
        v?.toLowerCase().includes(q)
      )
    );
  }, [employes, search]);

  // ── DataGrid columns ─────────────────────────────────────────────────────────

  const columns = [
    { field: 'matricule', headerName: 'Matricule', width: 120 },
    { field: 'nom',       headerName: 'Nom',       width: 140 },
    { field: 'prenom',    headerName: 'Prénom',    width: 140 },
    { field: 'email',     headerName: 'Email',     flex: 1, minWidth: 200 },
    {
      field: 'role',
      headerName: 'Rôle',
      width: 110,
      renderCell: ({ value }) => <RoleChip role={value} />,
    },
    {
      field: 'service',
      headerName: 'Service',
      width: 160,
      valueGetter: (value) => value?.nom ?? '—',
    },
    {
      field: 'departement_nom',
      headerName: 'Département',
      width: 160,
      valueGetter: (_value, row) => row.service?.departement?.nom ?? '—',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Box className="flex items-center gap-0.5 h-full">
          <Tooltip title="Voir">
            <IconButton
              size="small"
              sx={{ color: 'info.main' }}
              onClick={(e) => { e.stopPropagation(); setModal({ type: 'view', employe: row }); }}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Modifier">
            <IconButton
              size="small"
              sx={{ color: 'warning.main' }}
              onClick={(e) => { e.stopPropagation(); setModal({ type: 'edit', employe: row }); }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer">
            <IconButton
              size="small"
              sx={{ color: 'error.main' }}
              onClick={(e) => { e.stopPropagation(); setModal({ type: 'delete', employe: row }); }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Box className="flex flex-col gap-5 h-full">

      {/* Page header */}
      <Box className="flex flex-wrap items-center justify-between gap-3">
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ color: 'text.primary' }}>
            Gestion du Personnel
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
            {employes.length} employé{employes.length !== 1 ? 's' : ''} enregistré{employes.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setModal({ type: 'create', employe: null })}
        >
          Ajouter un employé
        </Button>
      </Box>

      {/* Error banner */}
      {error && <Alert severity="error">{error}</Alert>}

      {/* Search */}
      <TextField
        placeholder="Rechercher par matricule, nom, prénom ou email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        sx={{ maxWidth: 460 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
          },
        }}
      />

      {/* DataGrid */}
      <Box sx={{ flex: 1, minHeight: 400, bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
        <DataGrid
          rows={filteredEmployes}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          pageSizeOptions={[25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          sx={{
            border: 'none',
            height: '100%',
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: 'background.default',
            },
            '& .MuiDataGrid-columnHeader': {
              color: 'text.secondary',
              fontWeight: 600,
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            },
            '& .MuiDataGrid-cell': {
              borderColor: 'divider',
            },
            '& .MuiDataGrid-row:hover': {
              bgcolor: 'action.hover',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid',
              borderColor: 'divider',
            },
            '& .MuiDataGrid-overlay': {
              bgcolor: 'background.paper',
            },
          }}
        />
      </Box>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}

      <EmployeFormDialog
        open={modal.type === 'create' || modal.type === 'edit'}
        mode={modal.type}
        employe={modal.employe}
        services={services}
        onClose={closeModal}
        onSave={modal.type === 'edit' ? handleEdit : handleCreate}
      />

      <EmployeViewDialog
        open={modal.type === 'view'}
        employe={modal.employe}
        onClose={closeModal}
      />

      <DeleteConfirmDialog
        open={modal.type === 'delete'}
        employe={modal.employe}
        onClose={closeModal}
        onConfirm={handleDelete}
      />

      {/* ── Snackbar feedback ────────────────────────────────────────────────── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
