import axios from 'axios'
import { env } from '../config/env'
import { API_TIMEOUTS } from '../config/api'

export const api = axios.create({
  baseURL: env.apiUrl,
  timeout: API_TIMEOUTS.DEFAULT,
  withCredentials: true, // Send cookies with requests
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
