import apiClient from './axiosConfig';

const API_URL_OFERTA = '/oferta-educativa';

const obtenerNiveles = () => {
    return apiClient.get(`${API_URL_OFERTA}/niveles`);
};

const obtenerCursosPorNivel = (nivelId) => {
    return apiClient.get(`${API_URL_OFERTA}/cursos/por-nivel/${nivelId}`);
};

const ofertaEducativaService = {
    obtenerNiveles,
    obtenerCursosPorNivel,
};

export default ofertaEducativaService;