import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Toolbar, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, CircularProgress,
    Modal, Fade, Backdrop, IconButton, Tooltip, TextField, Grid,
    Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
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

const tiposFiltro = ["TODOS", "PUBLICO", "PRIVADO", "CONCERTADO"];

const provinciasFiltro = ["TODOS", "ANNOBON", "BIOKO_NORTE", "BIOKO_SUR", "CENTRO_SUR", "DJIBLOHO", "KIE_NTEM", "LITORAL", "WELE_NZAS"];

function GestionCentros() {
    const [centrosOriginales, setCentrosOriginales] = useState([]);
    const [centrosFiltrados, setCentrosFiltrados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [centroActual, setCentroActual] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);

    // --- Estados para los Filtros ---
    const [filtroTexto, setFiltroTexto] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('TODOS');
    const [filtroProvincia, setFiltroProvincia] = useState('TODOS');

    const cargarCentros = async () => {
        setLoading(true);
        try {
            const response = await centroService.obtenerTodosLosCentros();
            setCentrosOriginales(response.data || []);
        } catch (error) {
            console.error("Error al cargar los centros:", error);
            setCentrosOriginales([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarCentros();
    }, []);

    useEffect(() => {
        let centrosResultado = centrosOriginales;
        const textoBusqueda = filtroTexto.toLowerCase().trim();

        if (textoBusqueda) {
            centrosResultado = centrosResultado.filter(centro =>
                (centro.nombre && centro.nombre.toLowerCase().includes(textoBusqueda)) ||
                (centro.tipo && centro.tipo.toLowerCase().includes(textoBusqueda)) ||
                (centro.provincia && centro.provincia.toLowerCase().includes(textoBusqueda))
            );
        }

        if (filtroTipo !== 'TODOS') {
            centrosResultado = centrosResultado.filter(centro => centro.tipo === filtroTipo);
        }

        if (filtroProvincia !== 'TODOS') {
            centrosResultado = centrosResultado.filter(centro => centro.provincia === filtroProvincia);
        }

        setCentrosFiltrados(centrosResultado);

    }, [filtroTexto, filtroTipo, filtroProvincia, centrosOriginales]);

    // Manejadores para los filtros
    const handleFiltroTextoChange = (event) => setFiltroTexto(event.target.value);
    const handleFiltroTipoChange = (event) => setFiltroTipo(event.target.value);
    const handleFiltroProvinciaChange = (event) => setFiltroProvincia(event.target.value);

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
        if (window.confirm('¿Estás seguro de que deseas eliminar este centro?')) {
            try {
                await centroService.eliminarCentro(id);
                cargarCentros();
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

            <Grid container spacing={2} sx={{ mb: 2 }} alignItems="flex-end">
                {/* Filtro Texto */}
                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        fullWidth
                        label="Buscar..."
                        variant="outlined"
                        size="small"
                        value={filtroTexto}
                        onChange={handleFiltroTextoChange}
                    />
                </Grid>
                {/* Filtro Tipo */}
                <Grid item xs={6} sm={3} md={4}>
                    <FormControl fullWidth size="small">
                        <InputLabel id="filtro-tipo-label">Tipo</InputLabel>
                        <Select
                            labelId="filtro-tipo-label"
                            value={filtroTipo}
                            label="Tipo"
                            onChange={handleFiltroTipoChange}
                        >
                            {tiposFiltro.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                {/* Filtro Provincia */}
                <Grid item xs={6} sm={3} md={4}>
                    <FormControl fullWidth size="small">
                        <InputLabel id="filtro-provincia-label">Provincia</InputLabel>
                        <Select
                            labelId="filtro-provincia-label"
                            value={filtroProvincia}
                            label="Provincia"
                            onChange={handleFiltroProvinciaChange}
                        >
                            {provinciasFiltro.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                {/* Opcional: Botón para limpiar filtros */}
                {/* <Grid item xs={12} sm={12} md={3}>
                     <Button onClick={() => { setFiltroTexto(''); setFiltroTipo('TODOS'); setFiltroProvincia('TODOS'); }}>
                         Limpiar Filtros
                     </Button>
                 </Grid> */}
            </Grid>

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
                            {centrosFiltrados.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        {filtroTexto || filtroTipo !== 'TODOS' || filtroProvincia !== 'TODOS' ? "No se encontraron centros con esos criterios." : "No hay centros registrados."}
                                    </TableCell>
                                </TableRow>
                            )}
                            {centrosFiltrados.map((centro) => (
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