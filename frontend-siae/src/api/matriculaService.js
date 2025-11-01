import apiClient from './axiosConfig';

const API_URL_MATRICULAS = '/matriculas';

const obtenerMatriculas = (page, size, search, cursoId, anio, sort = 'alumno.apellidos,asc') => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    params.append('sort', sort);

    if (search) {
        params.append('search', search);
    }
    if (cursoId) {
        params.append('cursoId', cursoId);
    }
    if (anio) {
        params.append('anio', anio);
    }
    return apiClient.get(`${API_URL_MATRICULAS}/lista`, { params });
};

const registrarMatricula = (matriculaData) => {
    return apiClient.post(`${API_URL_MATRICULAS}/registrar`, matriculaData);
};

const obtenerMatriculasPorAlumno = (alumnoId) => {
    return apiClient.get(`${API_URL_MATRICULAS}/alumno/${alumnoId}`);
};

const obtenerAnios = () => {
    return apiClient.get(`${API_URL_MATRICULAS}/anios`);
};


const matriculaService = {
    obtenerMatriculas,
    registrarMatricula,
    obtenerMatriculasPorAlumno,
    obtenerAnios,
};

export default matriculaService;