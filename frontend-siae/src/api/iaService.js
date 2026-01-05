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

const recalcularPredicciones = () => {
    return apiClient.post('/ia/recalcular');
};

const iaService = {
    getIaStats,
    getRendimiento,
    recalcularPredicciones
};

export default iaService;