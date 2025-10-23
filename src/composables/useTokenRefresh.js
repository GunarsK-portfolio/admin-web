import { ref, onUnmounted } from 'vue'
import authService from '../services/auth'
import { useAuthStore } from '../stores/auth'

// Shared state across all instances
let refreshTimer = null
let statusCheckTimer = null
let lastActivity = Date.now()
const IDLE_THRESHOLD_MS = 30000 // 30 seconds
const STATUS_CHECK_INTERVAL_MS = 30000 // 30 seconds
const REFRESH_THRESHOLD_SECONDS = 60 // Refresh when < 60 seconds remaining

export function useTokenRefresh() {
  const authStore = useAuthStore()
  const ttl = ref(null)

  // Update last activity timestamp
  function updateActivity() {
    lastActivity = Date.now()
  }

  // Check if user is idle
  function isIdle() {
    return Date.now() - lastActivity > IDLE_THRESHOLD_MS
  }

  // Handle TTL from response header or API call
  async function handleTTL(ttlSeconds) {
    ttl.value = ttlSeconds

    if (ttlSeconds <= 0) {
      // Token expired, logout
      await authStore.logout()
      return
    }

    if (ttlSeconds < REFRESH_THRESHOLD_SECONDS) {
      // Token expiring soon, refresh immediately
      console.log(`Token expiring in ${ttlSeconds}s, refreshing now`)
      await refreshToken()
    }
  }

  // Refresh the access token
  async function refreshToken() {
    try {
      const response = await authService.refresh()
      localStorage.setItem('access_token', response.data.access_token)
      localStorage.setItem('refresh_token', response.data.refresh_token)

      // Update TTL and reschedule checks
      await handleTTL(response.data.expires_in)

      console.log('Token refreshed successfully')
      return true
    } catch (error) {
      console.error('Token refresh failed:', error)
      await authStore.logout()
      return false
    }
  }

  // Check token status via API (for idle users)
  async function checkTokenStatus() {
    try {
      const response = await authService.tokenStatus()
      if (response.data.valid) {
        await handleTTL(response.data.ttl_seconds)
      } else {
        await authStore.logout()
      }
    } catch (error) {
      console.error('Token status check failed:', error)
      // If status check fails, try to refresh
      await refreshToken()
    }
  }

  // Periodic status check for idle users
  function scheduleStatusCheck() {
    if (statusCheckTimer) {
      clearInterval(statusCheckTimer)
    }

    statusCheckTimer = setInterval(async () => {
      if (isIdle() && authStore.isAuthenticated) {
        console.log('User idle, checking token status')
        await checkTokenStatus()
      }
    }, STATUS_CHECK_INTERVAL_MS)
  }

  // Extract TTL from response headers (opportunistic check)
  function extractTTLFromHeaders(response) {
    const ttlHeader = response.headers['x-token-ttl']
    if (ttlHeader) {
      const ttlSeconds = parseInt(ttlHeader, 10)
      if (!isNaN(ttlSeconds)) {
        handleTTL(ttlSeconds)
      }
    }
  }

  // Start monitoring
  function start() {
    // Track user activity
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', updateActivity)
      window.addEventListener('keypress', updateActivity)
      window.addEventListener('click', updateActivity)
      window.addEventListener('scroll', updateActivity)
    }

    // Start periodic status checks
    scheduleStatusCheck()

    // Initial check if already logged in
    if (authStore.isAuthenticated) {
      checkTokenStatus()
    }
  }

  // Stop monitoring
  function stop() {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
      refreshTimer = null
    }
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

  // Cleanup on unmount
  onUnmounted(() => {
    stop()
  })

  return {
    ttl,
    refreshToken,
    checkTokenStatus,
    extractTTLFromHeaders,
    start,
    stop,
  }
}
