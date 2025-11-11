import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Tooltip, Avatar, Menu, MenuItem, ListItemIcon, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import useBackendStatus from '../../hooks/useBackendStatus';
import CircleIcon from '@mui/icons-material/Circle';


const drawerWidth = 240;

function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);

  const status = useBackendStatus();
  const statusColor =
    status === 'online' ? '#4caf50' :
      status === 'offline' ? '#f44336' : '#ffb300';


  const handleOpenMenu = (e) => setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleLogoutClick = () => {
    handleCloseMenu();
    setOpenConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setOpenConfirm(false);
    navigate('/login');
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          backgroundColor: 'white',
          color: 'black',
          boxShadow: '0px 1px 6px rgba(0,0,0,0.06)'
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Sistema de Información y Administración Educativa
          </Typography>

          {usuario && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                <Tooltip title={`Estado del servidor: ${status}`}>
                  <CircleIcon sx={{ color: statusColor, fontSize: 14, mr: 0.5 }} />
                </Tooltip>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                  {status === 'checking' ? 'Verificando...' : status === 'online' ? 'Conectado' : 'Sin conexión'}
                </Typography>
              </Box>

              <Typography variant="body1" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
                Hola, {usuario.nombre}
              </Typography>

              <Tooltip title="Cuenta">
                <IconButton onClick={handleOpenMenu} size="small" sx={{ ml: 1 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: '#00579b' }}>
                    {usuario.nombre ? usuario.nombre[0].toUpperCase() : '?'}
                  </Avatar>
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={() => { handleCloseMenu(); navigate('/perfil'); }}>
                  <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                  Perfil
                </MenuItem>
                <MenuItem onClick={() => { handleCloseMenu(); navigate('/ajustes'); }}>
                  <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                  Ajustes
                </MenuItem>
                <MenuItem onClick={handleLogoutClick}>
                  <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                  Cerrar sesión
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Confirm dialog for logout */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>¿Cerrar sesión?</DialogTitle>
        <DialogContent>
          ¿Seguro que deseas cerrar la sesión? Se te redirigirá a la pantalla de inicio de sesión.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Cancelar</Button>
          <Button onClick={confirmLogout} color="error" variant="contained">Cerrar sesión</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Navbar;