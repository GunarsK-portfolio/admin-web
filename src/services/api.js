import axios from 'axios'
import { env } from '../config/env'

const api = axios.create({
  baseURL: env.apiUrl,
})

const authApi = axios.create({
  baseURL: env.authUrl,
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle TTL headers (will be set up by App.vue)
export function setupResponseInterceptor(ttlHandler) {
  api.interceptors.response.use(
    (response) => {
      // Extract TTL from header if present
      const ttlHeader = response.headers['x-token-ttl']
      if (ttlHeader && ttlHandler) {
        const ttlSeconds = parseInt(ttlHeader, 10)
        if (!isNaN(ttlSeconds)) {
          ttlHandler(ttlSeconds)
        }
      }
      return response
    },
    (error) => {
      return Promise.reject(error)
    }
  )
}

export default {
  // Auth
  login(username, password) {
    return authApi.post('/login', { username, password })
  },
  logout() {
    const token = localStorage.getItem('access_token')
    return authApi.post(
      '/logout',
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
  },
  refresh() {
    const refreshToken = localStorage.getItem('refresh_token')
    return authApi.post('/refresh', { refresh_token: refreshToken })
  },
  tokenStatus() {
    const token = localStorage.getItem('access_token')
    return authApi.get('/token-status', {
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  // Profile
  updateProfile(data) {
    return api.post('/profile', data)
  },

  // Experience
  createExperience(data) {
    return api.post('/experience', data)
  },
  updateExperience(id, data) {
    return api.put(`/experience/${id}`, data)
  },
  deleteExperience(id) {
    return api.delete(`/experience/${id}`)
  },

  // Certifications
  createCertification(data) {
    return api.post('/certifications', data)
  },
  updateCertification(id, data) {
    return api.put(`/certifications/${id}`, data)
  },
  deleteCertification(id) {
    return api.delete(`/certifications/${id}`)
  },

  // Miniatures
  createMiniature(data) {
    return api.post('/miniatures', data)
  },
  updateMiniature(id, data) {
    return api.put(`/miniatures/${id}`, data)
  },
  deleteMiniature(id) {
    return api.delete(`/miniatures/${id}`)
  },

  // Images
  deleteImage(id) {
    return api.delete(`/images/${id}`)
  },
}
