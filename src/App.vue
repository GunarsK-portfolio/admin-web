<template>
  <n-config-provider :theme="currentTheme">
    <n-notification-provider>
      <n-message-provider>
        <n-dialog-provider>
          <n-global-style />
          <n-layout class="app-layout" has-sider>
            <AppSidebar
              v-if="authStore.isAuthenticated"
              v-model:collapsed="sidebarCollapsed"
              v-model:drawer-open="mobileDrawerOpen"
              :is-mobile="isMobile"
              :is-dark="isDark"
              @toggle-theme="toggleTheme"
            />

            <n-layout>
              <n-layout-content
                class="app-content"
                :class="{
                  'no-sider': !authStore.isAuthenticated,
                  'has-mobile-header': authStore.isAuthenticated && isMobile,
                }"
              >
                <router-view />
              </n-layout-content>
            </n-layout>
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
  NLayoutContent,
  darkTheme,
} from 'naive-ui'
import BackToTop from './components/shared/BackToTop.vue'
import AppSidebar from './components/layout/AppSidebar.vue'
import { useTokenRefresh } from './composables/useTokenRefresh'
import { useAuthStore } from './stores/auth'
import { THEMES, getStoredTheme, setStoredTheme, createThemeConfig } from './composables/useTheme'

const authStore = useAuthStore()

// Sidebar state
const sidebarCollapsed = ref(false)
const mobileDrawerOpen = ref(false)

// Mobile detection
const MOBILE_BREAKPOINT = 768
const isMobile = ref(window.innerWidth < MOBILE_BREAKPOINT)

function handleResize() {
  isMobile.value = window.innerWidth < MOBILE_BREAKPOINT
  if (!isMobile.value) {
    mobileDrawerOpen.value = false
  }
}

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
    window.location.reload()
  }
}

// Initialize token refresh system
const tokenRefresh = useTokenRefresh()

onMounted(() => {
  tokenRefresh.start()
  window.addEventListener('storage', handleStorageChange)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  tokenRefresh.stop()
  window.removeEventListener('storage', handleStorageChange)
  window.removeEventListener('resize', handleResize)
})

function handleStorageChange(event) {
  if (event.key === 'access_token' && event.newValue === null) {
    authStore.logout()
  }
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
}

.app-content {
  min-height: 100vh;
}

.app-content.no-sider {
  padding-left: 0;
}

.app-content.has-mobile-header {
  padding-top: 56px;
}
</style>
