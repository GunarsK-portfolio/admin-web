/**
 * Converts an image file to WebP format for better compression
 * @param {File|Blob} file - The image file to convert
 * @param {Object} options - Conversion options
 * @param {number} options.quality - WebP quality (0.0 to 1.0), default 0.85
 * @param {number} options.maxWidth - Maximum width (maintains aspect ratio), default null (no resize)
 * @param {number} options.maxHeight - Maximum height (maintains aspect ratio), default null (no resize)
 * @returns {Promise<Blob>} WebP blob
 */
export async function convertToWebP(file, options = {}) {
  const { quality = 0.85, maxWidth = null, maxHeight = null } = options

  // Skip if already WebP
  if (file.type === 'image/webp') {
    return file
  }

  // Skip non-image files
  if (!file.type.startsWith('image/')) {
    return file
  }

  return new Promise((resolve, reject) => {
    const img = new window.Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img

      // Calculate new dimensions if max constraints provided
      if (maxWidth && width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      if (maxHeight && height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to convert image to WebP'))
          }
        },
        'image/webp',
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image for conversion'))
    }

    img.src = url
  })
}

/**
 * Converts a Blob to a File object with WebP extension
 * @param {Blob} blob - The blob to convert
 * @param {string} originalName - Original filename
 * @returns {File} File with .webp extension
 */
export function blobToWebPFile(blob, originalName) {
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '')
  const fileName = `${nameWithoutExt}.webp`
  return new window.File([blob], fileName, { type: 'image/webp' })
}

/**
 * Formats file size to human-readable string
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * File validation configurations
 */
export const FILE_VALIDATION = {
  IMAGE: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    typeLabel: 'JPEG, PNG, GIF, WebP',
  },
  PDF: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['application/pdf'],
    typeLabel: 'PDF',
  },
  DOCUMENT: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    typeLabel: 'PDF, DOC, DOCX',
  },
}

/**
 * Validates file against specified rules
 * NOTE: This is CLIENT-SIDE validation for UX only. MIME types are browser-supplied
 * and can be spoofed. Backend MUST enforce validation using magic bytes/file signatures.
 * @param {File} file - The file to validate
 * @param {Object} config - Validation configuration (from FILE_VALIDATION)
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateFile(file, config) {
  if (!file) {
    return { valid: false, error: 'No file provided' }
  }

  // Validate file size
  if (file.size > config.maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${formatFileSize(config.maxSize)} limit. Selected file is ${formatFileSize(file.size)}`,
    }
  }

  // Validate MIME type
  if (!config.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Only ${config.typeLabel} files are allowed.`,
    }
  }

  return { valid: true }
}

/**
 * Creates a beforeUpload handler for Naive UI upload component
 * @param {Object} config - Validation configuration (from FILE_VALIDATION)
 * @param {Object} message - Naive UI message instance
 * @returns {Function} beforeUpload handler function
 */
export function createFileValidator(config, message) {
  return ({ file }) => {
    const result = validateFile(file.file, config)
    if (!result.valid) {
      message.error(result.error)
      return false
    }
    return true
  }
}

/**
 * Creates a file upload handler with standard error handling and loading states
 * @param {Object} options - Configuration options
 * @param {import('vue').Ref} options.uploading - Upload loading state ref
 * @param {import('vue').Ref} options.fileList - File list ref (for clearing after upload)
 * @param {import('vue').Ref} options.form - Form ref containing fileId field
 * @param {import('vue').Ref} options.editing - Editing object ref (optional, for displaying uploaded file)
 * @param {Function} options.service - File upload service method
 * @param {Function} options.message - Naive UI message instance
 * @param {string} options.fileType - File type identifier (e.g., 'portfolio-image', 'avatar', 'resume')
 * @param {string} options.fileIdField - Form field name for file ID (e.g., 'imageFileId', 'avatarFileId')
 * @param {string} options.fileObjectField - Editing object field name (e.g., 'imageFile', 'avatarFile')
 * @param {Function} options.logger - Logger instance for tracking operations
 * @param {Function} [options.checkPermission] - Optional permission check function, returns true if allowed
 * @returns {Function} Upload handler function compatible with Naive UI
 *
 * @example
 * const handleImageUpload = createFileUploadHandler({
 *   uploading: uploadingImage,
 *   fileList: imageFileList,
 *   form,
 *   editing,
 *   service: filesService.uploadFile,
 *   message,
 *   fileType: 'portfolio-image',
 *   fileIdField: 'imageFileId',
 *   fileObjectField: 'imageFile',
 *   logger,
 *   checkPermission: () => canEdit(Resource.PROJECTS),
 * })
 */
export function createFileUploadHandler(options) {
  const {
    uploading,
    fileList,
    form,
    editing,
    service,
    message,
    fileType,
    fileIdField,
    fileObjectField,
    logger,
    checkPermission,
  } = options

  return async ({ file }) => {
    if (checkPermission && !checkPermission()) {
      message.error('You do not have permission to upload files')
      return false
    }
    uploading.value = true
    try {
      const response = await service(file.file, fileType)
      const fileData = response.data || response

      // Update form with new file ID
      form.value[fileIdField] = fileData.id

      // Update or create editing object to show the new file
      if (editing.value) {
        editing.value[fileObjectField] = fileData
      } else {
        // For new entities, create temporary editing object to show the file
        editing.value = { [fileObjectField]: fileData }
      }

      if (logger) {
        logger.info(`${fileType} uploaded`, { fileId: fileData.id })
      }
      message.success('File uploaded successfully')
      return { file }
    } catch (error) {
      message.error(`Failed to upload file: ${error.message || 'Unknown error'}`)
      if (logger) {
        logger.error(`Failed to upload ${fileType}`, { error: error.message })
      }
      return false
    } finally {
      uploading.value = false
      fileList.value = []
    }
  }
}

/**
 * Creates a file deletion handler with standard error handling and loading states
 * @param {Object} options - Configuration options
 * @param {import('vue').Ref} options.deleting - Delete loading state ref
 * @param {import('vue').Ref} options.form - Form ref containing fileId field
 * @param {import('vue').Ref} options.editing - Editing object ref (optional)
 * @param {Function} options.service - File deletion service method
 * @param {Function} options.message - Naive UI message instance
 * @param {string} options.fileIdField - Form field name for file ID (e.g., 'imageFileId', 'avatarFileId')
 * @param {string} options.fileObjectField - Editing object field name (e.g., 'imageFile', 'avatarFile')
 * @param {string} options.entityName - Entity name for logging (e.g., 'image', 'avatar', 'resume')
 * @param {Function} options.logger - Logger instance for tracking operations
 * @param {Function} [options.checkPermission] - Optional permission check function, returns true if allowed
 * @returns {Function} Async delete handler function
 *
 * @example
 * const handleRemoveImage = createFileDeleteHandler({
 *   deleting: deletingImage,
 *   form,
 *   editing,
 *   service: filesService.deleteFile,
 *   message,
 *   fileIdField: 'imageFileId',
 *   fileObjectField: 'imageFile',
 *   entityName: 'image',
 *   logger,
 *   checkPermission: () => canEdit(Resource.PROJECTS),
 * })
 */
export function createFileDeleteHandler(options) {
  const {
    deleting,
    form,
    editing,
    service,
    message,
    fileIdField,
    fileObjectField,
    entityName,
    logger,
    checkPermission,
  } = options

  return async () => {
    if (checkPermission && !checkPermission()) {
      message.error('You do not have permission to delete files')
      return
    }
    const fileId = form.value[fileIdField] || editing.value?.[fileObjectField]?.id
    if (!fileId) {
      if (logger) {
        logger.warn(`No ${entityName} to delete`)
      }
      return
    }

    deleting.value = true
    try {
      await service(fileId)
      form.value[fileIdField] = null
      if (editing.value) {
        editing.value[fileObjectField] = null
      }
      if (logger) {
        logger.info(`${entityName} deleted`, { fileId })
      }
      message.success(
        `${entityName.charAt(0).toUpperCase() + entityName.slice(1)} removed successfully`
      )
    } catch (error) {
      message.error(`Failed to remove ${entityName}: ${error.message || 'Unknown error'}`)
      if (logger) {
        logger.error(`Failed to delete ${entityName}`, { fileId, error: error.message })
      }
    } finally {
      deleting.value = false
    }
  }
}
