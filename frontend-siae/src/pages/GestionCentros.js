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
import centroService from '../api/centroService';
import CentroForm from '../components/CentroForm';
import ofertaEducativaService from '../api/ofertaEducativaService';
import useDebounce from '../hooks/useDebounce';

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
    const [centros, setCentros] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados de Paginación
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [totalElements, setTotalElements] = useState(0);

    // Estados de Filtros
    const [filtroSearch, setFiltroSearch] = useState("");
    const [filtroTipo, setFiltroTipo] = useState("TODOS");
    const [filtroProvincia, setFiltroProvincia] = useState("TODOS");

    const debouncedSearch = useDebounce(filtroSearch, 500);
    const debouncedTipo = useDebounce(filtroTipo, 500);
    const debouncedProvincia = useDebounce(filtroProvincia, 500);

    const [openModal, setOpenModal] = useState(false);
    const [centroActual, setCentroActual] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);
    const [nivelesSeleccionadosForm, setNivelesSeleccionadosForm] = useState([]);

    useEffect(() => {
        const fetchCentros = async () => {
            setLoading(true);
            try {
                const response = await centroService.obtenerTodosLosCentros(
                    page,
                    rowsPerPage,
                    debouncedSearch,
                    debouncedTipo,
                    debouncedProvincia
                );

                setCentros(response.data.content);
                setTotalElements(response.data.totalElements);
            } catch (error) {
                console.error("Error al cargar centros:", error);
            }
            setLoading(false);
        };

        fetchCentros();
    }, [page, rowsPerPage, debouncedSearch, debouncedTipo, debouncedProvincia]);

    // --- MANEJADORES DE PAGINACIÓN ---
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenEdit = async (centro) => {
        setIsEditMode(true);
        setCentroActual(centro);
        setNivelesSeleccionadosForm([]);

        try {
            const response = await ofertaEducativaService.obtenerNivelesPorCentro(centro.id);
            setNivelesSeleccionadosForm(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error(`Error cargando niveles para el centro ${centro.id}:`, error);
            alert("Error al cargar los niveles asociados a este centro.");
        }
        setOpenModal(true);
    };

    const handleOpenCreate = () => {
        setIsEditMode(false);
        setCentroActual({});
        setNivelesSeleccionadosForm([]);
        setOpenModal(true);
    };

    const handleClose = () => {
        setOpenModal(false);
        setCentroActual({});
        setIsEditMode(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este centro?')) {
            setLoading(true);
            try {
                await centroService.eliminarCentro(id);
                setPage(0);
            } catch (error) {
                console.error("Error al eliminar el centro:", error);
            }
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            let centroGuardado;
            if (isEditMode) {
                const response = await centroService.editarCentro(centroActual.id, centroActual);
                centroGuardado = response.data;
            } else {
                const response = await centroService.crearCentro(centroActual);
                centroGuardado = response.data;
            }
            await centroService.actualizarNivelesCentro(centroGuardado.id, nivelesSeleccionadosForm.map(n => n.id));
            handleClose();
            setPage(0);
        } catch (error) {
            console.error("Error al guardar el centro:", error);
        }
    };

    return (
        <Box>
            <Toolbar />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Gestión de Centros</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
                    Añadir Centro
                </Button>
            </Box>

            {/* --- Filtros --- */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            label="Filtrar por Nombre, Tipo o Provincia"
                            value={filtroSearch}
                            onChange={e => setFiltroSearch(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel>Tipo</InputLabel>
                            <Select
                                value={filtroTipo}
                                label="Tipo"
                                onChange={e => setFiltroTipo(e.target.value)}
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
                                onChange={e => setFiltroProvincia(e.target.value)}
                            >
                                {provinciasFiltro.map(p => (
                                    <MenuItem key={p} value={p}>{p}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {loading ? (
                <CircularProgress />
            ) : (
                <Paper>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nombre</TableCell>
                                    <TableCell>Tipo</TableCell>
                                    <TableCell>Provincia</TableCell>
                                    <TableCell>Acciones</TableCell>
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
                        <CentroForm centro={centroActual} setCentro={setCentroActual} nivelesSeleccionados={nivelesSeleccionadosForm}
                            setNivelesSeleccionados={setNivelesSeleccionadosForm} />
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