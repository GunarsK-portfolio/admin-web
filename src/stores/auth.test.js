import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from './auth'

// Mock dependencies
vi.mock('../services/auth', () => ({
  default: {
    login: vi.fn(),
    logout: vi.fn(),
  },
}))

vi.mock('../router', () => ({
  default: {
    push: vi.fn(),
  },
}))

vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
  setUserContext: vi.fn(),
  clearUserContext: vi.fn(),
}))

import authService from '../services/auth'
import router from '../router'
import { logger, setUserContext, clearUserContext } from '../utils/logger'

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorage.getItem.mockReturnValue(null)
  })

  describe('initial state', () => {
    it('starts unauthenticated when no token in localStorage', () => {
      const store = useAuthStore()
      expect(store.token).toBe(null)
      expect(store.isAuthenticated).toBe(false)
    })

    it('starts authenticated when token exists in localStorage', () => {
      localStorage.getItem.mockReturnValue('existing-token')
      const store = useAuthStore()
      expect(store.token).toBe('existing-token')
      expect(store.isAuthenticated).toBe(true)
    })
  })

  describe('login', () => {
    it('sets token and navigates on successful login', async () => {
      authService.login.mockResolvedValue({
        data: {
          access_token: 'new-token',
          refresh_token: 'refresh-token',
          expires_in: 3600,
        },
      })

      const store = useAuthStore()
      const result = await store.login('testuser', 'password123')

      expect(result).toBe(true)
      expect(store.token).toBe('new-token')
      expect(store.isAuthenticated).toBe(true)
      expect(localStorage.setItem).toHaveBeenCalledWith('access_token', 'new-token')
      expect(localStorage.setItem).toHaveBeenCalledWith('refresh_token', 'refresh-token')
      expect(router.push).toHaveBeenCalledWith('/dashboard')
      expect(logger.info).toHaveBeenCalledWith('User logged in successfully', expect.any(Object))
    })

    it('sets user context when user data is returned', async () => {
      const userData = { id: 1, username: 'testuser' }
      authService.login.mockResolvedValue({
        data: {
          access_token: 'new-token',
          refresh_token: 'refresh-token',
          expires_in: 3600,
          user: userData,
        },
      })

      const store = useAuthStore()
      await store.login('testuser', 'password123')

      expect(setUserContext).toHaveBeenCalledWith(userData)
    })

    it('returns false on login failure', async () => {
      authService.login.mockRejectedValue(new Error('Invalid credentials'))

      const store = useAuthStore()
      const result = await store.login('testuser', 'wrong-password')

      expect(result).toBe(false)
      expect(store.token).toBe(null)
      expect(store.isAuthenticated).toBe(false)
      expect(logger.error).toHaveBeenCalledWith('Login failed', expect.any(Object))
    })
  })

  describe('logout', () => {
    it('clears state and navigates to login on successful logout', async () => {
      authService.logout.mockResolvedValue({})

      const store = useAuthStore()
      store.token = 'existing-token'
      store.isAuthenticated = true

      await store.logout()

      expect(store.token).toBe(null)
      expect(store.isAuthenticated).toBe(false)
      expect(localStorage.removeItem).toHaveBeenCalledWith('access_token')
      expect(localStorage.removeItem).toHaveBeenCalledWith('refresh_token')
      expect(clearUserContext).toHaveBeenCalled()
      expect(router.push).toHaveBeenCalledWith('/login')
      expect(logger.info).toHaveBeenCalledWith('User logged out successfully')
    })

    it('clears state even when logout request fails', async () => {
      authService.logout.mockRejectedValue(new Error('Network error'))

      const store = useAuthStore()
      store.token = 'existing-token'
      store.isAuthenticated = true

      await store.logout()

      // State should still be cleared
      expect(store.token).toBe(null)
      expect(store.isAuthenticated).toBe(false)
      expect(localStorage.removeItem).toHaveBeenCalledWith('access_token')
      expect(localStorage.removeItem).toHaveBeenCalledWith('refresh_token')
      expect(router.push).toHaveBeenCalledWith('/login')
      expect(logger.warn).toHaveBeenCalledWith(
        'Logout request failed, clearing local session anyway',
        expect.any(Object)
      )
    })
  })
})
