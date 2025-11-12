import React, { useState, useEffect, useCallback } from 'react';
import {
    Typography, Box, Toolbar, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, CircularProgress,
    Modal, Fade, Backdrop, IconButton, Tooltip, Chip, TextField, Grid,
    Select, MenuItem, InputLabel, FormControl, TablePagination,
    Snackbar, Alert
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import usuarioService from '../api/usuarioService';
import UsuarioForm from '../components/UsuarioForm';
import useDebounce from '../hooks/useDebounce';

const rolesFiltro = ["TODOS", "ADMIN", "GESTOR", "INVITADO"];

const modalStyle = {
    position: 'absolute',
    top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 500 },
    bgcolor: 'background.paper',
    borderRadius: 3,
    boxShadow: '0 6px 25px rgba(0,0,0,0.2)',
    p: 3
};

function GestionUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [usuarioActual, setUsuarioActual] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Paginación
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [totalElements, setTotalElements] = useState(0);

    // Filtros
    const [filtroTexto, setFiltroTexto] = useState('');
    const [filtroRol, setFiltroRol] = useState('TODOS');

    const debouncedTexto = useDebounce(filtroTexto, 500);

    // Cargar usuarios
    const fetchUsuarios = useCallback(async () => {
        setLoading(true);
        try {
            const response = await usuarioService.obtenerTodosLosUsuarios(
                page, rowsPerPage, debouncedTexto, filtroRol
            );
            setUsuarios(response.data.content);
            setTotalElements(response.data.totalElements);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        }
        setLoading(false);
    }, [page, rowsPerPage, debouncedTexto, filtroRol]);

    useEffect(() => {
        fetchUsuarios();
    }, [fetchUsuarios]);
    // --- FUNCIONES ---
    const handleChangePage = (_, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    const handleOpenCreate = () => {
        setIsEditMode(false);
        setUsuarioActual({});
        setOpenModal(true);
    };

    const handleOpenEdit = (usuario) => {
        setIsEditMode(true);
        setUsuarioActual(usuario);
        setOpenModal(true);
    };

    const handleClose = () => setOpenModal(false);

    const handleSave = async () => {
        try {
            if (isEditMode) {
                await usuarioService.editarUsuario(usuarioActual.id, usuarioActual);
                setSnackbar({ open: true, message: 'Usuario actualizado con éxito.', severity: 'success' });
            } else {
                await usuarioService.crearUsuario(usuarioActual);
                setSnackbar({ open: true, message: 'Usuario creado correctamente.', severity: 'success' });
            }
            handleClose();
            fetchUsuarios();
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            setSnackbar({ open: true, message: 'Error al guardar usuario.', severity: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar este usuario?')) {
            try {
                await usuarioService.eliminarUsuario(id);
                setSnackbar({ open: true, message: 'Usuario eliminado.', severity: 'info' });
                fetchUsuarios();
            } catch (error) {
                console.error('Error al eliminar usuario:', error);
                setSnackbar({ open: true, message: 'Error al eliminar usuario.', severity: 'error' });
            }
        }
    };

    const getRoleLabel = (rol) => {
        switch (rol) {
            case 'ADMIN': return 'Administrador';
            case 'GESTOR': return 'Gestor Institucional';
            case 'INVITADO': return 'Invitado';
            default: return rol;
        }
    };

    const getRoleColor = (rol) => {
        switch (rol) {
            case 'ADMIN': return 'primary';
            case 'GESTOR': return 'secondary';
            case 'INVITADO': return 'default';
            default: return 'default';
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
                    Gestión de Usuarios
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
                    Añadir Usuario
                </Button>
            </Box>

            {/* --- FILTROS --- */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: '0 4px 10px rgba(0,0,0,0.08)' }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Buscar por Nombre o Correo"
                            value={filtroTexto}
                            onChange={(e) => setFiltroTexto(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Rol</InputLabel>
                            <Select
                                value={filtroRol}
                                label="Rol"
                                onChange={(e) => setFiltroRol(e.target.value)}
                            >
                                {rolesFiltro.map(r => (
                                    <MenuItem key={r} value={r}>{r}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {/* --- TABLA --- */}
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
                                            <TableCell><strong>Correo</strong></TableCell>
                                            <TableCell><strong>Rol</strong></TableCell>
                                            <TableCell><strong>Centro</strong></TableCell>
                                            <TableCell><strong>Acciones</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {usuarios.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center">
                                                    No hay usuarios registrados.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            usuarios.map((usuario) => (
                                                <TableRow
                                                    key={usuario.id}
                                                    hover
                                                    sx={{ transition: 'background 0.2s', '&:hover': { background: 'rgba(0,137,123,0.06)' } }}
                                                >
                                                    <TableCell>{usuario.nombre}</TableCell>
                                                    <TableCell>{usuario.correo}</TableCell>
                                                    <TableCell>
                                                        <Chip label={getRoleLabel(usuario.rol)} color={getRoleColor(usuario.rol)} />
                                                    </TableCell>
                                                    <TableCell>{usuario.centro?.nombre || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <Tooltip title="Editar">
                                                            <IconButton onClick={() => handleOpenEdit(usuario)}>
                                                                <EditIcon color="primary" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Eliminar">
                                                            <IconButton onClick={() => handleDelete(usuario.id)}>
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

            {/* --- MODAL --- */}
            <Modal open={openModal} onClose={handleClose} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 300 }}>
                <Fade in={openModal}>
                    <Box sx={modalStyle}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            {isEditMode ? 'Editar Usuario' : 'Añadir Usuario'}
                        </Typography>
                        <UsuarioForm usuario={usuarioActual} setUsuario={setUsuarioActual} isEditMode={isEditMode} />
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

export default GestionUsuarios;