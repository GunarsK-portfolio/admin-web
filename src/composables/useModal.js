import { ref, nextTick } from 'vue'

/**
 * Deep clones an object using JSON serialization
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Creates a modal controller with form state management
 * Handles modal open/close, form reset, and edit mode
 *
 * @param {Object} defaultFormValues - Default values for the form when reset
 * @returns {Object} Modal controller object
 *
 * @example
 * const {
 *   showModal,
 *   editing,
 *   form,
 *   formRef,
 *   openModal,
 *   closeModal,
 *   openEditModal,
 *   resetForm
 * } = useModal({
 *   name: '',
 *   email: '',
 *   age: null
 * })
 */
export function useModal(defaultFormValues) {
  const showModal = ref(false)
  const editing = ref(null)
  const form = ref(deepClone(defaultFormValues))
  const formRef = ref(null)

  /**
   * Resets the form to default values and clears editing state
   */
  const resetForm = () => {
    editing.value = null
    form.value = deepClone(defaultFormValues)
    nextTick(() => {
      formRef.value?.restoreValidation()
    })
  }

  /**
   * Opens modal in create mode (resets form first)
   */
  const openModal = () => {
    resetForm()
    showModal.value = true
  }

  /**
   * Closes modal and resets form
   */
  const closeModal = () => {
    showModal.value = false
    resetForm()
  }

  /**
   * Opens modal in edit mode with entity data
   * @param {Object} entity - Entity to edit
   * @param {Function} [transformFn] - Optional function to transform entity data for form
   */
  const openEditModal = (entity, transformFn) => {
    editing.value = entity
    form.value = transformFn ? transformFn(entity) : deepClone(entity)
    showModal.value = true
  }

  return {
    // Refs
    showModal,
    editing,
    form,
    formRef,

    // Methods
    openModal,
    closeModal,
    openEditModal,
    resetForm,
  }
}
