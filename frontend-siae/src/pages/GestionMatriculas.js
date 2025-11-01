import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Toolbar, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, CircularProgress, Modal, Fade, Backdrop,
    TextField, Grid, Select, MenuItem, InputLabel, FormControl, TablePagination
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import matriculaService from '../api/matriculaService';
import MatriculaForm from '../components/MatriculaForm';
import ofertaEducativaService from '../api/ofertaEducativaService';
import useDebounce from '../hooks/useDebounce';

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

function GestionMatriculas() {
    const [matriculas, setMatriculas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [nuevaMatricula, setNuevaMatricula] = useState({});
    const [cursos, setCursos] = useState([]);
    const [anios, setAnios] = useState([]);

    // Estados de Paginación
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [totalElements, setTotalElements] = useState(0);

    // Estados de Filtros
    const [filtroSearch, setFiltroSearch] = useState("");
    const [filtroCurso, setFiltroCurso] = useState("");
    const [filtroAnio, setFiltroAnio] = useState(2025);

    const debouncedSearch = useDebounce(filtroSearch, 500);

    useEffect(() => {
        const fetchAnios = async () => {
            try {
                const response = await matriculaService.obtenerAnios();
                setAnios(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error("Error al cargar años:", error);
            }
        };

        const fetchCursos = async () => {
            try {
                const response = await ofertaEducativaService.obtenerCursos();
                setCursos(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error("Error al cargar los cursos:", error);
            }
        };

        fetchAnios();
        fetchCursos();
    }, []);

    useEffect(() => {
        const fetchMatriculas = async () => {
            setLoading(true);
            try {
                const response = await matriculaService.obtenerMatriculas(
                    page,
                    rowsPerPage,
                    debouncedSearch,
                    filtroCurso || null,
                    filtroAnio || null
                );

                setMatriculas(response.data.content);
                setTotalElements(response.data.totalElements);
            } catch (error) {
                console.error("Error al cargar matrículas:", error);
            }
            setLoading(false);
        };

        fetchMatriculas();
    }, [page, rowsPerPage, debouncedSearch, filtroCurso, filtroAnio]);

    // --- MANEJADORES DE PAGINACIÓN ---
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpen = () => {
        setNuevaMatricula({});
        setOpenModal(true);
    };

    const handleClose = () => setOpenModal(false);

    const handleSave = async () => {
        try {
            await matriculaService.registrarMatricula(nuevaMatricula);
            handleClose();
            setPage(0);
        } catch (error) {
            console.error("Error al registrar la matrícula:", error);
        }
    };

    return (
        <Box>
            <Toolbar />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Gestión de Matrículas</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
                    Añadir Matrícula
                </Button>
            </Box>

            {/* --- Filtros --- */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            label="Filtrar por Alumno o Centro"
                            value={filtroSearch}
                            onChange={e => setFiltroSearch(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel>Curso</InputLabel>
                            <Select
                                value={filtroCurso}
                                label="Curso"
                                onChange={e => setFiltroCurso(e.target.value)}
                                displayEmpty
                            >
                                <MenuItem value="">Todos los cursos</MenuItem>
                                {cursos.map((curso) => (
                                    <MenuItem key={curso.id} value={curso.id}>
                                        {curso.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel>Año Académico</InputLabel>
                            <Select
                                value={filtroAnio}
                                label="Año Académico"
                                onChange={e => setFiltroAnio(e.target.value)}
                                displayEmpty
                            >
                                <MenuItem value="">Todos los años</MenuItem>
                                {anios.map((anio) => (
                                    <MenuItem key={anio} value={anio}>
                                        {anio}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {loading ? (<CircularProgress />)
                : (
                    <Paper>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Alumno</TableCell>
                                        <TableCell>Centro Educativo</TableCell>
                                        <TableCell>Curso</TableCell>
                                        <TableCell>Año Académico</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {matriculas.map((matricula) => (
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