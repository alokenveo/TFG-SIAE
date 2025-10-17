import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

const drawerWidth = 240;

function Navbar() {
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
        <Typography variant="h6" noWrap component="div">
          Sistema de Información y Administración Educativa
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;