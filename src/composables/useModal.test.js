import { describe, it, expect, vi } from 'vitest'
import { nextTick } from 'vue'
import { useModal } from './useModal'

describe('useModal', () => {
  const defaultValues = {
    name: '',
    email: '',
    age: null,
  }

  describe('initial state', () => {
    it('starts with modal closed', () => {
      const { showModal, editing } = useModal(defaultValues)
      expect(showModal.value).toBe(false)
      expect(editing.value).toBe(null)
    })

    it('initializes form with default values', () => {
      const { form } = useModal(defaultValues)
      expect(form.value).toEqual({
        name: '',
        email: '',
        age: null,
      })
    })

    it('deep clones default values to prevent mutation', () => {
      const { form } = useModal(defaultValues)
      form.value.name = 'Modified'
      expect(defaultValues.name).toBe('')
    })
  })

  describe('openModal', () => {
    it('opens modal in create mode', () => {
      const { showModal, editing, openModal } = useModal(defaultValues)
      openModal()
      expect(showModal.value).toBe(true)
      expect(editing.value).toBe(null)
    })

    it('resets form to defaults when opening', () => {
      const { form, openModal } = useModal(defaultValues)
      form.value.name = 'Previous Value'
      openModal()
      expect(form.value.name).toBe('')
    })
  })

  describe('closeModal', () => {
    it('closes modal and resets form', () => {
      const { showModal, form, openModal, closeModal } = useModal(defaultValues)
      openModal()
      form.value.name = 'Test'
      closeModal()

      expect(showModal.value).toBe(false)
      expect(form.value.name).toBe('')
    })

    it('clears editing state', () => {
      const { editing, openEditModal, closeModal } = useModal(defaultValues)
      const entity = { id: 1, name: 'Test' }
      openEditModal(entity)
      closeModal()

      expect(editing.value).toBe(null)
    })
  })

  describe('openEditModal', () => {
    it('opens modal with entity data', () => {
      const { showModal, editing, form, openEditModal } = useModal(defaultValues)
      const entity = { id: 1, name: 'John', email: 'john@example.com', age: 25 }
      openEditModal(entity)

      expect(showModal.value).toBe(true)
      expect(editing.value).toStrictEqual(entity)
      expect(form.value.name).toBe('John')
      expect(form.value.email).toBe('john@example.com')
      expect(form.value.age).toBe(25)
    })

    it('uses transform function when provided', () => {
      const { form, openEditModal } = useModal({ firstName: '', lastName: '' })
      const entity = { id: 1, full_name: 'John Doe' }
      const transform = (e) => ({
        firstName: e.full_name.split(' ')[0],
        lastName: e.full_name.split(' ')[1],
      })

      openEditModal(entity, transform)

      expect(form.value.firstName).toBe('John')
      expect(form.value.lastName).toBe('Doe')
    })

    it('deep clones entity data to prevent mutation', () => {
      const { form, openEditModal } = useModal(defaultValues)
      const entity = { id: 1, name: 'Original', email: '', age: null }
      openEditModal(entity)

      form.value.name = 'Modified'
      expect(entity.name).toBe('Original')
    })
  })

  describe('resetForm', () => {
    it('resets form to default values', () => {
      const { form, resetForm } = useModal(defaultValues)
      form.value.name = 'Modified'
      form.value.email = 'test@example.com'

      resetForm()

      expect(form.value.name).toBe('')
      expect(form.value.email).toBe('')
    })

    it('clears editing state', () => {
      const { editing, openEditModal, resetForm } = useModal(defaultValues)
      openEditModal({ id: 1, name: 'Test', email: '', age: null })

      resetForm()

      expect(editing.value).toBe(null)
    })

    it('calls formRef.restoreValidation on next tick', async () => {
      const { formRef, resetForm } = useModal(defaultValues)
      const restoreValidation = vi.fn()
      formRef.value = { restoreValidation }

      resetForm()
      await nextTick()

      expect(restoreValidation).toHaveBeenCalled()
    })
  })

  describe('complex default values', () => {
    it('handles nested objects', () => {
      const nestedDefaults = {
        user: { name: '', settings: { theme: 'light' } },
        items: [],
      }
      const { form, openModal } = useModal(nestedDefaults)

      form.value.user.name = 'Test'
      form.value.user.settings.theme = 'dark'
      openModal()

      expect(form.value.user.name).toBe('')
      expect(form.value.user.settings.theme).toBe('light')
    })
  })
})
