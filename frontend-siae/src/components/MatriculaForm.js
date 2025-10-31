import React, { useState, useEffect } from 'react';
import {
    TextField, MenuItem, Box, CircularProgress, Grid,
    Autocomplete, Typography, Select, InputLabel, FormControl
} from '@mui/material';
import alumnoService from '../api/alumnoService';
import centroService from '../api/centroService';
import ofertaEducativaService from '../api/ofertaEducativaService';
import { useAuth } from '../context/AuthContext';

const PROVINCIAS = [
    'ANNOBON', 'BIOKO_NORTE', 'BIOKO_SUR', 'CENTRO_SUR', 'DJIBLOHO', 'KIE_NTEM', 'LITORAL', 'WELE_NZAS'
];

function MatriculaForm({ matricula, setMatricula }) {
    const { usuario } = useAuth();
    const isGestor = usuario?.rol === 'GESTOR';

    const [listas, setListas] = useState({
        provincias: [],
        centrosPorProvincia: [],
        nivelesDisponiblesCentro: [],
        cursosPorNivel: [],
    });
    const [loading, setLoading] = useState({
        provincias: !isGestor,
        centrosLoading: false,
        nivelesLoading: false,
        cursosLoading: false,
        dniLoading: false
    });

    const [selectedProvincia, setSelectedProvincia] = useState(
        isGestor ? (usuario.centro?.provincia || '') : (matricula.provincia || '')
    );
    const [selectedCentro, setSelectedCentro] = useState(
        isGestor ? usuario.centro : null
    );

    // --- NUEVOS ESTADOS PARA EL DNI ---
    const [dni, setDni] = useState('');
    const [alumnoEncontrado, setAlumnoEncontrado] = useState(null);

    // --- Buscar alumno por DNI ---
    const handleBuscarDni = async () => {
        if (!dni) return;
        setLoading(prev => ({ ...prev, dniLoading: true }));
        setAlumnoEncontrado(null);
        setMatricula(prev => ({ ...prev, alumnoId: '' }));

        try {
            const response = await alumnoService.obtenerAlumnoPorDNI(dni);
            const alumno = response.data;
            if (alumno) {
                setAlumnoEncontrado(alumno);
                setMatricula(prev => ({
                    ...prev,
                    alumnoId: alumno.id,
                    alumnoDni: alumno.dni
                }));
            }
        } catch (error) {
            console.error("Error al buscar alumno por DNI:", error);
            setAlumnoEncontrado({ error: 'No se encontró el alumno o el DNI es incorrecto.' });
        } finally {
            setLoading(prev => ({ ...prev, dniLoading: false }));
        }
    };

    // --- Cargar provincias ---
    useEffect(() => {
        if (!isGestor) {
            setListas(prev => ({ ...prev, provincias: PROVINCIAS }));
            setLoading(prev => ({ ...prev, provincias: false }));
        } else {
            setSelectedProvincia(usuario.centro?.provincia || '');
        }
    }, [isGestor, usuario]);

    // --- Cargar centros por provincia ---
    useEffect(() => {
        if (isGestor || !selectedProvincia) {
            const centroGestor = isGestor ? usuario.centro : null;
            setListas(prev => ({ ...prev, centrosPorProvincia: centroGestor ? [centroGestor] : [] }));
            setSelectedCentro(centroGestor);
            setMatricula(prev => ({ ...prev, centroEducativoId: centroGestor?.id || '' }));
            return;
        }

        setLoading(prev => ({ ...prev, centrosLoading: true }));
        setSelectedCentro(null);
        setMatricula(prev => ({ ...prev, centroEducativoId: '' }));
        centroService.obtenerCentrosPorProvincia(selectedProvincia)
            .then(response => {
                setListas(prev => ({ ...prev, centrosPorProvincia: Array.isArray(response.data) ? response.data : [] }));
            })
            .catch(error => {
                console.error("Error cargando centros:", error);
                setListas(prev => ({ ...prev, centrosPorProvincia: [] }));
            })
            .finally(() => setLoading(prev => ({ ...prev, centrosLoading: false })));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProvincia, isGestor]);

    useEffect(() => {
        const centroId = selectedCentro?.id || (isGestor ? usuario.centro?.id : null);

        if (!centroId) {
            setListas(prev => ({ ...prev, nivelesDisponiblesCentro: [], cursosPorNivel: [] }));
            setMatricula(prev => ({ ...prev, nivelId: '', cursoId: '' }));
            setLoading(prev => ({ ...prev, nivelesLoading: false, cursosLoading: false }));
            return;
        }

        setLoading(prev => ({ ...prev, nivelesLoading: true }));
        setMatricula(prev => ({ ...prev, nivelId: '', cursoId: '' }));
        setListas(prev => ({ ...prev, cursosPorNivel: [] }));
        ofertaEducativaService.obtenerNivelesPorCentro(centroId)
            .then(response => {
                setListas(prev => ({
                    ...prev,
                    nivelesDisponiblesCentro: Array.isArray(response.data) ? response.data : []
                }));
            })
            .catch(error => {
                console.error("Error cargando niveles por centro:", error);
                setListas(prev => ({ ...prev, nivelesDisponiblesCentro: [] }));
            })
            .finally(() => setLoading(prev => ({ ...prev, nivelesLoading: false })));

    }, [selectedCentro, isGestor, usuario.centro?.id, setMatricula]);

    const handleNivelChange = async (event) => {
        const nivelId = event.target.value;
        setMatricula(prev => ({ ...prev, nivelId, cursoId: '' }));
        setListas(prev => ({ ...prev, cursosPorNivel: [] }));
        if (!nivelId) {
            setLoading(prev => ({ ...prev, cursosLoading: false }));
            return;
        }
        setLoading(prev => ({ ...prev, cursosLoading: true }));
        try {
            const response = await ofertaEducativaService.obtenerCursosPorNivel(nivelId);
            setListas(prev => ({ ...prev, cursosPorNivel: Array.isArray(response.data) ? response.data : [] }));
        } catch (error) {
            console.error("Error al cargar cursos por nivel:", error);
            setListas(prev => ({ ...prev, cursosPorNivel: [] }));
        } finally {
            setLoading(prev => ({ ...prev, cursosLoading: false }));
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setMatricula(prev => ({ ...prev, [name]: value }));
    };
    const handleProvinciaChange = (event) => {
        setSelectedProvincia(event.target.value);
        setSelectedCentro(null);
        setMatricula(prev => ({ ...prev, centroEducativoId: '' }));
    };
    const handleCentroChange = (event, newValue) => {
        setSelectedCentro(newValue);
        setMatricula(prev => ({ ...prev, centroEducativoId: newValue ? newValue.id : '' }));
    };

    return (
        <Box component="form" noValidate autoComplete="off">
            <Typography variant="subtitle1" gutterBottom>Datos del Alumno</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                    <TextField
                        fullWidth
                        margin="dense"
                        label="DNI"
                        name="dni"
                        value={dni}
                        onChange={(e) => setDni(e.target.value)}
                        onBlur={handleBuscarDni}
                        required
                        inputProps={{ maxLength: 9 }}
                        InputProps={{
                            endAdornment: (
                                <>
                                    {loading.dniLoading && <CircularProgress size={20} />}
                                </>
                            ),
                        }}
                    />
                </Grid>
            </Grid>

            {alumnoEncontrado && (
                <Box sx={{
                    mb: 1, p: 1, borderRadius: 1,
                    bgcolor: alumnoEncontrado.error ? '#ffebee' : '#e8f5e9',
                    color: alumnoEncontrado.error ? 'red' : 'green'
                }}>
                    {alumnoEncontrado.error
                        ? alumnoEncontrado.error
                        : `Alumno: ${alumnoEncontrado.nombre} ${alumnoEncontrado.apellidos}`}
                </Box>
            )}

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>Datos de Matrícula</Typography>

            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="dense" disabled={isGestor || loading.provincias}>
                        <InputLabel id="provincia-select-label">Provincia</InputLabel>
                        <Select
                            labelId="provincia-select-label"
                            value={selectedProvincia}
                            label="Provincia"
                            onChange={handleProvinciaChange}
                            required={!isGestor}
                        >
                            <MenuItem value="" disabled={isGestor}>
                                <em>{isGestor ? (usuario.centro?.provincia || 'N/A') : 'Selecciona Provincia'}</em>
                            </MenuItem>
                            {!isGestor && listas.provincias.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                    {isGestor ? (
                        <TextField label="Centro Educativo" value={usuario.centro?.nombre || 'N/A'} disabled fullWidth margin="dense" />
                    ) : (
                        <Autocomplete
                            options={listas.centrosPorProvincia}
                            getOptionLabel={(option) => option.nombre || ''}
                            value={selectedCentro}
                            onChange={handleCentroChange}
                            isOptionEqualToValue={(option, value) => option.id === value?.id}
                            loading={loading.centrosLoading}
                            disabled={!selectedProvincia || loading.centrosLoading}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Centro Educativo"
                                    required
                                    margin="dense"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {loading.centrosLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                        />
                    )}
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField select fullWidth margin="dense" label="Nivel Educativo"
                        name="nivelId"
                        value={matricula.nivelId || ''}
                        onChange={handleNivelChange}
                        required
                        disabled={loading.nivelesLoading || !(selectedCentro || (isGestor && usuario.centro))}
                    >
                        <MenuItem value=""><em>Selecciona Nivel</em></MenuItem>
                        {listas.nivelesDisponiblesCentro.map(n => <MenuItem key={n.id} value={n.id}>{n.nombre}</MenuItem>)}
                    </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField select fullWidth margin="dense" label="Curso"
                        name="cursoId" value={matricula.cursoId || ''}
                        onChange={handleChange} required
                        disabled={loading.cursosLoading || !matricula.nivelId}
                    >
                        <MenuItem value=""><em>Selecciona Curso</em></MenuItem>
                        {loading.cursosLoading
                            ? <MenuItem disabled><CircularProgress size={20} /></MenuItem>
                            : listas.cursosPorNivel.map(c => <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>)}
                    </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField fullWidth margin="dense" label="Año Académico" name="anioAcademico" type="number"
                        value={matricula.anioAcademico || ''} onChange={handleChange} required placeholder="Ej: 2024" />
                </Grid>
            </Grid>
        </Box>
    );
}

export default MatriculaForm;