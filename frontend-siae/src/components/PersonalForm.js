import React, { useState, useEffect } from 'react';
import { TextField, Box, Grid, Autocomplete, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import centroService from '../api/centroService'; // Para cargar centros (Admin)

function PersonalForm({ personal, setPersonal }) {
    const { usuario } = useAuth();
    const isGestor = usuario?.rol === 'GESTOR';

    // Estado para la lista de centros (solo para Admin)
    const [centros, setCentros] = useState([]);
    const [loadingCentros, setLoadingCentros] = useState(!isGestor); // Admin necesita cargar centros
    // Estado para el centro seleccionado en Autocomplete (objeto)
    const [selectedCentro, setSelectedCentro] = useState(null);

    // Cargar centros si es Admin
    useEffect(() => {
        if (!isGestor) {
            setLoadingCentros(true);
            centroService.obtenerTodosLosCentros()
                .then(response => {
                    setCentros(Array.isArray(response.data) ? response.data : []);
                    // Si estamos editando y es Admin, preseleccionar el centro actual
                    if (personal.centroEducativoId) {
                       const centroActual = response.data.find(c => c.id === personal.centroEducativoId);
                       setSelectedCentro(centroActual || null);
                    }
                })
                .catch(error => {
                    console.error("Error cargando centros:", error);
                    setCentros([]);
                })
                .finally(() => setLoadingCentros(false));
        } else {
             // Si es Gestor, preseleccionar su centro
             setSelectedCentro(usuario.centro || null);
             // Asegurar que el ID está en el estado 'personal'
             if(usuario.centro){
                 setPersonal(prev => ({ ...prev, centroEducativoId: usuario.centro.id }));
             }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isGestor, usuario, personal.centroEducativoId]); // Dependencias clave

    // Manejador genérico para campos de texto
    const handleChange = (event) => {
        const { name, value } = event.target;
        setPersonal(prev => ({ ...prev, [name]: value }));
    };

    // Manejador para Autocomplete de Centro (Admin)
    const handleCentroChange = (event, newValue) => {
        setSelectedCentro(newValue); // Actualiza el objeto seleccionado
        setPersonal(prev => ({
            ...prev,
            centroEducativoId: newValue ? newValue.id : null // Actualiza el ID en el estado principal
        }));
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
                 <Grid item xs={12}>
                     {isGestor ? (
                        <TextField label="Centro Educativo" value={usuario.centro?.nombre || 'N/A'} disabled fullWidth margin="dense"/>
                     ) : (
                        <Autocomplete
                            options={centros}
                            getOptionLabel={(option) => option.nombre || ''}
                            value={selectedCentro}
                            onChange={handleCentroChange}
                            isOptionEqualToValue={(option, value) => option.id === value?.id}
                            loading={loadingCentros}
                            renderInput={(params) => (
                                <TextField {...params} label="Centro Educativo" required margin="dense"
                                    InputProps={{ ...params.InputProps,
                                        endAdornment: ( <> {loadingCentros ? <CircularProgress color="inherit" size={20} /> : null} {params.InputProps.endAdornment} </> ),
                                    }}
                                />
                            )}
                        />
                     )}
                 </Grid>
            </Grid>
        </Box>
    );
}

export default PersonalForm;