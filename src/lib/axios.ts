import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://localhost:5001/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const isAnonymous = config.url?.endsWith('/auth/login');

  if (token && !isAnonymous) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // For anonymous APIs like login, set tenant to root
    config.headers['X-Tenant-ID'] = 'root';
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
