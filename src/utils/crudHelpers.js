import { logger } from './logger'

/**
 * Creates a data loader function with standard error handling and logging
 * @param {Object} options - Configuration options
 * @param {import('vue').Ref} options.loading - Loading state ref
 * @param {import('vue').Ref} options.data - Data ref to populate
 * @param {Function} options.service - Service method to call
 * @param {string} options.entityName - Entity name for logging/errors
 * @param {Function} options.message - Naive UI message instance
 * @param {Function} [options.transform] - Optional data transformation function
 * @returns {Function} Async loader function
 *
 * @example
 * const loadCertifications = createDataLoader({
 *   loading,
 *   data: certifications,
 *   service: certificationsService.getAllCertifications,
 *   entityName: 'certifications',
 *   message,
 * })
 */
export function createDataLoader(options) {
  const { loading, data, service, entityName, message, transform } = options

  return async () => {
    loading.value = true
    try {
      const response = await service()
      const result = response.data || []

      // Apply transform with error handling
      if (transform) {
        try {
          data.value = transform(result)
        } catch (transformError) {
          logger.error(`Failed to transform ${entityName} data`, { error: transformError.message })
          data.value = result // Fallback to untransformed data
        }
      } else {
        data.value = result
      }

      // Safely log count - check if data is array
      const count = Array.isArray(data.value) ? data.value.length : 'N/A'
      logger.info(`${entityName} loaded`, { count })
    } catch (error) {
      message.error(`Failed to load ${entityName}`)
      logger.error(`Failed to load ${entityName}`, { error: error.message })
    } finally {
      loading.value = false
    }
  }
}

/**
 * Creates a save handler for create/update operations
 * @param {Object} options - Configuration options
 * @param {import('vue').Ref} options.formRef - Form ref for validation
 * @param {import('vue').Ref} options.saving - Saving state ref
 * @param {import('vue').Ref} options.editing - Editing item ref (null for create)
 * @param {import('vue').Ref} options.form - Form data ref
 * @param {import('vue').Ref} options.showModal - Modal visibility ref
 * @param {Object} options.service - Service object with create/update methods
 * @param {Function} options.service.create - Create service method
 * @param {Function} options.service.update - Update service method
 * @param {string} options.entityName - Entity name for logging/messages
 * @param {Function} options.message - Naive UI message instance
 * @param {Function} options.onSuccess - Callback after successful save (e.g., reload data)
 * @param {Function} options.resetForm - Form reset function
 * @param {Function} [options.transformPayload] - Optional payload transformation
 * @param {Function} [options.validateForm] - Form validation function
 * @returns {Function} Async save handler function
 *
 * @example
 * const handleSave = createSaveHandler({
 *   formRef,
 *   saving,
 *   editing,
 *   form,
 *   showModal,
 *   service: {
 *     create: certificationsService.createCertification,
 *     update: certificationsService.updateCertification,
 *   },
 *   entityName: 'certification',
 *   message,
 *   onSuccess: loadCertifications,
 *   resetForm,
 *   validateForm,
 * })
 */
export function createSaveHandler(options) {
  const {
    formRef,
    saving,
    editing,
    form,
    showModal,
    service,
    entityName,
    message,
    onSuccess,
    resetForm,
    transformPayload,
    validateForm,
  } = options

  return async () => {
    if (validateForm && !(await validateForm(formRef))) return

    saving.value = true
    try {
      const payload = transformPayload ? transformPayload(form.value) : form.value

      if (editing.value?.id) {
        await service.update(editing.value.id, payload)
        message.success(`${entityName} updated successfully`)
        logger.info(`${entityName} updated`, { id: editing.value.id })
      } else {
        const response = await service.create(payload)
        message.success(`${entityName} created successfully`)
        logger.info(`${entityName} created`, { id: response.data?.id })
      }

      showModal.value = false
      resetForm()

      // Reload data with separate error handling
      try {
        await onSuccess()
      } catch (reloadError) {
        message.warning(`${entityName} saved, but failed to reload data`)
        logger.error(`Failed to reload ${entityName} after save`, { error: reloadError.message })
      }
    } catch (error) {
      message.error(`Failed to save ${entityName}`)
      logger.error(`Failed to save ${entityName}`, { error: error.message })
    } finally {
      saving.value = false
    }
  }
}

/**
 * Creates a delete handler with confirmation dialog
 * @param {Object} options - Configuration options
 * @param {Function} options.dialog - Naive UI dialog instance
 * @param {Function} options.service - Delete service method
 * @param {string} options.entityName - Entity name for logging/messages
 * @param {Function} options.message - Naive UI message instance
 * @param {Function} options.onSuccess - Callback after successful delete (e.g., reload data)
 * @param {Function} [options.getConfirmText] - Function to get confirmation text from item
 * @returns {Function} Delete handler function
 *
 * @example
 * const handleDelete = createDeleteHandler({
 *   dialog,
 *   service: certificationsService.deleteCertification,
 *   entityName: 'certification',
 *   message,
 *   onSuccess: loadCertifications,
 *   getConfirmText: (cert) => `"${cert.name}"`,
 * })
 */
export function createDeleteHandler(options) {
  const { dialog, service, entityName, message, onSuccess, getConfirmText } = options

  return (item) => {
    // Validate item has ID
    if (!item?.id) {
      logger.error(`Cannot delete ${entityName}: missing ID`)
      message.error(`Cannot delete ${entityName}: invalid item`)
      return
    }

    const itemText = getConfirmText ? getConfirmText(item) : `this ${entityName}`

    dialog.warning({
      title: `Delete ${entityName}`,
      content: `Are you sure you want to delete ${itemText}?`,
      positiveText: 'Delete',
      negativeText: 'Cancel',
      onPositiveClick: async () => {
        try {
          await service(item.id)
          message.success(`${entityName} deleted successfully`)
          logger.info(`${entityName} deleted`, { id: item.id })

          // Reload data with separate error handling
          try {
            await onSuccess()
          } catch (reloadError) {
            message.warning(`${entityName} deleted, but failed to reload data`)
            logger.error(`Failed to reload ${entityName} after delete`, {
              error: reloadError.message,
            })
          }
        } catch (error) {
          message.error(`Failed to delete ${entityName}`)
          logger.error(`Failed to delete ${entityName}`, { error: error.message })
        }
      },
    })
  }
}
