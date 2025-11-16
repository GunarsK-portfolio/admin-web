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
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
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
