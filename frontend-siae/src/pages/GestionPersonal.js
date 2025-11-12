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
import personalService from '../api/personalService';
import PersonalForm from '../components/PersonalForm';
import useDebounce from '../hooks/useDebounce';

const modalStyle = {
    position: 'absolute',
    top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    borderRadius: 3,
    boxShadow: '0 6px 25px rgba(0,0,0,0.2)',
    p: 3
};

function GestionPersonal() {
    const [personal, setPersonal] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [personalActual, setPersonalActual] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [totalElements, setTotalElements] = useState(0);
    const [filtroSearch, setFiltroSearch] = useState('');
    const [filtroCargo, setFiltroCargo] = useState('TODOS');
    const [cargos, setCargos] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const debouncedSearch = useDebounce(filtroSearch, 500);

    useEffect(() => {
        const fetchCargos = async () => {
            try {
                const response = await personalService.obtenerCargos();
                setCargos(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error('Error al cargar cargos:', error);
            }
        };
        fetchCargos();
    }, []);

    const fetchPersonal = useCallback(async () => {
        setLoading(true);
        try {
            const response = await personalService.obtenerPersonal(
                page, rowsPerPage, debouncedSearch,
                filtroCargo !== 'TODOS' ? filtroCargo : null
            );
            setPersonal(response.data.content);
            setTotalElements(response.data.totalElements);
        } catch (error) {
            console.error('Error al cargar personal:', error);
        }
        setLoading(false);
    }, [page, rowsPerPage, debouncedSearch, filtroCargo]);

    useEffect(() => {
        fetchPersonal();
    }, [fetchPersonal]);
    const handleChangePage = (_, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    const handleOpenCreate = () => {
        setIsEditMode(false);
        setPersonalActual({});
        setOpenModal(true);
    };

    const handleOpenEdit = (persona) => {
        setIsEditMode(true);
        setPersonalActual(persona);
        setOpenModal(true);
    };

    const handleClose = () => {
        setOpenModal(false);
        setPersonalActual({});
        setIsEditMode(false);
    };

    const handleSave = async () => {
        try {
            if (isEditMode) {
                await personalService.editarPersonal(personalActual.id, personalActual);
                setSnackbar({ open: true, message: 'Personal actualizado correctamente.', severity: 'success' });
            } else {
                await personalService.registrarPersonal(personalActual);
                setSnackbar({ open: true, message: 'Nuevo personal añadido con éxito.', severity: 'success' });
            }
            handleClose();
            fetchPersonal();
        } catch (error) {
            console.error('Error al guardar personal:', error);
            setSnackbar({ open: true, message: 'Error al guardar personal.', severity: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este personal?')) {
            try {
                await personalService.eliminarPersonal(id);
                setSnackbar({ open: true, message: 'Personal eliminado.', severity: 'info' });
                fetchPersonal();
            } catch (error) {
                console.error('Error al eliminar personal:', error);
                setSnackbar({ open: true, message: 'Error al eliminar.', severity: 'error' });
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
                    Gestión de Personal
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
                    Añadir Personal
                </Button>
            </Box>

            {/* Filtros */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: '0 4px 10px rgba(0,0,0,0.08)' }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Buscar por DNI, nombre o centro"
                            value={filtroSearch}
                            onChange={(e) => setFiltroSearch(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Cargo</InputLabel>
                            <Select
                                value={filtroCargo}
                                label="Cargo"
                                onChange={(e) => setFiltroCargo(e.target.value)}
                            >
                                <MenuItem value="TODOS">TODOS</MenuItem>
                                {cargos.map((c) => (
                                    <MenuItem key={c} value={c}>{c}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

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
                                            <TableCell><strong>Apellidos</strong></TableCell>
                                            <TableCell><strong>DNI</strong></TableCell>
                                            <TableCell><strong>Cargo</strong></TableCell>
                                            <TableCell><strong>Centro Educativo</strong></TableCell>
                                            <TableCell><strong>Acciones</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {personal.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center">
                                                    No hay personal registrado.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            personal.map((persona) => (
                                                <TableRow
                                                    key={persona.id}
                                                    hover
                                                    sx={{
                                                        transition: 'background 0.2s',
                                                        '&:hover': { background: 'rgba(0,137,123,0.06)' }
                                                    }}
                                                >
                                                    <TableCell>{persona.nombre}</TableCell>
                                                    <TableCell>{persona.apellidos}</TableCell>
                                                    <TableCell>{persona.dni}</TableCell>
                                                    <TableCell>{persona.cargo}</TableCell>
                                                    <TableCell>{persona.centroEducativo?.nombre || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <Tooltip title="Editar">
                                                            <IconButton onClick={() => handleOpenEdit(persona)}>
                                                                <EditIcon color="primary" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Eliminar">
                                                            <IconButton onClick={() => handleDelete(persona.id)}>
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
                            {isEditMode ? 'Editar Personal' : 'Añadir Nuevo Personal'}
                        </Typography>
                        <PersonalForm personal={personalActual} setPersonal={setPersonalActual} />
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

export default GestionPersonal;