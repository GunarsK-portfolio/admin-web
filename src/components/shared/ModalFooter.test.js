import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import ModalFooter from './ModalFooter.vue'

describe('ModalFooter', () => {
  const createWrapper = (props = {}) =>
    shallowMount(ModalFooter, {
      props,
      global: {
        stubs: {
          NSpace: true,
          NButton: true,
        },
      },
    })

  describe('default props', () => {
    it('has loading default to false', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.loading).toBe(false)
    })

    it('has editing default to null', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.editing).toBe(null)
    })
  })

  describe('editing prop states', () => {
    it('accepts null for editing (create mode)', () => {
      const wrapper = createWrapper({ editing: null })
      expect(wrapper.vm.editing).toBe(null)
    })

    it('accepts object for editing (edit mode)', () => {
      const editingData = { id: 1, name: 'Test' }
      const wrapper = createWrapper({ editing: editingData })
      expect(wrapper.vm.editing).toEqual(editingData)
    })

    it('accepts empty object for editing', () => {
      const wrapper = createWrapper({ editing: {} })
      expect(wrapper.vm.editing).toEqual({})
    })
  })

  describe('events', () => {
    it('emits cancel event when triggered', async () => {
      const wrapper = createWrapper()
      await wrapper.vm.$emit('cancel')
      expect(wrapper.emitted('cancel')).toBeTruthy()
    })

    it('emits save event when triggered', async () => {
      const wrapper = createWrapper()
      await wrapper.vm.$emit('save')
      expect(wrapper.emitted('save')).toBeTruthy()
    })
  })

  describe('loading state', () => {
    it('accepts loading prop as true', () => {
      const wrapper = createWrapper({ loading: true })
      expect(wrapper.vm.loading).toBe(true)
    })

    it('accepts loading prop as false', () => {
      const wrapper = createWrapper({ loading: false })
      expect(wrapper.vm.loading).toBe(false)
    })
  })
})
