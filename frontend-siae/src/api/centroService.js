import apiClient from './axiosConfig';

const API_URL_CENTROS = '/centros';

const obtenerTodosLosCentros = (page, size, search, tipo, provincia, sort = 'nombre,asc') => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    params.append('sort', sort);

    if (search) {
        params.append('search', search);
    }
    if (tipo && tipo !== 'TODOS') {
        params.append('tipo', tipo);
    }
    if (provincia && provincia !== 'TODOS') {
        params.append('provincia', provincia);
    }
    return apiClient.get(`${API_URL_CENTROS}/lista`, { params });
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

const obtenerCentrosPorProvincia = (provincia) => {
    return apiClient.get(`${API_URL_CENTROS}/provincia/${provincia}`);
};

const actualizarNivelesCentro = (centroId, nivelIds) => {
    return apiClient.put(`${API_URL_CENTROS}/${centroId}/niveles`, nivelIds);
};

const centroService = {
    obtenerTodosLosCentros,
    crearCentro,
    editarCentro,
    eliminarCentro,
    obtenerCentrosPorProvincia,
    actualizarNivelesCentro
};

export default centroService;