import axios from 'axios'
import { env } from '../config/env'
import { API_TIMEOUTS } from '../config/api'

export const filesApi = axios.create({
  baseURL: env.filesApiUrl,
  timeout: API_TIMEOUTS.FILE_UPLOAD,
})

filesApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
