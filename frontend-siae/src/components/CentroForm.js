import React, { useState, useEffect } from 'react';
import { TextField, MenuItem, Box, Autocomplete, CircularProgress, Checkbox } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ofertaEducativaService from '../api/ofertaEducativaService';

const provincias = ["ANNABON", "BIOKO_NORTE", "BIOKO_SUR", "CENTRO_SUR", "KIE_NTEM", "LITORAL", "WELE_NZAS"];
const tipos = ["PUBLICO", "PRIVADO", "CONCERTADO"];

function CentroForm({ centro, setCentro, nivelesSeleccionados, setNivelesSeleccionados}) {

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

    // Iconos para el Autocomplete múltiple
    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

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

            <Autocomplete
                multiple // Permite selección múltiple
                id="niveles-centro"
                options={nivelesDisponibles} // Lista de todos los niveles
                disableCloseOnSelect // Mantener abierto al seleccionar
                loading={loadingNiveles}
                // Cómo mostrar el nombre de cada nivel
                getOptionLabel={(option) => option.nombre || ''}
                // El valor es el array de objetos NivelEducativo seleccionados
                value={nivelesSeleccionados}
                // Cómo comparar si un nivel ya está seleccionado
                isOptionEqualToValue={(option, value) => option.id === value.id}
                // Actualiza el estado en GestionCentros
                onChange={(event, newValue) => {
                    setNivelesSeleccionados(newValue);
                }}
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
                        label="Niveles Educativos Ofrecidos"
                        placeholder="Selecciona niveles..."
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
    );
}

export default CentroForm;