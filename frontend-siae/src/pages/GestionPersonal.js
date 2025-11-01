import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Toolbar, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, CircularProgress,
    Modal, Fade, Backdrop, IconButton, Tooltip, TextField, Grid,
    Select, MenuItem, InputLabel, FormControl, TablePagination
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import personalService from '../api/personalService';
import PersonalForm from '../components/PersonalForm';
import useDebounce from '../hooks/useDebounce';

// Estilo Modal
const style = {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 600 },
    bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4,
};

function GestionPersonal() {
    // Estados
    const [personal, setPersonal] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [personalActual, setPersonalActual] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);

    // Estados de Paginación
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [totalElements, setTotalElements] = useState(0);

    // Estados Filtros
    const [filtroSearch, setFiltroSearch] = useState("");
    const [filtroCargo, setFiltroCargo] = useState("TODOS");
    const [cargos, setCargos] = useState([]);

    const debouncedSearch = useDebounce(filtroSearch, 500);

    // Cargar cargos
    useEffect(() => {
        const fetchCargos = async () => {
            try {
                const response = await personalService.obtenerCargos();
                setCargos(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error("Error al cargar cargos:", error);
            }
        };
        fetchCargos();
    }, []);

    // Cargar personal con paginación y filtros
    useEffect(() => {
        const fetchPersonal = async () => {
            setLoading(true);
            try {
                const response = await personalService.obtenerPersonal(
                    page,
                    rowsPerPage,
                    debouncedSearch,
                    filtroCargo !== "TODOS" ? filtroCargo : null
                );
                setPersonal(response.data.content);
                setTotalElements(response.data.totalElements);
            } catch (error) {
                console.error("Error al cargar personal:", error);
            }
            setLoading(false);
        };
        fetchPersonal();
    }, [page, rowsPerPage, debouncedSearch, filtroCargo]);

    // Manejadores de paginación
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
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
            } else {
                await personalService.registrarPersonal(personalActual);
            }
            handleClose();
            setPage(0);
        } catch (error) {
            console.error("Error al guardar personal:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este personal?')) {
            try {
                await personalService.eliminarPersonal(id);
                setPage(0);
            } catch (error) {
                console.error("Error al eliminar personal:", error);
            }
        }
    };

    return (
        <Box>
            <Toolbar />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Gestión de Personal</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
                    Añadir Personal
                </Button>
            </Box>

            {/* Filtros */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Buscar por DNI, Nombre o Apellidos"
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
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Paper>
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ backgroundColor: '#e0e0e0' }}>
                                <TableRow>
                                    <TableCell>Nombre</TableCell>
                                    <TableCell>Apellidos</TableCell>
                                    <TableCell>DNI</TableCell>
                                    <TableCell>Cargo</TableCell>
                                    <TableCell>Centro Educativo</TableCell>
                                    <TableCell>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {personal.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} align="center">
                                        No hay personal registrado.
                                    </TableCell></TableRow>
                                ) : (
                                    personal.map((persona) => (
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