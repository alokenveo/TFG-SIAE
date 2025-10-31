import React, { useState, useEffect } from 'react';
import { TextField, MenuItem, Box, CircularProgress, Grid } from '@mui/material';
import ofertaEducativaService from '../api/ofertaEducativaService';

const evaluaciones = ["1ª Evaluación", "2ª Evaluación", "3ª Evaluación"];

// Componente Formulario
function NotaForm({ nota, setNota, cursosDelAlumno }) { // Recibe los cursos del alumno como prop
  const [asignaturas, setAsignaturas] = useState([]);
  const [loadingAsignaturas, setLoadingAsignaturas] = useState(false);

  // Cargar asignaturas cuando cambie el curso seleccionado
  useEffect(() => {
    async function cargarAsignaturas() {
      if (!nota.cursoId) {
        setAsignaturas([]); // Limpiar si no hay curso
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
  }, [nota.cursoId]); // Dependencia: cursoId

  // Manejador genérico para campos
  const handleChange = (event) => {
    const { name, value } = event.target;
    // Manejo especial para la calificación (convertir a número o null)
    if (name === 'calificacion') {
      const numValue = value === '' ? null : parseFloat(value);
      // Validar que sea un número entre 0 y 10 (o null)
      if (value === '' || (!isNaN(numValue) && numValue >= 0 && numValue <= 10)) {
        setNota({ ...nota, [name]: numValue });
      }
    } else {
      setNota({ ...nota, [name]: value });
    }
  };

  // Manejador para el cambio de curso (limpia la asignatura)
  const handleCursoChange = (event) => {
    const { name, value } = event.target;
    setNota({ ...nota, [name]: value, asignaturaId: '' }); // Limpia asignaturaId
  };


  return (
    <Box component="form" noValidate autoComplete="off">
      <Grid container spacing={2}>
        <Grid item xs={6}>
          {/* Selector de Curso (usa los cursos donde está matriculado el alumno) */}
          <TextField
            select fullWidth margin="normal" label="Curso"
            name="cursoId" value={nota.cursoId || ''}
            onChange={handleCursoChange}
            required
            disabled={!cursosDelAlumno || cursosDelAlumno.length === 0}
          >
            {cursosDelAlumno && cursosDelAlumno.map(c => (
              <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={6}>
          {/* Selector de Asignatura (dependiente del curso) */}
          <TextField
            select fullWidth margin="normal" label="Asignatura"
            name="asignaturaId" value={nota.asignaturaId || ''}
            onChange={handleChange} required
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

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            fullWidth margin="normal" label="Año Académico" name="anioAcademico" type="number"
            value={nota.anioAcademico || ''} onChange={handleChange} required
            placeholder="Ej: 2024"
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            select fullWidth margin="normal" label="Evaluación"
            name="evaluacion" value={nota.evaluacion || ''}
            onChange={handleChange} required
          >
            {evaluaciones.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
          </TextField>
        </Grid>
      </Grid>

      <TextField
        fullWidth margin="normal" label="Calificación (0-10)" name="calificacion" type="number"
        value={nota.calificacion ?? ''}
        onChange={handleChange} required
        inputProps={{ step: "0.1", min: "0", max: "10" }}
      />
    </Box>
  );
}

export default NotaForm;