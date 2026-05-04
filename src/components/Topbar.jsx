import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { DarkMode, LightMode, Logout, Menu as MenuIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { DRAWER_WIDTH } from './Sidebar';
import { getPageTitle } from '../utils/navItems';

export default function Topbar({ onMenuClick }) {
  const { profile, logout } = useAuth();
  const { mode, toggleTheme } = useAppTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const pageTitle = getPageTitle(profile?.role, location.pathname);
  const fullName = `${profile?.prenom ?? ''} ${profile?.nom ?? ''}`.trim() || '—';
  const initial = (profile?.prenom?.[0] ?? profile?.nom?.[0] ?? '?').toUpperCase();

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { lg: `${DRAWER_WIDTH}px` },
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar className="flex items-center justify-between">

        {/* Left: hamburger (mobile) + page title */}
        <Box className="flex items-center gap-2">
          <IconButton
            edge="start"
            onClick={onMenuClick}
            aria-label="Ouvrir le menu"
            sx={{ display: { lg: 'none' }, color: 'text.primary', mr: 0.5 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={600} sx={{ color: 'text.primary' }}>
            {pageTitle}
          </Typography>
        </Box>

        {/* Right: theme toggle + avatar */}
        <Box className="flex items-center gap-1">
          <Tooltip title={mode === 'dark' ? 'Mode clair' : 'Mode sombre'}>
            <IconButton onClick={toggleTheme} size="small" sx={{ color: 'text.secondary' }}>
              {mode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Tooltip title={fullName}>
            <IconButton
              onClick={(e) => setAnchorEl(e.currentTarget)}
              size="small"
              sx={{ ml: 0.5 }}
              aria-haspopup="true"
              aria-expanded={menuOpen}
            >
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: 'primary.main',
                  color: '#161821',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                }}
              >
                {initial}
              </Avatar>
            </IconButton>
          </Tooltip>

          {/* User dropdown */}
          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{ paper: { elevation: 2, sx: { minWidth: 180, mt: 0.5 } } }}
          >
            {/* Identity header */}
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="body2" fontWeight={600} sx={{ color: 'text.primary' }}>
                {fullName}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {profile?.email}
              </Typography>
            </Box>

            <Divider />

            <MenuItem
              onClick={handleLogout}
              sx={{ color: 'error.main', gap: 1.5, py: 1, mt: 0.5 }}
            >
              <Logout fontSize="small" />
              <Typography variant="body2" fontWeight={500}>
                Déconnexion
              </Typography>
            </MenuItem>
          </Menu>
        </Box>

      </Toolbar>
    </AppBar>
  );
}
