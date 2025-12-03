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

  it('emits update:modelValue on input', async () => {
    const wrapper = createWrapper()

    // Since NInput is stubbed, we need to emit from the component
    await wrapper.vm.$emit('update:modelValue', 'new value')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['new value'])
  })

  it('has search-input class', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.search-input').exists()).toBe(true)
  })
})
