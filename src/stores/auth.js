import { defineStore } from 'pinia'
import { ref } from 'vue'
import authService from '../services/auth'
import router from '../router'
import { logger, setUserContext, clearUserContext } from '../utils/logger'
import { Level, LevelValues } from '../constants/permissions'

export const useAuthStore = defineStore('auth', () => {
  // Auth state - no longer tied to localStorage tokens
  const isAuthenticated = ref(false)
  const username = ref('')
  const scopes = ref({})

  function hasPermission(resource, required) {
    const userLevel = scopes.value[resource] || Level.NONE
    const userValue = LevelValues[userLevel] ?? 0
    const requiredValue = LevelValues[required] ?? Infinity
    return userValue >= requiredValue
  }

  const canRead = (resource) => hasPermission(resource, Level.READ)
  const canEdit = (resource) => hasPermission(resource, Level.EDIT)
  const canDelete = (resource) => hasPermission(resource, Level.DELETE)

  async function checkAuthStatus() {
    try {
      const response = await authService.tokenStatus()
      isAuthenticated.value = response.data.valid
      if (response.data.valid) {
        if (response.data.username) {
          username.value = response.data.username
        }
        if (response.data.scopes) {
          scopes.value = response.data.scopes
        }
      }
      return response.data.valid
    } catch (error) {
      isAuthenticated.value = false
      username.value = ''
      scopes.value = {}
      // Log for observability - helps debug auth issues
      logger.warn('Auth status check failed', {
        error: error.message,
        status: error.response?.status,
      })
      return false
    }
  }

  async function login(loginUsername, password) {
    try {
      const response = await authService.login(loginUsername, password)
      isAuthenticated.value = true
      username.value = response.data.username || loginUsername
      scopes.value = response.data.scopes || {}

      logger.info('User logged in successfully', {
        expiresIn: response.data.expires_in,
        username: loginUsername,
      })

      // Set user context for future logs
      if (response.data.user_id) {
        setUserContext({ id: response.data.user_id })
      }

      router.push('/dashboard')
      return true
    } catch (error) {
      logger.error('Login failed', {
        username: loginUsername,
        error: error.message,
        status: error.response?.status,
      })
      return false
    }
  }

  async function logout() {
    try {
      await authService.logout()
      logger.info('User logged out successfully')
    } catch (error) {
      logger.warn('Logout request failed, clearing local state anyway', {
        error: error.message,
      })
    } finally {
      isAuthenticated.value = false
      username.value = ''
      scopes.value = {}
      clearUserContext()
      router.push('/login')
    }
  }

  return {
    isAuthenticated,
    username,
    scopes,
    hasPermission,
    canRead,
    canEdit,
    canDelete,
    checkAuthStatus,
    login,
    logout,
  }
})
