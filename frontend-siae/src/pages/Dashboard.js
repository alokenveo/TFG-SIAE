import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Toolbar, Grid, Paper, CircularProgress, Alert
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'; // Importar gráficos
import { useAuth } from '../context/AuthContext'; // Para saber el rol
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
    // Transformar datos: [["LITORAL", 50], ["BIOKO_NORTE", 30]] -> [{ name: "LITORAL", alumnos: 50 }, ...]
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
    // data = { suspensos: 10, aprobados: 50, notables: 30, sobresalientes: 5 }
    const chartData = data ? [
        { name: 'Suspensos (<5)', value: data.suspensos || 0 },
        { name: 'Aprobados (5-7)', value: data.aprobados || 0 },
        { name: 'Notables (7-9)', value: data.notables || 0 },
        { name: 'Sobresalientes (9+)', value: data.sobresalientes || 0 },
    ] : [];

    const COLORS = ['#FF8042', '#0088FE', '#00C49F', '#FFBB28'];

    return (
        <Paper sx={{ p: 2, height: 400, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>Distribución de Notas (Nacional)</Typography>
            {isLoading ? <CircularProgress /> : (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={chartData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <RechartsTooltip />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </Paper>
    );
};

const AsignaturaAvgChart = ({ data, isLoading }) => {
    // data = [["Matemáticas", 6.5], ["Lengua", 7.1]]
    const chartData = data?.map(item => ({ name: item[0], nota_media: parseFloat(item[1]).toFixed(2) })) || [];

    return (
        <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Rendimiento por Asignatura (Nacional)</Typography>
            {isLoading ? <CircularProgress /> : (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 10]} />
                        <YAxis dataKey="name" type="category" width={100} />
                        <RechartsTooltip />
                        <Bar dataKey="nota_media" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </Paper>
    );
};

const AlumnosPorNivelChart = ({ data, isLoading }) => {
    // data = [["Primaria", 150], ["ESO", 100]]
    const chartData = data?.map(item => ({ name: item[0], alumnos: item[1] })) || [];

    return (
        <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Alumnos por Nivel (Mi Centro)</Typography>
            {isLoading ? <CircularProgress /> : (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <RechartsTooltip />
                        <Bar dataKey="alumnos" fill="#8884d8" />
                    </BarChart>
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

    const currentYear = new Date().getFullYear(); // O el año académico que quieras consultar
    //const currentYear = 2024;

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError('');
            try {
                // Pasamos el año académico actual al servicio
                const response = await dashboardService.getStats(currentYear);
                setStats(response.data);
            } catch (err) {
                console.error("Error al cargar estadísticas:", err);
                setError(err.response?.data?.error || "No se pudieron cargar los datos del dashboard.");
            } finally {
                setLoading(false);
            }
        };

        if (usuario) { // Solo cargar si el usuario está listo
            fetchStats();
        }
    }, [usuario, currentYear]); // Recargar si cambia el usuario

    // --- Renderizado ---
    if (loading || !usuario) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;
    }

    if (!stats) return null; // No debería pasar si loading es false y no hay error

    return (
        <Box>
            <Toolbar />
            <Typography variant="h4" gutterBottom>
                Dashboard ({usuario.rol})
            </Typography>

            {/* --- Dashboard ADMIN --- */}
            {usuario.rol === 'ADMIN' && (
                <Grid container spacing={3}>
                    {/* KPIs */}
                    <Grid item xs={12} sm={3}><KpiCard title="Total Alumnos (Año Actual)" value={stats.totalAlumnos} isLoading={loading} /></Grid>
                    <Grid item xs={12} sm={3}><KpiCard title="Total Centros" value={stats.totalCentros} isLoading={loading} /></Grid>
                    <Grid item xs={12} sm={3}><KpiCard title="Total Personal" value={stats.totalPersonal} isLoading={loading} /></Grid>
                    <Grid item xs={12} sm={3}><KpiCard title="Media 1ª Ev." value={stats.rendimientoNacionalPorEvaluacion?.[0]?.[1]?.toFixed(2)} isLoading={loading} /></Grid>

                    {/* Gráficos Descriptivos */}
                    <Grid item xs={12} md={6}>
                        <AlumnosPorProvinciaChart data={stats.alumnosPorProvincia} isLoading={loading} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <GradeDistributionChart data={stats.distribucionNotasNacional} isLoading={loading} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <AsignaturaAvgChart data={stats.rendimientoPorAsignatura} isLoading={loading} />
                    </Grid>
                </Grid>
            )}

            {/* --- Dashboard GESTOR --- */}
            {usuario.rol === 'GESTOR' && (
                <Grid container spacing={3}>
                    {/* KPIs */}
                    <Grid item xs={12} sm={6}><KpiCard title={`Alumnos en ${usuario.centro.nombre}`} value={stats.totalAlumnosCentro} isLoading={loading} /></Grid>
                    <Grid item xs={12} sm={6}><KpiCard title="Personal en el Centro" value={stats.totalPersonalCentro} isLoading={loading} /></Grid>

                    {/* Gráfico Comparativo */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, height: 400 }}>
                            <Typography variant="h6">Rendimiento Comparativo (1ª Ev {currentYear})</Typography>
                            {/* (Aquí iría un gráfico de barras comparando stats.rendimientoCentroPorEvaluacion vs stats.rendimientoNacionalPorEvaluacion) */}
                            <Typography>Media Centro: {stats.rendimientoCentroPorEvaluacion?.[0]?.[1]?.toFixed(2) ?? 'N/A'}</Typography>
                            <Typography>Media Nacional: {stats.rendimientoNacionalPorEvaluacion?.[0]?.[1]?.toFixed(2) ?? 'N/A'}</Typography>
                        </Paper>
                    </Grid>

                    {/* Gráfico Descriptivo (Centro) */}
                    <Grid item xs={12} md={6}>
                        <AlumnosPorNivelChart data={stats.alumnosPorNivel} isLoading={loading} />
                    </Grid>
                </Grid>
            )}

            {/* --- Dashboard INVITADO --- */}
            {usuario.rol === 'INVITADO' && (
                <Typography paragraph>
                    Bienvenido, Invitado. No tienes acceso a estadísticas.
                </Typography>
            )}

        </Box>
    );
}

export default Dashboard;