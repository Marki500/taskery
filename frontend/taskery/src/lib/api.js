// src/lib/api.js
// Instancia de Axios con interceptores y baseURL relativa.
// Apache ya enruta /api y /auth al backend.

import axios from 'axios';
import { getToken, clearToken } from './auth';

export const api = axios.create({
  baseURL: '/api', // ✅ evita hardcodear https://todo.bycram.dev
});

// Interceptor: añade Authorization si hay token
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor de respuesta: si 401, limpia y manda a /login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      clearToken();
      // Redirige a login manteniendo UX simple
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);
