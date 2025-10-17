import React, { useState, useEffect } from 'react';
import { TextField, MenuItem, Box, CircularProgress } from '@mui/material';
import centroService from '../api/centroService'; // Reutilizamos el servicio de centros

const roles = ["ADMIN", "GESTOR", "INVITADO"];

function UsuarioForm({ usuario, setUsuario, isEditMode }) {
    const [centros, setCentros] = useState([]);
    const [loadingCentros, setLoadingCentros] = useState(false);

    // Cargar la lista de centros educativos para el selector
    useEffect(() => {
        if (usuario.rol === 'GESTOR' || !isEditMode) {
            setLoadingCentros(true);
            centroService.obtenerTodosLosCentros()
                .then(response => setCentros(response.data || []))
                .catch(error => console.error("Error al cargar centros", error))
                .finally(() => setLoadingCentros(false));
        }
    }, [usuario.rol, isEditMode]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setUsuario({ ...usuario, [name]: value });
    };

    // Manejo especial para el selector de centro, para guardar el objeto completo
    const handleCentroChange = (event) => {
        const centroId = event.target.value;
        const centroSeleccionado = centros.find(c => c.id === centroId);
        setUsuario({ ...usuario, centro: centroSeleccionado });
    };

    return (
        <Box component="form" noValidate autoComplete="off">
            <TextField
                fullWidth margin="normal" label="Nombre Completo" name="nombre"
                value={usuario.nombre || ''} onChange={handleChange} required
            />
            <TextField
                fullWidth margin="normal" label="Correo Electrónico" name="correo" type="email"
                value={usuario.correo || ''} onChange={handleChange} required
            />
            {/* El campo de contraseña solo se muestra al crear un usuario */}
            {!isEditMode && (
                <TextField
                    fullWidth margin="normal" label="Contraseña" name="password" type="password"
                    value={usuario.password || ''} onChange={handleChange} required
                />
            )}
            <TextField
                fullWidth margin="normal" select label="Rol de Usuario" name="rol"
                value={usuario.rol || ''} onChange={handleChange} required disabled={isEditMode}
            >
                {roles.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
            </TextField>

            {/* Campo condicional para Gestor Institucional */}
            {usuario.rol === 'GESTOR' && (
                loadingCentros ? <CircularProgress /> : (
                    <TextField
                        fullWidth margin="normal" select label="Centro Educativo" name="centro"
                        value={usuario.centro?.id || ''} onChange={handleCentroChange} required
                    >
                        {centros.map((centro) => (
                            <MenuItem key={centro.id} value={centro.id}>{centro.nombre}</MenuItem>
                        ))}
                    </TextField>
                )
            )}
        </Box>
    );
}

export default UsuarioForm;