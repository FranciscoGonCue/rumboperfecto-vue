// ============ IMPORTACIONES ============
import axios from 'axios'; // Librería para hacer peticiones HTTP al backend

// ============ CONFIGURACIÓN DE LA URL BASE ============
// Obtiene la URL del backend desde el archivo .env
// Si no existe la variable VITE_API_URL, usa http://localhost:8000/api como valor por defecto
// "as string" le dice a TypeScript: "Confía en mí, esto es un texto"
const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000/api';

// ============ CREAR INSTANCIA DE AXIOS ============
// Crea un "cliente HTTP" configurado para hablar con el backend
const api = axios.create({
  baseURL: API_BASE_URL, // Usa la URL que definimos arriba
  headers: {
    'Content-Type': 'application/json', // Dice al backend: "Te voy a enviar datos en formato JSON"
  },
  withCredentials: true, // Permite enviar cookies (importante para autenticación)
});

// ============ INTERCEPTOR DE PETICIONES (REQUEST) ============
// Se ejecuta ANTES de enviar cada petición al backend
// Sirve para agregar el token de autenticación a cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Obtiene el token guardado en el navegador
  if (token) {
    // Si existe token, lo agrega al header Authorization
    // Django necesita esto para saber quién está haciendo la petición
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config; // Devuelve la petición modificada
});

// ============ INTERCEPTOR DE RESPUESTAS (RESPONSE) ============
// Se ejecuta cuando recibimos una respuesta del backend
// Sirve para manejar errores comunes (como tokens expirados)
api.interceptors.response.use(
  (response) => response, // Si la petición fue exitosa, devuelve la respuesta tal cual
  (error) => {
    // Si hubo error, verifica si es error 401 (No autenticado)
    if (error.response?.status === 401) {
      // El token expiró o no es válido
      localStorage.removeItem('token'); // Borra el token guardado
      window.location.href = '/login'; // Redirige al usuario al login
    }
    return Promise.reject(error); // Devuelve el error para que el componente lo maneje
  }
);

// ============ EXPORTAR FUNCIONES PARA LAS TAREAS ============
// Estas funciones son atajos para hacer peticiones CRUD (Create, Read, Update, Delete)
// Se usan en los componentes Vue para interactuar con el backend
export const tasksAPI = {
  // GET /api/tasks/ - Obtiene todas las tareas
  getAll: (params?: any) => api.get('/tasks/', { params }),
  
  // GET /api/tasks/1/ - Obtiene una tarea específica por ID
  getById: (id: number) => api.get(`/tasks/${id}/`),
  
  // POST /api/tasks/ - Crea una nueva tarea
  create: (data: any) => api.post('/tasks/', data),
  
  // PUT /api/tasks/1/ - Actualiza una tarea existente
  update: (id: number, data: any) => api.put(`/tasks/${id}/`, data),
  
  // DELETE /api/tasks/1/ - Elimina una tarea
  delete: (id: number) => api.delete(`/tasks/${id}/`),
};

// Exporta la instancia de axios para usar directamente si es necesario
export default api;
