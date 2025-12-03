import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Login from './Login.vue'

// Mock the auth store
const mockLogin = vi.fn()

vi.mock('../stores/auth', () => ({
  useAuthStore: () => ({
    login: mockLogin,
  }),
}))

describe('Login', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const createWrapper = () =>
    shallowMount(Login, {
      global: {
        stubs: {
          NSpace: true,
          NCard: true,
          NForm: true,
          NFormItem: true,
          NInput: true,
          NButton: true,
          NAlert: true,
        },
      },
    })

  describe('initial state', () => {
    it('renders component successfully', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('has empty username and password fields', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.username).toBe('')
      expect(wrapper.vm.password).toBe('')
    })

    it('is not loading initially', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.loading).toBe(false)
    })

    it('has no error initially', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.error).toBe('')
    })
  })

  describe('handleLogin', () => {
    it('calls authStore.login with credentials', async () => {
      mockLogin.mockResolvedValue(true)
      const wrapper = createWrapper()

      wrapper.vm.username = 'testuser'
      wrapper.vm.password = 'testpass'

      await wrapper.vm.handleLogin()
      await flushPromises()

      expect(mockLogin).toHaveBeenCalledWith('testuser', 'testpass')
    })

    it('sets loading state during login', async () => {
      mockLogin.mockImplementation(async () => {
        return true
      })

      const wrapper = createWrapper()
      wrapper.vm.username = 'test'
      wrapper.vm.password = 'pass'

      const loginPromise = wrapper.vm.handleLogin()
      expect(wrapper.vm.loading).toBe(true)

      await loginPromise
      await flushPromises()

      expect(wrapper.vm.loading).toBe(false)
    })

    it('clears previous error before login attempt', async () => {
      mockLogin.mockResolvedValue(true)
      const wrapper = createWrapper()
      wrapper.vm.error = 'Previous error'

      await wrapper.vm.handleLogin()
      await flushPromises()

      expect(wrapper.vm.error).toBe('')
    })

    it('sets error on failed login', async () => {
      mockLogin.mockResolvedValue(false)
      const wrapper = createWrapper()

      wrapper.vm.username = 'wrong'
      wrapper.vm.password = 'wrong'

      await wrapper.vm.handleLogin()
      await flushPromises()

      expect(wrapper.vm.error).toBe('Invalid username or password')
    })

    it('does not set error on successful login', async () => {
      mockLogin.mockResolvedValue(true)
      const wrapper = createWrapper()

      wrapper.vm.username = 'correct'
      wrapper.vm.password = 'correct'

      await wrapper.vm.handleLogin()
      await flushPromises()

      expect(wrapper.vm.error).toBe('')
    })
  })

  describe('form state management', () => {
    it('allows setting username', () => {
      const wrapper = createWrapper()
      wrapper.vm.username = 'newuser'
      expect(wrapper.vm.username).toBe('newuser')
    })

    it('allows setting password', () => {
      const wrapper = createWrapper()
      wrapper.vm.password = 'newpass'
      expect(wrapper.vm.password).toBe('newpass')
    })
  })
})
