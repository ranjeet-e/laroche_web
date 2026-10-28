import axios from 'axios';

export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    const cleanUrl = envUrl.trim().replace(/\/$/, '');
    return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  }
  // Vercel cloud deployment fallback
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://laroche-web.onrender.com/api';
  }
  // Default to relative /api for college server (Nginx / Express reverse proxy or local)
  return '/api';
};

export const getBackendBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '' && !envUrl.startsWith('/')) {
    return envUrl.trim().replace(/\/api\/?$/, '').replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://laroche-web.onrender.com';
  }
  return typeof window !== 'undefined' ? window.location.origin : '';
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

// Auto-refresh token and retry on 401 for seamless checkout, or auto-logout staff
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRoute =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/signup');

    if (error.response && error.response.status === 401 && !isAuthRoute && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.removeItem('token');

      // Attempt silent re-authentication for student/demo orders
      try {
        const refreshRes = await axios.post(`${getApiBaseUrl()}/auth/login`, {
          email: 'demo.student@larochecafe.com',
          password: 'LaRoche2026!',
        });

        if (refreshRes.data?.token) {
          const freshToken = refreshRes.data.token;
          localStorage.setItem('token', freshToken);
          if (refreshRes.data.user) {
            localStorage.setItem('user', JSON.stringify(refreshRes.data.user));
          }
          originalRequest.headers.Authorization = `Bearer ${freshToken}`;
          return api(originalRequest); // Retry original request with fresh token!
        }
      } catch (refreshErr) {
        console.warn('Silent token refresh failed:', refreshErr?.message);
      }

      // If refresh failed and it's a staff route, redirect to staff login
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      if (currentPath.startsWith('/kitchen') || currentPath.startsWith('/cms')) {
        localStorage.removeItem('user');
        const loginUrl = currentPath.startsWith('/cms') ? '/cms/login' : '/kitchen/login';
        window.location.href = `${loginUrl}?redirect=${encodeURIComponent(currentPath)}`;
      }
    }
    return Promise.reject(error);
  }
);

export const resolveAssetUrl = (path) => {
  if (!path) return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }
  // Backend uploads (/uploads/...) are fetched from the Render backend
  if (path.startsWith('/uploads') || path.startsWith('uploads')) {
    const backendBase = getBackendBaseUrl();
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${backendBase}${cleanPath}`;
  }
  // Frontend public assets (/menu-items/..., /category-icons/..., /placeholder-food.png)
  // are served directly from the frontend host / CDN
  return path.startsWith('/') ? path : `/${path}`;
};

export default api;
