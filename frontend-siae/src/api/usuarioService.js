import apiClient from './axiosConfig';

const API_URL_USUARIOS = '/usuarios';

const obtenerTodosLosUsuarios = () => {
    return apiClient.get(`${API_URL_USUARIOS}/lista`);
};

// Función para crear un usuario según su rol
const crearUsuario = (usuarioData) => {
    const { rol, ...data } = usuarioData;
    switch (rol) {
        case 'ADMIN':
            return apiClient.post(`${API_URL_USUARIOS}/registrar-admin`, data);
        case 'GESTOR':
            // El backend espera centroId, no un objeto centro
            const gestorData = { ...data, centroId: data.centro.id };
            delete gestorData.centro;
            return apiClient.post(`${API_URL_USUARIOS}/registrar-gestor`, gestorData);
        case 'INVITADO':
            return apiClient.post(`${API_URL_USUARIOS}/registrar-invitado`, data);
        default:
            return Promise.reject(new Error('Rol no válido'));
    }
};

const editarUsuario = (id, usuarioData) => {
    return apiClient.put(`${API_URL_USUARIOS}/editar/${id}`, usuarioData);
};

const eliminarUsuario = (id) => {
    return apiClient.delete(`${API_URL_USUARIOS}/eliminar/${id}`);
};

const usuarioService = {
    obtenerTodosLosUsuarios,
    crearUsuario,
    editarUsuario,
    eliminarUsuario,
};

export default usuarioService;