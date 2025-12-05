import axios from 'axios'
import { env } from '../config/env'
import { API_TIMEOUTS } from '../config/api'
import { add401Interceptor } from './tokenRefresh'

export const messagingApi = axios.create({
  baseURL: env.messagingApiUrl,
  timeout: API_TIMEOUTS.DEFAULT,
  withCredentials: true,
})

add401Interceptor(messagingApi)
