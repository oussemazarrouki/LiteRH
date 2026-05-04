import { useState } from 'react';
import dayjs from 'dayjs';
import {
  Alert,
  AlertTitle,
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
  IconButton,
  Snackbar,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Cancel,
  CheckCircle,
  Delete,
  InfoOutlined,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useDemandesConges } from '../hooks/useDemandesConges';
import { calculerJoursOuvrables } from '../utils/congeUtils';

// ─── Statut config ────────────────────────────────────────────────────────────

const STATUT_CONFIG = {
  ATTENTE: { label: 'En attente', color: 'warning' },
  VALIDE:  { label: 'Approuvée',  color: 'success' },
  REFUSE:  { label: 'Rejetée',    color: 'error'   },
};

// ─── Shared summary row ───────────────────────────────────────────────────────

function SummaryRow({ label, value }) {
  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
      <Typography
        variant="body2"
        sx={{ color: 'text.secondary', fontWeight: 500, minWidth: 110, flexShrink: 0 }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.primary' }}>
        {value ?? '—'}
      </Typography>
    </Box>
  );
}

// ─── Approval Confirmation Dialog ─────────────────────────────────────────────

function ApprovalDialog({ open, demande, joursFeries, onClose, onConfirm }) {
  const [confirming, setConfirming] = useState(false);

  if (!demande) return null;

  const joursOuvrables = calculerJoursOuvrables(
    demande.date_debut,
    demande.date_fin,
    joursFeries
  );
  const isDeductible  = demande.typeconge?.est_deductible ?? false;
  const soldeActuel   = demande.employe?.solde_conge ?? 0;
  const soldeApres    = Math.max(0, soldeActuel - joursOuvrables);
  const soldeSuffisant = soldeActuel >= joursOuvrables;
  const employeNom    = `${demande.employe?.prenom ?? ''} ${demande.employe?.nom ?? ''}`.trim();

  const handleConfirm = async () => {
    setConfirming(true);
    await onConfirm(demande, 'VALIDE');
    setConfirming(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Approuver la demande</DialogTitle>

      <DialogContent dividers>
        {/* Request summary */}
        <Box className="flex flex-col gap-2.5 mb-4">
          <SummaryRow label="Employé"    value={employeNom} />
          <SummaryRow label="Type"       value={demande.typeconge?.label} />
          <SummaryRow
            label="Période"
            value={`${dayjs(demande.date_debut).format('DD/MM/YYYY')} → ${dayjs(demande.date_fin).format('DD/MM/YYYY')}`}
          />
          <SummaryRow
            label="Durée"
            value={`${joursOuvrables} jour${joursOuvrables !== 1 ? 's' : ''} ouvrable${joursOuvrables !== 1 ? 's' : ''}`}
          />
          {demande.commentaire && (
            <SummaryRow label="Commentaire" value={demande.commentaire} />
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Balance impact warning — the critical block */}
        {isDeductible ? (
          <Alert
            severity={soldeSuffisant ? 'warning' : 'error'}
            icon={<InfoOutlined />}
          >
            <AlertTitle sx={{ fontWeight: 700 }}>
              {soldeSuffisant ? 'Impact sur le solde de congés' : '⚠️ Solde insuffisant'}
            </AlertTitle>
            Cette approbation déduira{' '}
            <strong>{joursOuvrables} jour{joursOuvrables !== 1 ? 's' : ''}</strong> du
            solde de <strong>{employeNom}</strong>.
            <Box
              sx={{
                mt: 1,
                display: 'flex',
                gap: 3,
                flexWrap: 'wrap',
                '& span': { fontWeight: 600 },
              }}
            >
              <Typography variant="body2">
                Solde actuel : <span>{soldeActuel} j</span>
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>→</Typography>
              <Typography variant="body2">
                Solde après : <span style={{ color: soldeSuffisant ? 'inherit' : 'var(--error)' }}>
                  {isDeductible ? soldeApres : soldeActuel} j
                </span>
              </Typography>
            </Box>
            {!soldeSuffisant && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                L'employé n'a pas suffisamment de jours. Vous pouvez tout de même approuver
                (le solde sera ramené à 0).
              </Typography>
            )}
          </Alert>
        ) : (
          <Alert severity="info" icon={<InfoOutlined />}>
            Le type <strong>« {demande.typeconge?.label} »</strong> n'est{' '}
            <strong>pas déductible</strong> du solde. Le solde de{' '}
            <strong>{employeNom}</strong> ne sera pas modifié.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={confirming} variant="outlined">
          Annuler
        </Button>
        <Button
          onClick={handleConfirm}
          color="success"
          variant="contained"
          disabled={confirming}
          startIcon={confirming ? null : <CheckCircle />}
          sx={{ minWidth: 130 }}
        >
          {confirming ? <CircularProgress size={20} color="inherit" /> : 'Approuver'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Rejection Confirmation Dialog ────────────────────────────────────────────

function RejectionDialog({ open, demande, onClose, onConfirm }) {
  const [rejecting, setRejecting] = useState(false);

  if (!demande) return null;

  const employeNom = `${demande.employe?.prenom ?? ''} ${demande.employe?.nom ?? ''}`.trim();

  const handleConfirm = async () => {
    setRejecting(true);
    await onConfirm(demande, 'REFUSE');
    setRejecting(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Rejeter la demande</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Confirmez-vous le rejet de la demande de{' '}
          <strong>{employeNom}</strong>{' '}
          ({demande.typeconge?.label}) pour la période du{' '}
          <strong>{dayjs(demande.date_debut).format('DD/MM/YYYY')}</strong> au{' '}
          <strong>{dayjs(demande.date_fin).format('DD/MM/YYYY')}</strong> ?
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={rejecting} variant="outlined">
          Annuler
        </Button>
        <Button
          onClick={handleConfirm}
          color="error"
          variant="contained"
          disabled={rejecting}
          startIcon={rejecting ? null : <Cancel />}
          sx={{ minWidth: 110 }}
        >
          {rejecting ? <CircularProgress size={20} color="inherit" /> : 'Rejeter'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Delete Confirmation Dialog ───────────────────────────────────────────────

function DeleteDialog({ open, demande, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    await onConfirm(demande.id);
    setDeleting(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Supprimer la demande</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Êtes-vous sûr de vouloir supprimer cette demande de l'historique ?
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

export default function AdminDemandesConges() {
  const { demandes, joursFeries, isLoading, error, updateStatut, removeDemande } =
    useDemandesConges();

  const [modal, setModal] = useState({ type: null, demande: null });
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const notify     = (message, severity = 'success') => setSnack({ open: true, message, severity });
  const closeModal = () => setModal({ type: null, demande: null });

  const handleStatut = async (demande, nouveauStatut) => {
    const result = await updateStatut(demande, nouveauStatut);
    notify(
      result.success
        ? nouveauStatut === 'VALIDE'
          ? 'Demande approuvée avec succès.'
          : 'Demande rejetée.'
        : result.error,
      result.success ? 'success' : 'error'
    );
  };

  const handleDelete = async (id) => {
    const result = await removeDemande(id);
    notify(
      result.success ? 'Demande supprimée.' : result.error,
      result.success ? 'success' : 'error'
    );
  };

  // ── DataGrid columns ──────────────────────────────────────────────────────

  const columns = [
    {
      field: 'employe',
      headerName: 'Employé',
      width: 180,
      valueGetter: (value) =>
        value ? `${value.prenom ?? ''} ${value.nom ?? ''}`.trim() : '—',
    },
    {
      field: 'typeconge',
      headerName: 'Type de Congé',
      width: 160,
      valueGetter: (value) => value?.label ?? '—',
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
      field: 'commentaire',
      headerName: 'Commentaire',
      flex: 1,
      minWidth: 160,
      renderCell: ({ value }) =>
        value ? (
          <Tooltip title={value} placement="top-start">
            <Typography
              variant="body2"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%',
                color: 'text.primary',
              }}
            >
              {value}
            </Typography>
          </Tooltip>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
            —
          </Typography>
        ),
    },
    {
      field: 'statut',
      headerName: 'Statut',
      width: 140,
      renderCell: ({ value }) => {
        const cfg = STATUT_CONFIG[value] ?? { label: value, color: 'default' };
        return (
          <Chip
            label={cfg.label}
            color={cfg.color}
            size="small"
            variant="filled"
            sx={{ fontWeight: 600, fontSize: '0.7rem' }}
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 130,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => {
        const isPending = row.statut === 'ATTENTE';
        return (
          <Box className="flex items-center gap-0.5 h-full">
            {isPending && (
              <>
                <Tooltip title="Approuver">
                  <IconButton
                    size="small"
                    sx={{ color: 'success.main' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setModal({ type: 'approve', demande: row });
                    }}
                  >
                    <CheckCircle fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Rejeter">
                  <IconButton
                    size="small"
                    sx={{ color: 'error.main' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setModal({ type: 'reject', demande: row });
                    }}
                  >
                    <Cancel fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
            <Tooltip title="Supprimer">
              <IconButton
                size="small"
                sx={{ color: isPending ? 'text.secondary' : 'error.main' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setModal({ type: 'delete', demande: row });
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  // ── Counts for the subtitle ───────────────────────────────────────────────

  const enAttente = demandes.filter((d) => d.statut === 'ATTENTE').length;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Box className="flex flex-col gap-5 h-full">

      {/* Header — NO add button per spec */}
      <Box className="flex flex-wrap items-center justify-between gap-3">
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ color: 'text.primary' }}>
            Gestion des Demandes de Congés
          </Typography>
          <Box className="flex items-center gap-2 mt-0.5">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {demandes.length} demande{demandes.length !== 1 ? 's' : ''} au total
            </Typography>
            {enAttente > 0 && (
              <Chip
                label={`${enAttente} en attente`}
                color="warning"
                size="small"
                variant="outlined"
                sx={{ fontWeight: 600, fontSize: '0.7rem' }}
              />
            )}
          </Box>
        </Box>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {/* DataGrid */}
      <Box sx={{ flex: 1, minHeight: 400, bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
        <DataGrid
          rows={demandes}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
            sorting:    { sortModel: [{ field: 'date_debut', sort: 'desc' }] },
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

      {/* ── Modals ────────────────────────────────────────────────────────── */}

      <ApprovalDialog
        open={modal.type === 'approve'}
        demande={modal.demande}
        joursFeries={joursFeries}
        onClose={closeModal}
        onConfirm={handleStatut}
      />

      <RejectionDialog
        open={modal.type === 'reject'}
        demande={modal.demande}
        onClose={closeModal}
        onConfirm={handleStatut}
      />

      <DeleteDialog
        open={modal.type === 'delete'}
        demande={modal.demande}
        onClose={closeModal}
        onConfirm={handleDelete}
      />

      {/* ── Snackbar ──────────────────────────────────────────────────────── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
