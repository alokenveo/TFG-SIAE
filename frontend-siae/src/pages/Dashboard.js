import React, { useState, useEffect } from 'react';
import {
  Typography, Box, Toolbar, Grid, Paper, CircularProgress, Alert, Fade
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import dashboardService from '../api/dashboardService';

const cardBaseStyle = {
  p: 3,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  borderRadius: 3,
  boxShadow: '0 3px 12px rgba(0,0,0,0.08)',
  transition: '0.3s all ease',
  '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.12)' },
};

const KpiCard = ({ title, value, isLoading }) => (
  <Paper sx={cardBaseStyle}>
    <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
      {title}
    </Typography>
    {isLoading ? (
      <CircularProgress size={30} sx={{ mt: 1 }} />
    ) : (
      <Typography variant="h4" color="primary.main" fontWeight={600}>
        {value ?? 'N/A'}
      </Typography>
    )}
  </Paper>
);

const ChartCard = ({ title, children, isLoading }) => (
  <Paper sx={{ ...cardBaseStyle, alignItems: 'stretch', minHeight: 420, pb: 2 }}>
    <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
      {title}
    </Typography>
    <Box sx={{ flexGrow: 1 }}>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        children
      )}
    </Box>
  </Paper>
);

const AlumnosPorProvinciaChart = ({ data, isLoading }) => {
  const chartData = data?.map(item => ({ name: item[0], alumnos: item[1] })) || [];
  return (
    <ChartCard title="Alumnos por Provincia" isLoading={isLoading}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <RechartsTooltip />
          <Legend />
          <Bar dataKey="alumnos" fill="#8884d8" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

const GradeDistributionChart = ({ data, isLoading }) => {
  let parsedData = { suspensos: 0, aprobados: 0, notables: 0, sobresalientes: 0 };

  if (data) {
    if (Array.isArray(data)) {
      const arr = data[0];
      if (Array.isArray(arr) && arr.length >= 4) {
        parsedData = {
          suspensos: arr[0],
          aprobados: arr[1],
          notables: arr[2],
          sobresalientes: arr[3],
        };
      }
    } else {
      parsedData = data;
    }
  }

  const chartData = [
    { name: 'Suspensos (<5)', value: parsedData.suspensos, color: '#ef5350' },
    { name: 'Aprobados (5-7)', value: parsedData.aprobados, color: '#ffca28' },
    { name: 'Notables (7-9)', value: parsedData.notables, color: '#66bb6a' },
    { name: 'Sobresalientes (>9)', value: parsedData.sobresalientes, color: '#42a5f5' },
  ];
  
  return (
    <ChartCard title="Distribución de Notas" isLoading={isLoading}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie dataKey="value" data={chartData} cx="50%" cy="50%" outerRadius={75} label>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <RechartsTooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

const AsignaturaAvgChart = ({ data, isLoading }) => {
  const chartData = data?.map(item => ({ name: item[0], media: item[1] })) || [];
  return (
    <ChartCard title="Media por Asignatura" isLoading={isLoading}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-40} textAnchor="end" height={70} />
          <YAxis domain={[0, 10]} />
          <RechartsTooltip />
          <Legend />
          <Bar dataKey="media" fill="#82ca9d" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

const AlumnosPorNivelChart = ({ data, isLoading }) => {
  const chartData = data?.map(item => ({ name: item[0], alumnos: item[1] })) || [];
  const colors = ['#ff7043', '#7cb342', '#29b6f6', '#ab47bc'];
  return (
    <ChartCard title="Alumnos por Nivel Educativo" isLoading={isLoading}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
          <Pie dataKey="alumnos" data={chartData} cx="50%" cy="55%" outerRadius={75} label>
            {chartData.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <RechartsTooltip />
          <Legend verticalAlign="bottom" align="center" wrapperStyle={{ marginTop: 50 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

const CentrosPorTipoChart = ({ data, isLoading }) => {
  const chartData = data?.map(item => ({ name: item[0], centros: item[1] })) || [];
  return (
    <ChartCard title="Centros por Tipo" isLoading={isLoading}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie dataKey="centros" data={chartData} cx="50%" cy="50%" outerRadius={70} label>
            {chartData.map((_, i) => (
              <Cell key={i} fill={['#7e57c2', '#26c6da'][i % 2]} />
            ))}
          </Pie>
          <RechartsTooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

// --- Componente Principal ---
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
        const res = await dashboardService.getStats(currentYear);
        setStats(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || 'Error cargando datos del dashboard.');
      } finally {
        setLoading(false);
      }
    };
    if (usuario) fetchStats();
  }, [usuario, currentYear]);

  if (loading || !usuario)
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  if (error)
    return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;

  if (!stats) return null;

  return (
    <Fade in timeout={600}>
      <Box sx={{ p: { xs: 2, sm: 4 } }}>
        <Toolbar />
        <Typography variant="h4" fontWeight={600} gutterBottom>
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
              <Grid item xs={12} sm={6}>
                <KpiCard title={`Alumnos en ${usuario.centro.nombre}`} value={stats.totalAlumnosCentro} isLoading={loading} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <KpiCard title="Personal en el Centro" value={stats.totalPersonalCentro} isLoading={loading} />
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <ChartCard title={`Rendimiento (1ª Ev ${currentYear})`} isLoading={loading}>
                  <Typography>Media Centro: {stats.rendimientoCentroPorEvaluacion?.[0]?.[1]?.toFixed(2) ?? 'N/A'}</Typography>
                  <Typography>Media Nacional: {stats.rendimientoNacionalPorEvaluacion?.[0]?.[1]?.toFixed(2) ?? 'N/A'}</Typography>
                </ChartCard>
              </Grid>
              <Grid item xs={12} md={6}><AlumnosPorNivelChart data={stats.alumnosPorNivel} isLoading={loading} /></Grid>
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
    </Fade>
  );
}

export default Dashboard;