import React from 'react';
import { TextField, MenuItem, Box } from '@mui/material';

const sexos = ["MASCULINO", "FEMENINO"];

function AlumnoForm({ alumno, setAlumno }) {
    const handleChange = (event) => {
        const { name, value } = event.target;
        setAlumno({ ...alumno, [name]: value });
    };

    return (
        <Box component="form" noValidate autoComplete="off">
            <TextField
                fullWidth
                margin="normal"
                label="Nombre"
                name="nombre"
                value={alumno.nombre || ''}
                onChange={handleChange}
                required
            />
            <TextField
                fullWidth
                margin="normal"
                label="Apellidos"
                name="apellidos"
                value={alumno.apellidos || ''}
                onChange={handleChange}
                required
            />
            <TextField
                fullWidth
                margin="normal"
                label="Fecha de Nacimiento"
                name="fechaNacimiento"
                type="date"
                InputLabelProps={{ shrink: true }} // Para que la etiqueta no se superponga
                value={alumno.fechaNacimiento || ''}
                onChange={handleChange}
                required
            />
            <TextField
                fullWidth
                margin="normal"
                select
                label="Sexo"
                name="sexo"
                value={alumno.sexo || ''}
                onChange={handleChange}
                required
            >
                {sexos.map((option) => (
                    <MenuItem key={option} value={option}>
                        {option}
                    </MenuItem>
                ))}
            </TextField>
        </Box>
    );
}

export default AlumnoForm;