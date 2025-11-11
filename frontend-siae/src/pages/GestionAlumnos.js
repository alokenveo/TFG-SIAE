import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Box, Toolbar, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, CircularProgress,
  Modal, Fade, Backdrop, IconButton, Tooltip, TextField, Grid,
  Select, MenuItem, InputLabel, FormControl, TablePagination,
  Snackbar, Alert
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AssessmentIcon from '@mui/icons-material/Assessment';
import alumnoService from '../api/alumnoService';
import AlumnoForm from '../components/AlumnoForm';
import { useAuth } from '../context/AuthContext';
import useDebounce from '../hooks/useDebounce';

const sexosFiltro = ["TODOS", "MASCULINO", "FEMENINO"];

const modalStyle = {
  position: 'absolute',
  top: '50%', left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 450,
  bgcolor: 'background.paper',
  borderRadius: 3,
  boxShadow: '0 6px 25px rgba(0,0,0,0.2)',
  p: 3
};

function GestionAlumnos() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [filtroSearch, setFiltroSearch] = useState('');
  const [filtroSexo, setFiltroSexo] = useState('TODOS');
  const [filtroAnioInicio, setFiltroAnioInicio] = useState('');
  const [filtroAnioFin, setFiltroAnioFin] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [alumnoActual, setAlumnoActual] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const debouncedSearch = useDebounce(filtroSearch, 500);
  const debouncedSexo = useDebounce(filtroSexo, 500);
  const debouncedAnioInicio = useDebounce(filtroAnioInicio, 500);
  const debouncedAnioFin = useDebounce(filtroAnioFin, 500);

  useEffect(() => {
    const fetchAlumnos = async () => {
      setLoading(true);
      try {
        const response = await alumnoService.obtenerTodosLosAlumnos(
          page, rowsPerPage, debouncedSearch, debouncedSexo, debouncedAnioInicio, debouncedAnioFin
        );
        setAlumnos(response.data.content);
        setTotalElements(response.data.totalElements);
      } catch (error) {
        console.error("Error al cargar alumnos:", error);
      }
      setLoading(false);
    };
    fetchAlumnos();
  }, [page, rowsPerPage, debouncedSearch, debouncedSexo, debouncedAnioInicio, debouncedAnioFin]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpen = () => {
    setAlumnoActual({});
    setIsEditMode(false);
    setOpenModal(true);
  };
  const handleOpenEdit = (alumno) => {
    setAlumnoActual(alumno);
    setIsEditMode(true);
    setOpenModal(true);
  };
  const handleClose = () => setOpenModal(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (isEditMode) {
        await alumnoService.updateAlumno(alumnoActual.id, alumnoActual);
        setSnackbar({ open: true, message: 'Alumno actualizado con éxito.', severity: 'success' });
      } else {
        await alumnoService.createAlumno(alumnoActual);
        setSnackbar({ open: true, message: 'Alumno añadido correctamente.', severity: 'success' });
      }
      handleClose();
      setPage(0);
    } catch (error) {
      console.error("Error al guardar alumno:", error);
      setSnackbar({ open: true, message: 'Error al guardar alumno.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este alumno?')) {
      setLoading(true);
      try {
        await alumnoService.deleteAlumno(id);
        setSnackbar({ open: true, message: 'Alumno eliminado.', severity: 'info' });
        setPage(0);
      } catch (error) {
        console.error("Error al eliminar alumno:", error);
        setSnackbar({ open: true, message: 'Error al eliminar.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerHistorial = (alumnoId) => navigate(`/alumnos/${alumnoId}/historial`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <Toolbar />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#003366' }}>
          Gestión de Alumnos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
          sx={{
            background: 'linear-gradient(90deg,#00579b,#00897b)',
            '&:hover': { background: 'linear-gradient(90deg,#004b85,#00796b)' },
            fontWeight: 600
          }}
        >
          Añadir Alumno
        </Button>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: '0 4px 10px rgba(0,0,0,0.08)' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Busca por nombre, apellidos o DNI"
              value={filtroSearch}
              onChange={e => setFiltroSearch(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Sexo</InputLabel>
              <Select value={filtroSexo} label="Sexo" onChange={e => setFiltroSexo(e.target.value)}>
                {sexosFiltro.map(sexo => (
                  <MenuItem key={sexo} value={sexo}>{sexo}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={1.5}>
            <TextField
              fullWidth
              label="Desde"
              type="number"
              value={filtroAnioInicio}
              onChange={e => setFiltroAnioInicio(e.target.value)}
            />
          </Grid>
          <Grid item xs={6} sm={1.5}>
            <TextField
              fullWidth
              label="Hasta"
              type="number"
              value={filtroAnioFin}
              onChange={e => setFiltroAnioFin(e.target.value)}
            />
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <AnimatePresence>
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: 'rgba(0,87,155,0.1)' }}>
                      <TableCell><strong>DNI</strong></TableCell>
                      <TableCell><strong>Nombre</strong></TableCell>
                      <TableCell><strong>Apellidos</strong></TableCell>
                      <TableCell><strong>Sexo</strong></TableCell>
                      <TableCell><strong>Centro</strong></TableCell>
                      <TableCell><strong>Acciones</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {alumnos.map(alumno => (
                      <TableRow
                        key={alumno.id}
                        hover
                        sx={{ transition: 'background 0.2s', '&:hover': { background: 'rgba(0,137,123,0.06)' } }}
                      >
                        <TableCell>{alumno.dni}</TableCell>
                        <TableCell>{alumno.nombre}</TableCell>
                        <TableCell>{alumno.apellidos}</TableCell>
                        <TableCell>{alumno.sexo}</TableCell>
                        <TableCell>{alumno.centroEducativo?.nombre || 'N/A'}</TableCell>
                        <TableCell>
                          {usuario?.rol === 'GESTOR' && (
                            <Tooltip title="Historial">
                              <IconButton onClick={() => handleVerHistorial(alumno.id)}>
                                <AssessmentIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Editar">
                            <IconButton onClick={() => handleOpenEdit(alumno)}>
                              <EditIcon color="primary" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton onClick={() => handleDelete(alumno.id)}>
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
          </motion.div>
        </AnimatePresence>
      )}

      <Modal open={openModal} onClose={handleClose} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 300 }}>
        <Fade in={openModal}>
          <Box sx={modalStyle}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              {isEditMode ? 'Editar Alumno' : 'Añadir Alumno'}
            </Typography>
            <AlumnoForm alumno={alumnoActual} setAlumno={setAlumnoActual} />
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={handleClose}>Cancelar</Button>
              <Button variant="contained" onClick={handleSave}>Guardar</Button>
            </Box>
          </Box>
        </Fade>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </motion.div>
  );
}

export default GestionAlumnos;