import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Toolbar, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, CircularProgress, Modal, Fade, Backdrop,
    TextField, Grid, Select, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import matriculaService from '../api/matriculaService';
import MatriculaForm from '../components/MatriculaForm';
import ofertaEducativaService from '../api/ofertaEducativaService';

// Estilo para el Modal
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600, // Más ancho para el formulario
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

function GestionMatriculas() {
    const [matriculasOriginales, setMatriculasOriginales] = useState([]);
    const [matriculasFiltradas, setMatriculasFiltradas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [nuevaMatricula, setNuevaMatricula] = useState({});
    const [cursos, setCursos] = useState([]);
    const [anios, setAnios] = useState([]);

    // --- Estados para los Filtros ---
    const [filtroTexto, setFiltroTexto] = useState('');
    const [filtroCurso, setFiltroCurso] = useState('');
    const [filtroAnio, setFiltroAnio] = useState('');

    const cargarMatriculas = async () => {
        setLoading(true);
        try {
            const response = await matriculaService.obtenerMatriculas();
            const data = Array.isArray(response.data) ? response.data : [];
            setMatriculasOriginales(data);
        } catch (error) {
            console.error("Error al cargar las matrículas:", error);
            setMatriculasOriginales([]);
        } finally {
            setLoading(false);
        }
    };

    const cargarCursos = async () => {
        try {
            const response = await ofertaEducativaService.obtenerCursos();
            setCursos(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error al cargar los cursos:", error);
            setCursos([]);
        }
    };

    useEffect(() => {
        cargarMatriculas();
        cargarCursos();
    }, []);

    useEffect(() => {
        if (matriculasOriginales.length > 0) {
            const uniqueAnios = [...new Set(matriculasOriginales.map(m => m.anioAcademico))].sort((a, b) => a - b);
            setAnios(uniqueAnios);
        }
    }, [matriculasOriginales]);

    useEffect(() => {
        let matriculasResultado = matriculasOriginales;
        const textoBusqueda = filtroTexto.toLowerCase().trim();

        if (textoBusqueda) {
            matriculasResultado = matriculasResultado.filter(matricula =>
                (matricula.alumno?.nombre && matricula.alumno.nombre.toLowerCase().includes(textoBusqueda)) ||
                (matricula.alumno?.apellidos && matricula.alumno.apellidos.toLowerCase().includes(textoBusqueda)) ||
                (matricula.centroEducativo?.nombre && matricula.centroEducativo.nombre.toLowerCase().includes(textoBusqueda))
            );
        }

        if (filtroCurso) {
            matriculasResultado = matriculasResultado.filter(matricula => matricula.curso.id === filtroCurso);
        }

        if (filtroAnio) {
            matriculasResultado = matriculasResultado.filter(matricula => matricula.anioAcademico === filtroAnio);
        }

        setMatriculasFiltradas(matriculasResultado);

    }, [filtroTexto, filtroCurso, filtroAnio, matriculasOriginales]);

    // Manejadores para los filtros
    const handleFiltroTextoChange = (event) => setFiltroTexto(event.target.value);

    const handleOpen = () => setOpenModal(true);

    const handleClose = () => {
        setOpenModal(false);
        setNuevaMatricula({}); // Limpiar el formulario
    };

    const handleSave = async () => {
        try {
            // El DTO del backend espera el año como número, lo convertimos
            const dto = {
                ...nuevaMatricula,
                anioAcademico: parseInt(nuevaMatricula.anioAcademico, 10)
            };
            delete dto.nivelId; // Borramos el campo temporal que no va al DTO

            await matriculaService.registrarMatricula(dto);
            handleClose();
            cargarMatriculas(); // Recargar la lista
        } catch (error) {
            console.error("Error al registrar la matrícula:", error);
            // Aquí se podría mostrar un error al usuario
        }
    };

    return (
        <Box>
            <Toolbar />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Gestión de Matrículas</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
                    Nueva Matrícula
                </Button>
            </Box>

            <Grid container spacing={2} sx={{ mb: 2 }} alignItems="flex-end">
                {/* Filtro Texto */}
                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        fullWidth
                        label="Buscar..."
                        variant="outlined"
                        size="small"
                        value={filtroTexto}
                        onChange={handleFiltroTextoChange}
                    />
                </Grid>
                {/* Filtro Curso */}
                <Grid item xs={12} sm={6} md={3}>
                    <Select
                        fullWidth
                        value={filtroCurso}
                        onChange={(e) => setFiltroCurso(e.target.value)}
                        displayEmpty
                        size="small"
                    >
                        <MenuItem value="">Todos los cursos</MenuItem>
                        {cursos.map((curso) => (
                            <MenuItem key={curso.id} value={curso.id}>
                                {curso.nombre}
                            </MenuItem>
                        ))}
                    </Select>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Select
                        fullWidth
                        value={filtroAnio}
                        onChange={(e) => setFiltroAnio(e.target.value)}
                        displayEmpty
                        size="small"
                    >
                        <MenuItem value="">Todos los años</MenuItem>
                        {anios.map((anio) => (
                            <MenuItem key={anio} value={anio}>
                                {anio}
                            </MenuItem>
                        ))}
                    </Select>
                </Grid>
            </Grid>

            {loading ? (<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>)
                : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead sx={{ backgroundColor: '#e0e0e0' }}>
                                <TableRow>
                                    <TableCell>Alumno</TableCell>
                                    <TableCell>Centro Educativo</TableCell>
                                    <TableCell>Curso</TableCell>
                                    <TableCell>Año Académico</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {matriculasFiltradas.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            {filtroTexto || filtroCurso || filtroAnio ? "No se encontraron matrículas con esos criterios." : "No hay matrículas registradas."}
                                        </TableCell>
                                    </TableRow>
                                )}
                                {matriculasFiltradas.map((matricula) => (
                                    <TableRow key={matricula.id}>
                                        <TableCell>{matricula.alumno.nombre} {matricula.alumno.apellidos}</TableCell>
                                        <TableCell>{matricula.centroEducativo.nombre}</TableCell>
                                        <TableCell>{matricula.curso.nombre}</TableCell>
                                        <TableCell>{matricula.anioAcademico}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

            <Modal
                open={openModal}
                onClose={handleClose}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{ timeout: 500 }}
            >
                <Fade in={openModal}>
                    <Box sx={style}>
                        <Typography variant="h6" component="h2">Registrar Nueva Matrícula</Typography>
                        <MatriculaForm matricula={nuevaMatricula} setMatricula={setNuevaMatricula} />
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

export default GestionMatriculas;