import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Tooltip } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthContext'; // 1. Importar useAuth
import { useNavigate } from 'react-router-dom'; // Para redirigir

const drawerWidth = 240;

function Navbar() {
  const { usuario, logout } = useAuth(); // 2. Obtener usuario y logout
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // 3. Redirigir al login
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        backgroundColor: 'white',
        color: 'black',
        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Sistema de Información y Administración Educativa
        </Typography>

        {usuario && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ mr: 2 }}>
              Hola, {usuario.nombre}
            </Typography>
            <Tooltip title="Cerrar Sesión">
              <IconButton onClick={handleLogout} color="inherit">
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;