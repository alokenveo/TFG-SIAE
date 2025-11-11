import React, { useState, useEffect } from 'react';
import { TextField, Box, Autocomplete, CircularProgress, MenuItem } from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import centroService from '../api/centroService';

const PROVINCIAS = [
    'ANNOBON', 'BIOKO_NORTE', 'BIOKO_SUR', 'CENTRO_SUR',
    'DJIBLOHO', 'KIE_NTEM', 'LITORAL', 'WELE_NZAS'
];

function PersonalForm({ personal, setPersonal }) {
    const { usuario } = useAuth();
    const isGestor = usuario?.rol === 'GESTOR';
    const [provincia, setProvincia] = useState('');
    const [centros, setCentros] = useState([]);
    const [loadingCentros, setLoadingCentros] = useState(false);
    const [selectedCentro, setSelectedCentro] = useState(null);

    useEffect(() => {
        if (isGestor && usuario.centro) {
            setProvincia(usuario.centro.provincia);
            setSelectedCentro(usuario.centro);
            setPersonal(prev => ({ ...prev, centroEducativoId: usuario.centro.id }));
        }
    }, [isGestor, usuario, setPersonal]);

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
        } catch {
            setCentros([]);
        } finally {
            setLoadingCentros(false);
        }
    };

    const handleCentroChange = (event, newValue) => {
        setSelectedCentro(newValue);
        setPersonal(prev => ({ ...prev, centroEducativoId: newValue ? newValue.id : null }));
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setPersonal(prev => ({ ...prev, [name]: value }));
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {/*
                CAMBIOS PRINCIPALES:
                1. Eliminamos los <Grid container> y <Grid item>
                2. Añadimos fullWidth y margin="normal" a todos los campos
                   (igual que en AlumnoForm.js)
            */}
            <Box component="form" noValidate autoComplete="off">
                <TextField
                    fullWidth
                    label="Nombre"
                    name="nombre"
                    value={personal.nombre || ''}
                    onChange={handleChange}
                    required
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="Apellidos"
                    name="apellidos"
                    value={personal.apellidos || ''}
                    onChange={handleChange}
                    required
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="DNI"
                    name="dni"
                    value={personal.dni || ''}
                    onChange={handleChange}
                    required
                    margin="normal"
                    inputProps={{ maxLength: 9 }}
                />
                <TextField
                    fullWidth
                    label="Cargo"
                    name="cargo"
                    value={personal.cargo || ''}
                    onChange={handleChange}
                    required
                    margin="normal"
                    placeholder="Ej: Docente, Director..."
                />

                {!isGestor && (
                    <>
                        <TextField
                            select
                            fullWidth
                            label="Provincia"
                            value={provincia}
                            onChange={handleProvinciaChange}
                            margin="normal"
                        >
                            <MenuItem value=""><em>Seleccione provincia</em></MenuItem>
                            {PROVINCIAS.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                        </TextField>

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
                                    margin="normal" // <-- Cambiado de 'dense' a 'normal'
                                    required
                                    fullWidth // <-- Añadido
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
                    </>
                )}
                {isGestor && (
                    <TextField
                        label="Centro Educativo"
                        value={usuario.centro?.nombre || 'N/A'}
                        disabled
                        fullWidth
                        margin="normal" // <-- Cambiado de 'dense' a 'normal'
                    />
                )}
            </Box>
        </motion.div>
    );
}

export default PersonalForm;