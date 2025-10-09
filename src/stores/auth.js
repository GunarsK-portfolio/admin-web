import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'
import router from '../router'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('access_token') || null)
  const isAuthenticated = ref(!!token.value)

  async function login(username, password) {
    try {
      const response = await api.login(username, password)
      token.value = response.data.access_token
      localStorage.setItem('access_token', response.data.access_token)
      localStorage.setItem('refresh_token', response.data.refresh_token)
      isAuthenticated.value = true
      router.push('/dashboard')
      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  async function logout() {
    try {
      await api.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      token.value = null
      isAuthenticated.value = false
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      router.push('/login')
    }
  }

  return {
    token,
    isAuthenticated,
    login,
    logout
  }
})
