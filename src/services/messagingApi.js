import axios from 'axios'
import { env } from '../config/env'
import { API_TIMEOUTS } from '../config/api'

export const messagingApi = axios.create({
  baseURL: env.messagingApiUrl,
  timeout: API_TIMEOUTS.DEFAULT,
})

messagingApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
