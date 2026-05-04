import {
  Assignment,
  BeachAccess,
  Business,
  Category,
  Dashboard,
  EventBusy,
  People,
  Person,
  WorkOff,
} from '@mui/icons-material';

export const NAV_ITEMS = {
  ADMIN: [
    { label: 'Personnel',     icon: <People />,     path: '/admin/personnel' },
    { label: 'Absences',      icon: <EventBusy />,  path: '/admin/absences' },
    { label: 'Départements',  icon: <Business />,   path: '/admin/departements' },
    { label: 'Services',      icon: <Category />,   path: '/admin/services' },
    { label: 'Jours Fériés',  icon: <BeachAccess />, path: '/admin/jours-feries' },
    { label: 'Types Congés',  icon: <WorkOff />,    path: '/admin/types-conges' },
    { label: 'Demandes',      icon: <Assignment />, path: '/admin/demandes' },
  ],
  RH: [
    { label: 'Dashboard', icon: <Dashboard />, path: '/rh/dashboard' },
  ],
  EMPLOYE: [
    { label: 'Mon Profil',     icon: <Person />,      path: '/employe/profil' },
    { label: 'Mes Congés',     icon: <BeachAccess />, path: '/employe/demande-conges' },
    { label: 'Mes Absences',   icon: <EventBusy />,   path: '/employe/absences' },
  ],
};

/** Returns the nav label matching the current pathname, used as the Topbar title. */
export function getPageTitle(role, pathname) {
  const items = NAV_ITEMS[role] ?? [];
  return items.find((item) => pathname.startsWith(item.path))?.label ?? 'LiteRH';
}
