import apiClient from './axiosConfig';

const API_URL_PERSONAL = '/personal';

const obtenerPersonal = () => {
    return apiClient.get(`${API_URL_PERSONAL}/lista`);
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

const personalService = {
    obtenerPersonal,
    registrarPersonal,
    editarPersonal,
    eliminarPersonal,
};

export default personalService;