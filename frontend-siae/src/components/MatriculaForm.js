import React, { useState, useEffect } from 'react';
import { TextField, MenuItem, Box, CircularProgress, Grid, Autocomplete } from '@mui/material';
import alumnoService from '../api/alumnoService';
import centroService from '../api/centroService';
import ofertaEducativaService from '../api/ofertaEducativaService';
import { useAuth } from '../context/AuthContext';

// Lista fija de provincias
const PROVINCIAS = [
    'ANNOBON', 'BIOKO_NORTE', 'BIOKO_SUR', 'CENTRO_SUR', 'DJIBLOHO', 'KIE_NTEM', 'LITORAL', 'WELE_NZAS'
];

function MatriculaForm({ matricula, setMatricula }) {
    const { usuario } = useAuth();
    // Estado para las listas de los selectores
    const [listas, setListas] = useState({
        centrosPorProvincia: [],
        niveles: [],
        cursos: [],
    });
    // Estado para las cargas
    const [loading, setLoading] = useState({
        dniLoading: false,
        centrosLoading: false,
        niveles: true,
        cursos: false, // Cursos solo carga después de seleccionar nivel
    });

    const [dni, setDni] = useState('');
    const [alumnoEncontrado, setAlumnoEncontrado] = useState(null);
    const [provincia, setProvincia] = useState('');

    // 1. Cargar datos iniciales (alumnos, centros, niveles) al montar el form
    useEffect(() => {
        async function loadInitialData() {
            setLoading(prev => ({ ...prev, niveles: true }));
            try {
                // Ya no cargamos alumnos ni todos los centros
                const nivelesRes = await ofertaEducativaService.obtenerNiveles();
                setListas(prev => ({
                    ...prev,
                    centrosPorProvincia: [],
                    niveles: Array.isArray(nivelesRes.data) ? nivelesRes.data : [],
                    cursos: [],
                }));

            } catch (error) {
                console.error("Error al cargar datos iniciales del formulario:", error);
            } finally {
                setLoading(prev => ({ ...prev, niveles: false }));
            }
        }
        if (usuario) {
            loadInitialData();
        }
    }, [usuario]);

    const handleBuscarDni = async () => {
        if (!dni) return;
        setLoading(prev => ({ ...prev, dniLoading: true }));
        setAlumnoEncontrado(null);
        setMatricula({ ...matricula, alumnoId: '' });
        try {
            // Usamos el servicio de alumno para buscar por DNI
            const response = await alumnoService.obtenerAlumnoPorDNI(dni);
            const alumno = response.data;
            if (alumno) {
                setAlumnoEncontrado(alumno);
                setMatricula(prev => ({ ...prev, alumnoId: alumno.id }));
            }
        } catch (error) {
            console.error("Error al buscar alumno por DNI:", error);
            setAlumnoEncontrado({ error: 'Error al buscar. Verifique el DNI o si el alumno existe.' });
        } finally {
            setLoading(prev => ({ ...prev, dniLoading: false }));
        }
    };

    // 3. Manejador para cuando cambia la provincia
    const handleProvinciaChange = async (event) => {
        const nuevaProvincia = event.target.value;
        setProvincia(nuevaProvincia);

        // Limpiar centros y selección anterior
        setListas(prev => ({ ...prev, centrosPorProvincia: [] }));
        setMatricula(prev => ({ ...prev, centroEducativoId: '' }));

        if (nuevaProvincia) {
            setLoading(prev => ({ ...prev, centrosLoading: true }));
            try {
                // Usamos el servicio de centro para traer por provincia
                const response = await centroService.obtenerCentrosPorProvincia(nuevaProvincia);
                setListas(prev => ({
                    ...prev,
                    centrosPorProvincia: Array.isArray(response.data) ? response.data : [],
                }));
            } catch (error) {
                console.error("Error al cargar centros por provincia:", error);
                setListas(prev => ({ ...prev, centrosPorProvincia: [] }));
            } finally {
                setLoading(prev => ({ ...prev, centrosLoading: false }));
            }
        }
    };

    // 4. Manejador para el Autocomplete de Centro
    const handleCentroChange = (event, newValue) => {
        setMatricula(prev => ({ ...prev, centroEducativoId: newValue ? newValue.id : '' }));
    };

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

            {/* --- CAMPO DNI --- */}
            <TextField
                fullWidth margin="normal" label="DNI del Alumno"
                name="dni" value={dni}
                onChange={(e) => setDni(e.target.value)}
                onBlur={handleBuscarDni} // Busca al salir del campo
                required
                InputProps={{
                    endAdornment: (
                        <React.Fragment>
                            {loading.dniLoading && <CircularProgress size={20} />}
                        </React.Fragment>
                    ),
                }}
            />
            {/* Mensaje de confirmación de alumno */}
            {alumnoEncontrado && (
                <Box sx={{ mb: 1, p: 1, borderRadius: 1, bgcolor: alumnoEncontrado.error ? '#ffebee' : '#e8f5e9', color: alumnoEncontrado.error ? 'red' : 'green' }}>
                    {alumnoEncontrado.error
                        ? alumnoEncontrado.error
                        : `Alumno: ${alumnoEncontrado.nombre} ${alumnoEncontrado.apellidos}`
                    }
                </Box>
            )}

            {/* --- SELECTORES PROVINCIA Y CENTRO --- */}
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        select fullWidth margin="normal" label="Provincia"
                        value={provincia}
                        onChange={handleProvinciaChange} required
                    >
                        <MenuItem value=""><em>Seleccione provincia</em></MenuItem>
                        {PROVINCIAS.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                    </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Autocomplete
                        options={listas.centrosPorProvincia}
                        getOptionLabel={(option) => option.nombre || ''}
                        onChange={handleCentroChange}
                        loading={loading.centrosLoading}
                        disabled={!provincia || loading.centrosLoading}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Centro Educativo"
                                margin="normal"
                                required
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <React.Fragment>
                                            {loading.centrosLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </React.Fragment>
                                    ),
                                }}
                            />
                        )}
                    />
                </Grid>
            </Grid>

            {/* --- SELECTORES NIVEL Y CURSO --- */}
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