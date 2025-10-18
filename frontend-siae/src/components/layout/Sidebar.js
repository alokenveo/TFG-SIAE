import React from 'react';
import { Link } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { useAuth } from '../../context/AuthContext';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';

const drawerWidth = 240;

// 2. Definir TODOS los items del menú, AÑADIENDO una propiedad 'roles'
const allMenuItems = [
  { 
    text: 'Dashboard', 
    icon: <DashboardIcon />, 
    path: '/', 
    roles: ['ADMIN', 'GESTOR', 'INVITADO'] // Todos pueden ver el dashboard
  },
  { 
    text: 'Centros', 
    icon: <SchoolIcon />, 
    path: '/centros',
    roles: ['ADMIN'] // Solo ADMIN
  },
  { 
    text: 'Alumnos', 
    icon: <PeopleIcon />, 
    path: '/alumnos',
    roles: ['ADMIN', 'GESTOR'] // ADMIN y GESTOR
  },
  { 
    text: 'Usuarios', 
    icon: <SupervisorAccountIcon />, 
    path: '/usuarios',
    roles: ['ADMIN'] // Solo ADMIN
  },
  {
    text: 'Matrículas',
    icon: <AssignmentIndIcon />,
    path: '/matriculas',
    roles: ['ADMIN', 'GESTOR']
  }
];

function Sidebar() {
  const { usuario } = useAuth(); // 3. Obtener el usuario del contexto

  // 4. Si el usuario aún no ha cargado, no mostrar nada
  if (!usuario) {
    return null;
  }

  // 5. Filtrar el menú basado en el rol del usuario
  const visibleItems = allMenuItems.filter(item => 
    item.roles.includes(usuario.rol)
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar>
        <Box component="img" sx={{ height: 40, mr: 1 }} src="/logo-siae.png" alt="SIAE Logo" />
      </Toolbar>
      <List>
        {/* 6. Mapear solo los items visibles */}
        {visibleItems.map((item) => (
          <ListItem key={item.text} disablePadding component={Link} to={item.path} sx={{ color: 'inherit', textDecoration: 'none' }}>
            <ListItemButton>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}

export default Sidebar;