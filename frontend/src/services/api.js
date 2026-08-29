import axios from 'axios';

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (import.meta.env.PROD && (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
    return '/api';
  }
  return envUrl || '/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request automatically, if one exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout if token is invalid/expired on authenticated routes (backend returns 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute =
      error.config?.url?.includes('/auth/login') ||
      error.config?.url?.includes('/auth/signup');

    if (error.response && error.response.status === 401 && !isAuthRoute) {
      const hadToken = !!localStorage.getItem('token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (hadToken && window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
