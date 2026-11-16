import axios from 'axios';

// Creamos la instancia configurada
export const api = axios.create({
  // Usa la variable de entorno, y si falla, tiene localhost:8000 de respaldo
  baseURL: process.env.BACKEND_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  // Opcional: Puedes agregar un timeout para que la petición no se quede colgada infinito si FastAPI está apagado
  timeout: 10000, 
});


export default api;