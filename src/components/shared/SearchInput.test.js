import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchInput from './SearchInput.vue'

describe('SearchInput', () => {
  const createWrapper = (props = {}) =>
    mount(SearchInput, {
      props,
      global: {
        stubs: {
          NInput: true,
          NIcon: true,
          SearchOutline: true,
        },
      },
    })

  it('exposes correct default props', () => {
    const wrapper = createWrapper()
    const vm = wrapper.vm

    // Check component has correct default values
    expect(vm.modelValue).toBe('')
    expect(vm.placeholder).toBe('Search...')
    expect(vm.ariaLabel).toBe('Search')
  })

  it('accepts custom props', () => {
    const wrapper = createWrapper({
      modelValue: 'test query',
      placeholder: 'Search users...',
      ariaLabel: 'Filter users',
    })
    const vm = wrapper.vm

    expect(vm.modelValue).toBe('test query')
    expect(vm.placeholder).toBe('Search users...')
    expect(vm.ariaLabel).toBe('Filter users')
  })

  it('defines update:modelValue emit', () => {
    const wrapper = createWrapper()
    // Check that the component defines the emit
    expect(wrapper.vm.$options.emits).toContain('update:modelValue')
  })

  it('has search-input class', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.search-input').exists()).toBe(true)
  })
})
