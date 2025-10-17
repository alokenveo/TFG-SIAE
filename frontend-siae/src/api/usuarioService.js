import axios from 'axios';

const API_URL = 'http://localhost:8080/api/usuarios';

const obtenerTodosLosUsuarios = () => {
    return axios.get(`${API_URL}/lista`);
};

// Función para crear un usuario según su rol
const crearUsuario = (usuarioData) => {
    const { rol, ...data } = usuarioData;
    switch (rol) {
        case 'ADMIN':
            return axios.post(`${API_URL}/registrar-admin`, data);
        case 'GESTOR':
            // El backend espera centroId, no un objeto centro
            const gestorData = { ...data, centroId: data.centro.id };
            delete gestorData.centro;
            return axios.post(`${API_URL}/registrar-gestor`, gestorData);
        case 'INVITADO':
            return axios.post(`${API_URL}/registrar-invitado`, data);
        default:
            return Promise.reject(new Error('Rol no válido'));
    }
};

const editarUsuario = (id, usuarioData) => {
    return axios.put(`${API_URL}/editar/${id}`, usuarioData);
};

const eliminarUsuario = (id) => {
    return axios.delete(`${API_URL}/eliminar/${id}`);
};

const usuarioService = {
    obtenerTodosLosUsuarios,
    crearUsuario,
    editarUsuario,
    eliminarUsuario,
};

export default usuarioService;