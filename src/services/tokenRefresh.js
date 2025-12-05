import { authApi } from './authApi'

// Shared refresh state across all API clients
let isRefreshing = false
let failedQueue = []
let onAuthFailureCallback = null
const registeredInstances = new WeakSet()

// For testing only
export function __resetState() {
  isRefreshing = false
  failedQueue = []
  onAuthFailureCallback = null
}

function processQueue(success) {
  failedQueue.forEach(({ resolve, reject, error }) => {
    success ? resolve(success) : reject(error)
  })
  failedQueue = []
}

export function setAuthFailureCallback(callback) {
  onAuthFailureCallback = callback
}

export async function refreshToken() {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject, error: new Error('Refresh in progress') })
    })
  }

  isRefreshing = true

  try {
    await authApi.post('/refresh')
    processQueue(true)
    return true
  } catch {
    processQueue(false)
    onAuthFailureCallback?.()
    return false
  } finally {
    isRefreshing = false
  }
}

// Add 401 interceptor to any axios instance
export function add401Interceptor(axiosInstance) {
  if (registeredInstances.has(axiosInstance)) {
    return
  }
  registeredInstances.add(axiosInstance)

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, error })
        }).then(() => axiosInstance(originalRequest))
      }

      originalRequest._retry = true
      const success = await refreshToken()

      if (success) {
        return axiosInstance(originalRequest)
      }

      return Promise.reject(error)
    }
  )
}
