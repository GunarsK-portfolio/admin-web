import axios from 'axios'
import { env } from '../config/env'

export const authApi = axios.create({
  baseURL: env.authUrl,
  timeout: 10000, // 10 second timeout for auth operations
})
