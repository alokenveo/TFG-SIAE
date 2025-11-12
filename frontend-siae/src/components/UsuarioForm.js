import React, { useState, useEffect } from 'react';
import { TextField, MenuItem, Box, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import centroService from '../api/centroService';

const roles = ["ADMIN", "GESTOR", "INVITADO"];

function UsuarioForm({ usuario, setUsuario, isEditMode }) {
    const [centros, setCentros] = useState([]);
    const [loadingCentros, setLoadingCentros] = useState(false);

    useEffect(() => {
        if (usuario.rol === 'GESTOR' || !isEditMode) {
            setLoadingCentros(true);
            centroService.obtenerTodosLosCentros()
                .then(response => {
                    console.log("Centros obtenidos:", response?.data);
                    const data = response?.data;
                    const listaCentros = Array.isArray(data) ? data : data?.content || [];
                    setCentros(listaCentros);
                })
                .catch(error => console.error("Error al cargar centros:", error))
                .finally(() => setLoadingCentros(false));

        }
    }, [usuario.rol, isEditMode]);


    const handleChange = (event) => {
        const { name, value } = event.target;
        setUsuario({ ...usuario, [name]: value });
    };

    const handleCentroChange = (event) => {
        //const centroId = parseInt(event.target.value, 10);
        const centroId = event.target.value;
        console.log("Centro seleccionado ID:", centroId);
        const centroSeleccionado = centros.find(c => c.id === centroId);
        setUsuario({ ...usuario, centro: centroSeleccionado });
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <Box component="form" noValidate autoComplete="off">
                <TextField
                    fullWidth margin="normal" label="Nombre Completo" name="nombre"
                    value={usuario.nombre || ''} onChange={handleChange} required
                />
                <TextField
                    fullWidth margin="normal" label="Correo Electrónico" name="correo" type="email"
                    value={usuario.correo || ''} onChange={handleChange} required
                />
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

                {usuario.rol === 'GESTOR' && (
                    loadingCentros ? <CircularProgress /> : (
                        <TextField
                            fullWidth margin="normal" select label="Centro Educativo"
                            value={usuario.centro?.id || ''} onChange={handleCentroChange} required
                        >
                            {centros.map((centro) => (
                                <MenuItem key={centro.id} value={centro.id}>{centro.nombre}</MenuItem>
                            ))}
                        </TextField>
                    )
                )}
            </Box>
        </motion.div>
    );
}

export default UsuarioForm;