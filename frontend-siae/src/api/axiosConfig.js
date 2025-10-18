import axios from 'axios';

// 1. Creamos la instancia de Axios
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api', // URL base para todas las peticiones
});

// 2. Creamos el Interceptor de Petición (Request Interceptor)
apiClient.interceptors.request.use(
  (config) => {
    // Obtenemos el token de localStorage
    const token = localStorage.getItem('authToken');
    
    // Si el token existe, lo añadimos a la cabecera 'Authorization'
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Interceptor de Respuesta para manejar errores 401
apiClient.interceptors.response.use(
  (response) => {
    return response; // Si todo va bien, devolvemos la respuesta
  },
  (error) => {
    // Si recibimos un error 401 (No autorizado)
    if (error.response && error.response.status === 401) {
      // Limpiamos localStorage y redirigimos al login
      localStorage.removeItem('authToken');
      localStorage.removeItem('usuario');
      window.location.href = '/login'; // Redirección forzosa
      console.error("Sesión expirada o token inválido. Redirigiendo a login.");
    }
    return Promise.reject(error);
  }
);

export default apiClient;