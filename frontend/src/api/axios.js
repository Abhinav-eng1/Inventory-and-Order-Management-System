/**
 * Axios API Client Configuration
 * 
 * Sets up a pre-configured Axios instance.
 * Automatically attaches the JWT token from localStorage to every outgoing request.
 * Redirects to /login if a 401 Unauthorized response is received.
 */

import axios from 'axios';

// Create Axios instance with base URL (defaults to /api which is proxied by Vite in dev)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
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
