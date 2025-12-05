import { onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { refreshToken, setAuthFailureCallback } from '../services/tokenRefresh'
import { logger } from '../utils/logger'

// Shared state - this composable is a singleton and should only be instantiated
// once at the app root (e.g., App.vue). Multiple instances share the same timer
// and activity state, so unmounting any instance will stop refresh for all.
let statusCheckTimer = null
let lastActivity = Date.now()
let activeInstanceCount = 0
let authFailureCallbackConfigured = false
const IDLE_THRESHOLD_MS = 30000 // 30 seconds
const STATUS_CHECK_INTERVAL_MS = 30000 // 30 seconds

export function useTokenRefresh() {
  const authStore = useAuthStore()

  // Set auth failure callback to logout (configure once per app lifetime)
  if (!authFailureCallbackConfigured) {
    setAuthFailureCallback(() => authStore.logout())
    authFailureCallbackConfigured = true
  }

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
        try {
          await refreshToken()
        } catch (error) {
          logger.error('Idle token refresh failed', { error: error.message })
        }
      }
    }, STATUS_CHECK_INTERVAL_MS)
  }

  function start() {
    activeInstanceCount++
    // Only add listeners once (first instance)
    if (activeInstanceCount === 1 && typeof window !== 'undefined') {
      window.addEventListener('mousemove', updateActivity)
      window.addEventListener('keypress', updateActivity)
      window.addEventListener('click', updateActivity)
      window.addEventListener('scroll', updateActivity)
    }
    scheduleStatusCheck()
  }

  function stop() {
    activeInstanceCount--
    // Only tear down when the last instance stops
    if (activeInstanceCount <= 0) {
      activeInstanceCount = 0
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
  }

  onUnmounted(() => {
    stop()
  })

  return {
    start,
    stop,
  }
}
