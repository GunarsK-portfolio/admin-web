<template>
  <n-config-provider :theme="currentTheme">
    <n-notification-provider>
      <n-message-provider>
        <n-dialog-provider>
          <n-global-style />
          <n-layout class="app-layout">
            <n-layout-header v-if="authStore.isAuthenticated" bordered class="app-header">
              <div class="header-inner">
                <router-link to="/dashboard" class="header-logo">Portfolio Admin</router-link>

                <n-space>
                  <n-button circle @click="toggleTheme">
                    <template #icon>
                      <n-icon size="20">
                        <MoonOutline v-if="isDark" />
                        <SunnyOutline v-else />
                      </n-icon>
                    </template>
                  </n-button>
                  <n-button @click="authStore.logout()">Logout</n-button>
                </n-space>
              </div>
            </n-layout-header>

            <n-layout-content
              class="app-content"
              :class="{ 'no-header': !authStore.isAuthenticated }"
            >
              <router-view />
            </n-layout-content>
          </n-layout>

          <BackToTop />
        </n-dialog-provider>
      </n-message-provider>
    </n-notification-provider>
  </n-config-provider>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  NConfigProvider,
  NNotificationProvider,
  NMessageProvider,
  NDialogProvider,
  NGlobalStyle,
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NButton,
  NIcon,
  NSpace,
  darkTheme,
} from 'naive-ui'
import { MoonOutline, SunnyOutline } from '@vicons/ionicons5'
import BackToTop from './components/shared/BackToTop.vue'
import { useTokenRefresh } from './composables/useTokenRefresh'
import { useAuthStore } from './stores/auth'
import { THEMES, getStoredTheme, setStoredTheme, createThemeConfig } from './composables/useTheme'

const authStore = useAuthStore()

// Map theme codes to Naive UI themes
const THEME_CONFIG = createThemeConfig({
  [THEMES.DARK]: darkTheme,
})

// Initialize theme code from localStorage
const currentThemeCode = ref(getStoredTheme())

// Computed properties
const currentTheme = computed(() => THEME_CONFIG[currentThemeCode.value] || null)
const isDark = computed(() => currentThemeCode.value === THEMES.DARK)

function toggleTheme() {
  const newTheme = currentThemeCode.value === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK
  if (setStoredTheme(newTheme)) {
    currentThemeCode.value = newTheme
    window.location.reload() // Reload to apply theme
  }
}

// Initialize token refresh system
const tokenRefresh = useTokenRefresh()

onMounted(() => {
  // Start token monitoring (idle refresh)
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
    authStore.logout()
  }
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
}

.app-header {
  position: fixed;
  top: 0;
  z-index: 100;
  width: 100%;
  backdrop-filter: blur(10px);
}

.header-inner {
  display: flex;
  align-items: center;
  height: 64px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.header-logo {
  text-decoration: none;
  color: inherit;
  font-size: 20px;
  font-weight: bold;
  margin-right: auto;
}

.app-content {
  padding-top: 64px;
  min-height: 100vh;
}

.app-content.no-header {
  padding-top: 0;
}
</style>
