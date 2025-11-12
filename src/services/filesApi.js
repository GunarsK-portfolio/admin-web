import axios from 'axios'
import { env } from '../config/env'

export const filesApi = axios.create({
  baseURL: env.filesApiUrl,
  timeout: 60000, // 60 second timeout for file operations
})

filesApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
