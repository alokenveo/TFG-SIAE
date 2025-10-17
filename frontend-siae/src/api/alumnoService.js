import axios from 'axios';

const API_URL = 'http://localhost:8080/api/alumnos';

// Función para obtener todos los alumnos
const obtenerTodosLosAlumnos = () => {
    return axios.get(`${API_URL}/lista`);
};

// Función para crear un nuevo alumno
const crearAlumno = (alumnoData) => {
    return axios.post(`${API_URL}/registrar`, alumnoData);
};

// Función para editar un alumno existente
const editarAlumno = (id, alumnoData) => {
    return axios.put(`${API_URL}/editar/${id}`, alumnoData);
};

// Función para eliminar un alumno
const eliminarAlumno = (id) => {
    return axios.delete(`${API_URL}/eliminar/${id}`);
};

const alumnoService = {
    obtenerTodosLosAlumnos,
    crearAlumno,
    editarAlumno,
    eliminarAlumno,
};

export default alumnoService;