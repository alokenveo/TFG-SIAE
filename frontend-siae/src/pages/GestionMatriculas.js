import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Toolbar, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, CircularProgress, Modal, Fade, Backdrop
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import matriculaService from '../api/matriculaService';
import MatriculaForm from '../components/MatriculaForm';

// Estilo para el Modal
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600, // Más ancho para el formulario
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

function GestionMatriculas() {
    const [matriculas, setMatriculas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [nuevaMatricula, setNuevaMatricula] = useState({});

    const cargarMatriculas = async () => {
        setLoading(true);
        try {
            const response = await matriculaService.obtenerMatriculas();
            if (Array.isArray(response.data)) {
                setMatriculas(response.data);
            } else {
                setMatriculas([]);
            }

        } catch (error) {
            console.error("Error al cargar las matrículas:", error);
            setMatriculas([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarMatriculas();
    }, []);

    const handleOpen = () => setOpenModal(true);

    const handleClose = () => {
        setOpenModal(false);
        setNuevaMatricula({}); // Limpiar el formulario
    };

    const handleSave = async () => {
        try {
            // El DTO del backend espera el año como número, lo convertimos
            const dto = {
                ...nuevaMatricula,
                anioAcademico: parseInt(nuevaMatricula.anioAcademico, 10)
            };
            delete dto.nivelId; // Borramos el campo temporal que no va al DTO

            await matriculaService.registrarMatricula(dto);
            handleClose();
            cargarMatriculas(); // Recargar la lista
        } catch (error) {
            console.error("Error al registrar la matrícula:", error);
            // Aquí se podría mostrar un error al usuario
        }
    };

    return (
        <Box>
            <Toolbar />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Gestión de Matrículas</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
                    Nueva Matrícula
                </Button>
            </Box>

            {loading ? (<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>)
                : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead sx={{ backgroundColor: '#e0e0e0' }}>
                                <TableRow>
                                    <TableCell>Alumno</TableCell>
                                    <TableCell>Centro Educativo</TableCell>
                                    <TableCell>Curso</TableCell>
                                    <TableCell>Año Académico</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {matriculas.map((matricula) => (
                                    <TableRow key={matricula.id}>
                                        <TableCell>{matricula.alumno.nombre} {matricula.alumno.apellidos}</TableCell>
                                        <TableCell>{matricula.centroEducativo.nombre}</TableCell>
                                        <TableCell>{matricula.curso.nombre}</TableCell>
                                        <TableCell>{matricula.anioAcademico}</TableCell>
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
                        <Typography variant="h6" component="h2">Registrar Nueva Matrícula</Typography>
                        <MatriculaForm matricula={nuevaMatricula} setMatricula={setNuevaMatricula} />
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

export default GestionMatriculas;