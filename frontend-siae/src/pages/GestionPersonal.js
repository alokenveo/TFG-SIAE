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
import personalService from '../api/personalService';
import PersonalForm from '../components/PersonalForm'; // Importar el formulario
import { useAuth } from '../context/AuthContext'; // Para saber el rol

// Estilo Modal
const style = {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 600 }, // Ancho responsivo
    bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4,
};

function GestionPersonal() {
    const { usuario } = useAuth(); // Para lógica específica del gestor
    const isGestor = usuario?.rol === 'GESTOR';

    // Estados
    const [personalOriginal, setPersonalOriginal] = useState([]); // Lista completa
    const [personalFiltrado, setPersonalFiltrado] = useState([]); // Lista a mostrar
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [personalActual, setPersonalActual] = useState({}); // Para el form
    const [isEditMode, setIsEditMode] = useState(false);

    // --- Estados Filtros ---
    const [filtroTexto, setFiltroTexto] = useState('');
    const [filtroCargo, setFiltroCargo] = useState('TODOS');
    const [cargosUnicos, setCargosUnicos] = useState([]); // Opciones para el select de cargo
    // --- Fin Estados Filtros ---

    // Cargar Personal
    const cargarPersonal = async () => {
        setLoading(true);
        try {
            const response = await personalService.obtenerPersonal();
            const data = Array.isArray(response.data) ? response.data : [];

            const sortedData = data.sort((a, b) => a.apellidos.localeCompare(b.apellidos));

            setPersonalOriginal(sortedData);

            // Extraer cargos únicos para el filtro después de cargar
            const cargos = [...new Set(sortedData.map(p => p.cargo))].sort(); // Ordenar alfabéticamente
            setCargosUnicos(cargos);

        } catch (error) {
            console.error("Error al cargar el personal:", error);
            setPersonalOriginal([]);
            setCargosUnicos([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarPersonal();
    }, []); // Carga inicial

    // Aplicar Filtros
    useEffect(() => {
        let personalResultado = personalOriginal;
        const textoBusqueda = filtroTexto.toLowerCase().trim();

        // 1. Filtro Texto (DNI, Nombre, Apellidos, Nombre Centro)
        if (textoBusqueda) {
            personalResultado = personalResultado.filter(p =>
                (p.dni && p.dni.toLowerCase().includes(textoBusqueda)) ||
                (p.nombre && p.nombre.toLowerCase().includes(textoBusqueda)) ||
                (p.apellidos && p.apellidos.toLowerCase().includes(textoBusqueda)) ||
                (p.centroEducativo?.nombre && p.centroEducativo.nombre.toLowerCase().includes(textoBusqueda))
            );
        }

        // 2. Filtro Cargo
        if (filtroCargo !== 'TODOS') {
            personalResultado = personalResultado.filter(p => p.cargo === filtroCargo);
        }

        setPersonalFiltrado(personalResultado);

    }, [filtroTexto, filtroCargo, personalOriginal]); // Dependencias

    // Manejadores Filtros
    const handleFiltroTextoChange = (event) => setFiltroTexto(event.target.value);
    const handleFiltroCargoChange = (event) => setFiltroCargo(event.target.value);

    // --- Funciones CRUD Modal ---
    const handleOpenCreate = () => {
        setIsEditMode(false);
        // Si es gestor, pre-rellenar su centro ID
        const initialData = isGestor && usuario.centro ? { centroEducativoId: usuario.centro.id } : {};
        setPersonalActual(initialData);
        setOpenModal(true);
    };

    const handleOpenEdit = (persona) => {
        setIsEditMode(true);
        // Guardar los datos completos y asegurar el ID del centro para el form
        setPersonalActual({
            ...persona,
            centroEducativoId: persona.centroEducativo?.id || null
        });
        setOpenModal(true);
    };

    const handleClose = () => setOpenModal(false);

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar a esta persona?')) {
            try {
                await personalService.eliminarPersonal(id);
                cargarPersonal(); // Recargar lista
            } catch (error) {
                console.error("Error al eliminar personal:", error);
                alert(`Error al eliminar: ${error.response?.data?.error || error.message}`);
            }
        }
    };

    const handleSave = async () => {
        try {
            if (!personalActual.dni || !personalActual.nombre || !personalActual.apellidos || !personalActual.cargo || !personalActual.centroEducativoId) {
                alert("Por favor, completa DNI, Nombre, Apellidos, Cargo y Centro.");
                return;
            }

            const dto = {
                dni: personalActual.dni,
                nombre: personalActual.nombre,
                apellidos: personalActual.apellidos,
                cargo: personalActual.cargo,
                centroEducativoId: personalActual.centroEducativoId,
            };

            if (isEditMode) {
                await personalService.editarPersonal(personalActual.id, dto);
            } else {
                await personalService.registrarPersonal(dto);
            }
            cargarPersonal();
            handleClose();
        } catch (error) {
            console.error("Error al guardar personal:", error);
            alert(`Error al guardar: ${error.response?.data?.error || error.message}`);
        }
    };

    return (
        <Box>
            <Toolbar />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Gestión de Personal</Typography>
                {(usuario.rol === 'ADMIN' || usuario.rol === 'GESTOR') && (
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
                        Añadir Personal
                    </Button>
                )}
            </Box>

            {/* --- Filtros --- */}
            <Grid container spacing={2} sx={{ mb: 2 }} alignItems="flex-end">
                <Grid item xs={12} sm={6} md={5}>
                    <TextField fullWidth label="Buscar... " variant="outlined" size="small"
                        value={filtroTexto} onChange={handleFiltroTextoChange} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth size="small">
                        <InputLabel id="filtro-cargo-label">Cargo</InputLabel>
                        <Select labelId="filtro-cargo-label" value={filtroCargo} label="Cargo" onChange={handleFiltroCargoChange} >
                            <MenuItem value="TODOS"><em>TODOS</em></MenuItem>
                            {cargosUnicos.map(cargo => <MenuItem key={cargo} value={cargo}>{cargo}</MenuItem>)}
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
                                    <TableCell>Apellidos</TableCell>
                                    <TableCell>DNI</TableCell>
                                    <TableCell>Cargo</TableCell>
                                    <TableCell>Centro Educativo</TableCell>
                                    <TableCell sx={{ width: '130px' }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {personalFiltrado.length === 0 && !loading && (
                                    <TableRow><TableCell colSpan={6} align="center">
                                        {filtroTexto || filtroCargo !== 'TODOS' ? "No se encontraron resultados." : "No hay personal registrado."}
                                    </TableCell></TableRow>
                                )}
                                {personalFiltrado.map((persona) => (
                                    <TableRow key={persona.id}>
                                        <TableCell>{persona.nombre}</TableCell>
                                        <TableCell>{persona.apellidos}</TableCell>
                                        <TableCell>{persona.dni}</TableCell>
                                        <TableCell>{persona.cargo}</TableCell>
                                        <TableCell>{persona.centroEducativo?.nombre || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Tooltip title="Editar"><IconButton onClick={() => handleOpenEdit(persona)}><EditIcon /></IconButton></Tooltip>
                                            <Tooltip title="Eliminar"><IconButton onClick={() => handleDelete(persona.id)}><DeleteIcon color="error" /></IconButton></Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

            <Modal open={openModal} onClose={handleClose} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
                <Fade in={openModal}>
                    <Box sx={style}>
                        <Typography variant="h6" component="h2">{isEditMode ? 'Editar Personal' : 'Añadir Nuevo Personal'}</Typography>
                        <PersonalForm personal={personalActual} setPersonal={setPersonalActual} />
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

export default GestionPersonal;