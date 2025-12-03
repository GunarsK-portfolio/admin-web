import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BackButton from './BackButton.vue'

describe('BackButton', () => {
  const createWrapper = (props = {}) =>
    mount(BackButton, {
      props,
      global: {
        stubs: {
          RouterLink: true,
          NButton: true,
          NIcon: true,
          ArrowBackOutline: true,
        },
      },
    })

  describe('default props', () => {
    it('has default to prop of /dashboard', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.to).toBe('/dashboard')
    })

    it('has default label of "Back to Dashboard"', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.label).toBe('Back to Dashboard')
    })
  })

  describe('custom props', () => {
    it('accepts custom to prop as string', () => {
      const wrapper = createWrapper({ to: '/skills' })
      expect(wrapper.vm.to).toBe('/skills')
    })

    it('accepts custom to prop as object', () => {
      const route = { name: 'skills', params: { id: 1 } }
      const wrapper = createWrapper({ to: route })
      expect(wrapper.vm.to).toEqual(route)
    })

    it('accepts custom label', () => {
      const wrapper = createWrapper({ label: 'Back to Skills' })
      expect(wrapper.vm.label).toBe('Back to Skills')
    })
  })

  it('renders component successfully', () => {
    const wrapper = createWrapper({ label: 'Go Back' })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.vm.$props.label).toBe('Go Back')
  })
})
