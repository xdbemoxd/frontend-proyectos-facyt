import axios from 'axios';

// Creamos la instancia configurada
export const api = axios.create({
  // Usa la variable de entorno, y si falla, tiene localhost:8000 de respaldo
  baseURL: process.env.BACKEND_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  // El login incluye verificacion de Google + BD; 10s era muy corto.
  timeout: 30000, 
});


export default api;