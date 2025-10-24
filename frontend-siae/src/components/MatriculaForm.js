import React, { useState, useEffect } from 'react';
import { TextField, MenuItem, Box, CircularProgress, Grid } from '@mui/material';
import alumnoService from '../api/alumnoService';
import centroService from '../api/centroService';
import ofertaEducativaService from '../api/ofertaEducativaService';
import { useAuth } from '../context/AuthContext';

function MatriculaForm({ matricula, setMatricula }) {
    const { usuario } = useAuth();
    const isGestor = usuario?.rol === 'GESTOR';
    // Estado para las listas de los selectores
    const [listas, setListas] = useState({
        alumnos: [],
        centros: [],
        niveles: [],
        cursos: [],
    });
    // Estado para las cargas
    const [loading, setLoading] = useState({
        alumnos: true,
        centros: true,
        niveles: true,
        cursos: false, // Cursos solo carga después de seleccionar nivel
    });

    // 1. Cargar datos iniciales (alumnos, centros, niveles) al montar el form
    useEffect(() => {
        async function loadInitialData() {
            try {
                const [alumnosRes, centrosRes, nivelesRes] = await Promise.all([
                    alumnoService.obtenerAlumnosSinCentro(),
                    centroService.obtenerTodosLosCentros(),
                    ofertaEducativaService.obtenerNiveles(),
                ]);
                setListas(prev => ({
                    ...prev,
                    alumnos: Array.isArray(alumnosRes.data) ? alumnosRes.data : [],
                    centros: Array.isArray(centrosRes.data) ? centrosRes.data : [],
                    niveles: Array.isArray(nivelesRes.data) ? nivelesRes.data : [],
                }));

                if (isGestor && usuario.centro?.id) {
                    setMatricula(prev => ({
                        ...prev,
                        centroEducativoId: usuario.centro.id
                    }));
                }

            } catch (error) {
                console.error("Error al cargar datos iniciales del formulario:", error);
            } finally {
                setLoading(prev => ({ ...prev, alumnos: false, centros: false, niveles: false }));
            }
        }
        if (usuario) {
            loadInitialData();
        }
    }, [usuario]);

    const handleNivelChange = async (nivelId) => {
        setMatricula({ ...matricula, nivelId: nivelId, cursoId: '' });
        setLoading(prev => ({ ...prev, cursos: true }));
        try {
            const response = await ofertaEducativaService.obtenerCursosPorNivel(nivelId);
            setListas(prev => ({ ...prev, cursos: Array.isArray(response.data) ? response.data : [] }));

        } catch (error) {
            console.error("Error al cargar cursos por nivel:", error);
            setListas(prev => ({ ...prev, cursos: [] }));
        } finally {
            setLoading(prev => ({ ...prev, cursos: false }));
        }
    };

    // Manejador genérico para los campos
    const handleChange = (event) => {
        const { name, value } = event.target;
        setMatricula({ ...matricula, [name]: value });
    };

    return (
        <Box component="form" noValidate autoComplete="off">
            <TextField
                select fullWidth margin="normal" label="Alumno"
                name="alumnoId" value={matricula.alumnoId || ''}
                onChange={handleChange} required disabled={loading.alumnos}
            >
                {listas.alumnos.map(a => <MenuItem key={a.id} value={a.id}>{a.nombre} {a.apellidos}</MenuItem>)}
            </TextField>

            <TextField
                select fullWidth margin="normal" label="Centro Educativo"
                name="centroEducativoId" value={matricula.centroEducativoId || ''}
                onChange={handleChange} required disabled={loading.centros || isGestor}
            >
                {listas.centros.map(c => <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>)}
            </TextField>

            {/* Selectores dinámicos */}
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <TextField
                        select fullWidth margin="normal" label="Nivel Educativo"
                        value={matricula.nivelId || ''} // Este es un estado temporal para el form
                        onChange={(e) => handleNivelChange(e.target.value)} required disabled={loading.niveles}
                    >
                        {listas.niveles.map(n => <MenuItem key={n.id} value={n.id}>{n.nombre}</MenuItem>)}
                    </TextField>
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        select fullWidth margin="normal" label="Curso"
                        name="cursoId" value={matricula.cursoId || ''}
                        onChange={handleChange} required
                        disabled={loading.cursos || !matricula.nivelId} // Deshabilitado si no hay nivel
                    >
                        {loading.cursos ? (
                            <MenuItem disabled><CircularProgress size={20} /></MenuItem>
                        ) : (
                            listas.cursos.map(c => <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>)
                        )}
                    </TextField>
                </Grid>
            </Grid>

            <TextField
                fullWidth margin="normal" label="Año Académico" name="anioAcademico"
                value={matricula.anioAcademico || ''} onChange={handleChange} required
                placeholder="Ej: 2024-2025"
            />
        </Box>
    );
}

export default MatriculaForm;