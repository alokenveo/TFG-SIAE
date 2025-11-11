import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline, CircularProgress } from '@mui/material';
import { useAuth } from './context/AuthContext';

import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import PageTransition from './components/layout/PageTransition';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Lazy load pages for perf
const Dashboard = lazy(() => import('./pages/Dashboard'));
const GestionCentros = lazy(() => import('./pages/GestionCentros'));
const GestionAlumnos = lazy(() => import('./pages/GestionAlumnos'));
const GestionUsuarios = lazy(() => import('./pages/GestionUsuarios'));
const GestionMatriculas = lazy(() => import('./pages/GestionMatriculas'));
const HistorialAlumno = lazy(() => import('./pages/HistorialAlumno'));
const GestionPersonal = lazy(() => import('./pages/GestionPersonal'));
const AnalisisIA = lazy(() => import('./pages/AnalisisIA'));

function LoadingFull() {
  return (
    <Box sx={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  );
}

function PrivateRoute({ children }) {
  const { isAuthenticated, checkingAuth } = useAuth(); // checkingAuth: opcional pero recomendable
  if (checkingAuth) return <LoadingFull />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function RoleBasedRoute({ children, roles = [] }) {
  const { usuario } = useAuth();
  // Si usuario no está cargado aún: mostrar fallback neutral
  if (!usuario) return <Navigate to="/login" replace />;
  if (!roles.includes(usuario.rol)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function MainLayout({ children }) {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
        <Navbar />
        <Suspense fallback={<LoadingFull />}>
          {children}
        </Suspense>
      </Box>
    </Box>
  );
}

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

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

        <Route
          path="/analisis-ia"
          element={
            <PrivateRoute>
              <RoleBasedRoute roles={['ADMIN', 'GESTOR']}>
                <MainLayout>
                  <AnalisisIA />
                </MainLayout>
              </RoleBasedRoute>
            </PrivateRoute>
          }
        />

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
          path="/alumnos/:alumnoId/historial"
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

        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout>
                <PageTransition>
                  <Dashboard />
                </PageTransition>
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;