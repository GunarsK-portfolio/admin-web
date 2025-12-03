import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { nextTick } from 'vue'
import BackToTop from './BackToTop.vue'

describe('BackToTop', () => {
  let scrollY = 0
  let scrollToMock

  const createScrollEvent = () => new window.Event('scroll')

  beforeEach(() => {
    scrollY = 0
    scrollToMock = vi.fn()

    // Mock window.scrollY
    Object.defineProperty(window, 'scrollY', {
      get: () => scrollY,
      configurable: true,
    })

    // Mock window.scrollTo
    window.scrollTo = scrollToMock
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const createWrapper = () =>
    shallowMount(BackToTop, {
      global: {
        stubs: {
          NButton: {
            template: '<button class="back-to-top" @click="$emit(\'click\')"><slot /></button>',
          },
          NIcon: { template: '<span class="n-icon"><slot /></span>' },
          ArrowUpOutline: { template: '<span class="arrow-icon" />' },
          Transition: { template: '<div><slot /></div>' },
        },
      },
    })

  describe('initial state', () => {
    it('button is hidden by default', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.showButton).toBe(false)
    })
  })

  describe('scroll behavior', () => {
    it('shows button when scrollY > 300', async () => {
      const wrapper = createWrapper()

      scrollY = 350
      window.dispatchEvent(createScrollEvent())
      await nextTick()

      expect(wrapper.vm.showButton).toBe(true)
    })

    it('hides button when scrollY <= 300', async () => {
      const wrapper = createWrapper()

      // First scroll down
      scrollY = 400
      window.dispatchEvent(createScrollEvent())
      await nextTick()
      expect(wrapper.vm.showButton).toBe(true)

      // Then scroll up
      scrollY = 100
      window.dispatchEvent(createScrollEvent())
      await nextTick()
      expect(wrapper.vm.showButton).toBe(false)
    })

    it('hides button at exactly 300', async () => {
      const wrapper = createWrapper()

      scrollY = 300
      window.dispatchEvent(createScrollEvent())
      await nextTick()

      expect(wrapper.vm.showButton).toBe(false)
    })
  })

  describe('scrollToTop function', () => {
    it('calls window.scrollTo with smooth behavior', async () => {
      const wrapper = createWrapper()

      // Make button visible
      scrollY = 500
      window.dispatchEvent(createScrollEvent())
      await nextTick()

      // Call scrollToTop
      wrapper.vm.scrollToTop()

      expect(scrollToMock).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth',
      })
    })
  })

  describe('lifecycle', () => {
    it('adds scroll listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      createWrapper()
      expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    })

    it('removes scroll listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      const wrapper = createWrapper()
      wrapper.unmount()
      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    })
  })

  describe('CSS class', () => {
    it('has back-to-top class', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.back-to-top').exists()).toBe(true)
    })
  })
})
