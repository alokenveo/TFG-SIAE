import axios from 'axios';

// URL base de tu API en el backend
const API_URL = 'http://localhost:8080/api/centros';

const obtenerTodosLosCentros = () => {
    return axios.get(`${API_URL}/lista`);
};

const crearCentro = (centroData) => {
    return axios.post(`${API_URL}/registrar`, centroData);
};

const editarCentro = (id, centroData) => {
    return axios.put(`${API_URL}/editar/${id}`, centroData);
};

const eliminarCentro = (id) => {
    return axios.delete(`${API_URL}/eliminar/${id}`);
};


const centroService = {
    obtenerTodosLosCentros,
    crearCentro,
    editarCentro,
    eliminarCentro,
};

export default centroService;