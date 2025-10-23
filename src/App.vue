<template>
  <n-config-provider :theme="theme">
    <n-layout style="min-height: 100vh">
      <router-view />
    </n-layout>
  </n-config-provider>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { NConfigProvider, NLayout } from 'naive-ui'
import { setupResponseInterceptor } from './services/api'
import { useTokenRefresh } from './composables/useTokenRefresh'
import { useAuthStore } from './stores/auth'

const theme = null

// Initialize token refresh system
const tokenRefresh = useTokenRefresh()

onMounted(() => {
  // Setup axios interceptor to read TTL headers
  setupResponseInterceptor(tokenRefresh.handleTTL)

  // Start token monitoring
  tokenRefresh.start()

  // Listen for logout events from other tabs
  window.addEventListener('storage', handleStorageChange)
})

onBeforeUnmount(() => {
  tokenRefresh.stop()
  window.removeEventListener('storage', handleStorageChange)
})

// Handle multi-tab sync via localStorage events
function handleStorageChange(event) {
  // If access_token was removed in another tab, logout in this tab
  if (event.key === 'access_token' && event.newValue === null) {
    const authStore = useAuthStore()
    authStore.logout()
  }
}
</script>
