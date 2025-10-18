import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Typography, Box, Toolbar, Button, Table, TableBody, TableCell, Select, MenuItem, InputLabel, FormControl,
    TableContainer, TableHead, TableRow, Paper, CircularProgress, Grid
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import alumnoService from '../api/alumnoService';
import notaService from '../api/notaService';

function HistorialAlumno() {
    const { alumnoId } = useParams(); // Obtener el ID del alumno de la URL
    const navigate = useNavigate();
    const [alumno, setAlumno] = useState(null);
    const [notas, setNotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(''); // Año seleccionado en el filtro
    const [availableYears, setAvailableYears] = useState([]); // Años disponibles en las notas

    useEffect(() => {
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
                // Seleccionar el año más reciente por defecto, si hay notas
                if (years.length > 0) {
                    setSelectedYear(years[0]);
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

        cargarDatos();
    }, [alumnoId, navigate]); // Dependencia: si cambia el ID, recargar

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

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    if (!alumno) {
         // Ya se manejó el error en useEffect, esto es por si acaso
        return <Typography>No se pudieron cargar los datos del alumno.</Typography>;
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
                <Button variant="contained" startIcon={<AddIcon />}>
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

            {/* Aquí irá el Modal para registrar notas */}
        </Box>
    );
}

export default HistorialAlumno;