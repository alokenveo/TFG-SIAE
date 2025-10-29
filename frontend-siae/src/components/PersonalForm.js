import React, { useState, useEffect } from 'react';
import { TextField, Box, Grid, Autocomplete, CircularProgress, MenuItem } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import centroService from '../api/centroService';

// Lista fija de provincias
const PROVINCIAS = [
    'ANNOBON', 'BIOKO_NORTE', 'BIOKO_SUR', 'CENTRO_SUR', 'DJIBLOHO', 'KIE_NTEM', 'LITORAL', 'WELE_NZAS'
];

function PersonalForm({ personal, setPersonal }) {
    const { usuario } = useAuth();
    const isGestor = usuario?.rol === 'GESTOR';

    const [provincia, setProvincia] = useState('');
    const [centros, setCentros] = useState([]);
    const [loadingCentros, setLoadingCentros] = useState(false);
    const [selectedCentro, setSelectedCentro] = useState(null);

    // Si es Gestor, preseleccionamos su provincia y centro
    useEffect(() => {
        if (isGestor && usuario.centro) {
            setProvincia(usuario.centro.provincia);
            setSelectedCentro(usuario.centro);
            setPersonal(prev => ({ ...prev, centroEducativoId: usuario.centro.id }));
        }
    }, [isGestor, usuario, setPersonal]);

    // Cargar centros según provincia seleccionada (solo Admin)
    const handleProvinciaChange = async (event) => {
        if (isGestor) return;

        const nuevaProvincia = event.target.value;
        setProvincia(nuevaProvincia);
        setSelectedCentro(null);
        setPersonal(prev => ({ ...prev, centroEducativoId: null }));

        if (!nuevaProvincia) {
            setCentros([]);
            return;
        }

        setLoadingCentros(true);
        try {
            const response = await centroService.obtenerCentrosPorProvincia(nuevaProvincia);
            setCentros(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error al cargar centros por provincia:", error);
            setCentros([]);
        } finally {
            setLoadingCentros(false);
        }
    };

    const handleCentroChange = (event, newValue) => {
        setSelectedCentro(newValue);
        setPersonal(prev => ({ ...prev, centroEducativoId: newValue ? newValue.id : null }));
    };

    // Manejador genérico para campos de texto
    const handleChange = (event) => {
        const { name, value } = event.target;
        setPersonal(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Box component="form" noValidate autoComplete="off">
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField fullWidth margin="dense" label="Nombre" name="nombre"
                        value={personal.nombre || ''} onChange={handleChange} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField fullWidth margin="dense" label="Apellidos" name="apellidos"
                        value={personal.apellidos || ''} onChange={handleChange} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField fullWidth margin="dense" label="DNI" name="dni"
                        value={personal.dni || ''} onChange={handleChange} required inputProps={{ maxLength: 9 }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField fullWidth margin="dense" label="Cargo" name="cargo"
                        value={personal.cargo || ''} onChange={handleChange} required placeholder="Ej: Docente, Director..." />
                </Grid>
            </Grid>
            <Grid container spacing={2}>
                {/* --- SELECCIÓN PROVINCIA + CENTRO --- */}
                {!isGestor && (
                    <>
                        <Grid item xs={12} sm={6}>
                            <TextField select fullWidth margin="dense" label="Provincia"
                                value={provincia} onChange={handleProvinciaChange}>
                                <MenuItem value=""><em>Seleccione provincia</em></MenuItem>
                                {PROVINCIAS.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={centros}
                                getOptionLabel={(option) => option.nombre || ''}
                                value={selectedCentro}
                                onChange={handleCentroChange}
                                isOptionEqualToValue={(option, value) => option.id === value?.id}
                                loading={loadingCentros}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Centro Educativo"
                                        margin="dense"
                                        required
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {loadingCentros ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                    />
                                )}
                            />
                        </Grid>
                    </>
                )}

                {/* Si es Gestor, mostramos su centro fijo */}
                {isGestor && (
                    <Grid item xs={12}>
                        <TextField label="Centro Educativo" value={usuario.centro?.nombre || 'N/A'} disabled fullWidth margin="dense" />
                    </Grid>
                )}
            </Grid>
        </Box>
    );
}

export default PersonalForm;
