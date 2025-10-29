/**
 * Creates required field validation rule
 * @param {string} fieldName - Field name for error message
 * @param {string} trigger - Validation trigger event
 * @returns {Object} Naive UI validation rule
 */
export const required = (fieldName, trigger = 'blur') => ({
  required: true,
  message: `${fieldName} is required`,
  trigger,
})

/**
 * Creates required number field validation rule
 * @param {string} fieldName - Field name for error message
 * @param {string} trigger - Validation trigger event
 * @returns {Object} Naive UI validation rule
 */
export const requiredNumber = (fieldName, trigger = 'change') => ({
  required: true,
  type: 'number',
  message: `${fieldName} is required`,
  trigger,
})

/**
 * Creates email validation rule
 * More comprehensive regex that prevents common invalid patterns
 * @param {string} trigger - Validation trigger event
 * @returns {Object} Naive UI validation rule
 */
export const email = (trigger = 'blur') => ({
  pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  message: 'Please enter a valid email address',
  trigger,
})

/**
 * Creates URL validation rule with protocol restrictions
 * @param {Object} options - Validation options
 * @param {Array<string>} options.protocols - Allowed protocols (default: ['http:', 'https:'])
 * @param {string} options.trigger - Validation trigger event
 * @returns {Object} Naive UI validation rule
 */
export const url = (options = {}) => {
  const { protocols = ['http:', 'https:'], trigger = 'blur' } = options

  return {
    validator: (_rule, value) => {
      if (!value) return true
      try {
        const urlObj = new URL(value)
        if (!protocols.includes(urlObj.protocol)) {
          return new Error(`URL must use one of the following protocols: ${protocols.join(', ')}`)
        }
        return true
      } catch {
        return new Error('Please enter a valid URL')
      }
    },
    trigger,
  }
}

/**
 * Checks if a URL string is a valid HTTP/HTTPS URL
 * @param {string} urlString - URL to validate
 * @returns {boolean} True if valid HTTP/HTTPS URL
 */
export function isValidHttpUrl(urlString) {
  if (!urlString) return false
  try {
    const url = new URL(urlString)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Creates date range validation rule
 * Supports both full dates (yyyy-MM-dd) and month dates (yyyy-MM)
 * @param {Function} getStartDate - Function that returns the start date value
 * @param {string} trigger - Validation trigger event
 * @returns {Object} Naive UI validation rule
 */
export const dateAfter = (getStartDate, trigger = 'blur') => ({
  validator: (_rule, value) => {
    if (!value) return true
    const startDate = getStartDate()
    if (!startDate) return true

    // Convert to string to safely check format
    const startStr = String(startDate)
    const endStr = String(value)

    // Regex patterns for date formats
    const fullDatePattern = /^\d{4}-\d{2}-\d{2}$/
    const monthPattern = /^\d{4}-\d{2}$/

    // Determine format and normalize dates
    let startFull, endFull

    if (fullDatePattern.test(startStr)) {
      startFull = startStr
    } else if (monthPattern.test(startStr)) {
      startFull = startStr + '-01'
    } else {
      return new Error('Invalid start date format')
    }

    if (fullDatePattern.test(endStr)) {
      endFull = endStr
    } else if (monthPattern.test(endStr)) {
      endFull = endStr + '-01'
    } else {
      return new Error('Invalid end date format')
    }

    const isValid = new Date(endFull) >= new Date(startFull)
    if (isValid) return true
    return new Error('End date must be after or equal to start date')
  },
  trigger,
})

/**
 * Validates form and returns true if valid, false if invalid
 * @param {Object} formRef - Naive UI form ref
 * @returns {Promise<boolean>} True if validation passes
 */
export async function validateForm(formRef) {
  if (!formRef?.value) return false
  try {
    await formRef.value.validate()
    return true
  } catch {
    return false
  }
}

/**
 * Validates that a required value is not null, undefined, or empty
 *
 * Behavior:
 * - Without type option: Rejects null/undefined and empty strings. Allows 0, false, [], {}
 * - With type option: Enforces specific type validation
 *
 * @param {any} value - Value to validate
 * @param {string} paramName - Parameter name for error message
 * @param {Object} options - Validation options
 * @param {string} options.type - Expected type ('string', 'number', 'object', 'array')
 * @throws {Error} If value is invalid
 *
 * @example
 * validateRequired(userId, 'User ID') // Allows any value except null/undefined/empty string
 * validateRequired(payload, 'Payload', { type: 'object' }) // Requires non-null object (not array)
 * validateRequired(count, 'Count', { type: 'number' }) // Requires valid number (0 is valid)
 */
export function validateRequired(value, paramName = 'Parameter', options = {}) {
  // Check for null/undefined
  if (value == null) {
    throw new Error(`${paramName} is required`)
  }

  // Type-specific validation
  if (options.type) {
    switch (options.type) {
      case 'string':
        if (typeof value !== 'string' || value.trim() === '') {
          throw new Error(`${paramName} must be a non-empty string`)
        }
        break
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          throw new Error(`${paramName} must be a valid number`)
        }
        break
      case 'object':
        if (typeof value !== 'object' || Array.isArray(value)) {
          throw new Error(`${paramName} must be a valid object`)
        }
        break
      case 'array':
        if (!Array.isArray(value)) {
          throw new Error(`${paramName} must be an array`)
        }
        break
    }
  } else {
    // Default: check for empty string only
    // Note: Allows falsy values like 0, false, [], {} - these may be legitimate
    if (typeof value === 'string' && value.trim() === '') {
      throw new Error(`${paramName} is required`)
    }
  }
}

/**
 * Normalizes a value to a safe string for search/filter operations
 * Converts null/undefined to empty string and ensures lowercase
 * @param {any} value - Value to normalize
 * @returns {string} Normalized lowercase string
 */
export function normalizeString(value) {
  return (value ?? '').toString().toLowerCase()
}
