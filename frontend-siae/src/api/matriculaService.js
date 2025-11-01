import apiClient from './axiosConfig';

const API_URL_MATRICULAS = '/matriculas';

const obtenerMatriculas = () => {
    return apiClient.get(`${API_URL_MATRICULAS}/lista`);
};

const registrarMatricula = (matriculaData) => {
    return apiClient.post(`${API_URL_MATRICULAS}/registrar`, matriculaData);
};

const obtenerMatriculasPorAlumno = (alumnoId) => {
    return apiClient.get(`${API_URL_MATRICULAS}/alumno/${alumnoId}`);
};


const matriculaService = {
    obtenerMatriculas,
    registrarMatricula,
    obtenerMatriculasPorAlumno,
};

export default matriculaService;