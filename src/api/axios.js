import axios from 'axios';

const api = axios.create({
  baseURL: 'https://hote244-api.onrender.com/api',
});

// Add interceptor to include token in requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

