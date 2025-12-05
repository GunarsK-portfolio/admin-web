import { onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { refreshToken, setAuthFailureCallback } from '../services/tokenRefresh'
import { logger } from '../utils/logger'

// Shared state
let statusCheckTimer = null
let lastActivity = Date.now()
const IDLE_THRESHOLD_MS = 30000 // 30 seconds
const STATUS_CHECK_INTERVAL_MS = 30000 // 30 seconds

export function useTokenRefresh() {
  const authStore = useAuthStore()

  // Set auth failure callback to logout
  setAuthFailureCallback(() => authStore.logout())

  function updateActivity() {
    lastActivity = Date.now()
  }

  function isIdle() {
    return Date.now() - lastActivity > IDLE_THRESHOLD_MS
  }

  // Periodic token refresh for idle users
  function scheduleStatusCheck() {
    if (statusCheckTimer) {
      clearInterval(statusCheckTimer)
    }

    statusCheckTimer = setInterval(async () => {
      if (isIdle() && authStore.isAuthenticated) {
        logger.debug('User idle, refreshing token')
        await refreshToken()
      }
    }, STATUS_CHECK_INTERVAL_MS)
  }

  function start() {
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', updateActivity)
      window.addEventListener('keypress', updateActivity)
      window.addEventListener('click', updateActivity)
      window.addEventListener('scroll', updateActivity)
    }
    scheduleStatusCheck()
  }

  function stop() {
    if (statusCheckTimer) {
      clearInterval(statusCheckTimer)
      statusCheckTimer = null
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', updateActivity)
      window.removeEventListener('keypress', updateActivity)
      window.removeEventListener('click', updateActivity)
      window.removeEventListener('scroll', updateActivity)
    }
  }

  onUnmounted(() => {
    stop()
  })

  return {
    start,
    stop,
  }
}
