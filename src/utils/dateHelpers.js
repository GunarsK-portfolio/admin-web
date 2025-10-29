/**
 * Converts API date format to month picker format
 * @param {string|null} dateString - Date in yyyy-MM-dd format
 * @returns {string|null} Date in yyyy-MM format
 */
export function toMonthFormat(dateString) {
  if (!dateString) return null
  const match = typeof dateString === 'string' && dateString.match(/^\d{4}-(0[1-9]|1[0-2])/)
  if (!match) return null
  return match[0]
}

/**
 * Converts month picker format to API date format
 * @param {string|null} monthString - Date in yyyy-MM format
 * @returns {string|null} Date in yyyy-MM-dd format (first day of month)
 */
export function fromMonthFormat(monthString) {
  if (!monthString) return null
  if (typeof monthString !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(monthString)) {
    return null
  }
  return `${monthString}-01`
}

/**
 * Extracts full date without timestamp
 * @param {string|null} dateString - Date or timestamp string
 * @returns {string|null} Date in yyyy-MM-dd format
 */
export function toDateFormat(dateString) {
  if (!dateString) return null
  const match =
    typeof dateString === 'string' &&
    dateString.match(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])/)
  if (!match) return null
  return match[0]
}
