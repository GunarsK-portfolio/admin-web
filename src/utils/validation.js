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
 * @throws {Error} If value is invalid
 */
export function validateRequired(value, paramName = 'Parameter') {
  if (value == null || String(value).trim() === '') {
    throw new Error(`${paramName} is required`)
  }
}
