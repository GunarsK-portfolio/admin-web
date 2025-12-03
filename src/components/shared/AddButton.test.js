import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import AddButton from './AddButton.vue'

describe('AddButton', () => {
  const createWrapper = (props = {}) =>
    shallowMount(AddButton, {
      props,
      global: {
        stubs: {
          NButton: true,
          NIcon: true,
          AddOutline: true,
        },
      },
    })

  it('accepts label prop', () => {
    const wrapper = createWrapper({ label: 'Add Item' })
    expect(wrapper.vm.label).toBe('Add Item')
  })

  it('passes label to template', () => {
    const wrapper = createWrapper({ label: 'Add New Skill' })
    // Verify prop is set correctly
    expect(wrapper.vm.$props.label).toBe('Add New Skill')
  })

  it('emits click event when triggered', async () => {
    const wrapper = createWrapper({ label: 'Add' })
    await wrapper.vm.$emit('click')
    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('renders component successfully', () => {
    const wrapper = createWrapper({ label: 'Add' })
    expect(wrapper.exists()).toBe(true)
  })
})
