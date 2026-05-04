import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { Logout, WorkspacePremium } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { NAV_ITEMS } from '../utils/navItems';

export const DRAWER_WIDTH = 240;

// ── Shared content rendered inside both temporary and permanent drawers ────────

function DrawerContent({ onClose }) {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = NAV_ITEMS[profile?.role] ?? [];

  const handleNav = (path) => {
    navigate(path);
    onClose?.();
  };

  const handleLogout = async () => {
    onClose?.();
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ── Brand header ──────────────────────────────────────────────── */}
      <Box className="flex items-center gap-3 px-5 py-[18px]">
        <WorkspacePremium sx={{ color: 'primary.main', fontSize: 26 }} />
        <Typography variant="h6" fontWeight={700} sx={{ color: 'text.primary', letterSpacing: '-0.3px' }}>
          LiteRH
        </Typography>
      </Box>

      <Divider />

      {/* ── Navigation links ──────────────────────────────────────────── */}
      <List sx={{ flex: 1, pt: 1.5, px: 1 }}>
        {navItems.map(({ label, icon, path }) => {
          const active = location.pathname === path || location.pathname.startsWith(path + '/');
          return (
            <ListItemButton
              key={path}
              onClick={() => handleNav(path)}
              sx={{
                borderRadius: '8px',
                mb: 0.5,
                pl: '10px',
                borderLeft: '3px solid',
                borderColor: active ? 'primary.main' : 'transparent',
                bgcolor: active ? 'rgba(169, 223, 216, 0.09)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(169, 223, 216, 0.06)' },
                transition: 'background-color 0.15s',
              }}
            >
              <ListItemIcon sx={{ color: active ? 'primary.main' : 'text.secondary', minWidth: 36 }}>
                {icon}
              </ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: active ? 600 : 400,
                  color: active ? 'primary.main' : 'text.secondary',
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      {/* ── Logout ────────────────────────────────────────────────────── */}
      <Divider />
      <Box sx={{ p: 1, pb: 1.5 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: '8px',
            '&:hover': { bgcolor: 'rgba(242, 109, 91, 0.08)' },
          }}
        >
          <ListItemIcon sx={{ color: 'error.main', minWidth: 36 }}>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Déconnexion"
            primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500, color: 'error.main' }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );
}

// ── Drawer wrapper ─────────────────────────────────────────────────────────────

const paperSx = {
  width: DRAWER_WIDTH,
  bgcolor: 'background.paper',
  borderRight: '1px solid',
  borderColor: 'divider',
  boxSizing: 'border-box',
};

export default function Sidebar({ mobileOpen, onClose }) {
  return (
    <Box component="nav" sx={{ width: { lg: DRAWER_WIDTH }, flexShrink: { lg: 0 } }}>

      {/* Mobile — overlay drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': paperSx,
        }}
      >
        <DrawerContent onClose={onClose} />
      </Drawer>

      {/* Desktop — always-visible permanent drawer */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': paperSx,
        }}
      >
        <DrawerContent />
      </Drawer>

    </Box>
  );
}
