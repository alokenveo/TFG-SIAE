import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import GestionCentros from './pages/GestionCentros';
import GestionAlumnos from './pages/GestionAlumnos';
import GestionUsuarios from './pages/GestionUsuarios';

function App() {
  return (
    <Router>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/centros" element={<GestionCentros />} />
            <Route path="/alumnos" element={<GestionAlumnos />} />
            <Route path="/usuarios" element={<GestionUsuarios />} />
            {/* Aquí añadiremos más rutas en el futuro */}
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
