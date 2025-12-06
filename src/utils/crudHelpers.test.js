import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { createDataLoader, createSaveHandler, createDeleteHandler } from './crudHelpers'

// Mock logger
vi.mock('./logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}))

describe('crudHelpers', () => {
  let mockMessage

  beforeEach(() => {
    vi.clearAllMocks()
    mockMessage = {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
    }
  })

  describe('createDataLoader', () => {
    it('throws error when options is missing', () => {
      expect(() => createDataLoader()).toThrow('options object is required')
    })

    it('throws error when required options are missing', () => {
      expect(() => createDataLoader({})).toThrow('required options missing')
    })

    it('loads data successfully', async () => {
      const loading = ref(false)
      const data = ref([])
      const service = vi.fn().mockResolvedValue({ data: [{ id: 1, name: 'Test' }] })

      const loader = createDataLoader({
        loading,
        data,
        service,
        entityName: 'items',
        message: mockMessage,
      })

      await loader()

      expect(loading.value).toBe(false)
      expect(data.value).toEqual([{ id: 1, name: 'Test' }])
      expect(service).toHaveBeenCalled()
    })

    it('sets loading state during load', async () => {
      const loading = ref(false)
      const data = ref([])
      let loadingDuringCall = false

      const service = vi.fn().mockImplementation(async () => {
        loadingDuringCall = loading.value
        return { data: [] }
      })

      const loader = createDataLoader({
        loading,
        data,
        service,
        entityName: 'items',
        message: mockMessage,
      })

      await loader()

      expect(loadingDuringCall).toBe(true)
      expect(loading.value).toBe(false)
    })

    it('handles empty response data', async () => {
      const loading = ref(false)
      const data = ref([{ id: 'old' }])
      const service = vi.fn().mockResolvedValue({})

      const loader = createDataLoader({
        loading,
        data,
        service,
        entityName: 'items',
        message: mockMessage,
      })

      await loader()

      expect(data.value).toEqual([])
    })

    it('applies transform function', async () => {
      const loading = ref(false)
      const data = ref([])
      const service = vi.fn().mockResolvedValue({ data: [{ id: 1 }, { id: 2 }] })
      const transform = vi.fn((items) => items.map((i) => ({ ...i, transformed: true })))

      const loader = createDataLoader({
        loading,
        data,
        service,
        entityName: 'items',
        message: mockMessage,
        transform,
      })

      await loader()

      expect(transform).toHaveBeenCalled()
      expect(data.value).toEqual([
        { id: 1, transformed: true },
        { id: 2, transformed: true },
      ])
    })

    it('falls back to raw data when transform fails', async () => {
      const loading = ref(false)
      const data = ref([])
      const service = vi.fn().mockResolvedValue({ data: [{ id: 1 }] })
      const transform = vi.fn(() => {
        throw new Error('Transform error')
      })

      const loader = createDataLoader({
        loading,
        data,
        service,
        entityName: 'items',
        message: mockMessage,
        transform,
      })

      await loader()

      expect(data.value).toEqual([{ id: 1 }])
    })

    it('handles service error', async () => {
      const loading = ref(false)
      const data = ref([])
      const service = vi.fn().mockRejectedValue(new Error('Network error'))

      const loader = createDataLoader({
        loading,
        data,
        service,
        entityName: 'items',
        message: mockMessage,
      })

      await loader()

      expect(loading.value).toBe(false)
      expect(mockMessage.error).toHaveBeenCalledWith('Failed to load items')
    })
  })

  describe('createSaveHandler', () => {
    let defaultOptions

    beforeEach(() => {
      defaultOptions = {
        formRef: ref(null),
        saving: ref(false),
        editing: ref(null),
        form: ref({ name: 'Test' }),
        showModal: ref(true),
        service: {
          create: vi.fn().mockResolvedValue({ data: { id: 1 } }),
          update: vi.fn().mockResolvedValue({ data: { id: 1 } }),
        },
        entityName: 'item',
        message: mockMessage,
        onSuccess: vi.fn().mockResolvedValue(),
        resetForm: vi.fn(),
      }
    })

    it('throws error when options is missing', () => {
      expect(() => createSaveHandler()).toThrow('options object is required')
    })

    it('throws error when required options are missing', () => {
      expect(() => createSaveHandler({})).toThrow('required options missing')
    })

    it('creates new entity when not editing', async () => {
      const handler = createSaveHandler(defaultOptions)
      await handler()

      expect(defaultOptions.service.create).toHaveBeenCalledWith({ name: 'Test' })
      expect(mockMessage.success).toHaveBeenCalledWith('item created successfully')
      expect(defaultOptions.showModal.value).toBe(false)
      expect(defaultOptions.resetForm).toHaveBeenCalled()
      expect(defaultOptions.onSuccess).toHaveBeenCalled()
    })

    it('updates entity when editing', async () => {
      defaultOptions.editing.value = { id: 5 }
      const handler = createSaveHandler(defaultOptions)
      await handler()

      expect(defaultOptions.service.update).toHaveBeenCalledWith(5, { name: 'Test' })
      expect(mockMessage.success).toHaveBeenCalledWith('item updated successfully')
    })

    it('applies payload transformation', async () => {
      defaultOptions.transformPayload = vi.fn((form) => ({ ...form, extra: 'data' }))
      const handler = createSaveHandler(defaultOptions)
      await handler()

      expect(defaultOptions.service.create).toHaveBeenCalledWith({
        name: 'Test',
        extra: 'data',
      })
    })

    it('validates form before saving', async () => {
      const validateForm = vi.fn().mockResolvedValue(false)
      defaultOptions.validateForm = validateForm
      const handler = createSaveHandler(defaultOptions)
      await handler()

      expect(validateForm).toHaveBeenCalled()
      expect(defaultOptions.service.create).not.toHaveBeenCalled()
    })

    it('proceeds when validation passes', async () => {
      const validateForm = vi.fn().mockResolvedValue(true)
      defaultOptions.validateForm = validateForm
      const handler = createSaveHandler(defaultOptions)
      await handler()

      expect(defaultOptions.service.create).toHaveBeenCalled()
    })

    it('handles save error', async () => {
      defaultOptions.service.create.mockRejectedValue(new Error('Save failed'))
      const handler = createSaveHandler(defaultOptions)
      await handler()

      expect(mockMessage.error).toHaveBeenCalledWith('Failed to save item')
      expect(defaultOptions.saving.value).toBe(false)
    })

    it('handles reload error gracefully', async () => {
      defaultOptions.onSuccess.mockRejectedValue(new Error('Reload failed'))
      const handler = createSaveHandler(defaultOptions)
      await handler()

      expect(mockMessage.success).toHaveBeenCalled() // Save succeeded
      expect(mockMessage.warning).toHaveBeenCalledWith('item saved, but failed to reload data')
    })

    it('sets saving state during operation', async () => {
      let savingDuringCall = false
      defaultOptions.service.create.mockImplementation(async () => {
        savingDuringCall = defaultOptions.saving.value
        return { data: { id: 1 } }
      })

      const handler = createSaveHandler(defaultOptions)
      await handler()

      expect(savingDuringCall).toBe(true)
      expect(defaultOptions.saving.value).toBe(false)
    })

    it('blocks save when checkPermission returns false', async () => {
      defaultOptions.checkPermission = vi.fn().mockReturnValue(false)
      const handler = createSaveHandler(defaultOptions)
      await handler()

      expect(defaultOptions.checkPermission).toHaveBeenCalled()
      expect(defaultOptions.service.create).not.toHaveBeenCalled()
      expect(mockMessage.error).toHaveBeenCalledWith('You do not have permission to save this item')
    })

    it('proceeds with save when checkPermission returns true', async () => {
      defaultOptions.checkPermission = vi.fn().mockReturnValue(true)
      const handler = createSaveHandler(defaultOptions)
      await handler()

      expect(defaultOptions.checkPermission).toHaveBeenCalled()
      expect(defaultOptions.service.create).toHaveBeenCalled()
    })

    it('proceeds with save when checkPermission is not provided', async () => {
      const handler = createSaveHandler(defaultOptions)
      await handler()

      expect(defaultOptions.service.create).toHaveBeenCalled()
    })
  })

  describe('createDeleteHandler', () => {
    let defaultOptions
    let dialogCallback

    beforeEach(() => {
      defaultOptions = {
        dialog: {
          warning: vi.fn((config) => {
            dialogCallback = config.onPositiveClick
          }),
        },
        service: vi.fn().mockResolvedValue({}),
        entityName: 'item',
        message: mockMessage,
        onSuccess: vi.fn().mockResolvedValue(),
      }
    })

    it('throws error when options is missing', () => {
      expect(() => createDeleteHandler()).toThrow('options object is required')
    })

    it('throws error when required options are missing', () => {
      expect(() => createDeleteHandler({})).toThrow('required options missing')
    })

    it('shows confirmation dialog', () => {
      const handler = createDeleteHandler(defaultOptions)
      handler({ id: 1, name: 'Test' })

      expect(defaultOptions.dialog.warning).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Delete item',
          positiveText: 'Delete',
          negativeText: 'Cancel',
        })
      )
    })

    it('uses custom confirmation text', () => {
      defaultOptions.getConfirmText = (item) => `"${item.name}"`
      const handler = createDeleteHandler(defaultOptions)
      handler({ id: 1, name: 'Test Item' })

      expect(defaultOptions.dialog.warning).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Are you sure you want to delete "Test Item"?',
        })
      )
    })

    it('deletes item on confirm', async () => {
      const handler = createDeleteHandler(defaultOptions)
      handler({ id: 5 })

      await dialogCallback()

      expect(defaultOptions.service).toHaveBeenCalledWith(5)
      expect(mockMessage.success).toHaveBeenCalledWith('item deleted successfully')
      expect(defaultOptions.onSuccess).toHaveBeenCalled()
    })

    it('handles delete error', async () => {
      defaultOptions.service.mockRejectedValue(new Error('Delete failed'))
      const handler = createDeleteHandler(defaultOptions)
      handler({ id: 1 })

      await dialogCallback()

      expect(mockMessage.error).toHaveBeenCalledWith('Failed to delete item')
    })

    it('handles reload error after delete', async () => {
      defaultOptions.onSuccess.mockRejectedValue(new Error('Reload failed'))
      const handler = createDeleteHandler(defaultOptions)
      handler({ id: 1 })

      await dialogCallback()

      expect(mockMessage.success).toHaveBeenCalled() // Delete succeeded
      expect(mockMessage.warning).toHaveBeenCalledWith('item deleted, but failed to reload data')
    })

    it('rejects item without id', () => {
      const handler = createDeleteHandler(defaultOptions)
      handler({ name: 'No ID' })

      expect(defaultOptions.dialog.warning).not.toHaveBeenCalled()
      expect(mockMessage.error).toHaveBeenCalledWith('Cannot delete item: invalid item')
    })

    it('rejects null item', () => {
      const handler = createDeleteHandler(defaultOptions)
      handler(null)

      expect(defaultOptions.dialog.warning).not.toHaveBeenCalled()
    })

    it('blocks delete when checkPermission returns false', () => {
      defaultOptions.checkPermission = vi.fn().mockReturnValue(false)
      const handler = createDeleteHandler(defaultOptions)
      handler({ id: 1 })

      expect(defaultOptions.checkPermission).toHaveBeenCalled()
      expect(defaultOptions.dialog.warning).not.toHaveBeenCalled()
      expect(mockMessage.error).toHaveBeenCalledWith(
        'You do not have permission to delete this item'
      )
    })

    it('proceeds with delete when checkPermission returns true', async () => {
      defaultOptions.checkPermission = vi.fn().mockReturnValue(true)
      const handler = createDeleteHandler(defaultOptions)
      handler({ id: 1 })

      expect(defaultOptions.checkPermission).toHaveBeenCalled()
      expect(defaultOptions.dialog.warning).toHaveBeenCalled()

      await dialogCallback()
      expect(defaultOptions.service).toHaveBeenCalledWith(1)
    })

    it('proceeds with delete when checkPermission is not provided', async () => {
      const handler = createDeleteHandler(defaultOptions)
      handler({ id: 1 })

      expect(defaultOptions.dialog.warning).toHaveBeenCalled()

      await dialogCallback()
      expect(defaultOptions.service).toHaveBeenCalledWith(1)
    })
  })
})
