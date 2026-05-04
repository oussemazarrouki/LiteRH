import { useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { Add, Close, Delete, Edit } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { DataGrid } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { useAbsences } from '../hooks/useAbsences';

// ── Helpers ───────────────────────────────────────────────────────────────────

const INIT_FORM = { id_employe: '', date_debut: null, date_fin: null, motif: '' };

function employeLabel(emp) {
  return emp ? `${emp.prenom} ${emp.nom}` : '';
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminAbsences() {
  const { absences, employes, isLoading, error, addAbsence, editAbsence, removeAbsence } =
    useAbsences();

  const [modal, setModal]       = useState({ type: null, absence: null });
  const [form, setForm]         = useState(INIT_FORM);
  const [saving, setSaving]     = useState(false);
  const [snack, setSnack]       = useState({ open: false, message: '', severity: 'success' });

  // ── Modal helpers ─────────────────────────────────────────────────────────

  const openCreate = () => {
    setForm(INIT_FORM);
    setModal({ type: 'create', absence: null });
  };

  const openEdit = (absence) => {
    setForm({
      id_employe:  absence.id_employe,
      date_debut:  absence.date_debut,
      date_fin:    absence.date_fin,
      motif:       absence.motif ?? '',
    });
    setModal({ type: 'edit', absence });
  };

  const openDelete = (absence) => setModal({ type: 'delete', absence });
  const closeModal  = ()        => { if (!saving) setModal({ type: null, absence: null }); };

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const showSnack = (message, severity = 'success') =>
    setSnack({ open: true, message, severity });

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.id_employe || !form.date_debut || !form.date_fin) return;
    setSaving(true);

    const payload = {
      id_employe: form.id_employe,
      date_debut: form.date_debut,
      date_fin:   form.date_fin,
      motif:      form.motif || null,
    };

    const result =
      modal.type === 'create'
        ? await addAbsence(payload)
        : await editAbsence(modal.absence.id, payload);

    setSaving(false);
    if (result.success) {
      closeModal();
      showSnack(modal.type === 'create' ? 'Absence ajoutée.' : 'Absence modifiée.');
    } else {
      showSnack(result.error, 'error');
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    const result = await removeAbsence(modal.absence.id);
    setSaving(false);
    if (result.success) {
      closeModal();
      showSnack('Absence supprimée.');
    } else {
      showSnack(result.error, 'error');
    }
  };

  // ── DataGrid columns ──────────────────────────────────────────────────────

  const columns = [
    {
      field: 'employe_nom',
      headerName: 'Employé',
      flex: 1.5,
      valueGetter: (_v, row) =>
        row.employe ? `${row.employe.prenom} ${row.employe.nom}` : '—',
    },
    {
      field: 'date_debut',
      headerName: 'Date de début',
      width: 140,
      valueFormatter: (v) => (v ? dayjs(v).format('DD/MM/YYYY') : '—'),
    },
    {
      field: 'date_fin',
      headerName: 'Date de fin',
      width: 140,
      valueFormatter: (v) => (v ? dayjs(v).format('DD/MM/YYYY') : '—'),
    },
    {
      field: 'motif',
      headerName: 'Motif',
      flex: 2,
      renderCell: ({ value }) => (
        <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {value || '—'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: ({ row }) => (
        <Box className="flex gap-1">
          <IconButton size="small" color="primary" onClick={() => openEdit(row)}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => openDelete(row)}>
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  // ── Shared form dialog (Create + Edit) ────────────────────────────────────

  const isFormOpen = modal.type === 'create' || modal.type === 'edit';
  const isCreate   = modal.type === 'create';

  const selectedEmploye =
    employes.find((e) => e.id === form.id_employe) ?? null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Box className="flex h-full flex-col p-6">

      {/* Header */}
      <Box className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Typography variant="h6" fontWeight={700}>Absences</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
          Ajouter Absence
        </Button>
      </Box>

      {error && <Alert severity="error" className="mb-4">{error}</Alert>}

      {/* DataGrid */}
      <Box className="flex-1" sx={{ minHeight: 400 }}>
        <DataGrid
          rows={absences}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
            sorting:    { sortModel: [{ field: 'date_debut', sort: 'desc' }] },
          }}
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
        />
      </Box>

      {/* ── Create / Edit dialog ──────────────────────────────────────────── */}
      <Dialog open={isFormOpen} onClose={closeModal} maxWidth="sm" fullWidth>
        <DialogTitle className="flex items-center justify-between">
          <span>{isCreate ? 'Ajouter une absence' : 'Modifier l\'absence'}</span>
          <IconButton size="small" onClick={closeModal} disabled={saving}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Divider />

        <DialogContent className="flex flex-col gap-4 pt-4">

          {/* Employee autocomplete */}
          <Autocomplete
            options={employes}
            getOptionLabel={(opt) => employeLabel(opt)}
            value={selectedEmploye}
            onChange={(_, newVal) => setField('id_employe', newVal?.id ?? '')}
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            renderInput={(params) => (
              <TextField {...params} label="Employé" size="small" required />
            )}
          />

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

          {/* Motif */}
          <TextField
            label="Motif"
            multiline
            minRows={3}
            size="small"
            fullWidth
            value={form.motif}
            onChange={(e) => setField('motif', e.target.value)}
          />

        </DialogContent>

        <Divider />
        <DialogActions className="px-4 py-3">
          <Button onClick={closeModal} disabled={saving}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !form.id_employe || !form.date_debut || !form.date_fin}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete confirmation ───────────────────────────────────────────── */}
      <Dialog open={modal.type === 'delete'} onClose={closeModal} maxWidth="xs" fullWidth>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <Divider />
        <DialogContent>
          <Typography variant="body2">
            Voulez-vous vraiment supprimer cet enregistrement d'absence&nbsp;?
            {modal.absence?.employe && (
              <> (<strong>{employeLabel(modal.absence.employe)}</strong>,{' '}
              {dayjs(modal.absence.date_debut).format('DD/MM/YYYY')})</>
            )}
          </Typography>
        </DialogContent>
        <Divider />
        <DialogActions className="px-4 py-3">
          <Button onClick={closeModal} disabled={saving}>Annuler</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {saving ? 'Suppression…' : 'Confirmer'}
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
