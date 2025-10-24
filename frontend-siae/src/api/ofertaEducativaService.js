import apiClient from './axiosConfig';

const API_URL_OFERTA = '/oferta-educativa';

const obtenerNiveles = () => {
    return apiClient.get(`${API_URL_OFERTA}/niveles`);
};

const obtenerCursosPorNivel = (nivelId) => {
    return apiClient.get(`${API_URL_OFERTA}/cursos/por-nivel/${nivelId}`);
};

const obtenerAsignaturasPorCurso = (cursoId) => {
    return apiClient.get(`${API_URL_OFERTA}/asignaturas/por-curso/${cursoId}`);
};

const ofertaEducativaService = {
    obtenerNiveles,
    obtenerCursosPorNivel,
    obtenerAsignaturasPorCurso,
};

export default ofertaEducativaService;