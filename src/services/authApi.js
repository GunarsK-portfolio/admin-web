import axios from 'axios'
import { env } from '../config/env'

export const authApi = axios.create({
  baseURL: env.authUrl,
})
