import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Typography, Box, Toolbar, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, CircularProgress,
    Modal, Fade, Backdrop, IconButton, Tooltip, TextField, Grid,
    Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import alumnoService from '../api/alumnoService';
import AlumnoForm from '../components/AlumnoForm';
import AssessmentIcon from '@mui/icons-material/Assessment';

const style = {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4,
};

const sexosFiltro = ["TODOS", "MASCULINO", "FEMENINO"];

function GestionAlumnos() {
    const [alumnosOriginales, setAlumnosOriginales] = useState([]);
    const [alumnosFiltrados, setAlumnosFiltrados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [alumnoActual, setAlumnoActual] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);
    const navigate = useNavigate();

    // --- Estados para los Filtros ---
    const [filtroTexto, setFiltroTexto] = useState('');
    const [filtroSexo, setFiltroSexo] = useState('TODOS');
    const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
    const [filtroFechaFin, setFiltroFechaFin] = useState('');

    const cargarAlumnos = async () => {
        setLoading(true);
        try {
            const response = await alumnoService.obtenerTodosLosAlumnos();
            setAlumnosOriginales(response.data || []);
        } catch (error) {
            console.error("Error al cargar los alumnos:", error);
            setAlumnosOriginales([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarAlumnos();
    }, []);

    useEffect(() => {
        let alumnosResultado = alumnosOriginales;
        const textoBusqueda = filtroTexto.toLowerCase().trim();

        if (textoBusqueda) {
            alumnosResultado = alumnosResultado.filter(alumno =>
                (alumno.dni && alumno.dni.toLowerCase().includes(textoBusqueda)) ||
                (alumno.nombre && alumno.nombre.toLowerCase().includes(textoBusqueda)) ||
                (alumno.apellidos && alumno.apellidos.toLowerCase().includes(textoBusqueda))
            );
        }

        if (filtroSexo !== 'TODOS') {
            alumnosResultado = alumnosResultado.filter(alumno => alumno.sexo === filtroSexo);
        }

        if (filtroFechaInicio || filtroFechaFin) {
            const inicio = filtroFechaInicio ? new Date(filtroFechaInicio) : new Date('1900-01-01');
            const fin = filtroFechaFin ? new Date(filtroFechaFin) : new Date();

            alumnosResultado = alumnosResultado.filter(alumno => {
                const fechaNac = new Date(alumno.fechaNacimiento);
                return fechaNac >= inicio && fechaNac <= fin;
            });
        }

        setAlumnosFiltrados(alumnosResultado);

    }, [filtroTexto, filtroSexo, filtroFechaInicio, filtroFechaFin, alumnosOriginales]);

    // Manejadores para los filtros
    const handleFiltroTextoChange = (event) => setFiltroTexto(event.target.value);
    const handleFiltroSexoChange = (event) => setFiltroSexo(event.target.value);
    const handleFiltroFechaInicioChange = (event) => setFiltroFechaInicio(event.target.value);
    const handleFiltroFechaFinChange = (event) => setFiltroFechaFin(event.target.value);

    const handleOpenCreate = () => {
        setIsEditMode(false);
        setAlumnoActual({});
        setOpenModal(true);
    };

    const handleOpenEdit = (alumno) => {
        setIsEditMode(true);
        // Formatear la fecha para el input type="date" (YYYY-MM-DD)
        const formattedAlumno = { ...alumno, fechaNacimiento: alumno.fechaNacimiento.split('T')[0] };
        setAlumnoActual(formattedAlumno);
        setOpenModal(true);
    };

    const handleClose = () => {
        setOpenModal(false);
        setAlumnoActual({});
        setIsEditMode(false);
    };

    const handleSave = async () => {
        try {
            if (isEditMode) {
                await alumnoService.editarAlumno(alumnoActual.id, alumnoActual);
            } else {
                await alumnoService.crearAlumno(alumnoActual);
            }
            handleClose();
            cargarAlumnos();
        } catch (error) {
            console.error("Error al guardar el alumno:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este alumno?')) {
            try {
                await alumnoService.eliminarAlumno(id);
                cargarAlumnos();
            } catch (error) {
                console.error("Error al eliminar el alumno:", error);
            }
        }
    };

    const handleVerHistorial = (alumnoId) => {
        navigate(`/alumnos/${alumnoId}/historial`);
    };

    return (
        <Box>
            <Toolbar />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Gestión de Alumnos</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
                    Añadir Alumno
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
                {/* Filtro Sexo */}
                <Grid item xs={6} sm={3} md={2}>
                    <FormControl fullWidth size="small">
                        <InputLabel id="filtro-sexo-label">Sexo</InputLabel>
                        <Select
                            labelId="filtro-sexo-label"
                            value={filtroSexo}
                            label="Sexo"
                            onChange={handleFiltroSexoChange}
                        >
                            {sexosFiltro.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                {/* Filtro Fecha Inicio */}
                <Grid item xs={6} sm={3} md={2.5}>
                    <TextField
                        fullWidth
                        label="Fecha Inicio"
                        type="date"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        value={filtroFechaInicio}
                        onChange={handleFiltroFechaInicioChange}
                    />
                </Grid>
                {/* Filtro Fecha Fin */}
                <Grid item xs={6} sm={3} md={2.5}>
                    <TextField
                        fullWidth
                        label="Fecha Fin"
                        type="date"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        value={filtroFechaFin}
                        onChange={handleFiltroFechaFinChange}
                    />
                </Grid>
                {/* Botón de "Limpiar Filtros" */}
                <Grid item xs={12} sm={12} md={3}>
                    <Button onClick={() => { setFiltroTexto(''); setFiltroSexo('TODOS'); setFiltroFechaInicio(''); setFiltroFechaFin(''); }}>
                        Limpiar Filtros
                    </Button>
                </Grid>
            </Grid>

            {loading ? (<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>)
                : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead sx={{ backgroundColor: '#e0e0e0' }}>
                                <TableRow>
                                    <TableCell>Nombre</TableCell>
                                    <TableCell>Apellidos</TableCell>
                                    <TableCell>DNI</TableCell>
                                    <TableCell>Fecha de Nacimiento</TableCell>
                                    <TableCell>Sexo</TableCell>
                                    <TableCell sx={{ width: '120px' }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {alumnosFiltrados.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            {filtroTexto || filtroSexo !== 'TODOS' || filtroFechaInicio || filtroFechaFin
                                                ? "No se encontraron alumnos con esos criterios."
                                                : "No hay alumnos registrados."}
                                        </TableCell>
                                    </TableRow>
                                )}
                                {alumnosFiltrados.map((alumno) => (
                                    <TableRow key={alumno.id}>
                                        <TableCell>{alumno.nombre}</TableCell>
                                        <TableCell>{alumno.apellidos}</TableCell>
                                        <TableCell>{alumno.dni}</TableCell>
                                        <TableCell>{new Date(alumno.fechaNacimiento).toLocaleDateString()}</TableCell>
                                        <TableCell>{alumno.sexo}</TableCell>
                                        <TableCell>
                                            <Tooltip title="Ver Historial"><IconButton onClick={() => handleVerHistorial(alumno.id)}><AssessmentIcon color="info" /></IconButton></Tooltip>
                                            <Tooltip title="Editar"><IconButton onClick={() => handleOpenEdit(alumno)}><EditIcon /></IconButton></Tooltip>
                                            <Tooltip title="Eliminar"><IconButton onClick={() => handleDelete(alumno.id)}><DeleteIcon color="error" /></IconButton></Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

            <Modal open={openModal} onClose={handleClose} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
                <Fade in={openModal}>
                    <Box sx={style}>
                        <Typography variant="h6" component="h2">{isEditMode ? 'Editar Alumno' : 'Añadir Nuevo Alumno'}</Typography>
                        <AlumnoForm alumno={alumnoActual} setAlumno={setAlumnoActual} />
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

export default GestionAlumnos;