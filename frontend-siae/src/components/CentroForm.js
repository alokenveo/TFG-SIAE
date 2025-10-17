import React from 'react';
import { TextField, MenuItem, Box } from '@mui/material';

// Opciones para los selectores, basadas en tus enums del backend
const provincias = ["ANNABON", "BIOKO_NORTE", "BIOKO_SUR", "CENTRO_SUR", "KIE_NTEM", "LITORAL", "WELE_NZAS"];
const tipos = ["PUBLICO", "PRIVADO", "CONCERTADO"];

function CentroForm({ centro, setCentro }) {
    // Función para manejar los cambios en los inputs
    const handleChange = (event) => {
        const { name, value } = event.target;
        setCentro({ ...centro, [name]: value });
    };

    return (
        <Box component="form" noValidate autoComplete="off">
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
                fullWidth
                margin="normal"
                select
                label="Tipo de Centro"
                name="tipo"
                value={centro.tipo || ''}
                onChange={handleChange}
                required
            >
                {tipos.map((option) => (
                    <MenuItem key={option} value={option}>
                        {option}
                    </MenuItem>
                ))}
            </TextField>
            <TextField
                fullWidth
                margin="normal"
                select
                label="Provincia"
                name="provincia"
                value={centro.provincia || ''}
                onChange={handleChange}
                required
            >
                {provincias.map((option) => (
                    <MenuItem key={option} value={option}>
                        {option}
                    </MenuItem>
                ))}
            </TextField>
            <TextField
                fullWidth
                margin="normal"
                label="Dirección"
                name="direccion"
                value={centro.direccion || ''}
                onChange={handleChange}
            />
        </Box>
    );
}

export default CentroForm;