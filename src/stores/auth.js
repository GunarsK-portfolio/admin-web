import { defineStore } from 'pinia'
import { ref } from 'vue'
import authService from '../services/auth'
import router from '../router'
import { logger, setUserContext, clearUserContext } from '../utils/logger'

export const useAuthStore = defineStore('auth', () => {
  // Auth state - no longer tied to localStorage tokens
  const isAuthenticated = ref(false)

  async function checkAuthStatus() {
    try {
      const response = await authService.tokenStatus()
      isAuthenticated.value = response.data.valid
      return response.data.valid
    } catch {
      isAuthenticated.value = false
      return false
    }
  }

  async function login(username, password) {
    try {
      const response = await authService.login(username, password)
      isAuthenticated.value = true

      logger.info('User logged in successfully', {
        expiresIn: response.data.expires_in,
        username,
      })

      // Set user context for future logs
      if (response.data.user_id) {
        setUserContext({ id: response.data.user_id, username: response.data.username })
      }

      router.push('/dashboard')
      return true
    } catch (error) {
      logger.error('Login failed', {
        username,
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
      clearUserContext()
      router.push('/login')
    }
  }

  return {
    isAuthenticated,
    checkAuthStatus,
    login,
    logout,
  }
})
