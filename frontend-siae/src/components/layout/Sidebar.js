import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar,
  Box, Divider, Tooltip, IconButton, useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import BadgeIcon from '@mui/icons-material/Badge';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import OnlinePredictionIcon from '@mui/icons-material/OnlinePrediction';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 240;
const miniWidth = 72;

const allMenuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/', roles: ['ADMIN', 'GESTOR', 'INVITADO'] },
  { text: 'Centros', icon: <SchoolIcon />, path: '/centros', roles: ['ADMIN'] },
  { text: 'Alumnos', icon: <PeopleIcon />, path: '/alumnos', roles: ['ADMIN', 'GESTOR'] },
  { text: 'Personal', icon: <BadgeIcon />, path: '/personal', roles: ['ADMIN', 'GESTOR'] },
  { text: 'Matrículas', icon: <AssignmentIndIcon />, path: '/matriculas', roles: ['ADMIN', 'GESTOR'] },
  { text: 'Usuarios', icon: <SupervisorAccountIcon />, path: '/usuarios', roles: ['ADMIN'] },
  { text: 'Análisis IA', icon: <OnlinePredictionIcon />, path: '/analisis-ia', roles: ['ADMIN', 'GESTOR'] },
];

function Sidebar() {
  const { usuario } = useAuth();
  const isSmall = useMediaQuery('(max-width:900px)');
  const [mini, setMini] = useState(() => localStorage.getItem('sidebarMini') === 'true');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('sidebarMini', mini);
  }, [mini]);

  if (!usuario) return null;

  const visibleItems = allMenuItems.filter(item => item.roles.includes(usuario.rol));

  const drawerContent = (
    <>
      <Toolbar sx={{ display: 'flex', justifyContent: mini ? 'center' : 'space-between', alignItems: 'center', px: 2 }}>
        {!mini && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box component="img" src="/logo-siae.png" alt="SIAE" sx={{ height: 40, mr: 1 }} />
            <Box sx={{ fontWeight: 700 }}>SIAE</Box>
          </Box>
        )}
        {!isSmall && (
          <IconButton size="small" onClick={() => setMini(!mini)} sx={{ ml: mini ? 0 : 'auto' }}>
            {mini ? <MenuIcon /> : <ChevronLeftIcon />}
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List>
        {visibleItems.map(item => (
          <Tooltip
            key={item.text}
            title={mini ? item.text : ''}
            placement="right"
            arrow
          >
            <NavLink
              to={item.path}
              end
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {({ isActive }) => (
                <ListItemButton
                  selected={isActive}
                  sx={{
                    justifyContent: mini ? 'center' : 'flex-start',
                    px: mini ? 1 : 3,
                    '&.Mui-selected': {
                      background: 'linear-gradient(90deg, rgba(0,87,155,0.08), rgba(0,137,123,0.06))',
                      borderLeft: mini ? 'none' : '4px solid #00579b',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? '#00579b' : 'inherit',
                      minWidth: 0,
                      justifyContent: 'center',
                      mr: mini ? 0 : 2,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!mini && <ListItemText primary={item.text} />}
                </ListItemButton>
              )}
            </NavLink>
          </Tooltip>
        ))}
      </List>
    </>
  );

  return (
    <>
      {isSmall ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: mini ? miniWidth : drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: mini ? miniWidth : drawerWidth,
              transition: 'width 0.3s ease',
              overflowX: 'hidden',
              boxSizing: 'border-box',
              borderRight: '1px solid rgba(0,0,0,0.05)',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
}

export default Sidebar;
