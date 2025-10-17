import React from 'react';
import { Typography, Box, Toolbar } from '@mui/material';

function Dashboard() {
  return (
    <Box>
      <Toolbar /> {/* Un espacio para que el contenido no quede debajo de la Navbar */}
      <Typography variant="h4">
        Bienvenido a SIAE
      </Typography>
      <Typography paragraph>
        Selecciona una opción del menú lateral para comenzar.
      </Typography>
    </Box>
  );
}

export default Dashboard;