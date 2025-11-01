import apiClient from './axiosConfig';

const getIaStats = (anio = null) => {
    const params = {};
    if (anio) {
        params.anio = anio;
    }
    return apiClient.get('/ia/stats', { params });
};

const iaService = {
    getIaStats,
};

export default iaService;