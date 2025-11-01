import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Typography, Box, Toolbar, Button, Table, TableBody, TableCell, Select, MenuItem, InputLabel, FormControl,
    TableContainer, TableHead, TableRow, Paper, CircularProgress, Grid, Modal, Fade, Backdrop
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import NotaForm from '../components/NotaForm';
import alumnoService from '../api/alumnoService';
import notaService from '../api/notaService';
import matriculaService from '../api/matriculaService';


// Estilo para el Modal
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const evaluacionesFiltro = ["TODAS", "1ª Evaluación", "2ª Evaluación", "3ª Evaluación"];

function HistorialAlumno() {
    const { alumnoId } = useParams();
    const navigate = useNavigate();
    const [alumno, setAlumno] = useState(null);
    const [matriculas, setMatriculas] = useState([]);
    const [matriculaSeleccionada, setMatriculaSeleccionada] = useState(null);
    const [notas, setNotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState('');
    const [availableYears, setAvailableYears] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [nuevaNota, setNuevaNota] = useState({});
    const [selectedEvaluacion, setSelectedEvaluacion] = useState('1ª Evaluación');

    const cargarDatos = useCallback(async () => {
        setLoading(true);
        try {
            const [alumnoRes, matriculasRes] = await Promise.all([
                alumnoService.obtenerAlumnoPorId(alumnoId),
                matriculaService.obtenerMatriculasPorAlumno(alumnoId)
            ]);

            const alumnoData = alumnoRes.data;
            const matriculasData = Array.isArray(matriculasRes.data) ? matriculasRes.data : [];

            setAlumno(alumnoData);
            setMatriculas(matriculasData);

            // Seleccionamos la matrícula más reciente por defecto
            if (matriculasData.length > 0) {
                const ordenadas = [...matriculasData].sort((a, b) => b.anioAcademico - a.anioAcademico);
                setMatriculaSeleccionada(ordenadas[0]);
            }

        } catch (error) {
            console.error("Error al cargar datos del historial:", error);
            alert("Error al cargar el historial del alumno.");
            navigate('/alumnos');
        } finally {
            setLoading(false);
        }
    }, [alumnoId, navigate]);


    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    useEffect(() => {
        if (notas.length > 0) {
            const years = [...new Set(notas.map(n => n.anioAcademico))].sort((a, b) => b - a);
            setAvailableYears(years);
            if (selectedYear === '' || !years.includes(selectedYear)) {
                setSelectedYear(years.length > 0 ? years[0] : '');
            }
        } else {
            setAvailableYears([]);
            setSelectedYear('');
        }
    }, [notas, selectedYear]);

    useEffect(() => {
        const fetchNotas = async () => {
            if (matriculaSeleccionada) {
                try {
                    const res = await notaService.obtenerNotasPorMatricula(matriculaSeleccionada.id);
                    const data = Array.isArray(res.data) ? res.data : [];

                    const sortedData = data.sort((a, b) => a.asignatura.nombre.localeCompare(b.asignatura.nombre));

                    setNotas(sortedData);
                } catch (err) {
                    console.error("Error al cargar notas:", err);
                    setNotas([]);
                }
            } else {
                setNotas([]);
            }
        };
        fetchNotas();
    }, [matriculaSeleccionada]);


    const handleOpen = () => {
        setNuevaNota({
            alumnoId: parseInt(alumnoId, 10),
            anioAcademico: selectedYear || (availableYears.length > 0 ? availableYears[0] : new Date().getFullYear()),
            cursoId: '',
            asignaturaId: '',
            evaluacion: '1ª Evaluación',
            calificacion: null,
        });
        setOpenModal(true);
    };

    const handleClose = () => {
        setOpenModal(false);
        setNuevaNota({});
    };

    const handleSave = async () => {
        try {
            if (!nuevaNota.cursoId || !nuevaNota.asignaturaId || !nuevaNota.evaluacion || nuevaNota.calificacion === null) {
                alert("Por favor, completa todos los campos requeridos.");
                return;
            }

            const dto = {
                ...nuevaNota,
                anioAcademico: parseInt(nuevaNota.anioAcademico, 10),
                calificacion: parseFloat(nuevaNota.calificacion),
                matriculaId: matriculaSeleccionada?.id,
            };
            await notaService.registrarNota(dto);
            handleClose();
            cargarDatos();
        } catch (error) {
            console.error("Error al registrar la nota:", error);
            alert(`Error al guardar: ${error.response?.data?.message || error.message}`);
        }
    };

    // Filtrar notas según el año seleccionado
    const filteredNotas = notas.filter(n => {
        const yearMatch = selectedYear === '' || n.anioAcademico === selectedYear;
        const evalMatch = selectedEvaluacion === 'TODAS' || n.evaluacion === selectedEvaluacion;
        return yearMatch && evalMatch;
    });

    const handleEvaluacionChange = (event) => {
        setSelectedEvaluacion(event.target.value);
    };

    const getCentroNombre = () => {
        if (alumno && alumno.matriculas && alumno.matriculas.length > 0) {
            return alumno.matriculas[0]?.centroEducativo?.nombre || 'Centro no disponible';
        }
        return 'Sin centro asociado';
    }

    const getCursosDelAlumno = () => {
        if (!alumno || !alumno.matriculas) return [];
        const cursosMap = new Map();
        alumno.matriculas.forEach(m => {
            if (m.curso) {
                cursosMap.set(m.curso.id, m.curso);
            }
        });
        return Array.from(cursosMap.values());
    }


    if (loading && !alumno) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }
    if (!alumno && !loading) {
        return <Typography sx={{ mt: 4, textAlign: 'center' }}>No se pudieron cargar los datos del alumno.</Typography>;
    }


    return (
        <Box>
            <Toolbar />
            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Grid item>
                    <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/alumnos')}>
                        Volver a Alumnos
                    </Button>
                </Grid>
                <Grid item xs>
                    <Typography variant="h4">
                        Historial de: {alumno.nombre} {alumno.apellidos}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                        Centro: {getCentroNombre()}
                    </Typography>
                </Grid>
            </Grid>

            {/* Filtro por Año y Botón Registrar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel id="matricula-select-label">Matrícula</InputLabel>
                    <Select
                        labelId="matricula-select-label"
                        value={matriculaSeleccionada ? matriculaSeleccionada.id : ''}
                        label="Matrícula"
                        onChange={(e) => {
                            const seleccionada = matriculas.find(m => m.id === e.target.value);
                            setMatriculaSeleccionada(seleccionada);
                        }}
                        disabled={matriculas.length === 0}
                    >
                        {matriculas.map(m => (
                            <MenuItem key={m.id} value={m.id}>
                                {m.anioAcademico} - {m.curso?.nombre} ({m.centroEducativo?.nombre})
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel id="eval-select-label">Evaluación</InputLabel>
                    <Select
                        labelId="eval-select-label"
                        value={selectedEvaluacion}
                        label="Evaluación"
                        onChange={handleEvaluacionChange}
                    >
                        {evaluacionesFiltro.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
                    </Select>
                </FormControl>

                <Box sx={{ flexGrow: 1 }} />

                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
                    Registrar Nota
                </Button>
            </Box>

            {/* Tabla de Notas */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#e0e0e0' }}>
                        <TableRow>
                            <TableCell>Curso</TableCell>
                            <TableCell>Asignatura</TableCell>
                            <TableCell>Evaluación</TableCell>
                            <TableCell>Calificación</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredNotas.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center">No hay notas registradas para este año.</TableCell>
                            </TableRow>
                        ) : (
                            filteredNotas.map((nota) => (
                                <TableRow key={nota.id}>
                                    <TableCell>{nota.curso.nombre}</TableCell>
                                    <TableCell>{nota.asignatura.nombre}</TableCell>
                                    <TableCell>{nota.evaluacion}</TableCell>
                                    <TableCell>{nota.calificacion}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Modal
                open={openModal}
                onClose={handleClose}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{ timeout: 500 }}
            >
                <Fade in={openModal}>
                    <Box sx={style}>
                        <Typography variant="h6" component="h2">Registrar Nueva Nota para {alumno?.nombre}</Typography>
                        <NotaForm
                            nota={nuevaNota}
                            setNota={setNuevaNota}
                            cursosDelAlumno={getCursosDelAlumno()}
                        />
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button onClick={handleClose}>Cancelar</Button>
                            <Button onClick={handleSave} variant="contained" sx={{ ml: 1 }}>Guardar</Button>
                        </Box>
                    </Box>
                </Fade>
            </Modal>
        </Box>
    );
}

export default HistorialAlumno;