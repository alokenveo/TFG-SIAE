import apiClient from './axiosConfig';

const getIaStats = (anio = null) => {
    const params = {};
    if (anio) {
        params.anio = anio;
    }
    return apiClient.get('/ia/stats', { params });
};

const getRendimiento = () => {
    return apiClient.get('/ia/rendimiento');
};

const iaService = {
    getIaStats,
    getRendimiento,
};

export default iaService;