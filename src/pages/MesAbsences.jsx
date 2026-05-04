import { Box, Card, CardContent, Divider, Typography } from '@mui/material';
import { EventBusy } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { useMesAbsences } from '../hooks/useMesAbsences';

// ── DataGrid columns ──────────────────────────────────────────────────────────

const columns = [
  {
    field: 'date_debut',
    headerName: 'Date de début',
    width: 150,
    valueFormatter: (v) => (v ? dayjs(v).format('DD/MM/YYYY') : '—'),
  },
  {
    field: 'date_fin',
    headerName: 'Date de fin',
    width: 150,
    valueFormatter: (v) => (v ? dayjs(v).format('DD/MM/YYYY') : '—'),
  },
  {
    field: 'motif',
    headerName: 'Motif',
    flex: 1,
    renderCell: ({ value }) => (
      <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {value || '—'}
      </Typography>
    ),
  },
];

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <Box className="flex flex-col items-center justify-center py-16 gap-3">
      <EventBusy sx={{ fontSize: 48, color: 'text.disabled' }} />
      <Typography variant="body1" color="text.secondary" textAlign="center">
        Aucune absence enregistrée dans votre historique.
      </Typography>
    </Box>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MesAbsences() {
  const { absences, isLoading } = useMesAbsences();

  return (
    <Box className="p-6">
      <Typography variant="h6" fontWeight={700} className="mb-4">
        Mes Absences
      </Typography>

      <Card variant="outlined">
        <CardContent className="p-0">
          <Box className="px-4 py-3">
            <Typography variant="subtitle2" color="text.secondary">
              Historique de vos absences enregistrées
            </Typography>
          </Box>
          <Divider />

          {/* overflow-x scroll on mobile as required by spec */}
          <Box sx={{ overflowX: 'auto' }}>
            <DataGrid
              rows={absences}
              columns={columns}
              loading={isLoading}
              pageSizeOptions={[10, 25]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
                sorting:    { sortModel: [{ field: 'date_debut', sort: 'desc' }] },
              }}
              slots={{ noRowsOverlay: EmptyState }}
              disableRowSelectionOnClick
              sx={{ border: 'none', minWidth: 500 }}
              autoHeight
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
