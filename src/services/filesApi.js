import axios from 'axios'
import { env } from '../config/env'
import { API_TIMEOUTS } from '../config/api'
import { add401Interceptor } from './tokenRefresh'

export const filesApi = axios.create({
  baseURL: env.filesApiUrl,
  timeout: API_TIMEOUTS.FILE_UPLOAD,
  withCredentials: true,
})

add401Interceptor(filesApi)
