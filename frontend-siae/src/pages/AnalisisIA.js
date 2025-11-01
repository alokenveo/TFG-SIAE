// src/pages/AnalisisIA.js
import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Toolbar, Grid, Paper, CircularProgress, Alert,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import iaService from '../api/iaService'; // El nuevo servicio
import InfoIcon from '@mui/icons-material/Info';
import { useNavigate } from 'react-router-dom';

// --- COMPONENTE COPIADO DE DASHBOARD.JS ---
const RiesgoAlumnosTable = ({ data, isLoading, onAlumnoClick }) => (
    <Paper sx={{ p: 2, mt: 3, width: '100%' }}>
        <Typography variant="h6" gutterBottom>
            Alumnos en Riesgo Predictivo (Simulación IA)
            <Tooltip title="Alumnos con alta probabilidad de repetir curso, basado en notas de 1ª Evaluación y edad.">
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
                            <TableCell>Probabilidad Riesgo</TableCell>
                            <TableCell>Motivo Principal</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data?.length === 0 && (
                            <TableRow><TableCell colSpan={4} align="center">¡Buen trabajo! No se detectan alumnos en riesgo.</TableCell></TableRow>
                        )}
                        {data?.map(item => (
                            <TableRow
                                key={item.alumno.id}
                                hover
                                onClick={() => onAlumnoClick(item.alumno.id)}
                                sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell>{item.alumno.nombre} {item.alumno.apellidos}</TableCell>
                                <TableCell>{item.alumno.dni}</TableCell>
                                <TableCell sx={{ color: 'red', fontWeight: 'bold' }}>
                                    {`${(item.probabilidadRiesgo * 100).toFixed(0)}%`}
                                </TableCell>
                                <TableCell>{item.motivoPrincipal}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
         )}
    </Paper>
);

// --- COMPONENTE COPIADO DE DASHBOARD.JS ---
const RiesgoProvinciaChart = ({ data, isLoading }) => {
    const chartData = data?.map(item => ({
        name: item.provincia,
        "% Riesgo": (item.total_alumnos > 0 ? (item.total_en_riesgo / item.total_alumnos) * 100 : 0).toFixed(1),
    })) || [];

    return (
        <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>IA: Alumnos en Riesgo por Provincia</Typography>
            {isLoading ? <CircularProgress /> : (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: '% en Riesgo', angle: -90, position: 'insideLeft' }} />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="% Riesgo" fill="#FF0000" />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </Paper>
    );
};


// --- Componente Principal de la Página de IA ---
function AnalisisIA() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchStats = async () => {
        setLoading(true);
        setError('');
        try {
            // Usamos el NUEVO servicio
            const response = await iaService.getIaStats(currentYear);
            setStats(response.data);
        } catch (err) {
            console.error("Error al cargar estadísticas de IA:", err);
            setError(err.response?.data?.error || "No se pudieron cargar los datos de IA.");
        } finally {
            setLoading(false);
        }
    };
    
    if (usuario) {
        fetchStats();
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

      {/* --- Vista ADMIN --- */}
      {usuario.rol === 'ADMIN' && (
        <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
                <RiesgoProvinciaChart data={stats} isLoading={loading} />
            </Grid>
             <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, height: 400 }}>
                    <Typography variant="h6">Sumario de Riesgo</Typography>
                    <Typography paragraph>
                        El gráfico muestra el porcentaje de alumnos detectados en riesgo por provincia, 
                        basado en el análisis de la 1ª Evaluación y factores demográficos.
                    </Typography>
                </Paper>
            </Grid>
        </Grid>
      )}

      {/* --- Vista GESTOR --- */}
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