import axios from 'axios'
import { env } from '../config/env'
import { API_TIMEOUTS } from '../config/api'

export const api = axios.create({
  baseURL: env.apiUrl,
  timeout: API_TIMEOUTS.DEFAULT,
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
      if (ttlHandler && ttlHeader) {
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
