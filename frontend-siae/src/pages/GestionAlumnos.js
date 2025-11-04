import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Typography, Box, Toolbar, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, CircularProgress,
    Modal, Fade, Backdrop, IconButton, Tooltip, TextField, Grid,
    Select, MenuItem, InputLabel, FormControl, TablePagination // <-- AÑADIR
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import alumnoService from '../api/alumnoService';
import AlumnoForm from '../components/AlumnoForm';
import AssessmentIcon from '@mui/icons-material/Assessment';
import useDebounce from '../hooks/useDebounce';

const style = {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4,
};

const sexosFiltro = ["TODOS", "MASCULINO", "FEMENINO"];

function GestionAlumnos() {
    const [alumnos, setAlumnos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados de Paginación
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [totalElements, setTotalElements] = useState(0);

    // Estados de Filtros
    const [filtroSearch, setFiltroSearch] = useState("");
    const [filtroSexo, setFiltroSexo] = useState("TODOS");
    const [filtroAnioInicio, setFiltroAnioInicio] = useState("");
    const [filtroAnioFin, setFiltroAnioFin] = useState("");


    const debouncedSearch = useDebounce(filtroSearch, 500);
    const debouncedSexo = useDebounce(filtroSexo, 500);
    const debouncedAnioInicio = useDebounce(filtroAnioInicio, 500);
    const debouncedAnioFin = useDebounce(filtroAnioFin, 500);

    const [openModal, setOpenModal] = useState(false);
    const [alumnoActual, setAlumnoActual] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);

    const navigate = useNavigate();

    // --- USEEFFECT MODIFICADO ---
    useEffect(() => {
        const fetchAlumnos = async () => {
            setLoading(true);
            try {
                const response = await alumnoService.obtenerTodosLosAlumnos(
                    page,
                    rowsPerPage,
                    debouncedSearch,
                    debouncedSexo,
                    debouncedAnioInicio,
                    debouncedAnioFin
                );

                setAlumnos(response.data.content);
                setTotalElements(response.data.totalElements);
            } catch (error) {
                console.error("Error al cargar alumnos:", error);
            }
            setLoading(false);
        };

        fetchAlumnos();
    }, [page, rowsPerPage, debouncedSearch, debouncedSexo, debouncedAnioInicio, debouncedAnioFin]);

    // --- MANEJADORES DE PAGINACIÓN ---
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // --- MANEJADORES DE MODAL (sin cambios) ---
    const handleOpen = () => {
        setAlumnoActual({});
        setIsEditMode(false);
        setOpenModal(true);
    };

    const handleOpenEdit = (alumno) => {
        setAlumnoActual(alumno);
        setIsEditMode(true);
        setOpenModal(true);
    };

    const handleClose = () => setOpenModal(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            if (isEditMode) {
                await alumnoService.updateAlumno(alumnoActual.id, alumnoActual);
            } else {
                await alumnoService.createAlumno(alumnoActual);
            }
            handleClose();
            setPage(0);
        } catch (error) {
            console.error("Error al guardar alumno:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este alumno?')) {
            setLoading(true);
            try {
                await alumnoService.deleteAlumno(id);
                setPage(0);
            } catch (error) {
                console.error("Error al eliminar alumno:", error);
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
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
                    Añadir Alumno
                </Button>
            </Box>

            {/* --- Filtros --- */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Busca por nombre, apellidos o DNI"
                            value={filtroSearch}
                            onChange={e => setFiltroSearch(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Sexo</InputLabel>
                            <Select
                                value={filtroSexo}
                                label="Sexo"
                                onChange={e => setFiltroSexo(e.target.value)}
                            >
                                {sexosFiltro.map(sexo => (
                                    <MenuItem key={sexo} value={sexo}>{sexo}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            fullWidth
                            label="Año nacimiento desde"
                            type="number"
                            value={filtroAnioInicio}
                            onChange={e => setFiltroAnioInicio(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            fullWidth
                            label="Año nacimiento hasta"
                            type="number"
                            value={filtroAnioFin}
                            onChange={e => setFiltroAnioFin(e.target.value)}
                        />
                    </Grid>

                </Grid>
            </Paper>

            {loading ? (
                <CircularProgress />
            ) : (
                <Paper>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>DNI</TableCell>
                                    <TableCell>Nombre</TableCell>
                                    <TableCell>Apellidos</TableCell>
                                    <TableCell>Sexo</TableCell>
                                    <TableCell>Centro</TableCell>
                                    <TableCell>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {alumnos.map((alumno) => (
                                    <TableRow key={alumno.id}>
                                        <TableCell>{alumno.dni}</TableCell>
                                        <TableCell>{alumno.nombre}</TableCell>
                                        <TableCell>{alumno.apellidos}</TableCell>
                                        <TableCell>{alumno.sexo}</TableCell>
                                        <TableCell>{alumno.centroEducativo?.nombre || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Tooltip title="Historial">
                                                <IconButton onClick={() => handleVerHistorial(alumno.id)}>
                                                    <AssessmentIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Editar"><IconButton onClick={() => handleOpenEdit(alumno)}><EditIcon /></IconButton></Tooltip>
                                            <Tooltip title="Eliminar"><IconButton onClick={() => handleDelete(alumno.id)}><DeleteIcon color="error" /></IconButton></Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        rowsPerPageOptions={[10, 20, 30, 50]}
                        component="div"
                        count={totalElements}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
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