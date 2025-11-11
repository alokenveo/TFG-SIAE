import React, { useState, useEffect } from 'react';
import {
  Typography, Box, Toolbar, Grid, Paper, CircularProgress, Alert
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import dashboardService from '../api/dashboardService';

const KpiCard = ({ title, value, isLoading }) => (
  <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
    <Typography variant="h6" color="textSecondary">{title}</Typography>
    {isLoading ? <CircularProgress size={30} sx={{ mt: 1 }} /> : (
      <Typography component="p" variant="h4">
        {value ?? 'N/A'}
      </Typography>
    )}
  </Paper>
);

const AlumnosPorProvinciaChart = ({ data, isLoading }) => {
  const chartData = data?.map(item => ({ name: item[0], alumnos: item[1] })) || [];
  return (
    <Paper sx={{ p: 2, height: 400 }}>
      <Typography variant="h6" gutterBottom>Alumnos por Provincia</Typography>
      {isLoading ? <CircularProgress /> : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <RechartsTooltip />
            <Legend />
            <Bar dataKey="alumnos" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
};

const GradeDistributionChart = ({ data, isLoading }) => {
  const chartData = data ? [
    { name: 'Suspensos (<5)', value: data.suspensos || 0, color: '#ff0000' },
    { name: 'Aprobados (5-7)', value: data.aprobados || 0, color: '#ffff00' },
    { name: 'Notables (7-9)', value: data.notables || 0, color: '#00ff00' },
    { name: 'Sobresalientes (>9)', value: data.sobresalientes || 0, color: '#0000ff' }
  ] : [];
  return (
    <Paper sx={{ p: 2, height: 400 }}>
      <Typography variant="h6" gutterBottom>Distribución de Notas</Typography>
      {isLoading ? <CircularProgress /> : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie dataKey="value" data={chartData} cx="50%" cy="50%" outerRadius={80} label>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <RechartsTooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
};

const AsignaturaAvgChart = ({ data, isLoading }) => {
  const chartData = data?.map(item => ({ name: item[0], media: item[1] })) || [];
  return (
    <Paper sx={{ p: 2, height: 400 }}>
      <Typography variant="h6" gutterBottom>Media por Asignatura</Typography>
      {isLoading ? <CircularProgress /> : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
            <YAxis domain={[0, 10]} />
            <RechartsTooltip />
            <Legend />
            <Bar dataKey="media" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
};

const AlumnosPorNivelChart = ({ data, isLoading }) => {
  const chartData = data?.map(item => ({ name: item[0], alumnos: item[1] })) || [];
  return (
    <Paper sx={{ p: 2, height: 400 }}>
      <Typography variant="h6" gutterBottom>Alumnos por Nivel Educativo</Typography>
      {isLoading ? <CircularProgress /> : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie dataKey="alumnos" data={chartData} cx="50%" cy="50%" outerRadius={80} label>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={['#ff7300', '#387908', '#ff0000', '#0000ff'][index % 4]} />
              ))}
            </Pie>
            <RechartsTooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
};

const CentrosPorTipoChart = ({ data, isLoading }) => {
  const chartData = data?.map(item => ({ name: item[0], centros: item[1] })) || [];
  return (
    <Paper sx={{ p: 2, height: 400 }}>
      <Typography variant="h6" gutterBottom>Centros por Tipo</Typography>
      {isLoading ? <CircularProgress /> : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie dataKey="centros" data={chartData} cx="50%" cy="50%" outerRadius={80} label>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d'][index % 2]} />
              ))}
            </Pie>
            <RechartsTooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
};

// --- Componente Principal del Dashboard ---
function Dashboard() {
  const { usuario } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await dashboardService.getStats(currentYear);
        setStats(response.data);
      } catch (err) {
        console.error("Error al cargar estadísticas:", err);
        setError(err.response?.data?.error || "No se pudieron cargar los datos del dashboard.");
      } finally {
        setLoading(false);
      }
    };
    if (usuario) {
      fetchStats();
    }
  }, [usuario, currentYear]);

  if (loading || !usuario) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;
  }

  if (!stats) return null;

  return (
    <Box>
      <Toolbar />
      <Typography variant="h4" gutterBottom>
        Dashboard ({usuario.rol})
      </Typography>

      {usuario.rol === 'ADMIN' && (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}><KpiCard title="Total Alumnos (Año Actual)" value={stats.totalAlumnos} isLoading={loading} /></Grid>
            <Grid item xs={12} sm={4}><KpiCard title="Total Centros" value={stats.totalCentros} isLoading={loading} /></Grid>
            <Grid item xs={12} sm={4}><KpiCard title="Total Personal" value={stats.totalPersonal} isLoading={loading} /></Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}><AlumnosPorProvinciaChart data={stats.alumnosPorProvincia} isLoading={loading} /></Grid>
            <Grid item xs={12} md={6}><AlumnosPorNivelChart data={stats.alumnosPorNivelNacional} isLoading={loading} /></Grid>
            <Grid item xs={12} md={6}><GradeDistributionChart data={stats.distribucionNotasNacional} isLoading={loading} /></Grid>
            <Grid item xs={12} md={6}><AsignaturaAvgChart data={stats.rendimientoPorAsignatura} isLoading={loading} /></Grid>
            <Grid item xs={12} md={6}><CentrosPorTipoChart data={stats.centrosPorTipo} isLoading={loading} /></Grid>
          </Grid>
        </>
      )}

      {usuario.rol === 'GESTOR' && (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}><KpiCard title={`Alumnos en ${usuario.centro.nombre}`} value={stats.totalAlumnosCentro} isLoading={loading} /></Grid>
            <Grid item xs={12} sm={6}><KpiCard title="Personal en el Centro" value={stats.totalPersonalCentro} isLoading={loading} /></Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 300 }}>
                <Typography variant="h6">Rendimiento (1ª Ev {currentYear})</Typography>
                <Typography>Media Centro: {stats.rendimientoCentroPorEvaluacion?.[0]?.[1]?.toFixed(2) ?? 'N/A'}</Typography>
                <Typography>Media Nacional: {stats.rendimientoNacionalPorEvaluacion?.[0]?.[1]?.toFixed(2) ?? 'N/A'}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}><AlumnosPorNivelChart data={stats.alumnosPorNivel} isLoading={loading} /> </Grid>
            <Grid item xs={12} md={6}><GradeDistributionChart data={stats.distribucionNotasCentro} isLoading={loading} /></Grid>
            <Grid item xs={12} md={6}><AsignaturaAvgChart data={stats.rendimientoPorAsignaturaCentro} isLoading={loading} /></Grid>
          </Grid>
        </>
      )}

      {usuario.rol === 'INVITADO' && (
        <Typography paragraph>
          Bienvenido, Invitado. No tienes acceso a estadísticas.
        </Typography>
      )}
    </Box>
  );
}

export default Dashboard;
