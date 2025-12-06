<template>
  <!-- Desktop Sidebar -->
  <n-layout-sider
    v-if="!isMobile"
    bordered
    collapse-mode="width"
    :collapsed-width="64"
    :width="220"
    :collapsed="collapsed"
    show-trigger
    class="app-sider"
    @collapse="emit('update:collapsed', true)"
    @expand="emit('update:collapsed', false)"
  >
    <div class="sider-header">
      <router-link to="/dashboard" class="sider-logo">
        <span v-if="!collapsed">Portfolio Admin</span>
        <span v-else>PA</span>
      </router-link>
    </div>
    <n-menu
      :collapsed="collapsed"
      :collapsed-width="64"
      :collapsed-icon-size="22"
      :options="menuOptions"
      :value="currentRoute"
      @update:value="handleMenuSelect"
    />
    <div class="sider-footer">
      <div v-if="!collapsed" class="user-info">
        <n-icon size="16"><PersonOutline /></n-icon>
        <span class="username">{{ authStore.username }}</span>
      </div>
      <n-button :quaternary="!collapsed" :circle="collapsed" @click="emit('toggle-theme')">
        <template #icon>
          <n-icon size="20">
            <MoonOutline v-if="isDark" />
            <SunnyOutline v-else />
          </n-icon>
        </template>
        <span v-if="!collapsed">{{ isDark ? 'Dark' : 'Light' }}</span>
      </n-button>
      <n-button :quaternary="!collapsed" :circle="collapsed" @click="authStore.logout()">
        <template #icon>
          <n-icon size="20">
            <LogOutOutline />
          </n-icon>
        </template>
        <span v-if="!collapsed">Logout</span>
      </n-button>
    </div>
  </n-layout-sider>

  <!-- Mobile Drawer -->
  <n-drawer
    v-if="isMobile"
    :show="drawerOpen"
    :width="280"
    placement="left"
    @update:show="emit('update:drawerOpen', $event)"
  >
    <n-drawer-content>
      <template #header>
        <span class="drawer-title">Portfolio Admin</span>
      </template>
      <n-menu :options="menuOptions" :value="currentRoute" @update:value="handleMobileMenuSelect" />
      <template #footer>
        <div class="drawer-footer">
          <div class="user-info-centered">
            <n-icon size="18"><PersonOutline /></n-icon>
            <span class="username">{{ authStore.username }}</span>
          </div>
          <div class="drawer-actions">
            <n-button quaternary @click="emit('toggle-theme')">
              <template #icon>
                <n-icon size="20">
                  <MoonOutline v-if="isDark" />
                  <SunnyOutline v-else />
                </n-icon>
              </template>
              {{ isDark ? 'Dark Mode' : 'Light Mode' }}
            </n-button>
            <n-button quaternary @click="authStore.logout()">
              <template #icon>
                <n-icon size="20">
                  <LogOutOutline />
                </n-icon>
              </template>
              Logout
            </n-button>
          </div>
        </div>
      </template>
    </n-drawer-content>
  </n-drawer>

  <!-- Mobile Header -->
  <n-layout-header v-if="isMobile" bordered class="mobile-header">
    <n-button quaternary @click="emit('update:drawerOpen', true)">
      <template #icon>
        <n-icon size="24"><MenuOutline /></n-icon>
      </template>
    </n-button>
    <span class="mobile-title">Portfolio Admin</span>
  </n-layout-header>
</template>

<script setup>
import { h, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NLayoutSider,
  NLayoutHeader,
  NMenu,
  NButton,
  NIcon,
  NDrawer,
  NDrawerContent,
} from 'naive-ui'
import {
  MoonOutline,
  SunnyOutline,
  LogOutOutline,
  HomeOutline,
  PersonOutline,
  CodeSlashOutline,
  BriefcaseOutline,
  RibbonOutline,
  FolderOpenOutline,
  ColorPaletteOutline,
  MailOutline,
  MenuOutline,
} from '@vicons/ionicons5'
import { useAuthStore } from '@/stores/auth'
import { usePermissions } from '@/composables/usePermissions'

defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
  drawerOpen: {
    type: Boolean,
    default: false,
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
  isDark: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:collapsed', 'update:drawerOpen', 'toggle-theme'])

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { canRead, Resource } = usePermissions()

const currentRoute = computed(() => route.name)

function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions = computed(() => {
  const options = [
    {
      label: 'Dashboard',
      key: 'Dashboard',
      icon: renderIcon(HomeOutline),
    },
  ]

  if (canRead(Resource.PROFILE)) {
    options.push({
      label: 'Profile',
      key: 'Profile',
      icon: renderIcon(PersonOutline),
    })
  }

  if (canRead(Resource.SKILLS)) {
    options.push({
      label: 'Skills',
      key: 'Skills',
      icon: renderIcon(CodeSlashOutline),
    })
  }

  if (canRead(Resource.EXPERIENCE)) {
    options.push({
      label: 'Work Experience',
      key: 'WorkExperience',
      icon: renderIcon(BriefcaseOutline),
    })
  }

  if (canRead(Resource.CERTIFICATIONS)) {
    options.push({
      label: 'Certifications',
      key: 'Certifications',
      icon: renderIcon(RibbonOutline),
    })
  }

  if (canRead(Resource.PROJECTS)) {
    options.push({
      label: 'Projects',
      key: 'PortfolioProjects',
      icon: renderIcon(FolderOpenOutline),
    })
  }

  if (canRead(Resource.MINIATURES)) {
    options.push({
      label: 'Miniatures',
      key: 'Miniatures',
      icon: renderIcon(ColorPaletteOutline),
    })
  }

  if (canRead(Resource.MESSAGES)) {
    options.push({
      label: 'Messaging',
      key: 'Messaging',
      icon: renderIcon(MailOutline),
    })
  }

  return options
})

function handleMenuSelect(key) {
  router.push({ name: key })
}

function handleMobileMenuSelect(key) {
  router.push({ name: key })
  emit('update:drawerOpen', false)
}
</script>

<style scoped>
.app-sider {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
}

.sider-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--n-border-color);
}

.sider-logo {
  text-decoration: none;
  color: inherit;
  font-size: 18px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 16px;
}

.sider-footer {
  margin-top: auto;
  padding: 16px;
  border-top: 1px solid var(--n-border-color);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  font-size: 14px;
  color: var(--n-text-color-2);
}

.username {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  gap: 8px;
}

.mobile-title {
  font-size: 18px;
  font-weight: bold;
}

.drawer-title {
  font-size: 18px;
  font-weight: bold;
}

.drawer-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.user-info-centered {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: var(--n-text-color-2);
}

.drawer-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}
</style>
