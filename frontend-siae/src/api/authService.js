import apiClient from './axiosConfig';

const login = async (correo, password) => {
  const response = await apiClient.post('/auth/login', {
    correo,
    password,
  });
  return response.data;
};

const authService = {
  login,
};

export default authService;