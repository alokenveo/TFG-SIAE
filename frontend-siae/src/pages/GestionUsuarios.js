import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Toolbar, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, CircularProgress,
    Modal, Fade, IconButton, Tooltip, Chip, TextField, Grid,
    Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import usuarioService from '../api/usuarioService';
import UsuarioForm from '../components/UsuarioForm';

const style = {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4,
};

const rolesFiltro = ["TODOS", "ADMIN", "GESTOR", "INVITADO"];

function GestionUsuarios() {
    const [usuariosOriginales, setUsuariosOriginales] = useState([]);
    const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [usuarioActual, setUsuarioActual] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);

    // --- Estados para los Filtros ---
    const [filtroTexto, setFiltroTexto] = useState('');
    const [filtroRol, setFiltroRol] = useState('TODOS');

    const cargarUsuarios = async () => {
        setLoading(true);
        try {
            const response = await usuarioService.obtenerTodosLosUsuarios();
            const data = Array.isArray(response.data) ? response.data : [];
            const sortedData = data.sort((a, b) => a.nombre.localeCompare(b.nombre));
            setUsuariosOriginales(sortedData);
        } catch (error) {
            console.error("Error al cargar los usuarios:", error);
            setUsuariosOriginales([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarUsuarios();
    }, []);

    useEffect(() => {
        let usuariosResultado = usuariosOriginales;
        const textoBusqueda = filtroTexto.toLowerCase().trim();

        if (textoBusqueda) {
            usuariosResultado = usuariosResultado.filter(usuario =>
                (usuario.nombre && usuario.nombre.toLowerCase().includes(textoBusqueda)) ||
                (usuario.correo && usuario.correo.toLowerCase().includes(textoBusqueda)) ||
                (usuario.centro?.nombre && usuario.centro.nombre.toLowerCase().includes(textoBusqueda))
            );
        }

        if (filtroRol !== 'TODOS') {
            usuariosResultado = usuariosResultado.filter(usuario => (usuario.rol ? usuario.rol.toUpperCase() : '') === filtroRol);
        }

        setUsuariosFiltrados(usuariosResultado);

    }, [filtroTexto, filtroRol, usuariosOriginales]);

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
        // La propiedad 'rol' la extraemos del campo 'rol' que nos da el backend
        const userWithRole = { ...usuario, rol: usuario.rol ? usuario.rol.toUpperCase() : '' };
        setUsuarioActual(userWithRole);
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
            cargarUsuarios();
        } catch (error) {
            console.error("Error al guardar el usuario:", error.response.data);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            try {
                await usuarioService.eliminarUsuario(id);
                cargarUsuarios();
            } catch (error) {
                console.error("Error al eliminar el usuario:", error);
            }
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'ADMIN':
                return 'Administrador';
            case 'GESTOR':
                return 'Gestor Institucional';
            case 'INVITADO':
                return 'Invitado';
            default:
                return role;
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'ADMIN':
                return 'primary'; // Azul/Violeta
            case 'GESTOR':
                return 'success'; // Verde
            case 'INVITADO':
                return 'warning'; // Naranja
            default:
                return 'default'; // Gris
        }
    };

    return (
        <Box>
            <Toolbar />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Gestión de Usuarios</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>Añadir Usuario</Button>
            </Box>

            <Grid container spacing={2} sx={{ mb: 2 }} alignItems="flex-end">
                {/* Filtro Texto */}
                <Grid item xs={12} sm={6} md={6}>
                    <TextField
                        fullWidth
                        label="Buscar..."
                        variant="outlined"
                        size="small"
                        value={filtroTexto}
                        onChange={handleFiltroTextoChange}
                    />
                </Grid>
                {/* Filtro Rol */}
                <Grid item xs={12} sm={6} md={6}>
                    <FormControl fullWidth size="small">
                        <InputLabel id="filtro-rol-label">Rol</InputLabel>
                        <Select
                            labelId="filtro-rol-label"
                            value={filtroRol}
                            label="Rol"
                            onChange={handleFiltroRolChange}
                        >
                            {rolesFiltro.map(r => <MenuItem key={r} value={r}>{r === 'TODOS' ? 'TODOS' : getRoleLabel(r)}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                {/* Opcional: Botón para limpiar filtros */}
                {/* <Grid item xs={12} sm={12} md={3}>
                     <Button onClick={() => { setFiltroTexto(''); setFiltroRol('TODOS'); }}>
                         Limpiar Filtros
                     </Button>
                 </Grid> */}
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
                                    <TableCell>Centro (Si aplica)</TableCell>
                                    <TableCell sx={{ width: '120px' }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {usuariosFiltrados.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            {filtroTexto || filtroRol !== 'TODOS' ? "No se encontraron usuarios con esos criterios." : "No hay usuarios registrados."}
                                        </TableCell>
                                    </TableRow>
                                )}
                                {usuariosFiltrados.map((usuario) => (
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

            <Modal open={openModal} onClose={handleClose} /* ... */ >
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
