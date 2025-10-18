import apiClient from './axiosConfig';

const API_URL_NOTAS = '/notas';

// Obtener todas las notas (filtradas por rol en el backend)
const obtenerNotas = () => {
    return apiClient.get(`${API_URL_NOTAS}/lista`);
};

// Obtener notas de un alumno específico (filtradas por rol en el backend)
const obtenerNotasPorAlumno = (alumnoId) => {
    return apiClient.get(`${API_URL_NOTAS}/por-alumno/${alumnoId}`);
};

// Registrar una nueva nota (validado por rol en el backend)
const registrarNota = (notaData) => {
    return apiClient.post(`${API_URL_NOTAS}/registrar`, notaData);
};

// Añadiremos editar/eliminar si es necesario más adelante

const notaService = {
    obtenerNotas,
    obtenerNotasPorAlumno,
    registrarNota,
};

export default notaService;