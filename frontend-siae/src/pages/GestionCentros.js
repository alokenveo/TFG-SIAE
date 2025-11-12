import React, { useState, useEffect, useCallback } from 'react';
import {
    Typography, Box, Toolbar, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, CircularProgress,
    Modal, Fade, Backdrop, IconButton, Tooltip, TextField, Grid,
    Select, MenuItem, InputLabel, FormControl, TablePagination,
    Snackbar, Alert
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import centroService from '../api/centroService';
import CentroForm from '../components/CentroForm';
import ofertaEducativaService from '../api/ofertaEducativaService';
import useDebounce from '../hooks/useDebounce';

const tiposFiltro = ["TODOS", "PUBLICO", "PRIVADO", "CONCERTADO"];
const provinciasFiltro = [
    "TODOS", "ANNOBON", "BIOKO_NORTE", "BIOKO_SUR",
    "CENTRO_SUR", "DJIBLOHO", "KIE_NTEM", "LITORAL", "WELE_NZAS"
];

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

function GestionCentros() {
    const [centros, setCentros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [centroActual, setCentroActual] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);
    const [nivelesSeleccionadosForm, setNivelesSeleccionadosForm] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Paginación
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [totalElements, setTotalElements] = useState(0);

    // Filtros
    const [filtroSearch, setFiltroSearch] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('TODOS');
    const [filtroProvincia, setFiltroProvincia] = useState('TODOS');

    const debouncedSearch = useDebounce(filtroSearch, 500);
    const debouncedTipo = useDebounce(filtroTipo, 500);
    const debouncedProvincia = useDebounce(filtroProvincia, 500);

    // Cargar centros
    const fetchCentros = useCallback(async () => {
        setLoading(true);
        try {
            const response = await centroService.obtenerTodosLosCentros(
                page, rowsPerPage, debouncedSearch, debouncedTipo, debouncedProvincia
            );
            setCentros(response.data.content);
            setTotalElements(response.data.totalElements);
        } catch (error) {
            console.error('Error al cargar centros:', error);
        }
        setLoading(false);
    }, [page, rowsPerPage, debouncedSearch, debouncedTipo, debouncedProvincia]);

    useEffect(() => {
        fetchCentros();
    }, [fetchCentros]);

    // Paginación
    const handleChangePage = (_, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    // Abrir modal nuevo
    const handleOpenCreate = () => {
        setIsEditMode(false);
        setCentroActual({});
        setNivelesSeleccionadosForm([]);
        setOpenModal(true);
    };

    // Abrir modal editar
    const handleOpenEdit = async (centro) => {
        setIsEditMode(true);
        setCentroActual(centro);
        try {
            const response = await ofertaEducativaService.obtenerNivelesPorCentro(centro.id);
            setNivelesSeleccionadosForm(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error cargando niveles:', error);
            setSnackbar({ open: true, message: 'Error al cargar niveles del centro.', severity: 'error' });
        }
        setOpenModal(true);
    };

    const handleClose = () => setOpenModal(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            let centroGuardado;
            if (isEditMode) {
                const response = await centroService.editarCentro(centroActual.id, centroActual);
                centroGuardado = response.data;
                setSnackbar({ open: true, message: 'Centro actualizado con éxito.', severity: 'success' });
            } else {
                const response = await centroService.crearCentro(centroActual);
                centroGuardado = response.data;
                setSnackbar({ open: true, message: 'Centro creado correctamente.', severity: 'success' });
            }
            await centroService.actualizarNivelesCentro(
                centroGuardado.id,
                nivelesSeleccionadosForm.map(n => n.id)
            );
            handleClose();
            fetchCentros();
        } catch (error) {
            console.error('Error al guardar centro:', error);
            setSnackbar({ open: true, message: 'Error al guardar centro.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este centro?')) {
            setLoading(true);
            try {
                await centroService.eliminarCentro(id);
                setSnackbar({ open: true, message: 'Centro eliminado.', severity: 'info' });
                fetchCentros();
            } catch (error) {
                console.error('Error al eliminar centro:', error);
                setSnackbar({ open: true, message: 'Error al eliminar centro.', severity: 'error' });
            } finally {
                setLoading(false);
            }
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
                    Gestión de Centros
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                    sx={{
                        background: 'linear-gradient(90deg,#00579b,#00897b)',
                        '&:hover': { background: 'linear-gradient(90deg,#004b85,#00796b)' },
                        fontWeight: 600
                    }}
                >
                    Añadir Centro
                </Button>
            </Box>

            {/* Filtros */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: '0 4px 10px rgba(0,0,0,0.08)' }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            label="Buscar por nombre o provincia"
                            value={filtroSearch}
                            onChange={(e) => setFiltroSearch(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel>Tipo</InputLabel>
                            <Select
                                value={filtroTipo}
                                label="Tipo"
                                onChange={(e) => setFiltroTipo(e.target.value)}
                            >
                                {tiposFiltro.map(t => (
                                    <MenuItem key={t} value={t}>{t}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel>Provincia</InputLabel>
                            <Select
                                value={filtroProvincia}
                                label="Provincia"
                                onChange={(e) => setFiltroProvincia(e.target.value)}
                            >
                                {provinciasFiltro.map(p => (
                                    <MenuItem key={p} value={p}>{p}</MenuItem>
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
                                            <TableCell><strong>Nombre</strong></TableCell>
                                            <TableCell><strong>Tipo</strong></TableCell>
                                            <TableCell><strong>Provincia</strong></TableCell>
                                            <TableCell><strong>Acciones</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {centros.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center">
                                                    No hay centros registrados.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            centros.map((centro) => (
                                                <TableRow
                                                    key={centro.id}
                                                    hover
                                                    sx={{ transition: 'background 0.2s', '&:hover': { background: 'rgba(0,137,123,0.06)' } }}
                                                >
                                                    <TableCell>{centro.nombre}</TableCell>
                                                    <TableCell>{centro.tipo}</TableCell>
                                                    <TableCell>{centro.provincia}</TableCell>
                                                    <TableCell>
                                                        <Tooltip title="Editar">
                                                            <IconButton onClick={() => handleOpenEdit(centro)}>
                                                                <EditIcon color="primary" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Eliminar">
                                                            <IconButton onClick={() => handleDelete(centro.id)}>
                                                                <DeleteIcon color="error" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
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
                            {isEditMode ? 'Editar Centro' : 'Añadir Centro'}
                        </Typography>
                        <CentroForm
                            centro={centroActual}
                            setCentro={setCentroActual}
                            nivelesSeleccionados={nivelesSeleccionadosForm}
                            setNivelesSeleccionados={setNivelesSeleccionadosForm}
                        />
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button onClick={handleClose}>Cancelar</Button>
                            <Button variant="contained" onClick={handleSave}>Guardar</Button>
                        </Box>
                    </Box>
                </Fade>
            </Modal>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </motion.div>
    );
}

export default GestionCentros;