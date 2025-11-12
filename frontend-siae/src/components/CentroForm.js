import React, { useState, useEffect } from 'react';
import {
    TextField, MenuItem, Box, Autocomplete, CircularProgress, Checkbox, Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ofertaEducativaService from '../api/ofertaEducativaService';

const provincias = [
    "ANNOBON", "BIOKO_NORTE", "BIOKO_SUR", "CENTRO_SUR",
    "DJIBLOHO", "KIE_NTEM", "LITORAL", "WELE_NZAS"
];

const tipos = ["PUBLICO", "PRIVADO", "CONCERTADO"];

function CentroForm({ centro, setCentro, nivelesSeleccionados, setNivelesSeleccionados }) {
    const [nivelesDisponibles, setNivelesDisponibles] = useState([]);
    const [loadingNiveles, setLoadingNiveles] = useState(true);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setCentro({ ...centro, [name]: value });
    };

    useEffect(() => {
        setLoadingNiveles(true);
        ofertaEducativaService.obtenerNiveles()
            .then(response => {
                setNivelesDisponibles(Array.isArray(response.data) ? response.data : []);
            })
            .catch(error => console.error("Error cargando niveles:", error))
            .finally(() => setLoadingNiveles(false));
    }, []);

    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <Box component="form" noValidate autoComplete="off">

                <Typography variant="subtitle1" gutterBottom>Datos del Centro</Typography>

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        gap: 2
                    }}
                >
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Nombre del Centro"
                        name="nombre"
                        value={centro.nombre || ''}
                        onChange={handleChange}
                        required
                    />

                    <TextField
                        select
                        fullWidth
                        margin="normal"
                        label="Tipo de Centro"
                        name="tipo"
                        value={centro.tipo || ''}
                        onChange={handleChange}
                        required
                    >
                        {tipos.map((option) => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        fullWidth
                        margin="normal"
                        label="Provincia"
                        name="provincia"
                        value={centro.provincia || ''}
                        onChange={handleChange}
                        required
                    >
                        {provincias.map((option) => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Dirección"
                        name="direccion"
                        value={centro.direccion || ''}
                        onChange={handleChange}
                        placeholder="Ej: Calle Central nº5"
                    />
                </Box>

                <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                    Niveles Educativos Ofrecidos
                </Typography>

                <Autocomplete
                    multiple
                    id="niveles-centro"
                    options={nivelesDisponibles}
                    disableCloseOnSelect
                    loading={loadingNiveles}
                    getOptionLabel={(option) => option.nombre || ''}
                    value={nivelesSeleccionados}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    onChange={(event, newValue) => setNivelesSeleccionados(newValue)}
                    renderOption={(props, option, { selected }) => (
                        <li {...props}>
                            <Checkbox
                                icon={icon}
                                checkedIcon={checkedIcon}
                                style={{ marginRight: 8 }}
                                checked={selected}
                            />
                            {option.nombre}
                        </li>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Selecciona los Niveles"
                            placeholder="Primaria, Secundaria..."
                            margin="normal"
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        {loadingNiveles ? <CircularProgress color="inherit" size={20} /> : null}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                />

            </Box>
        </motion.div>
    );
}

export default CentroForm;