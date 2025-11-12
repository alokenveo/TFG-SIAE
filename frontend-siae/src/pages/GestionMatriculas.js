import React, { useState, useEffect, useCallback } from 'react';
import {
    Typography, Box, Toolbar, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, CircularProgress,
    Modal, Fade, Backdrop, TextField, Grid, Select, MenuItem,
    InputLabel, FormControl, TablePagination, Snackbar, Alert
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import matriculaService from '../api/matriculaService';
import MatriculaForm from '../components/MatriculaForm';
import ofertaEducativaService from '../api/ofertaEducativaService';
import useDebounce from '../hooks/useDebounce';

const modalStyle = {
    position: 'absolute',
    top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 600 },
    bgcolor: 'background.paper',
    borderRadius: 3,
    boxShadow: '0 6px 25px rgba(0,0,0,0.2)',
    p: 3
};

function GestionMatriculas() {
    const [matriculas, setMatriculas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [nuevaMatricula, setNuevaMatricula] = useState({});
    const [cursos, setCursos] = useState([]);
    const [anios, setAnios] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [totalElements, setTotalElements] = useState(0);
    const [filtroSearch, setFiltroSearch] = useState('');
    const [filtroCurso, setFiltroCurso] = useState('');
    const [filtroAnio, setFiltroAnio] = useState(2025);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const debouncedSearch = useDebounce(filtroSearch, 500);

    useEffect(() => {
        const fetchDatos = async () => {
            try {
                const [aniosRes, cursosRes] = await Promise.all([
                    matriculaService.obtenerAnios(),
                    ofertaEducativaService.obtenerCursos()
                ]);
                setAnios(Array.isArray(aniosRes.data) ? aniosRes.data : []);
                setCursos(Array.isArray(cursosRes.data) ? cursosRes.data : []);
            } catch (error) {
                console.error('Error cargando datos base:', error);
            }
        };
        fetchDatos();
    }, []);

    const fetchMatriculas = useCallback(async () => {
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
            console.error('Error al cargar matrículas:', error);
        }
        setLoading(false);
    }, [page, rowsPerPage, debouncedSearch, filtroCurso, filtroAnio]);

    useEffect(() => {
        fetchMatriculas();
    }, [fetchMatriculas]);

    const handleChangePage = (_, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
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
            fetchMatriculas();
            setSnackbar({ open: true, message: 'Matrícula registrada con éxito.', severity: 'success' });
        } catch (error) {
            console.error('Error al registrar la matrícula:', error);
            setSnackbar({ open: true, message: 'Error al registrar matrícula.', severity: 'error' });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
        >
            <Toolbar />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: '#003366' }}>
                    Gestión de Matrículas
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpen}
                    sx={{
                        background: 'linear-gradient(90deg,#00579b,#00897b)',
                        '&:hover': { background: 'linear-gradient(90deg,#004b85,#00796b)' },
                        fontWeight: 600
                    }}
                >
                    Añadir Matrícula
                </Button>
            </Box>

            {/* Filtros */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: '0 4px 10px rgba(0,0,0,0.08)' }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            label="Buscar por Alumno o Centro"
                            value={filtroSearch}
                            onChange={(e) => setFiltroSearch(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel>Curso</InputLabel>
                            <Select
                                value={filtroCurso}
                                label="Curso"
                                onChange={(e) => setFiltroCurso(e.target.value)}
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
                                onChange={(e) => setFiltroAnio(e.target.value)}
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

            {/* Tabla */}
            {loading ? (
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <AnimatePresence>
                    <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ background: 'rgba(0,87,155,0.1)' }}>
                                            <TableCell><strong>Alumno</strong></TableCell>
                                            <TableCell><strong>Centro Educativo</strong></TableCell>
                                            <TableCell><strong>Curso</strong></TableCell>
                                            <TableCell><strong>Año Académico</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {matriculas.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center">
                                                    No hay matrículas registradas.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            matriculas.map((matricula) => (
                                                <TableRow
                                                    key={matricula.id}
                                                    hover
                                                    sx={{
                                                        transition: 'background 0.2s',
                                                        '&:hover': { background: 'rgba(0,137,123,0.06)' }
                                                    }}
                                                >
                                                    <TableCell>
                                                        {matricula.alumno.nombre} {matricula.alumno.apellidos}
                                                    </TableCell>
                                                    <TableCell>{matricula.centroEducativo.nombre}</TableCell>
                                                    <TableCell>{matricula.curso.nombre}</TableCell>
                                                    <TableCell>{matricula.anioAcademico}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
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
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Modal */}
            <Modal open={openModal} onClose={handleClose} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 300 }}>
                <Fade in={openModal}>
                    <Box sx={modalStyle}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            Registrar Nueva Matrícula
                        </Typography>
                        <MatriculaForm matricula={nuevaMatricula} setMatricula={setNuevaMatricula} />
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button onClick={handleClose}>Cancelar</Button>
                            <Button variant="contained" onClick={handleSave}>Guardar</Button>
                        </Box>
                    </Box>
                </Fade>
            </Modal>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
            </Snackbar>
        </motion.div>
    );
}

export default GestionMatriculas;