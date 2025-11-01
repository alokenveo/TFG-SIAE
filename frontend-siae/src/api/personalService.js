import apiClient from './axiosConfig';

const API_URL_PERSONAL = '/personal';

const obtenerPersonal = (page, size, search, cargo, sort = 'apellidos,asc') => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    params.append('sort', sort);

    if (search) {
        params.append('search', search);
    }
    if (cargo) {
        params.append('cargo', cargo);
    }
    return apiClient.get(`${API_URL_PERSONAL}/lista`, { params });
};

const registrarPersonal = (personalData) => {
    return apiClient.post(`${API_URL_PERSONAL}/registrar`, personalData);
};

const editarPersonal = (id, personalData) => {
    return apiClient.put(`${API_URL_PERSONAL}/editar/${id}`, personalData);
};

const eliminarPersonal = (id) => {
    return apiClient.delete(`${API_URL_PERSONAL}/eliminar/${id}`);
};

const obtenerCargos = () => {
    return apiClient.get(`${API_URL_PERSONAL}/cargos`);
};

const personalService = {
    obtenerPersonal,
    registrarPersonal,
    editarPersonal,
    eliminarPersonal,
    obtenerCargos,
};

export default personalService;