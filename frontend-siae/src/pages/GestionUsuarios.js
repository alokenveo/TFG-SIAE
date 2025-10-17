import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Toolbar, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, CircularProgress,
    Modal, Fade, Backdrop, IconButton, Tooltip, Chip
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

function GestionUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [usuarioActual, setUsuarioActual] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);

    const cargarUsuarios = async () => {
        setLoading(true);
        try {
            const response = await usuarioService.obtenerTodosLosUsuarios();
            setUsuarios(response.data || []);
        } catch (error) {
            console.error("Error al cargar los usuarios:", error);
            setUsuarios([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const handleOpenCreate = () => {
        setIsEditMode(false);
        setUsuarioActual({});
        setOpenModal(true);
    };

    const handleOpenEdit = (usuario) => {
        setIsEditMode(true);
        // La propiedad 'rol' la extraemos del campo 'dtype' que nos da el backend
        const userWithRole = { ...usuario, rol: usuario.dtype.toUpperCase() };
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

    const getRoleColor = (role) => {
        switch (role) {
            case 'Administrador':
                return 'primary'; // Azul/Violeta
            case 'GestorInstitucional':
                return 'success'; // Verde
            case 'Invitado':
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
                                {usuarios.map((usuario) => (
                                    <TableRow key={usuario.id}>
                                        <TableCell>{usuario.nombre}</TableCell>
                                        <TableCell>{usuario.correo}</TableCell>
                                        <TableCell>
                                            <Chip label={usuario.dtype} color={getRoleColor(usuario.dtype)} />
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