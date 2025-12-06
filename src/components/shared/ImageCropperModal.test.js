/* global Blob */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import ImageCropperModal from './ImageCropperModal.vue'

// Mock vue-advanced-cropper
vi.mock('vue-advanced-cropper', () => ({
  Cropper: {
    name: 'Cropper',
    template: '<div class="cropper-stub"></div>',
    methods: {
      getResult: () => ({
        canvas: {
          toBlob: vi.fn((callback, format) => {
            callback(new Blob(['test'], { type: format }))
          }),
        },
      }),
    },
  },
  CircleStencil: { name: 'CircleStencil' },
  RectangleStencil: { name: 'RectangleStencil' },
}))

describe('ImageCropperModal', () => {
  const createWrapper = (props = {}) =>
    shallowMount(ImageCropperModal, {
      props: {
        show: true,
        imageSrc: 'data:image/png;base64,test',
        ...props,
      },
      global: {
        stubs: {
          NModal: {
            template: '<div class="modal-stub"><slot /></div>',
            props: ['show'],
          },
          NSpace: true,
          NButton: true,
          Cropper: {
            template: '<div class="cropper-stub"></div>',
            methods: {
              getResult: () => ({
                canvas: {
                  toBlob: (callback, format) => {
                    callback(new Blob(['test'], { type: format }))
                  },
                },
              }),
            },
          },
        },
      },
    })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('renders component successfully', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('has default props values', () => {
      const wrapper = createWrapper({ imageSrc: '' })
      const vm = wrapper.vm

      expect(vm.title).toBe('Crop Image')
      expect(vm.confirmText).toBe('Upload Image')
      expect(vm.aspectRatio).toBe(1)
      expect(vm.circular).toBe(false)
      expect(vm.outputFormat).toBe('image/webp')
      expect(vm.outputQuality).toBe(0.85)
    })

    it('accepts custom props', () => {
      const wrapper = createWrapper({
        title: 'Edit Avatar',
        confirmText: 'Save',
        aspectRatio: 16 / 9,
        circular: true,
        outputFormat: 'image/jpeg',
        outputQuality: 0.9,
      })
      const vm = wrapper.vm

      expect(vm.title).toBe('Edit Avatar')
      expect(vm.confirmText).toBe('Save')
      expect(vm.aspectRatio).toBe(16 / 9)
      expect(vm.circular).toBe(true)
      expect(vm.outputFormat).toBe('image/jpeg')
      expect(vm.outputQuality).toBe(0.9)
    })

    it('is not uploading initially', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.uploading).toBe(false)
    })
  })

  describe('visibility sync', () => {
    it('syncs internal visibility with show prop', async () => {
      const wrapper = createWrapper({ show: false })
      expect(wrapper.vm.isVisible).toBe(false)

      await wrapper.setProps({ show: true })
      expect(wrapper.vm.isVisible).toBe(true)
    })

    it('emits update:show when internal visibility changes', async () => {
      const wrapper = createWrapper({ show: true })

      wrapper.vm.isVisible = false
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('update:show')).toBeTruthy()
      expect(wrapper.emitted('update:show')[0]).toEqual([false])
    })
  })

  describe('stencil selection', () => {
    it('uses RectangleStencil by default', () => {
      const wrapper = createWrapper({ circular: false })
      const vm = wrapper.vm

      // stencilComponent is computed
      expect(vm.stencilComponent).toBeDefined()
    })

    it('uses CircleStencil when circular is true', () => {
      const wrapper = createWrapper({ circular: true })
      const vm = wrapper.vm

      expect(vm.stencilComponent).toBeDefined()
    })
  })

  describe('handleCancel', () => {
    it('hides the modal', () => {
      const wrapper = createWrapper()

      wrapper.vm.handleCancel()

      expect(wrapper.vm.isVisible).toBe(false)
    })

    it('emits cancel event', () => {
      const wrapper = createWrapper()

      wrapper.vm.handleCancel()

      expect(wrapper.emitted('cancel')).toBeTruthy()
    })
  })

  describe('handleCrop', () => {
    it('does nothing if cropperRef is null', async () => {
      const wrapper = createWrapper()
      wrapper.vm.cropperRef = null

      await wrapper.vm.handleCrop()

      expect(wrapper.emitted('crop')).toBeFalsy()
    })

    it('sets uploading to true during crop', async () => {
      const wrapper = createWrapper()
      const mockCanvas = {
        toBlob: vi.fn((callback) => {
          // Delay callback to test loading state
          setTimeout(() => callback(new Blob(['test'])), 10)
        }),
      }
      wrapper.vm.cropperRef = {
        getResult: () => ({ canvas: mockCanvas }),
      }

      const cropPromise = wrapper.vm.handleCrop()
      expect(wrapper.vm.uploading).toBe(true)

      await cropPromise
    })

    it('emits crop event with blob', async () => {
      const wrapper = createWrapper()
      const testBlob = new Blob(['test'], { type: 'image/webp' })
      const mockCanvas = {
        toBlob: vi.fn((callback) => {
          callback(testBlob)
        }),
      }
      wrapper.vm.cropperRef = {
        getResult: () => ({ canvas: mockCanvas }),
      }

      await wrapper.vm.handleCrop()

      expect(wrapper.emitted('crop')).toBeTruthy()
      expect(wrapper.emitted('crop')[0][0]).toBe(testBlob)
    })

    it('uses correct output format and quality', async () => {
      const wrapper = createWrapper({
        outputFormat: 'image/jpeg',
        outputQuality: 0.75,
      })
      const mockToBlob = vi.fn((callback) => callback(new Blob()))
      wrapper.vm.cropperRef = {
        getResult: () => ({ canvas: { toBlob: mockToBlob } }),
      }

      await wrapper.vm.handleCrop()

      expect(mockToBlob).toHaveBeenCalledWith(expect.any(Function), 'image/jpeg', 0.75)
    })

    it('handles crop error gracefully', async () => {
      const wrapper = createWrapper()
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      wrapper.vm.cropperRef = {
        getResult: () => {
          throw new Error('Crop failed')
        },
      }

      await wrapper.vm.handleCrop()

      expect(wrapper.vm.uploading).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('Failed to crop image:', expect.any(Error))
      consoleSpy.mockRestore()
    })
  })
})
