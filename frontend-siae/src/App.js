import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import { useAuth } from './context/AuthContext';

import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import GestionCentros from './pages/GestionCentros';
import GestionAlumnos from './pages/GestionAlumnos';
import GestionUsuarios from './pages/GestionUsuarios';
import GestionMatriculas from './pages/GestionMatriculas';
import HistorialAlumno from './pages/HistorialAlumno';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import GestionPersonal from './pages/GestionPersonal';


function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// --- NUEVO COMPONENTE ---
/**
 * Componente de Ruta Basada en Rol
 * Comprueba si el rol del usuario está en la lista de roles permitidos.
 * Si no, lo redirige al Dashboard.
 */
function RoleBasedRoute({ children, roles }) {
  const { usuario } = useAuth();

  if (!roles.includes(usuario.rol)) {
    // Si no tiene el rol, redirigir a la página principal
    return <Navigate to="/" replace />;
  }

  return children;
}
// --- FIN NUEVO COMPONENTE ---

/**
 * Componente Layout Principal (Sin cambios)
 */
function MainLayout({ children }) {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
        <Navbar />
        {children}
      </Box>
    </Box>
  );
}

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Ruta Pública: Login */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* --- RUTAS PRIVADAS ACTUALIZADAS --- */}

        {/* Dashboard (Todos los roles logueados) */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </PrivateRoute>
          }
        />

        {/* Centros (Solo ADMIN) */}
        <Route
          path="/centros"
          element={
            <PrivateRoute>
              <RoleBasedRoute roles={['ADMIN']}>
                <MainLayout>
                  <GestionCentros />
                </MainLayout>
              </RoleBasedRoute>
            </PrivateRoute>
          }
        />

        {/* Alumnos (ADMIN y GESTOR) */}
        <Route
          path="/alumnos"
          element={
            <PrivateRoute>
              <RoleBasedRoute roles={['ADMIN', 'GESTOR']}>
                <MainLayout>
                  <GestionAlumnos />
                </MainLayout>
              </RoleBasedRoute>
            </PrivateRoute>
          }
        />

        {/* Usuarios (Solo ADMIN) */}
        <Route
          path="/usuarios"
          element={
            <PrivateRoute>
              <RoleBasedRoute roles={['ADMIN']}>
                <MainLayout>
                  <GestionUsuarios />
                </MainLayout>
              </RoleBasedRoute>
            </PrivateRoute>
          }
        />

        <Route
          path="/matriculas"
          element={
            <PrivateRoute>
              <RoleBasedRoute roles={['ADMIN', 'GESTOR']}>
                <MainLayout>
                  <GestionMatriculas />
                </MainLayout>
              </RoleBasedRoute>
            </PrivateRoute>
          }
        />

        <Route
          path="/alumnos/:alumnoId/historial" // Ruta con parámetro
          element={
            <PrivateRoute>
              <RoleBasedRoute roles={['ADMIN', 'GESTOR']}>
                <MainLayout>
                  <HistorialAlumno />
                </MainLayout>
              </RoleBasedRoute>
            </PrivateRoute>
          }
        />

        <Route
          path="/personal"
          element={
            <PrivateRoute>
              <RoleBasedRoute roles={['ADMIN', 'GESTOR']}>
                <MainLayout>
                  <GestionPersonal />
                </MainLayout>
              </RoleBasedRoute>
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;