import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL
const AUTH_URL = import.meta.env.VITE_AUTH_URL

if (!API_URL || !AUTH_URL) {
  throw new Error('VITE_API_URL and VITE_AUTH_URL must be set in environment variables')
}

const api = axios.create({
  baseURL: API_URL,
})

const authApi = axios.create({
  baseURL: AUTH_URL,
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

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
