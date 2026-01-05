import React, { useState, useEffect } from 'react';
import {
  Typography, Box, Toolbar, Grid, Paper, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tooltip, Collapse, IconButton, Chip
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, Line
} from 'recharts';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useAuth } from '../context/AuthContext';
import iaService from '../api/iaService';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SchoolIcon from '@mui/icons-material/School';
import RefreshIcon from '@mui/icons-material/Refresh';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useNavigate } from 'react-router-dom';

// --- Estilo base compartido con Dashboard ---
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

// --- Card genérica para gráficos ---
const ChartCard = ({ title, isLoading, children, toggleScope, setToggleScope, showToggle = false }) => (
  <Paper sx={{ ...cardBaseStyle, alignItems: 'stretch', minHeight: 420, pb: 2 }}>
    <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
      {title}
    </Typography>
    {showToggle && (
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <ToggleButtonGroup
          value={toggleScope}
          exclusive
          onChange={(e, newScope) => { if (newScope) setToggleScope(newScope); }}
          aria-label="scope"
        >
          <ToggleButton value="provincia">Provincia</ToggleButton>
          <ToggleButton value="centro">Centro</ToggleButton>
        </ToggleButtonGroup>
      </Box>
    )}
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

// --- Tabla expandible de alumnos ---
const RiesgoAlumnosTable = ({ data, isLoading, onAlumnoClick }) => {
  const [expanded, setExpanded] = useState({});

  const handleExpand = (alumnoId) => {
    setExpanded((prev) => ({ ...prev, [alumnoId]: !prev[alumnoId] }));
  };

  return (
    <Paper sx={{ ...cardBaseStyle, overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <SchoolIcon sx={{ mr: 1.2, color: 'primary.main' }} />
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
          Predicciones por Alumno (IA)
        </Typography>
        <Tooltip title="Predicciones de riesgo por asignatura, basadas en aprendizaje automático.">
          <InfoIcon sx={{ color: 'text.secondary' }} />
        </Tooltip>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer>
          <Table size="small" sx={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
            <TableHead>
              <TableRow sx={{ background: 'rgba(0,87,155,0.1)' }}>
                <TableCell><strong>Alumno</strong></TableCell>
                <TableCell><strong>DNI</strong></TableCell>
                <TableCell><strong>Prob. Repetir</strong></TableCell>
                <TableCell><strong>Prob. Abandono</strong></TableCell>
                <TableCell><strong>Detalles</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data
                ?.filter(alumno => alumno.asignaturas?.some(asig => asig.prob_suspender > 0.5)) // 🔹 solo alumnos en riesgo
                .map((alumno) => (
                  <React.Fragment key={alumno.alumno_id}>
                    <TableRow
                      sx={{ cursor: 'pointer', '&:hover': { background: 'rgba(0,0,0,0.04)' } }}
                      onClick={() => onAlumnoClick(alumno.alumno_id)}
                    >
                      <TableCell>{`${alumno.nombre} ${alumno.apellidos}`}</TableCell>
                      <TableCell>{alumno.dni}</TableCell>
                      <TableCell>
                        <Chip
                          label={`${(alumno.prob_repetir * 100).toFixed(1)}%`}
                          color={alumno.prob_repetir > 0.5 ? 'error' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${(alumno.prob_abandono * 100).toFixed(1)}%`}
                          color={alumno.prob_abandono > 0.3 ? 'warning' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); handleExpand(alumno.alumno_id); }}
                        >
                          <ExpandMoreIcon
                            sx={{
                              transform: expanded[alumno.alumno_id]
                                ? 'rotate(180deg)'
                                : 'rotate(0deg)',
                              transition: 'transform 0.2s'
                            }}
                          />
                        </IconButton>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell colSpan={5} sx={{ p: 0 }}>
                        <Collapse in={expanded[alumno.alumno_id]}>
                          <Box sx={{ p: 2, background: 'rgba(0,0,0,0.02)' }}>
                            <Typography variant="subtitle2" gutterBottom>Recomendaciones Globales</Typography>
                            <ul>
                              {alumno.recomendaciones_globales.map((rec, idx) => <li key={idx}>{rec}</li>)}
                            </ul>

                            <Typography variant="subtitle2" gutterBottom mt={2}>Asignaturas en riesgo</Typography>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Asignatura</TableCell>
                                  <TableCell>Prob. Suspender</TableCell>
                                  <TableCell>Nota Esperada</TableCell>
                                  <TableCell>Recomendaciones</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {alumno.asignaturas
                                  ?.filter(asig => asig.prob_suspender > 0.5) // 🔹 solo asignaturas en riesgo
                                  .map((asig) => (
                                    <TableRow key={asig.asignatura_id}>
                                      <TableCell>{asig.asignatura_nombre}</TableCell>
                                      <TableCell sx={{ color: 'red' }}>
                                        {(asig.prob_suspender * 100).toFixed(1)}%
                                      </TableCell>
                                      <TableCell>{asig.nota_esperada.toFixed(1)}</TableCell>
                                      <TableCell>
                                        <ul>
                                          {asig.recomendaciones.map((rec, idx) => <li key={idx}>{rec}</li>)}
                                        </ul>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

// --- Chart para Tasa de Suspensos (con toggle) ---
const TasaSuspensosChart = ({ dataProv, dataCentro, isLoading, scope, setScope }) => {
  const [processedData, setProcessedData] = useState([]);

  useEffect(() => {
    const data = scope === 'provincia' ? dataProv : dataCentro;
    if (data) {
      const sortedData = [...data].sort((a, b) => b.tasa_suspensos_predicha - a.tasa_suspensos_predicha);
      setProcessedData(sortedData);
    }
  }, [scope, dataProv, dataCentro]);

  const nameKey = scope === 'provincia' ? 'provincia' : 'centro_educativo_id';

  return (
    <ChartCard
      title="Distribución de Tasas de Suspensos"
      isLoading={isLoading}
      toggleScope={scope}
      setToggleScope={setScope}
      showToggle={true}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={processedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={nameKey} angle={-45} textAnchor="end" height={80} />
          <YAxis />
          <RechartsTooltip />
          <Legend />
          <Bar dataKey="tasa_suspensos_predicha" fill="#42a5f5" name="Tasa Predicha (%)" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

// --- Chart para Impacto del Ratio (nuevo, con toggle) ---
const ImpactoRatioChart = ({ dataProv, dataCentro, isLoading, scope, setScope }) => {
  const [processedData, setProcessedData] = useState([]);

  useEffect(() => {
    const data = scope === 'provincia' ? dataProv : dataCentro;
    if (data) {
      const filteredData = data.filter(item => 'impacto_ratio' in item);
      const sortedData = [...filteredData].sort((a, b) => b.impacto_ratio - a.impacto_ratio);
      setProcessedData(sortedData);
    }
  }, [scope, dataProv, dataCentro]);

  const nameKey = scope === 'provincia' ? 'provincia' : 'centro_educativo_id';

  return (
    <ChartCard
      title="Impacto del Ratio Alumno/Personal"
      isLoading={isLoading}
      toggleScope={scope}
      setToggleScope={setScope}
      showToggle={true}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={processedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={nameKey} angle={-45} textAnchor="end" height={80} />
          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
          <RechartsTooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="tasa_suspensos_predicha" fill="#8884d8" name="Tasa Actual (%)" />
          <Bar yAxisId="left" dataKey="tasa_si_10_docentes_mas" fill="#82ca9d" name="Tasa con +10 Docentes (%)" />
          <Line yAxisId="right" type="monotone" dataKey="impacto_ratio" stroke="#ff7300" name="Impacto Ratio" />
          <Line yAxisId="right" type="monotone" dataKey="ratio_alumno_personal" stroke="#ffc658" name="Ratio Actual" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

// --- Chart para Tendencias (modificado a BarChart, con toggle) ---
const TendenciasChart = ({ dataProv, dataCentro, isLoading, scope, setScope }) => {
  const [processedData, setProcessedData] = useState([]);

  useEffect(() => {
    const data = scope === 'provincia' ? dataProv : dataCentro;
    if (data) {
      const sortedData = [...data].sort((a, b) => b.tasa_suspensos_forecast - a.tasa_suspensos_forecast);
      setProcessedData(sortedData);
    }
  }, [scope, dataProv, dataCentro]);

  const nameKey = scope === 'provincia' ? 'provincia' : 'centro_educativo_id';

  return (
    <ChartCard
      title="Tendencias: Forecast Suspensos"
      isLoading={isLoading}
      toggleScope={scope}
      setToggleScope={setScope}
      showToggle={true}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={processedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={nameKey} angle={-45} textAnchor="end" height={80} />
          <YAxis />
          <RechartsTooltip />
          <Legend />
          <Bar dataKey="tasa_suspensos_forecast" fill="#42a5f5" name="Forecast Tasa Suspensos (%)" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

// --- Chart para Disparidades (sin cambio) ---
const DisparidadesChart = ({ data, isLoading }) => (
  <ChartCard title="Disparidades por Sexo y Provincia" isLoading={isLoading}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="provincia" />
        <YAxis />
        <RechartsTooltip />
        <Legend />
        <Bar dataKey="tasa_suspenso_%" fill="#8884d8" name="Tasa Suspenso (%)" />
        <Bar dataKey="gap_vs_media" fill="#82ca9d" name="Gap vs Media" />
      </BarChart>
    </ResponsiveContainer>
  </ChartCard>
);

// --- Chart para Rendimiento por Asignatura (sin cambio) ---
const RendimientoChart = ({ data, isLoading }) => {
  const [processedData, setProcessedData] = useState([]);

  useEffect(() => {
    if (data) {
      const sortedData = [...data].sort((a, b) => b.tasa_suspensos_predicha - a.tasa_suspensos_predicha);
      setProcessedData(sortedData.slice(0, 15)); // Top 15 como en consola
    }
  }, [data]);

  return (
    <ChartCard title="Tasa Media de Suspensos por Asignatura" isLoading={isLoading}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={processedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="asignatura_nombre" angle={-45} textAnchor="end" height={80} />
          <YAxis />
          <RechartsTooltip />
          <Legend />
          <Bar dataKey="tasa_suspensos_predicha" fill="#8884d8" name="Tasa Predicha (%)" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

// --- Componente Principal ---
function AnalisisIA() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [rendimiento, setRendimiento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para el botón de recalcular
  const [recalculando, setRecalculando] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const [scopeTasa, setScopeTasa] = useState('provincia');
  const [scopeImpacto, setScopeImpacto] = useState('provincia');
  const [scopeTendencias, setScopeTendencias] = useState('provincia');

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
        console.error('Error al cargar datos de IA:', err);
        setError(err.response?.data?.error || 'No se pudieron cargar los datos.');
      } finally {
        setLoading(false);
      }
    };

    if (usuario) fetchData();
  }, [usuario, currentYear]);

  const handleRecalcular = async () => {
    if (!window.confirm("¿Seguro que quieres lanzar el re-entrenamiento? Esto puede tardar unos minutos en segundo plano.")) return;

    setRecalculando(true);
    try {
      // 1. Llamamos al Backend Java -> Python
      const res = await iaService.recalcularPredicciones();

      // 2. Feedback positivo
      setSnackbar({
        open: true,
        message: '🚀 ' + (res.data.mensaje || "Proceso iniciado correctamente"),
        severity: 'success'
      });

    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: 'Error al iniciar el proceso: ' + (err.response?.data?.error || err.message),
        severity: 'error'
      });
    } finally {
      setRecalculando(false);
    }
  };

  const handleAlumnoClick = (alumnoId) => {
    navigate(`/alumnos/${alumnoId}/historial`);
  };

  if (loading || !usuario)
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  if (error) return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;

  if (!stats) return null;

  return (
    <Box sx={{ p: { xs: 2, sm: 4 } }}>
      <Toolbar />
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          <AutoAwesomeIcon color="primary" /> Análisis Predictivo (IA)
        </Typography>

        {usuario.rol === 'ADMIN' && (
          <Button
            variant="contained"
            color="secondary"
            startIcon={recalculando ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
            onClick={handleRecalcular}
            disabled={recalculando}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
          >
            {recalculando ? 'Iniciando...' : 'Recalcular Predicciones'}
          </Button>
        )}
      </Box>

      {usuario.rol === 'ADMIN' && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TasaSuspensosChart
              dataProv={stats.agregados}
              dataCentro={stats.agregadosPorCentro}
              isLoading={loading}
              scope={scopeTasa}
              setScope={setScopeTasa}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ImpactoRatioChart
              dataProv={stats.agregados}
              dataCentro={stats.agregadosPorCentro}
              isLoading={loading}
              scope={scopeImpacto}
              setScope={setScopeImpacto}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TendenciasChart
              dataProv={stats.tendencias}
              dataCentro={stats.tendenciasPorCentro}
              isLoading={loading}
              scope={scopeTendencias}
              setScope={setScopeTendencias}
            />
          </Grid>
          <Grid item xs={12} md={6}><DisparidadesChart data={stats.disparidades} isLoading={loading} /></Grid>
          <Grid item xs={12} md={6}><RendimientoChart data={rendimiento} isLoading={loading} /></Grid>
        </Grid>
      )}

      {usuario.rol === 'GESTOR' && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <RiesgoAlumnosTable
              data={stats}
              isLoading={loading}
              onAlumnoClick={handleAlumnoClick}
            />
          </Grid>
        </Grid>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AnalisisIA;