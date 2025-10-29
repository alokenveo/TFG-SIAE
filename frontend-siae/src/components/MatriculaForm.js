import React, { useState, useEffect } from 'react';
import {
    TextField, MenuItem, Box, CircularProgress, Grid,
    Autocomplete, Typography, Select, InputLabel, FormControl // Imports necesarios
} from '@mui/material';
import centroService from '../api/centroService';
import ofertaEducativaService from '../api/ofertaEducativaService';
import { useAuth } from '../context/AuthContext'; // Asegúrate que la ruta a AuthContext es correcta

// Lista fija de provincias (ya la tenías)
const PROVINCIAS = [
    'ANNOBON', 'BIOKO_NORTE', 'BIOKO_SUR', 'CENTRO_SUR', 'DJIBLOHO', 'KIE_NTEM', 'LITORAL', 'WELE_NZAS'
];

function MatriculaForm({ matricula, setMatricula }) {
    const { usuario } = useAuth();
    const isGestor = usuario?.rol === 'GESTOR';

    // --- Estados (Mantenemos tu estructura original y añadimos/modificamos) ---
    const [listas, setListas] = useState({
        // alumnos: [], // Eliminamos alumnos
        // centros: [], // Eliminamos centros (se maneja diferente ahora)
        provincias: [], // Añadimos provincias
        centrosPorProvincia: [], // Añadimos centros filtrados
        nivelesDisponiblesCentro: [], // <<< MODIFICACIÓN: Niveles filtrados por centro
        cursosPorNivel: [], // Renombrado de 'cursos'
    });
    const [loading, setLoading] = useState({
        // alumnos: true, // Eliminado
        // centros: true, // Eliminado
        provincias: !isGestor, // Añadido
        centrosLoading: false, // Añadido (era centros)
        nivelesLoading: false, // <<< MODIFICACIÓN: Ya no carga al inicio (era niveles)
        cursosLoading: false, // Renombrado de 'cursos'
    });

    // Estados para controlar los selectores dependientes (Provincia/Centro)
    const [selectedProvincia, setSelectedProvincia] = useState(
        isGestor ? (usuario.centro?.provincia || '') : (matricula.provincia || '')
    );
    const [selectedCentro, setSelectedCentro] = useState(
        isGestor ? usuario.centro : null
    );
    // --- Fin Estados ---

    // --- Cargar Provincias (Admin) ---
    useEffect(() => {
        if (!isGestor) {
            setLoading(prev => ({ ...prev, provincias: true }));
            centroService.obtenerProvincias()
                .then(response => {
                    setListas(prev => ({ ...prev, provincias: Array.isArray(response.data) ? response.data : [] }));
                })
                .catch(error => console.error("Error cargando provincias:", error))
                .finally(() => setLoading(prev => ({ ...prev, provincias: false })));
        } else {
             // Para gestor, pre-rellena provincia si existe
            setSelectedProvincia(usuario.centro?.provincia || '');
        }
    }, [isGestor, usuario]); // Depende de isGestor

    // --- Cargar Centros por Provincia (Admin) ---
    useEffect(() => {
        if (isGestor || !selectedProvincia) {
            const centroGestor = isGestor ? usuario.centro : null;
            setListas(prev => ({ ...prev, centrosPorProvincia: centroGestor ? [centroGestor] : [] }));
            setSelectedCentro(centroGestor);
            // Asegura ID en el estado principal 'matricula'
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
    }, [selectedProvincia, isGestor]); // Depende de la provincia

    // --- <<< NUEVO useEffect: Cargar Niveles cuando cambia el Centro Seleccionado >>> ---
    useEffect(() => {
        // Obtenemos el ID del centro, ya sea del Autocomplete (Admin) o del usuario (Gestor)
        const centroId = selectedCentro?.id || (isGestor ? usuario.centro?.id : null);

        // Si no hay centroId, limpiamos los niveles y lo que depende de ellos
        if (!centroId) {
            setListas(prev => ({ ...prev, nivelesDisponiblesCentro: [], cursosPorNivel: [] }));
            setMatricula(prev => ({ ...prev, nivelId: '', cursoId: '' }));
            setLoading(prev => ({ ...prev, nivelesLoading: false, cursosLoading: false })); // Parar cargas si las hubiera
            return;
        }

        // Hay centroId, procedemos a cargar los niveles asociados
        setLoading(prev => ({ ...prev, nivelesLoading: true }));
        setMatricula(prev => ({ ...prev, nivelId: '', cursoId: '' })); // Limpiar nivel/curso previos
        setListas(prev => ({ ...prev, cursosPorNivel: [] })); // Limpiar cursos previos
        ofertaEducativaService.obtenerNivelesPorCentro(centroId) // <--- LLAMADA FILTRADA
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

    // Dependencias: el objeto centro seleccionado o si el usuario gestor cambia
    }, [selectedCentro, isGestor, usuario.centro?.id, setMatricula]);
    // --- <<< FIN NUEVO useEffect >>> ---


    // --- Cargar Cursos por Nivel (Sin cambios en la lógica interna) ---
    const handleNivelChange = async (event) => {
        const nivelId = event.target.value;
        setMatricula(prev => ({ ...prev, nivelId: nivelId, cursoId: '' })); // Guarda nivelId temporal y limpia cursoId
        setListas(prev => ({ ...prev, cursosPorNivel: [] })); // Limpia lista de cursos anterior
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

    // --- Manejadores (handleChange, handleCentroChange sin cambios funcionales) ---
    const handleChange = (event) => {
        const { name, value } = event.target;
        setMatricula(prev => ({ ...prev, [name]: value }));
    };
    const handleProvinciaChange = (event) => { // Manejador para provincia
        setSelectedProvincia(event.target.value);
        setSelectedCentro(null); // Limpia centro al cambiar provincia
        setMatricula(prev => ({ ...prev, centroEducativoId: '' }));
    };
    const handleCentroChange = (event, newValue) => { // Manejador para Autocomplete
        setSelectedCentro(newValue);
        // El useEffect que carga niveles se activará automáticamente
        // Actualizamos el ID en matricula por si acaso, aunque el useEffect de niveles lo usa de selectedCentro
        setMatricula(prev => ({ ...prev, centroEducativoId: newValue ? newValue.id : '' }));
    };


    return (
        <Box component="form" noValidate autoComplete="off">
            {/* --- Datos Alumno (DNI, Nombre, Apellidos) - Sin cambios --- */}
            <Typography variant="subtitle1" gutterBottom>Datos del Alumno</Typography>
            <Grid container spacing={2}>
                 <Grid item xs={12} sm={4}> <TextField fullWidth margin="dense" label="DNI" name="alumnoDni" value={matricula.alumnoDni || ''} onChange={handleChange} required inputProps={{ maxLength: 9 }} /> </Grid>
                 {/* <Grid item xs={12} sm={4}> <TextField fullWidth margin="dense" label="Nombre Alumno" name="alumnoNombre" value={matricula.alumnoNombre || ''} onChange={handleChange} /> </Grid> */}
                 {/* <Grid item xs={12} sm={4}> <TextField fullWidth margin="dense" label="Apellidos Alumno" name="alumnoApellidos" value={matricula.alumnoApellidos || ''} onChange={handleChange} /> </Grid> */}
            </Grid>

             <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>Datos de Matrícula</Typography>

            <Grid container spacing={2}>
                {/* --- Provincia y Centro (Lógica Admin/Gestor sin cambios) --- */}
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
                            <MenuItem value="" disabled={isGestor}> <em>{isGestor ? (usuario.centro?.provincia || 'N/A') : 'Selecciona Provincia'}</em> </MenuItem>
                            {!isGestor && listas.provincias.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    {isGestor ? (
                         <TextField label="Centro Educativo" value={usuario.centro?.nombre || 'N/A'} disabled fullWidth margin="dense"/>
                    ) : (
                        <Autocomplete
                            options={listas.centrosPorProvincia} // Usa la lista del estado 'listas'
                            getOptionLabel={(option) => option.nombre || ''}
                            value={selectedCentro}
                            onChange={handleCentroChange}
                            isOptionEqualToValue={(option, value) => option.id === value?.id}
                            loading={loading.centrosLoading}
                            disabled={!selectedProvincia || loading.centrosLoading}
                            renderInput={(params) => ( <TextField {...params} label="Centro Educativo" required margin="dense" InputProps={{ ...params.InputProps, endAdornment: ( <> {loading.centrosLoading ? <CircularProgress color="inherit" size={20} /> : null} {params.InputProps.endAdornment} </> ), }} /> )}
                         />
                    )}
                </Grid>

                {/* --- Nivel Educativo (MODIFICADO) --- */}
                <Grid item xs={12} sm={6}>
                    <TextField select fullWidth margin="dense" label="Nivel Educativo"
                        name="nivelId" // Temporal
                        value={matricula.nivelId || ''}
                        onChange={handleNivelChange} // Mismo handler para cargar cursos
                        required
                        // Deshabilitado si carga niveles o si no hay centro
                        disabled={loading.nivelesLoading || !(selectedCentro || (isGestor && usuario.centro))}
                    >
                         <MenuItem value=""><em>Selecciona Nivel</em></MenuItem>
                         {/* <<< USA LA LISTA FILTRADA >>> */}
                        {listas.nivelesDisponiblesCentro.map(n => <MenuItem key={n.id} value={n.id}>{n.nombre}</MenuItem>)}
                    </TextField>
                </Grid>

                {/* --- Curso (Sin cambios funcionales) --- */}
                <Grid item xs={12} sm={6}>
                    <TextField select fullWidth margin="dense" label="Curso"
                        name="cursoId" value={matricula.cursoId || ''}
                        onChange={handleChange} required
                        disabled={loading.cursosLoading || !matricula.nivelId}
                    >
                         <MenuItem value=""><em>Selecciona Curso</em></MenuItem>
                        {loading.cursosLoading ? (<MenuItem disabled><CircularProgress size={20} /></MenuItem>)
                         : (listas.cursosPorNivel.map(c => <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>))}
                    </TextField>
                </Grid>

                {/* --- Año Académico (Sin cambios) --- */}
                 <Grid item xs={12} sm={6}>
                     <TextField fullWidth margin="dense" label="Año Académico" name="anioAcademico" type="number"
                        value={matricula.anioAcademico || ''} onChange={handleChange} required placeholder="Ej: 2024" />
                 </Grid>
            </Grid>
        </Box>
    );
}

export default MatriculaForm;