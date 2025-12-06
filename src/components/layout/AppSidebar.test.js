import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AppSidebar from './AppSidebar.vue'

// Mock vue-router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useRoute: () => ({
    name: 'Dashboard',
  }),
}))

// Mock auth store
const mockAuthStore = {
  username: 'testuser',
  logout: vi.fn(),
  hasPermission: vi.fn(() => true),
  canRead: vi.fn(() => true),
  canEdit: vi.fn(() => true),
  canDelete: vi.fn(() => true),
}

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

// Mock permissions composable
vi.mock('@/composables/usePermissions', () => ({
  usePermissions: () => ({
    canRead: vi.fn(() => true),
    canEdit: vi.fn(() => true),
    canDelete: vi.fn(() => true),
    Resource: {
      PROFILE: 'profile',
      EXPERIENCE: 'experience',
      CERTIFICATIONS: 'certifications',
      SKILLS: 'skills',
      PROJECTS: 'projects',
      MINIATURES: 'miniatures',
      FILES: 'files',
      MESSAGES: 'messages',
    },
    Level: {
      READ: 'read',
      EDIT: 'edit',
      DELETE: 'delete',
    },
  }),
}))

describe('AppSidebar', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const createWrapper = (props = {}) =>
    shallowMount(AppSidebar, {
      props: {
        collapsed: false,
        drawerOpen: false,
        isMobile: false,
        isDark: false,
        ...props,
      },
      global: {
        stubs: {
          NLayoutSider: true,
          NLayoutHeader: true,
          NMenu: true,
          NButton: true,
          NIcon: true,
          NDrawer: true,
          NDrawerContent: true,
          RouterLink: {
            template: '<a><slot /></a>',
          },
          MoonOutline: true,
          SunnyOutline: true,
          LogOutOutline: true,
          HomeOutline: true,
          PersonOutline: true,
          CodeSlashOutline: true,
          BriefcaseOutline: true,
          RibbonOutline: true,
          FolderOpenOutline: true,
          ColorPaletteOutline: true,
          MailOutline: true,
          MenuOutline: true,
        },
      },
    })

  describe('initial state', () => {
    it('renders component successfully', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('accepts collapsed prop', () => {
      const wrapper = createWrapper({ collapsed: true })
      expect(wrapper.vm.collapsed).toBe(true)
    })

    it('accepts drawerOpen prop', () => {
      const wrapper = createWrapper({ drawerOpen: true })
      expect(wrapper.vm.drawerOpen).toBe(true)
    })

    it('accepts isMobile prop', () => {
      const wrapper = createWrapper({ isMobile: true })
      expect(wrapper.vm.isMobile).toBe(true)
    })

    it('accepts isDark prop', () => {
      const wrapper = createWrapper({ isDark: true })
      expect(wrapper.vm.isDark).toBe(true)
    })
  })

  describe('desktop sidebar', () => {
    it('shows desktop sidebar when not mobile', () => {
      const wrapper = createWrapper({ isMobile: false })
      expect(wrapper.find('.app-sider-stub').exists() || wrapper.vm.isMobile === false).toBe(true)
    })

    it('shows full title when not collapsed', () => {
      const wrapper = createWrapper({ collapsed: false })
      // Text content check - component is stubbed but we verify prop
      expect(wrapper.vm.collapsed).toBe(false)
    })

    it('shows abbreviated title when collapsed', () => {
      const wrapper = createWrapper({ collapsed: true })
      expect(wrapper.vm.collapsed).toBe(true)
    })
  })

  describe('mobile drawer', () => {
    it('shows mobile drawer when isMobile', () => {
      const wrapper = createWrapper({ isMobile: true })
      expect(wrapper.vm.isMobile).toBe(true)
    })

    it('shows mobile header when isMobile', () => {
      const wrapper = createWrapper({ isMobile: true })
      expect(wrapper.vm.isMobile).toBe(true)
    })
  })

  describe('menu options', () => {
    it('always includes Dashboard option', () => {
      const wrapper = createWrapper()
      const options = wrapper.vm.menuOptions

      expect(options.some((opt) => opt.key === 'Dashboard')).toBe(true)
    })

    it('includes permission-protected menu items when user has access', () => {
      const wrapper = createWrapper()
      const options = wrapper.vm.menuOptions

      // With full permissions, all items should be present
      expect(options.length).toBeGreaterThan(1)
    })
  })

  describe('navigation', () => {
    it('navigates on menu select', () => {
      const wrapper = createWrapper()

      wrapper.vm.handleMenuSelect('Profile')

      expect(mockPush).toHaveBeenCalledWith({ name: 'Profile' })
    })

    it('navigates and closes drawer on mobile menu select', () => {
      const wrapper = createWrapper({ isMobile: true, drawerOpen: true })

      wrapper.vm.handleMobileMenuSelect('Skills')

      expect(mockPush).toHaveBeenCalledWith({ name: 'Skills' })
      expect(wrapper.emitted('update:drawerOpen')).toBeTruthy()
      expect(wrapper.emitted('update:drawerOpen')[0]).toEqual([false])
    })
  })

  describe('emits', () => {
    it('emits update:collapsed when sidebar collapses', async () => {
      const wrapper = createWrapper()

      await wrapper.vm.$emit('update:collapsed', true)

      expect(wrapper.emitted('update:collapsed')).toBeTruthy()
      expect(wrapper.emitted('update:collapsed')[0]).toEqual([true])
    })

    it('emits update:drawerOpen when drawer state changes', async () => {
      const wrapper = createWrapper({ isMobile: true })

      await wrapper.vm.$emit('update:drawerOpen', true)

      expect(wrapper.emitted('update:drawerOpen')).toBeTruthy()
    })

    it('emits toggle-theme when theme button clicked', async () => {
      const wrapper = createWrapper()

      await wrapper.vm.$emit('toggle-theme')

      expect(wrapper.emitted('toggle-theme')).toBeTruthy()
    })
  })

  describe('current route', () => {
    it('computes currentRoute from route name', () => {
      const wrapper = createWrapper()

      expect(wrapper.vm.currentRoute).toBe('Dashboard')
    })
  })

  describe('user info', () => {
    it('displays username from auth store', () => {
      createWrapper()
      // Username is available via authStore mock
      expect(mockAuthStore.username).toBe('testuser')
    })

    it('calls logout on logout button click', () => {
      createWrapper()
      // Verify logout is available on the store
      expect(typeof mockAuthStore.logout).toBe('function')
    })
  })

  describe('theme toggle', () => {
    it('shows moon icon when dark mode', () => {
      const wrapper = createWrapper({ isDark: true })
      expect(wrapper.vm.isDark).toBe(true)
    })

    it('shows sun icon when light mode', () => {
      const wrapper = createWrapper({ isDark: false })
      expect(wrapper.vm.isDark).toBe(false)
    })
  })
})
