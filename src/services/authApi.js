import axios from 'axios'
import { env } from '../config/env'
import { API_TIMEOUTS } from '../config/api'

export const authApi = axios.create({
  baseURL: env.authUrl,
  timeout: API_TIMEOUTS.AUTH,
  withCredentials: true, // Send cookies with requests
})
