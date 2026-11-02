/**
 * Axios API Client Configuration
 * 
 * Sets up a pre-configured Axios instance.
 * Automatically attaches the JWT token from localStorage to every outgoing request.
 * Redirects to /login if a 401 Unauthorized response is received.
 */

import axios from 'axios';

/**
 * Normalizes the backend API base URL:
 * - If VITE_API_URL is provided, ensures trailing slashes are trimmed and appends '/api' if not already present.
 * - If not provided, falls back to '/api' (for local Vite dev proxy and Vercel serverless rewrites).
 */
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl || !envUrl.trim()) {
    return '/api';
  }
  const cleanUrl = envUrl.trim().replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

// Create Axios instance with normalized base URL
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Request Interceptor:
 * Before any request is sent, inspect localStorage for an auth token.
 * If present, attach 'Authorization: Bearer <token>' to request headers.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor:
 * If a 401 response is returned by the server, clear the token from localStorage
 * so the user can re-authenticate.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and user from localStorage on authentication failure
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // If we are not already on login or register, redirect
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register'
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
