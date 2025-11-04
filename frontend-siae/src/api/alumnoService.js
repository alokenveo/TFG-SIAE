import apiClient from './axiosConfig';

const API_URL_ALUMNOS = '/alumnos';

// Función para obtener todos los alumnos
const obtenerTodosLosAlumnos = (page, size, search, sexo, anioInicio, anioFin, sort = 'apellidos,asc') => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    params.append('sort', sort);

    if (search) params.append('search', search);
    if (sexo && sexo !== 'TODOS') params.append('sexo', sexo);
    if (anioInicio) params.append('anioInicio', anioInicio);
    if (anioFin) params.append('anioFin', anioFin);

    return apiClient.get(`${API_URL_ALUMNOS}/lista`, { params });
};

// Función para obtener todos los alumnos sin centro asignado
const obtenerAlumnosSinCentro = () => {
    return apiClient.get(`${API_URL_ALUMNOS}/lista-sin-centro`);
};

// Función para crear un nuevo alumno
const crearAlumno = (alumnoData) => {
    return apiClient.post(`${API_URL_ALUMNOS}/registrar`, alumnoData);
};

// Función para editar un alumno existente
const editarAlumno = (id, alumnoData) => {
    return apiClient.put(`${API_URL_ALUMNOS}/editar/${id}`, alumnoData);
};

// Función para eliminar un alumno
const eliminarAlumno = (id) => {
    return apiClient.delete(`${API_URL_ALUMNOS}/eliminar/${id}`);
};

const obtenerAlumnoPorId = (id) => {
    return apiClient.get(`${API_URL_ALUMNOS}/${id}`);
};

const obtenerAlumnoPorDNI = (dni) => {
    return apiClient.get(`${API_URL_ALUMNOS}/dni/${dni}`);
};

const alumnoService = {
    obtenerTodosLosAlumnos,
    obtenerAlumnosSinCentro,
    crearAlumno,
    editarAlumno,
    eliminarAlumno,
    obtenerAlumnoPorId,
    obtenerAlumnoPorDNI,
};

export default alumnoService;