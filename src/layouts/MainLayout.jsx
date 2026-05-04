import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar, { DRAWER_WIDTH } from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* ── Main column: Topbar + scrollable content ─────────────────── */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          // On desktop the permanent sidebar occupies DRAWER_WIDTH, so the
          // main column must shrink by the same amount.
          width: { xs: '100%', lg: `calc(100% - ${DRAWER_WIDTH}px)` },
          minWidth: 0,
        }}
      >
        <Topbar onMenuClick={() => setMobileOpen(true)} />

        {/* Content area — offset by AppBar height (64px) */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            mt: '64px',
            p: { xs: 2, sm: 3 },
            bgcolor: 'background.default',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
