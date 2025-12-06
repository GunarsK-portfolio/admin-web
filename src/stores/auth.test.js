import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from './auth'

// Mock dependencies
vi.mock('../services/auth', () => ({
  default: {
    login: vi.fn(),
    logout: vi.fn(),
    tokenStatus: vi.fn(),
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
  })

  describe('initial state', () => {
    it('starts unauthenticated', () => {
      const store = useAuthStore()
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('checkAuthStatus', () => {
    it('sets authenticated to true when token is valid', async () => {
      authService.tokenStatus.mockResolvedValue({
        data: { valid: true, ttl_seconds: 600 },
      })

      const store = useAuthStore()
      const result = await store.checkAuthStatus()

      expect(result).toBe(true)
      expect(store.isAuthenticated).toBe(true)
    })

    it('stores scopes from token status response', async () => {
      const mockScopes = {
        profile: 'edit',
        skills: 'delete',
        projects: 'read',
      }
      authService.tokenStatus.mockResolvedValue({
        data: { valid: true, ttl_seconds: 600, scopes: mockScopes },
      })

      const store = useAuthStore()
      await store.checkAuthStatus()

      expect(store.scopes).toEqual(mockScopes)
    })

    it('sets authenticated to false when token is invalid', async () => {
      authService.tokenStatus.mockResolvedValue({
        data: { valid: false, ttl_seconds: 0 },
      })

      const store = useAuthStore()
      const result = await store.checkAuthStatus()

      expect(result).toBe(false)
      expect(store.isAuthenticated).toBe(false)
    })

    it('sets authenticated to false on error', async () => {
      authService.tokenStatus.mockRejectedValue(new Error('Network error'))

      const store = useAuthStore()
      const result = await store.checkAuthStatus()

      expect(result).toBe(false)
      expect(store.isAuthenticated).toBe(false)
    })

    it('clears scopes on error', async () => {
      authService.tokenStatus.mockRejectedValue(new Error('Network error'))

      const store = useAuthStore()
      store.scopes = { profile: 'edit' }
      await store.checkAuthStatus()

      expect(store.scopes).toEqual({})
    })
  })

  describe('login', () => {
    it('sets authenticated and navigates on successful login', async () => {
      authService.login.mockResolvedValue({
        data: {
          success: true,
          expires_in: 3600,
          user_id: 1,
          username: 'testuser',
        },
      })

      const store = useAuthStore()
      const result = await store.login('testuser', 'password123')

      expect(result).toBe(true)
      expect(store.isAuthenticated).toBe(true)
      expect(router.push).toHaveBeenCalledWith('/dashboard')
      expect(logger.info).toHaveBeenCalledWith('User logged in successfully', expect.any(Object))
    })

    it('sets user context when user data is returned', async () => {
      authService.login.mockResolvedValue({
        data: {
          success: true,
          expires_in: 3600,
          user_id: 1,
          username: 'testuser',
        },
      })

      const store = useAuthStore()
      await store.login('testuser', 'password123')

      expect(setUserContext).toHaveBeenCalledWith({ id: 1 })
    })

    it('stores scopes from login response', async () => {
      const mockScopes = {
        profile: 'delete',
        skills: 'edit',
        experience: 'read',
      }
      authService.login.mockResolvedValue({
        data: {
          success: true,
          expires_in: 3600,
          user_id: 1,
          username: 'testuser',
          scopes: mockScopes,
        },
      })

      const store = useAuthStore()
      await store.login('testuser', 'password123')

      expect(store.scopes).toEqual(mockScopes)
    })

    it('sets empty scopes when login response has no scopes', async () => {
      authService.login.mockResolvedValue({
        data: {
          success: true,
          expires_in: 3600,
          user_id: 1,
          username: 'testuser',
        },
      })

      const store = useAuthStore()
      await store.login('testuser', 'password123')

      expect(store.scopes).toEqual({})
    })

    it('returns false on login failure', async () => {
      authService.login.mockRejectedValue(new Error('Invalid credentials'))

      const store = useAuthStore()
      const result = await store.login('testuser', 'wrong-password')

      expect(result).toBe(false)
      expect(store.isAuthenticated).toBe(false)
      expect(logger.error).toHaveBeenCalledWith('Login failed', expect.any(Object))
    })
  })

  describe('logout', () => {
    it('clears state and navigates to login on successful logout', async () => {
      authService.logout.mockResolvedValue({})

      const store = useAuthStore()
      store.isAuthenticated = true
      store.scopes = { profile: 'delete', skills: 'edit' }

      await store.logout()

      expect(store.isAuthenticated).toBe(false)
      expect(store.scopes).toEqual({})
      expect(clearUserContext).toHaveBeenCalled()
      expect(router.push).toHaveBeenCalledWith('/login')
      expect(logger.info).toHaveBeenCalledWith('User logged out successfully')
    })

    it('clears state even when logout request fails', async () => {
      authService.logout.mockRejectedValue(new Error('Network error'))

      const store = useAuthStore()
      store.isAuthenticated = true
      store.scopes = { profile: 'edit' }

      await store.logout()

      // State should still be cleared
      expect(store.isAuthenticated).toBe(false)
      expect(store.scopes).toEqual({})
      expect(router.push).toHaveBeenCalledWith('/login')
      expect(logger.warn).toHaveBeenCalledWith(
        'Logout request failed, clearing local state anyway',
        expect.any(Object)
      )
    })
  })

  describe('hasPermission', () => {
    it('returns true when user has exact required level', () => {
      const store = useAuthStore()
      store.scopes = { profile: 'edit' }

      expect(store.hasPermission('profile', 'edit')).toBe(true)
    })

    it('returns true when user has higher permission level', () => {
      const store = useAuthStore()
      store.scopes = { profile: 'delete' }

      expect(store.hasPermission('profile', 'read')).toBe(true)
      expect(store.hasPermission('profile', 'edit')).toBe(true)
    })

    it('returns false when user has lower permission level', () => {
      const store = useAuthStore()
      store.scopes = { profile: 'read' }

      expect(store.hasPermission('profile', 'edit')).toBe(false)
      expect(store.hasPermission('profile', 'delete')).toBe(false)
    })

    it('returns false for resource not in scopes', () => {
      const store = useAuthStore()
      store.scopes = { profile: 'edit' }

      expect(store.hasPermission('skills', 'read')).toBe(false)
    })

    it('returns false when scopes are empty', () => {
      const store = useAuthStore()
      store.scopes = {}

      expect(store.hasPermission('profile', 'read')).toBe(false)
    })
  })

  describe('canRead', () => {
    it('returns true when user has read permission', () => {
      const store = useAuthStore()
      store.scopes = { skills: 'read' }

      expect(store.canRead('skills')).toBe(true)
    })

    it('returns true when user has higher than read permission', () => {
      const store = useAuthStore()
      store.scopes = { skills: 'delete' }

      expect(store.canRead('skills')).toBe(true)
    })

    it('returns false when user has no permission', () => {
      const store = useAuthStore()
      store.scopes = {}

      expect(store.canRead('skills')).toBe(false)
    })
  })

  describe('canEdit', () => {
    it('returns true when user has edit permission', () => {
      const store = useAuthStore()
      store.scopes = { projects: 'edit' }

      expect(store.canEdit('projects')).toBe(true)
    })

    it('returns true when user has delete permission', () => {
      const store = useAuthStore()
      store.scopes = { projects: 'delete' }

      expect(store.canEdit('projects')).toBe(true)
    })

    it('returns false when user has only read permission', () => {
      const store = useAuthStore()
      store.scopes = { projects: 'read' }

      expect(store.canEdit('projects')).toBe(false)
    })
  })

  describe('canDelete', () => {
    it('returns true when user has delete permission', () => {
      const store = useAuthStore()
      store.scopes = { experience: 'delete' }

      expect(store.canDelete('experience')).toBe(true)
    })

    it('returns false when user has only edit permission', () => {
      const store = useAuthStore()
      store.scopes = { experience: 'edit' }

      expect(store.canDelete('experience')).toBe(false)
    })

    it('returns false when user has only read permission', () => {
      const store = useAuthStore()
      store.scopes = { experience: 'read' }

      expect(store.canDelete('experience')).toBe(false)
    })
  })
})
