import apiClient from './axiosConfig';

const login = async (correo, password) => {
  const response = await apiClient.post('/auth/login', {
    correo,
    password,
  });
  return response.data;
};

const requestPasswordReset = async (correo) => {
  const response = await apiClient.post('/auth/request-reset', { correo });
  return response.data;
};

const resetPassword = async (token, nuevaPassword) => {
  const response = await apiClient.post('/auth/reset-password', { token, nuevaPassword });
  return response.data;
};

const authService = {
  login,
  requestPasswordReset,
  resetPassword,
};

export default authService;