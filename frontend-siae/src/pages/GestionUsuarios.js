import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Toolbar, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, CircularProgress,
    Modal, Fade, IconButton, Tooltip, Chip, TextField, Grid,
    Select, MenuItem, InputLabel, FormControl, TablePagination, Backdrop
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import usuarioService from '../api/usuarioService';
import UsuarioForm from '../components/UsuarioForm';
import useDebounce from '../hooks/useDebounce';

const style = {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4,
};

const rolesFiltro = ["TODOS", "ADMIN", "GESTOR", "INVITADO"];

function GestionUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [usuarioActual, setUsuarioActual] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);

    // Estados de Paginación
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [totalElements, setTotalElements] = useState(0);

    // Estados para los Filtros
    const [filtroTexto, setFiltroTexto] = useState('');
    const [filtroRol, setFiltroRol] = useState('TODOS');

    const debouncedTexto = useDebounce(filtroTexto, 500);

    useEffect(() => {
        const fetchUsuarios = async () => {
            setLoading(true);
            try {
                const response = await usuarioService.obtenerTodosLosUsuarios(
                    page,
                    rowsPerPage,
                    debouncedTexto,
                    filtroRol
                );
                setUsuarios(response.data.content);
                setTotalElements(response.data.totalElements);
            } catch (error) {
                console.error("Error al cargar los usuarios:", error);
            }
            setLoading(false);
        };
        fetchUsuarios();
    }, [page, rowsPerPage, debouncedTexto, filtroRol]);

    // Manejadores para los filtros
    const handleFiltroTextoChange = (event) => setFiltroTexto(event.target.value);
    const handleFiltroRolChange = (event) => setFiltroRol(event.target.value);

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

    const handleClose = () => {
        setOpenModal(false);
        setUsuarioActual({});
        setIsEditMode(false);
    };

    const handleSave = async () => {
        try {
            if (isEditMode) {
                await usuarioService.editarUsuario(usuarioActual.id, usuarioActual);
            } else {
                await usuarioService.crearUsuario(usuarioActual);
            }
            handleClose();
            setPage(0);
        } catch (error) {
            console.error("Error al guardar el usuario:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            try {
                await usuarioService.eliminarUsuario(id);
                setPage(0);
            } catch (error) {
                console.error("Error al eliminar el usuario:", error);
            }
        }
    };

    // Función auxiliar para etiquetas de rol
    const getRoleLabel = (rol) => {
        switch (rol) {
            case 'ADMIN': return 'Administrador';
            case 'GESTOR': return 'Gestor Institucional';
            case 'INVITADO': return 'Invitado';
            default: return rol;
        }
    };

    // Función auxiliar para colores de rol
    const getRoleColor = (rol) => {
        switch (rol) {
            case 'ADMIN': return 'primary';
            case 'GESTOR': return 'secondary';
            case 'INVITADO': return 'default';
            default: return 'default';
        }
    };

    return (
        <Box>
            <Toolbar />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Gestión de Usuarios</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
                    Añadir Usuario
                </Button>
            </Box>

            <Grid container spacing={2} sx={{ mb: 2 }} alignItems="flex-end">
                {/* Filtro Texto */}
                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        fullWidth
                        label="Buscar por Nombre o Correo"
                        variant="outlined"
                        size="small"
                        value={filtroTexto}
                        onChange={handleFiltroTextoChange}
                    />
                </Grid>
                {/* Filtro Rol */}
                <Grid item xs={6} sm={3} md={2}>
                    <FormControl fullWidth size="small">
                        <InputLabel id="filtro-rol-label">Rol</InputLabel>
                        <Select
                            labelId="filtro-rol-label"
                            value={filtroRol}
                            label="Rol"
                            onChange={handleFiltroRolChange}
                        >
                            {rolesFiltro.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            {loading ? (<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>)
                : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead sx={{ backgroundColor: '#e0e0e0' }}>
                                <TableRow>
                                    <TableCell>Nombre</TableCell>
                                    <TableCell>Correo</TableCell>
                                    <TableCell>Rol</TableCell>
                                    <TableCell>Centro (si aplica)</TableCell>
                                    <TableCell sx={{ width: '120px' }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {usuarios.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            No hay usuarios registrados.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {usuarios.map((usuario) => (
                                    <TableRow key={usuario.id}>
                                        <TableCell>{usuario.nombre}</TableCell>
                                        <TableCell>{usuario.correo}</TableCell>
                                        <TableCell>
                                            <Chip label={getRoleLabel(usuario.rol)} color={getRoleColor(usuario.rol)} />
                                        </TableCell>
                                        <TableCell>{usuario.centro?.nombre || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Tooltip title="Editar"><IconButton onClick={() => handleOpenEdit(usuario)}><EditIcon /></IconButton></Tooltip>
                                            <Tooltip title="Eliminar"><IconButton onClick={() => handleDelete(usuario.id)}><DeleteIcon color="error" /></IconButton></Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

            {!loading && (
                <TablePagination
                    rowsPerPageOptions={[10, 20, 30, 50]}
                    component="div"
                    count={totalElements}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />
            )}

            <Modal open={openModal} onClose={handleClose} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
                <Fade in={openModal}>
                    <Box sx={style}>
                        <Typography variant="h6">{isEditMode ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}</Typography>
                        <UsuarioForm usuario={usuarioActual} setUsuario={setUsuarioActual} isEditMode={isEditMode} />
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

export default GestionUsuarios;