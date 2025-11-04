import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Toolbar, Grid, Paper, CircularProgress, Alert,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Collapse, IconButton
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useAuth } from '../context/AuthContext';
import iaService from '../api/iaService';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';

// Componente para tabla de alumnos (expandible por asignatura)
const RiesgoAlumnosTable = ({ data, isLoading, onAlumnoClick }) => {
    const [expanded, setExpanded] = useState({});

    const handleExpand = (alumnoId) => {
        setExpanded(prev => ({ ...prev, [alumnoId]: !prev[alumnoId] }));
    };

    return (
        <Paper sx={{ p: 2, mt: 3, width: '100%' }}>
            <Typography variant="h6" gutterBottom>
                Predicciones por Alumno (IA)
                <Tooltip title="Predicciones de riesgo por asignatura, basadas en ML con historial.">
                    <InfoIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
                </Tooltip>
            </Typography>
            {isLoading ? <CircularProgress /> : (
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Alumno</TableCell>
                                <TableCell>DNI</TableCell>
                                <TableCell>Asignaturas</TableCell>
                                <TableCell>Acción</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data?.length === 0 && (
                                <TableRow><TableCell colSpan={4} align="center">No hay predicciones disponibles.</TableCell></TableRow>
                            )}
                            {data
                                ?.filter(item => item.asignaturas?.some(asig => asig.prob_suspender > 0.5))
                                .map(item => (
                                    <React.Fragment key={item.alumno_id}>
                                        <TableRow
                                            hover
                                            onClick={() => onAlumnoClick(item.alumno_id)}
                                            sx={{ cursor: 'pointer' }}
                                        >
                                            <TableCell>{item.nombre} {item.apellidos}</TableCell>
                                            <TableCell>{item.dni}</TableCell>
                                            <TableCell>
                                                {item.asignaturas.filter(asig => asig.prob_suspender > 0.5).length} asignaturas en riesgo
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => { e.stopPropagation(); handleExpand(item.alumno_id); }}
                                                >
                                                    <ExpandMoreIcon
                                                        sx={{
                                                            transform: expanded[item.alumno_id]
                                                                ? 'rotate(180deg)'
                                                                : 'rotate(0deg)'
                                                        }}
                                                    />
                                                </IconButton>
                                            </TableCell>
                                            <TableCell>Ver Historial</TableCell>
                                        </TableRow>

                                        <TableRow>
                                            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                                                <Collapse in={expanded[item.alumno_id]} timeout="auto" unmountOnExit>
                                                    <Box sx={{ margin: 1 }}>
                                                        <Table size="small" aria-label="asignaturas">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell>Asignatura</TableCell>
                                                                    <TableCell>Prob. Suspenso</TableCell>
                                                                    <TableCell>Nota Esperada</TableCell>
                                                                    <TableCell>Recomendaciones</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {item.asignaturas
                                                                    ?.filter(asig => asig.prob_suspender > 0.5)
                                                                    .map((asig, idx) => (
                                                                        <TableRow key={idx}>
                                                                            <TableCell>
                                                                                {asig.asignatura_nombre
                                                                                    ? `${asig.asignatura_nombre} (${asig.asignatura_id})`
                                                                                    : `Asignatura ${asig.asignatura_id}`}
                                                                            </TableCell>
                                                                            <TableCell sx={{ color: 'red' }}>
                                                                                {(asig.prob_suspender * 100).toFixed(0)}%
                                                                            </TableCell>
                                                                            <TableCell>{asig.nota_esperada.toFixed(1)}</TableCell>
                                                                            <TableCell>{asig.recomendaciones.join(', ')}</TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                            </TableBody>
                                                        </Table>
                                                    </Box>
                                                </Collapse>
                                            </TableCell>
                                        </TableRow>
                                    </React.Fragment>
                                ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Paper>
    );
};

// Componente para gráfico agregados (tasa suspensos por provincia/centro)
const AgregadosChart = ({ data, isLoading, keyField = 'provincia' }) => {
    const chartData = data?.map(item => ({
        name: item[keyField],
        'Tasa Suspensos %': item.tasa_suspensos_predicha,
    })) || [];

    return (
        <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Agregados: Tasa Suspensos Predicha</Typography>
            {isLoading ? <CircularProgress /> : (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: '% Suspensos', angle: -90, position: 'insideLeft' }} />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="Tasa Suspensos %" fill="#FF0000" />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </Paper>
    );
};

// Componente para tendencias (line chart forecast)
const TendenciasChart = ({ data, isLoading }) => {
    return (
        <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Tendencias: Forecast Suspensos</Typography>
            {isLoading ? <CircularProgress /> : (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="anio_pred" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Line type="monotone" dataKey="tasa_suspensos_forecast" stroke="#8884d8" />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </Paper>
    );
};

// Componente para disparidades (grouped bar por sexo/provincia)
const DisparidadesChart = ({ data, isLoading }) => {
    return (
        <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Disparidades por Sexo/Provincia</Typography>
            {isLoading ? <CircularProgress /> : (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="provincia" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="tasa_suspenso_%" stackId="a" fill="#8884d8" name="Media" />
                        <Bar dataKey="gap_vs_media" fill="#82ca9d" name="Gap" />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </Paper>
    );
};

// Componente para rendimiento por asignatura
const RendimientoChart = ({ data, isLoading }) => {
    const chartData = data?.map(item => ({
        name: `${item.asignatura_nombre} (Curso ${item.curso_orden})`,
        'Tasa Suspensos %': item.tasa_suspensos_predicha,
    })) || [];

    return (
        <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Rendimiento por Asignatura</Typography>
            {isLoading ? <CircularProgress /> : (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="Tasa Suspensos %" fill="#ffc658" />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </Paper>
    );
};

// Componente Principal
function AnalisisIA() {
    const { usuario } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [rendimiento, setRendimiento] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const currentYear = new Date().getFullYear();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const statsResponse = await iaService.getIaStats(currentYear);
                setStats(statsResponse.data);

                if (usuario.rol === 'ADMIN') {
                    const rendResponse = await iaService.getRendimiento();
                    setRendimiento(rendResponse.data);
                }
            } catch (err) {
                console.error("Error al cargar datos de IA:", err);
                setError(err.response?.data?.error || "No se pudieron cargar los datos.");
            } finally {
                setLoading(false);
            }
        };

        if (usuario) {
            fetchData();
        }
    }, [usuario, currentYear]);

    const handleAlumnoClick = (alumnoId) => {
        navigate(`/alumnos/${alumnoId}/historial`);
    };

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
                Análisis Predictivo (IA)
            </Typography>

            {/* Vista ADMIN */}
            {usuario.rol === 'ADMIN' && (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <AgregadosChart data={stats.agregados} isLoading={loading} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TendenciasChart data={stats.tendencias} isLoading={loading} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <DisparidadesChart data={stats.disparidades} isLoading={loading} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <RendimientoChart data={rendimiento} isLoading={loading} />
                    </Grid>
                </Grid>
            )}

            {/* Vista GESTOR */}
            {usuario.rol === 'GESTOR' && (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <RiesgoAlumnosTable data={stats} isLoading={loading} onAlumnoClick={handleAlumnoClick} />
                    </Grid>
                </Grid>
            )}
        </Box>
    );
}

export default AnalisisIA;