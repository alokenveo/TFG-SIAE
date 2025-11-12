import React, { useState, useEffect } from 'react';
import {
  TextField, MenuItem, Box, CircularProgress, Grid, Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import ofertaEducativaService from '../api/ofertaEducativaService';

const evaluaciones = ["1ª Evaluación", "2ª Evaluación", "3ª Evaluación"];

function NotaForm({ nota, setNota, cursosDelAlumno }) {
  const [asignaturas, setAsignaturas] = useState([]);
  const [loadingAsignaturas, setLoadingAsignaturas] = useState(false);

  // --- Cargar asignaturas cuando cambie el curso ---
  useEffect(() => {
    async function cargarAsignaturas() {
      if (!nota.cursoId) {
        setAsignaturas([]);
        return;
      }
      setLoadingAsignaturas(true);
      try {
        const response = await ofertaEducativaService.obtenerAsignaturasPorCurso(nota.cursoId);
        setAsignaturas(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error al cargar asignaturas:", error);
        setAsignaturas([]);
      } finally {
        setLoadingAsignaturas(false);
      }
    }
    cargarAsignaturas();
  }, [nota.cursoId]);

  // --- Manejadores ---
  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'calificacion') {
      const numValue = value === '' ? null : parseFloat(value);
      if (value === '' || (!isNaN(numValue) && numValue >= 0 && numValue <= 10)) {
        setNota({ ...nota, [name]: numValue });
      }
    } else {
      setNota({ ...nota, [name]: value });
    }
  };

  const handleCursoChange = (event) => {
    const { name, value } = event.target;
    setNota({ ...nota, [name]: value, asignaturaId: '' });
  };

  // --- UI ---
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Box component="form" noValidate autoComplete="off">
        <Typography variant="subtitle1" gutterBottom>
          Datos Académicos
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              margin="normal"
              label="Curso"
              name="cursoId"
              value={nota.cursoId || ''}
              onChange={handleCursoChange}
              required
              disabled={!cursosDelAlumno || cursosDelAlumno.length === 0}
            >
              {cursosDelAlumno && cursosDelAlumno.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              margin="normal"
              label="Asignatura"
              name="asignaturaId"
              value={nota.asignaturaId || ''}
              onChange={handleChange}
              required
              disabled={loadingAsignaturas || !nota.cursoId}
            >
              {loadingAsignaturas ? (
                <MenuItem disabled><CircularProgress size={20} /></MenuItem>
              ) : (
                asignaturas.map(a => <MenuItem key={a.id} value={a.id}>{a.nombre}</MenuItem>)
              )}
            </TextField>
          </Grid>
        </Grid>

        <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
          Evaluación y Calificación
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              margin="normal"
              label="Año Académico"
              name="anioAcademico"
              type="number"
              value={nota.anioAcademico || ''}
              onChange={handleChange}
              required
              placeholder="Ej: 2024"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              margin="normal"
              label="Evaluación"
              name="evaluacion"
              value={nota.evaluacion || ''}
              onChange={handleChange}
              required
            >
              {evaluaciones.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
            </TextField>
          </Grid>
        </Grid>

        <TextField
          fullWidth
          margin="normal"
          label="Calificación (0-10)"
          name="calificacion"
          type="number"
          value={nota.calificacion ?? ''}
          onChange={handleChange}
          required
          inputProps={{ step: "0.1", min: "0", max: "10" }}
        />
      </Box>
    </motion.div>
  );
}

export default NotaForm;