import apiClient from './axiosConfig';

const API_URL_CENTROS = '/centros';

const obtenerTodosLosCentros = () => {
    return apiClient.get(`${API_URL_CENTROS}/lista`);
};

const crearCentro = (centroData) => {
    return apiClient.post(`${API_URL_CENTROS}/registrar`, centroData);
};

const editarCentro = (id, centroData) => {
    return apiClient.put(`${API_URL_CENTROS}/editar/${id}`, centroData);
};

const eliminarCentro = (id) => {
    return apiClient.delete(`${API_URL_CENTROS}/eliminar/${id}`);
};

const centroService = {
    obtenerTodosLosCentros,
    crearCentro,
    editarCentro,
    eliminarCentro,
};

export default centroService;