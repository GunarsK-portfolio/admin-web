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
 * @param {string} trigger - Validation trigger event
 * @returns {Object} Naive UI validation rule
 */
export const email = (trigger = 'blur') => ({
  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  message: 'Please enter a valid email address',
  trigger,
})

/**
 * Creates date range validation rule
 * @param {Function} getStartDate - Function that returns the start date value
 * @param {string} trigger - Validation trigger event
 * @returns {Object} Naive UI validation rule
 */
export const dateAfter = (getStartDate, trigger = 'blur') => ({
  validator: (_rule, value) => {
    if (!value) return true
    const startDate = getStartDate()
    if (!startDate) return true
    const startFull = startDate + '-01'
    const endFull = value + '-01'
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
 * @param {any} value - Value to validate
 * @param {string} paramName - Parameter name for error message
 * @param {Object} options - Validation options
 * @param {string} options.type - Expected type ('string', 'number', 'object', 'array')
 * @throws {Error} If value is invalid
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
    // Default: check for empty string
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
