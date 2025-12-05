import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import {
  refreshToken,
  setAuthFailureCallback,
  add401Interceptor,
  __resetState,
} from './tokenRefresh'

vi.mock('./authApi', () => ({
  authApi: {
    post: vi.fn(),
  },
}))

import { authApi } from './authApi'

describe('tokenRefresh', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    __resetState()
  })

  describe('refreshToken', () => {
    it('calls refresh endpoint and returns true on success', async () => {
      authApi.post.mockResolvedValue({ data: {} })

      const result = await refreshToken()

      expect(authApi.post).toHaveBeenCalledWith('/refresh')
      expect(result).toBe(true)
    })

    it('returns false on refresh failure', async () => {
      authApi.post.mockRejectedValue(new Error('Refresh failed'))

      const result = await refreshToken()

      expect(result).toBe(false)
    })

    it('calls auth failure callback on refresh failure', async () => {
      const callback = vi.fn()
      setAuthFailureCallback(callback)
      authApi.post.mockRejectedValue(new Error('Refresh failed'))

      await refreshToken()

      expect(callback).toHaveBeenCalled()
    })

    it('queues concurrent refresh requests', async () => {
      let resolveRefresh
      authApi.post.mockImplementation(() => new Promise((resolve) => (resolveRefresh = resolve)))

      const promise1 = refreshToken()
      const promise2 = refreshToken()
      const promise3 = refreshToken()

      // Only one actual refresh call
      expect(authApi.post).toHaveBeenCalledTimes(1)

      resolveRefresh({ data: {} })

      // First call gets true, queued calls resolve without a value
      const results = await Promise.all([promise1, promise2, promise3])

      expect(results[0]).toBe(true)
      // Queued promises resolve when processQueue(true) is called
    })
  })

  describe('add401Interceptor', () => {
    it('calls refresh on 401 and marks request for retry', async () => {
      const mockAxios = axios.create()
      add401Interceptor(mockAxios)

      authApi.post.mockResolvedValue({ data: {} })

      const originalRequest = { url: '/test', _retry: false }
      const error = {
        response: { status: 401 },
        config: originalRequest,
      }

      // Get the error interceptor
      const interceptors = mockAxios.interceptors.response.handlers
      const errorHandler = interceptors[0].rejected

      // The interceptor will call mockAxios which will fail in test env
      // but we can verify refresh was called and _retry was set
      try {
        await errorHandler(error)
      } catch {
        // Expected - axios call fails in test env
      }

      expect(authApi.post).toHaveBeenCalledWith('/refresh')
      expect(originalRequest._retry).toBe(true)
    })

    it('rejects on non-401 errors', async () => {
      const mockAxios = axios.create()
      add401Interceptor(mockAxios)

      const error = {
        response: { status: 500 },
        config: { url: '/test' },
      }

      const interceptors = mockAxios.interceptors.response.handlers
      const errorHandler = interceptors[0].rejected

      await expect(errorHandler(error)).rejects.toEqual(error)
      expect(authApi.post).not.toHaveBeenCalled()
    })

    it('rejects if already retried', async () => {
      const mockAxios = axios.create()
      add401Interceptor(mockAxios)

      const error = {
        response: { status: 401 },
        config: { url: '/test', _retry: true },
      }

      const interceptors = mockAxios.interceptors.response.handlers
      const errorHandler = interceptors[0].rejected

      await expect(errorHandler(error)).rejects.toEqual(error)
      expect(authApi.post).not.toHaveBeenCalled()
    })

    it('rejects if refresh fails', async () => {
      const mockAxios = axios.create()
      add401Interceptor(mockAxios)

      authApi.post.mockRejectedValue(new Error('Refresh failed'))

      const error = {
        response: { status: 401 },
        config: { url: '/test', _retry: false },
      }

      const interceptors = mockAxios.interceptors.response.handlers
      const errorHandler = interceptors[0].rejected

      await expect(errorHandler(error)).rejects.toEqual(error)
    })
  })
})
