// API Service para comunicación con Django Backend
import axios from 'axios'

// Configuración base de Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

// Interceptor para manejar autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API Methods
export const apiService = {
  // Autenticación
  auth: {
    login: (credentials) => api.post('/auth/login/', credentials),
    logout: () => api.post('/auth/logout/'),
    register: (userData) => api.post('/auth/register/', userData),
    refreshToken: () => api.post('/auth/refresh/'),
  },

  // Dashboard
  dashboard: {
    getStats: () => api.get('/dashboard/stats/'),
    getChart: (period) => api.get(`/dashboard/chart/?period=${period}`),
    getActivity: () => api.get('/dashboard/activity/'),
  },

  // Clientes
  clientes: {
    list: (params = {}) => api.get('/clientes/', { params }),
    create: (data) => api.post('/clientes/', data),
    update: (id, data) => api.put(`/clientes/${id}/`, data),
    delete: (id) => api.delete(`/clientes/${id}/`),
    detail: (id) => api.get(`/clientes/${id}/`),
    search: (query) => api.get(`/clientes/search/?q=${query}`),
  },

  // Productos
  productos: {
    list: (params = {}) => api.get('/productos/', { params }),
    create: (data) => api.post('/productos/', data),
    update: (id, data) => api.put(`/productos/${id}/`, data),
    delete: (id) => api.delete(`/productos/${id}/`),
    detail: (id) => api.get(`/productos/${id}/`),
    search: (query) => api.get(`/productos/search/?q=${query}`),
    updateStock: (id, stock) => api.put(`/productos/${id}/stock/`, { stock }),
  },

  // Ventas
  ventas: {
    list: (params = {}) => api.get('/ventas/', { params }),
    create: (data) => api.post('/ventas/', data),
    update: (id, data) => api.put(`/ventas/${id}/`, data),
    delete: (id) => api.delete(`/ventas/${id}/`),
    detail: (id) => api.get(`/ventas/${id}/`),
    generatePdf: (id) => api.get(`/ventas/${id}/pdf/`, { responseType: 'blob' }),
  },

  // Compras
  compras: {
    list: (params = {}) => api.get('/compras/', { params }),
    create: (data) => api.post('/compras/', data),
    update: (id, data) => api.put(`/compras/${id}/`, data),
    delete: (id) => api.delete(`/compras/${id}/`),
    detail: (id) => api.get(`/compras/${id}/`),
  },

  // Perfil de Usuario
  perfil: {
    getInfo: () => api.get('/perfil/info/'),
    updateInfo: (data) => api.put('/perfil/info/', data),
    uploadImage: (formData) => {
      return api.post('/perfil/imagen/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    },
    changePassword: (data) => api.put('/perfil/password/', data),
  },

  // Caja
  caja: {
    getMovements: (params = {}) => api.get('/caja/movimientos/', { params }),
    createMovement: (data) => api.post('/caja/movimiento/', data),
    updateMovement: (id, data) => api.put(`/caja/movimiento/${id}/`, data),
    deleteMovement: (id) => api.delete(`/caja/movimiento/${id}/`),
    getCurrentBalance: () => api.get('/caja/saldo/'),
    closeDay: (data) => api.post('/caja/cierre/', data),
  },

  // Reportes
  reportes: {
    generate: (type, params) => api.post(`/reportes/${type}/`, params),
    list: () => api.get('/reportes/'),
    download: (id, type) => api.get(`/reportes/${id}/download/?type=${type}`, {
      responseType: 'blob',
    }),
  },

  // Archivos y Media
  files: {
    upload: (formData, onProgress) => {
      return api.post('/files/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            onProgress(percentCompleted)
          }
        },
      })
    },
    delete: (id) => api.delete(`/files/${id}/`),
  },

  // Configuración
  configuracion: {
    get: () => api.get('/configuracion/'),
    update: (data) => api.put('/configuracion/', data),
    getEmpresas: () => api.get('/configuracion/empresas/'),
    updateEmpresa: (id, data) => api.put(`/configuracion/empresas/${id}/`, data),
  },

  // Búsqueda Global
  search: {
    global: (query) => api.get(`/search/global/?q=${query}`),
    suggest: (query, type) => api.get(`/search/suggest/?q=${query}&type=${type}`),
  },
}

export default api