import apiClient from './axiosConfig';

const API_URL_MATRICULAS = '/matriculas';

const obtenerMatriculas = () => {
    return apiClient.get(`${API_URL_MATRICULAS}/lista`);
};

const registrarMatricula = (matriculaData) => {
    return apiClient.post(`${API_URL_MATRICULAS}/registrar`, matriculaData);
};

const matriculaService = {
    obtenerMatriculas,
    registrarMatricula,
};

export default matriculaService;