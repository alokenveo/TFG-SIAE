import apiClient from './axiosConfig';

const getStats = (anio = null) => {
    const params = {};
    if (anio) {
        params.anio = anio;
    }
    return apiClient.get('/dashboard/', { params });
};

const dashboardService = {
    getStats,
};

export default dashboardService;