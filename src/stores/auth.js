import { defineStore } from 'pinia'
import { ref } from 'vue'
import authService from '../services/auth'
import router from '../router'
import { logger, setUserContext, clearUserContext } from '../utils/logger'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('access_token') || null)
  const isAuthenticated = ref(!!token.value)

  async function login(username, password) {
    try {
      const response = await authService.login(username, password)
      token.value = response.data.access_token
      localStorage.setItem('access_token', response.data.access_token)
      localStorage.setItem('refresh_token', response.data.refresh_token)
      isAuthenticated.value = true

      logger.info('User logged in successfully', {
        expiresIn: response.data.expires_in,
        username,
      })

      // Set user context for future logs
      if (response.data.user) {
        setUserContext(response.data.user)
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
      logger.warn('Logout request failed, clearing local session anyway', {
        error: error.message,
      })
    } finally {
      token.value = null
      isAuthenticated.value = false
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      clearUserContext()
      router.push('/login')
    }
  }

  return {
    token,
    isAuthenticated,
    login,
    logout,
  }
})
