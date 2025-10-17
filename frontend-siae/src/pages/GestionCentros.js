import React, { useState, useEffect } from 'react';
import { Typography, Box, Toolbar, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Modal, Fade, Backdrop, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import centroService from '../api/centroService';
import CentroForm from '../components/CentroForm';

// Estilo para el Modal
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

function GestionCentros() {
    const [centros, setCentros] = useState([]);
    const [loading, setLoading] = useState(true); // Estado para saber si estamos cargando datos
    const [openModal, setOpenModal] = useState(false); // Estado para abrir/cerrar el modal
    const [centroActual, setCentroActual] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);

    // Función para cargar los datos cuando el componente se monte
    const cargarCentros = async () => {
        setLoading(true);
        try {
            const response = await centroService.obtenerTodosLosCentros();
            setCentros(response.data || []);
        } catch (error) {
            console.error("Error al cargar los centros:", error);
            setCentros([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarCentros();
    }, []);

    // --- MANEJO DEL MODAL ---
    const handleOpenCreate = () => {
        setIsEditMode(false);
        setCentroActual({});
        setOpenModal(true);
    };

    const handleOpenEdit = (centro) => {
        setIsEditMode(true);
        setCentroActual(centro);
        setOpenModal(true);
    };

    const handleClose = () => {
        setOpenModal(false);
        setCentroActual({});
        setIsEditMode(false);
    };

    const handleSave = async () => {
        try {
            if (isEditMode) {
                await centroService.editarCentro(centroActual.id, centroActual);
            } else {
                await centroService.crearCentro(centroActual);
            }
            handleClose();
            cargarCentros();
        } catch (error) {
            console.error("Error al guardar el centro:", error);
        }
    };

    const handleDelete = async (id) => {
        // Pedimos confirmación antes de borrar
        if (window.confirm('¿Estás seguro de que deseas eliminar este centro?')) {
            try {
                await centroService.eliminarCentro(id);
                cargarCentros(); // Recargamos la lista
            } catch (error) {
                console.error("Error al eliminar el centro:", error);
            }
        }
    };

    return (
        <Box>
            <Toolbar />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Gestión de Centros Educativos</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
                    Añadir Centro
                </Button>
            </Box>

            {/* Mostramos un spinner de carga mientras se obtienen los datos */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead sx={{ backgroundColor: '#e0e0e0' }}>
                            <TableRow>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Tipo</TableCell>
                                <TableCell>Provincia</TableCell>
                                <TableCell sx={{ width: '120px' }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {centros.map((centro) => (
                                <TableRow key={centro.id}>
                                    <TableCell>{centro.nombre}</TableCell>
                                    <TableCell>{centro.tipo}</TableCell>
                                    <TableCell>{centro.provincia}</TableCell>
                                    <TableCell>
                                        <Tooltip title="Editar">
                                            <IconButton onClick={() => handleOpenEdit(centro)}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Eliminar">
                                            <IconButton onClick={() => handleDelete(centro.id)}>
                                                <DeleteIcon color="error" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* --- MODAL PARA AÑADIR CENTRO --- */}
            <Modal
                open={openModal}
                onClose={handleClose}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{ timeout: 500 }}
            >
                <Fade in={openModal}>
                    <Box sx={style}>
                        <Typography variant="h6" component="h2">
                            {isEditMode ? 'Editar Centro' : 'Añadir Nuevo Centro'}
                        </Typography>
                        <CentroForm centro={centroActual} setCentro={setCentroActual} />
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

export default GestionCentros;