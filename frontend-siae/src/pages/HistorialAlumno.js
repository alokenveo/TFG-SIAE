import React, { useState, useEffect } from 'react';
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

function HistorialAlumno() {
    const { alumnoId } = useParams(); // Obtener el ID del alumno de la URL
    const navigate = useNavigate();
    const [alumno, setAlumno] = useState(null);
    const [notas, setNotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(''); // Año seleccionado en el filtro
    const [availableYears, setAvailableYears] = useState([]); // Años disponibles en las notas
    const [openModal, setOpenModal] = useState(false);
    const [nuevaNota, setNuevaNota] = useState({});

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [alumnoRes, notasRes] = await Promise.all([
                alumnoService.obtenerAlumnoPorId(alumnoId),
                notaService.obtenerNotasPorAlumno(alumnoId)
            ]);

            setAlumno(alumnoRes.data);

            const notasData = Array.isArray(notasRes.data) ? notasRes.data : [];
            setNotas(notasData);

            // Extraer años únicos de las notas para el selector
            const years = [...new Set(notasData.map(n => n.anioAcademico))].sort((a, b) => b - a); // Ordenar descendente
            setAvailableYears(years);
            if (selectedYear === '' || !years.includes(selectedYear)) {
                setSelectedYear(years.length > 0 ? years[0] : '');
            }

        } catch (error) {
            console.error("Error al cargar datos del historial:", error);
            // Podríamos mostrar un mensaje de error o redirigir
            if (error.response && error.response.status === 403) {
                alert("No tienes permiso para ver las notas de este alumno.");
                navigate('/alumnos'); // O a donde corresponda
            } else if (error.response && error.response.status === 404) {
                alert("Alumno no encontrado.");
                navigate('/alumnos');
            }
            setNotas([]);
            setAlumno(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, [alumnoId, navigate]); // Dependencia: si cambia el ID, recargar

    const handleOpen = () => {
        // Pre-rellenar alumnoId y quizás año académico actual
        setNuevaNota({
            alumnoId: parseInt(alumnoId, 10), // Asegurar que es número
            anioAcademico: selectedYear || (availableYears.length > 0 ? availableYears[0] : new Date().getFullYear()), // Año actual o el filtrado
            cursoId: '', // Curso se selecciona en el form
            asignaturaId: '',
            evaluacion: '',
            calificacion: null,
        });
        setOpenModal(true);
    };

    const handleClose = () => {
        setOpenModal(false);
        setNuevaNota({}); // Limpiar
    };

    const handleSave = async () => {
        try {
            // Validaciones básicas (se pueden mejorar)
            if (!nuevaNota.cursoId || !nuevaNota.asignaturaId || nuevaNota.calificacion === null) {
                alert("Por favor, completa todos los campos requeridos.");
                return;
            }

            // El DTO espera año como número, calificación como double
            const dto = {
                ...nuevaNota,
                anioAcademico: parseInt(nuevaNota.anioAcademico, 10),
                calificacion: parseFloat(nuevaNota.calificacion) // Ya debería ser número por el form, pero aseguramos
            };
            await notaService.registrarNota(dto);
            handleClose();
            cargarDatos(); // Recargar notas para ver la nueva
        } catch (error) {
            console.error("Error al registrar la nota:", error);
            alert(`Error al guardar: ${error.response?.data?.message || error.message}`);
        }
    };

    // Filtrar notas según el año seleccionado
    const filteredNotas = selectedYear === '' ? notas : notas.filter(n => n.anioAcademico === selectedYear);

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };

    const getCentroNombre = () => {
        // Asumiendo que el alumno tiene una lista de matrículas
        // y queremos mostrar el centro de la matrícula más reciente
        if (alumno && alumno.matriculas && alumno.matriculas.length > 0) {
            // Ordenar matrículas por año (si es necesario) o simplemente tomar la primera/última
            // Aquí asumimos que la relación carga el objeto CentroEducativo
            return alumno.matriculas[0]?.centroEducativo?.nombre || 'Centro no disponible';
        }
        return 'Sin centro asociado';
    }

    const getCursosDelAlumno = () => {
        if (!alumno || !alumno.matriculas) return [];
        // Mapear las matrículas a objetos {id, nombre} de curso, evitando duplicados
        const cursosMap = new Map();
        alumno.matriculas.forEach(m => {
            if (m.curso) {
                cursosMap.set(m.curso.id, m.curso);
            }
        });
        return Array.from(cursosMap.values());
    }


    if (loading && !alumno) { // Mostrar spinner solo en carga inicial
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }
    if (!alumno && !loading) { // Si terminó de cargar y no hay alumno
        return <Typography sx={{ mt: 4, textAlign: 'center' }}>No se pudieron cargar los datos del alumno.</Typography>;
    }


    return (
        <Box>
            <Toolbar />
            {/* Cabecera con Nombre, Centro y Botón Volver */}
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
                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel id="year-select-label">Año Académico</InputLabel>
                    <Select
                        labelId="year-select-label"
                        id="year-select"
                        value={selectedYear}
                        label="Año Académico"
                        onChange={handleYearChange}
                        disabled={availableYears.length === 0}
                    >
                        <MenuItem value=""><em>Todos</em></MenuItem>
                        {availableYears.map(year => (
                            <MenuItem key={year} value={year}>{year}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
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
                            cursosDelAlumno={getCursosDelAlumno()} // Pasar los cursos del alumno
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