import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Typography, Box, Toolbar, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, CircularProgress,
    Modal, Fade, Backdrop, IconButton, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import alumnoService from '../api/alumnoService';
import AlumnoForm from '../components/AlumnoForm';
import AssessmentIcon from '@mui/icons-material/Assessment';

const style = {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4,
};

function GestionAlumnos() {
    const [alumnos, setAlumnos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [alumnoActual, setAlumnoActual] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);
    const navigate = useNavigate();

    const cargarAlumnos = async () => {
        setLoading(true);
        try {
            const response = await alumnoService.obtenerTodosLosAlumnos();
            setAlumnos(response.data || []);
        } catch (error) {
            console.error("Error al cargar los alumnos:", error);
            setAlumnos([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarAlumnos();
    }, []);

    const handleOpenCreate = () => {
        setIsEditMode(false);
        setAlumnoActual({});
        setOpenModal(true);
    };

    const handleOpenEdit = (alumno) => {
        setIsEditMode(true);
        // Formatear la fecha para el input type="date" (YYYY-MM-DD)
        const formattedAlumno = { ...alumno, fechaNacimiento: alumno.fechaNacimiento.split('T')[0] };
        setAlumnoActual(formattedAlumno);
        setOpenModal(true);
    };

    const handleClose = () => {
        setOpenModal(false);
        setAlumnoActual({});
        setIsEditMode(false);
    };

    const handleSave = async () => {
        try {
            if (isEditMode) {
                await alumnoService.editarAlumno(alumnoActual.id, alumnoActual);
            } else {
                await alumnoService.crearAlumno(alumnoActual);
            }
            handleClose();
            cargarAlumnos();
        } catch (error) {
            console.error("Error al guardar el alumno:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este alumno?')) {
            try {
                await alumnoService.eliminarAlumno(id);
                cargarAlumnos();
            } catch (error) {
                console.error("Error al eliminar el alumno:", error);
            }
        }
    };

    const handleVerHistorial = (alumnoId) => {
        navigate(`/alumnos/${alumnoId}/historial`);
    };

    return (
        <Box>
            <Toolbar />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Gestión de Alumnos</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
                    Añadir Alumno
                </Button>
            </Box>

            {loading ? (<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>)
                : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead sx={{ backgroundColor: '#e0e0e0' }}>
                                <TableRow>
                                    <TableCell>Nombre</TableCell>
                                    <TableCell>Apellidos</TableCell>
                                    <TableCell>Fecha de Nacimiento</TableCell>
                                    <TableCell>Sexo</TableCell>
                                    <TableCell sx={{ width: '120px' }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {alumnos.map((alumno) => (
                                    <TableRow key={alumno.id}>
                                        <TableCell>{alumno.nombre}</TableCell>
                                        <TableCell>{alumno.apellidos}</TableCell>
                                        <TableCell>{new Date(alumno.fechaNacimiento).toLocaleDateString()}</TableCell>
                                        <TableCell>{alumno.sexo}</TableCell>
                                        <TableCell>
                                            <Tooltip title="Ver Historial"><IconButton onClick={() => handleVerHistorial(alumno.id)}><AssessmentIcon color="info" /></IconButton></Tooltip>
                                            <Tooltip title="Editar"><IconButton onClick={() => handleOpenEdit(alumno)}><EditIcon /></IconButton></Tooltip>
                                            <Tooltip title="Eliminar"><IconButton onClick={() => handleDelete(alumno.id)}><DeleteIcon color="error" /></IconButton></Tooltip>
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
                        <Typography variant="h6" component="h2">{isEditMode ? 'Editar Alumno' : 'Añadir Nuevo Alumno'}</Typography>
                        <AlumnoForm alumno={alumnoActual} setAlumno={setAlumnoActual} />
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

export default GestionAlumnos;