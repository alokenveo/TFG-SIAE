import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Typography, Box, Toolbar, Button, Table, TableBody, TableCell, Select,
    MenuItem, InputLabel, FormControl, TableContainer, TableHead, TableRow,
    Paper, CircularProgress, Grid, Modal, Fade, Backdrop
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import NotaForm from '../components/NotaForm';
import alumnoService from '../api/alumnoService';
import notaService from '../api/notaService';
import matriculaService from '../api/matriculaService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const modalStyle = {
    position: 'absolute',
    top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 600 },
    bgcolor: 'background.paper',
    borderRadius: 3,
    boxShadow: '0 6px 25px rgba(0,0,0,0.2)',
    p: 3
};

const evaluacionesFiltro = ["TODAS", "1ª Evaluación", "2ª Evaluación", "3ª Evaluación"];

function HistorialAlumno() {
    const { alumnoId } = useParams();
    const navigate = useNavigate();
    const [alumno, setAlumno] = useState(null);
    const [matriculas, setMatriculas] = useState([]);
    const [matriculaSeleccionada, setMatriculaSeleccionada] = useState(null);
    const [notas, setNotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState('');
    const [availableYears, setAvailableYears] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [nuevaNota, setNuevaNota] = useState({});
    const [selectedEvaluacion, setSelectedEvaluacion] = useState('1ª Evaluación');

    // Cargar datos de alumno y matrículas
    const cargarDatos = useCallback(async () => {
        setLoading(true);
        try {
            const [alumnoRes, matriculasRes] = await Promise.all([
                alumnoService.obtenerAlumnoPorId(alumnoId),
                matriculaService.obtenerMatriculasPorAlumno(alumnoId)
            ]);

            const alumnoData = alumnoRes.data;
            const matriculasData = Array.isArray(matriculasRes.data) ? matriculasRes.data : [];

            setAlumno(alumnoData);
            setMatriculas(matriculasData);

            if (matriculasData.length > 0) {
                const ordenadas = [...matriculasData].sort((a, b) => b.anioAcademico - a.anioAcademico);
                setMatriculaSeleccionada(ordenadas[0]);
            }
        } catch (error) {
            console.error("Error al cargar datos del historial:", error);
            alert("Error al cargar el historial del alumno.");
            navigate('/alumnos');
        } finally {
            setLoading(false);
        }
    }, [alumnoId, navigate]);

    useEffect(() => { cargarDatos(); }, [cargarDatos]);

    useEffect(() => {
        if (notas.length > 0) {
            const years = [...new Set(notas.map(n => n.anioAcademico))].sort((a, b) => b - a);
            setAvailableYears(years);
            if (selectedYear === '' || !years.includes(selectedYear)) {
                setSelectedYear(years.length > 0 ? years[0] : '');
            }
        } else {
            setAvailableYears([]);
            setSelectedYear('');
        }
    }, [notas, selectedYear]);

    useEffect(() => {
        const fetchNotas = async () => {
            if (matriculaSeleccionada) {
                try {
                    const res = await notaService.obtenerNotasPorMatricula(matriculaSeleccionada.id);
                    const data = Array.isArray(res.data) ? res.data : [];
                    const sortedData = data.sort((a, b) => a.asignatura.nombre.localeCompare(b.asignatura.nombre));
                    setNotas(sortedData);
                } catch (err) {
                    console.error("Error al cargar notas:", err);
                    setNotas([]);
                }
            } else {
                setNotas([]);
            }
        };
        fetchNotas();
    }, [matriculaSeleccionada]);

    const handleOpen = () => {
        setNuevaNota({
            alumnoId: parseInt(alumnoId, 10),
            anioAcademico: selectedYear || (availableYears.length > 0 ? availableYears[0] : new Date().getFullYear()),
            cursoId: '',
            asignaturaId: '',
            evaluacion: '1ª Evaluación',
            calificacion: null,
        });
        setOpenModal(true);
    };

    const handleClose = () => {
        setOpenModal(false);
        setNuevaNota({});
    };

    const handleSave = async () => {
        try {
            if (!nuevaNota.cursoId || !nuevaNota.asignaturaId || !nuevaNota.evaluacion || nuevaNota.calificacion === null) {
                alert("Por favor, completa todos los campos requeridos.");
                return;
            }

            const dto = {
                ...nuevaNota,
                anioAcademico: parseInt(nuevaNota.anioAcademico, 10),
                calificacion: parseFloat(nuevaNota.calificacion),
                matriculaId: matriculaSeleccionada?.id,
            };
            await notaService.registrarNota(dto);
            handleClose();
            cargarDatos();
        } catch (error) {
            console.error("Error al registrar la nota:", error);
            alert(`Error al guardar: ${error.response?.data?.message || error.message}`);
        }
    };

    async function getBase64FromUrl(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error("Error al cargar imagen para PDF:", error);
            return null;
        }
    }

    const handleDescargarPDF = async () => {
        if (!alumno || !matriculaSeleccionada || notas.length === 0) {
            alert("No hay datos suficientes para generar el PDF.");
            return;
        }

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 14;

        const logoWidth = 30;
        const logoHeight = 40;
        const logoUrl = `${process.env.PUBLIC_URL}/logo-siae.png`;

        const logo = await getBase64FromUrl(logoUrl);
        if (logo) doc.addImage(logo, 'PNG', margin, margin, logoWidth, logoHeight);

        const textStartX = margin + logoWidth + 10;
        let currentY = margin + 5;

        doc.setFontSize(18).setFont('helvetica', 'bold');
        doc.text("Expediente Académico", textStartX, currentY);
        currentY += 10;

        const { anioAcademico, curso, centroEducativo } = matriculaSeleccionada;
        doc.setFontSize(12).setFont('helvetica', 'normal');
        doc.text(`Alumno: ${alumno.nombre} ${alumno.apellidos}`, textStartX, currentY);
        currentY += 6;
        doc.text(`DNI: ${alumno.dni || 'N/A'}`, textStartX, currentY);
        currentY += 8;

        doc.setFont('helvetica', 'bold');
        doc.text(`Informe: ${curso?.nombre || ''} (${anioAcademico})`, textStartX, currentY);
        currentY += 6;
        doc.setFont('helvetica', 'normal');
        doc.text(`Centro: ${centroEducativo?.nombre || getCentroNombre()}`, textStartX, currentY);

        const logoBottom = margin + logoHeight;
        const textBottom = currentY;
        let startY = Math.max(logoBottom, textBottom) + 15;

        const evaluaciones = ['1ª Evaluación', '2ª Evaluación', '3ª Evaluación'];
        const tableColumn = ["Asignatura", "Calificación"];
        let overallTotal = 0;
        let overallCount = 0;

        evaluaciones.forEach((evalName) => {
            const evalNotas = notas.filter(n => n.evaluacion === evalName);
            if (evalNotas.length === 0) return;

            if (startY > pageHeight - 50) {
                doc.addPage();
                startY = margin;
            }

            doc.setFontSize(13).setFont('helvetica', 'bold');
            doc.text(evalName, margin, startY);
            startY += 4;

            const tableRows = [];
            let evalTotal = 0;
            let evalCount = 0;

            const sortedEvalNotas = [...evalNotas].sort((a, b) => a.asignatura.nombre.localeCompare(b.asignatura.nombre));

            sortedEvalNotas.forEach(nota => {
                const notaData = [nota.asignatura.nombre, nota.calificacion.toFixed(2)];
                tableRows.push(notaData);
                evalTotal += nota.calificacion;
                evalCount++;
            });

            if (evalCount > 0) {
                const evalAverage = (evalTotal / evalCount).toFixed(2);
                tableRows.push(['Promedio', evalAverage]);
                overallTotal += evalTotal;
                overallCount += evalCount;
            }

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY,
                theme: 'grid',
                headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255], fontStyle: 'bold' },
                columnStyles: { 1: { halign: 'right', cellWidth: 30 } },
                margin: { left: margin, right: margin },
            });

            startY = doc.lastAutoTable.finalY + 15;
        });

        if (startY > pageHeight - 50) {
            doc.addPage();
            startY = margin;
        }

        if (overallCount > 0) {
            const overallAverage = (overallTotal / overallCount).toFixed(2);
            doc.setFontSize(12).setFont('helvetica', 'bold');
            doc.text(`Promedio General: ${overallAverage}`, margin, startY);
        }

        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8).setTextColor(150);

        for (let i = 1; i <= pageCount; i++) {
            const footerText = `Generado por SIAE App el ${new Date().toLocaleDateString('es-ES')}`;
            doc.text(footerText, margin, pageHeight - margin + 5);
            doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - margin + 5, { align: 'right' });
        }

        doc.save(`Expediente_${alumno.apellidos.replace(/ /g, '_')}_${anioAcademico}.pdf`);
    };

    const filteredNotas = notas.filter(n => {
        const yearMatch = selectedYear === '' || n.anioAcademico === selectedYear;
        const evalMatch = selectedEvaluacion === 'TODAS' || n.evaluacion === selectedEvaluacion;
        return yearMatch && evalMatch;
    });

    const handleEvaluacionChange = (event) => setSelectedEvaluacion(event.target.value);

    const getCentroNombre = () => alumno?.matriculas?.[0]?.centroEducativo?.nombre || 'Sin centro asociado';

    const getCursosDelAlumno = () => {
        if (!alumno || !alumno.matriculas) return [];
        const cursosMap = new Map();
        alumno.matriculas.forEach(m => m.curso && cursosMap.set(m.curso.id, m.curso));
        return Array.from(cursosMap.values());
    };

    if (loading && !alumno) return <Box sx={{ textAlign: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
            <Toolbar />
            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Grid item>
                    <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/alumnos')}>
                        Volver a Alumnos
                    </Button>
                </Grid>
                <Grid item xs>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#003366' }}>
                        Historial de: {alumno.nombre} {alumno.apellidos}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                        Centro: {getCentroNombre()}
                    </Typography>
                </Grid>
            </Grid>

            <Paper sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: '0 4px 10px rgba(0,0,0,0.08)' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel>Matrícula</InputLabel>
                            <Select
                                value={matriculaSeleccionada ? matriculaSeleccionada.id : ''}
                                onChange={(e) => {
                                    const seleccionada = matriculas.find(m => m.id === e.target.value);
                                    setMatriculaSeleccionada(seleccionada);
                                }}
                                label="Matrícula"
                            >
                                {matriculas.map(m => (
                                    <MenuItem key={m.id} value={m.id}>
                                        {m.anioAcademico} - {m.curso?.nombre} ({m.centroEducativo?.nombre})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <FormControl fullWidth>
                            <InputLabel>Evaluación</InputLabel>
                            <Select value={selectedEvaluacion} onChange={handleEvaluacionChange} label="Evaluación">
                                {evaluacionesFiltro.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs />
                    <Grid item>
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={handleDescargarPDF}
                            sx={{ mr: 2 }}
                            disabled={notas.length === 0}
                        >
                            Descargar PDF
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleOpen}
                            sx={{
                                background: 'linear-gradient(90deg,#00579b,#00897b)',
                                '&:hover': { background: 'linear-gradient(90deg,#004b85,#00796b)' }
                            }}
                        >
                            Registrar Nota
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <AnimatePresence>
                <motion.div key="tabla" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                    <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                        <TableContainer>
                            <Table>
                                <TableHead sx={{ background: 'rgba(0,87,155,0.1)' }}>
                                    <TableRow>
                                        <TableCell><strong>Curso</strong></TableCell>
                                        <TableCell><strong>Asignatura</strong></TableCell>
                                        <TableCell><strong>Evaluación</strong></TableCell>
                                        <TableCell><strong>Calificación</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredNotas.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">No hay notas registradas para este año.</TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredNotas.map((nota) => (
                                            <TableRow key={nota.id} hover sx={{ '&:hover': { background: 'rgba(0,137,123,0.06)' } }}>
                                                <TableCell>{nota.curso.nombre}</TableCell>
                                                <TableCell>{nota.asignatura.nombre}</TableCell>
                                                <TableCell>{nota.evaluacion}</TableCell>
                                                <TableCell>{nota.calificacion}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </motion.div>
            </AnimatePresence>

            <Modal open={openModal} onClose={handleClose} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 300 }}>
                <Fade in={openModal}>
                    <Box sx={modalStyle}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            Registrar Nueva Nota para {alumno?.nombre}
                        </Typography>
                        <NotaForm nota={nuevaNota} setNota={setNuevaNota} cursosDelAlumno={getCursosDelAlumno()} />
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button onClick={handleClose}>Cancelar</Button>
                            <Button variant="contained" onClick={handleSave}>Guardar</Button>
                        </Box>
                    </Box>
                </Fade>
            </Modal>
        </motion.div>
    );
}

export default HistorialAlumno;